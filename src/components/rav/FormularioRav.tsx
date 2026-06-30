'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ravSchema, type RavSchemaType } from '@/lib/validations/ravSchema'
import { SecaoA } from './SecaoA'
import { SecaoB } from './SecaoB'
import { SecaoE } from './SecaoE'
import { BotaoExportar } from './BotaoExportar'
import type { Rav } from '@/types/rav'

const CAMPOS_PADRAO: (keyof RavSchemaType)[] = [
  'ano_letivo', 'cre', 'unidade_escolar', 'bloco', 'ano', 'turma', 'turno',
  'professor_generalista', 'matricula_professor',
  'professor_2', 'professor_3', 'professor_4',
  'nome_coordenador', 'matricula_coordenador',
  'bimestre', 'total_dias_letivos', 'local_data',
]

const CAMPO_LABEL: Partial<Record<keyof RavSchemaType, string>> = {
  ano_letivo: 'Ano Letivo',
  cre: 'CRE',
  unidade_escolar: 'Unidade Escolar',
  bloco: 'Bloco',
  ano: 'Ano',
  turma: 'Turma',
  turno: 'Turno',
  professor_generalista: 'Professor(a) Generalista',
  estudante: 'Nome do Estudante',
  bimestre: 'Bimestre',
  descricao_aprendizagem: 'Descrição da Aprendizagem',
  local_data: 'Local e Data',
  // resultado_final é opcional — não aparece como "obrigatório"
}

interface FormularioRavProps {
  ravInicial?: Rav
  modo: 'novo' | 'editar'
}

export function FormularioRav({ ravInicial, modo }: FormularioRavProps) {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [camposComErro, setCamposComErro] = useState<string[]>([])
  const [sucesso, setSucesso] = useState(false)
  const [lembrarDados, setLembrarDados] = useState(false)
  const [ravId, setRavId] = useState<string | null>(ravInicial?.id ?? null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<RavSchemaType>({
    resolver: zodResolver(ravSchema) as any,
    defaultValues: ravInicial
      ? {
          ano_letivo: ravInicial.ano_letivo,
          cre: ravInicial.cre,
          unidade_escolar: ravInicial.unidade_escolar,
          bloco: ravInicial.bloco,
          ano: ravInicial.ano,
          turma: ravInicial.turma,
          turno: ravInicial.turno,
          professor_generalista: ravInicial.professor_generalista,
          matricula_professor: ravInicial.matricula_professor ?? undefined,
          professor_2: ravInicial.professor_2 ?? undefined,
          professor_3: ravInicial.professor_3 ?? undefined,
          professor_4: ravInicial.professor_4 ?? undefined,
          nome_coordenador: ravInicial.nome_coordenador ?? undefined,
          matricula_coordenador: ravInicial.matricula_coordenador ?? undefined,
          estudante: ravInicial.estudante,
          tem_deficiencia: ravInicial.tem_deficiencia,
          houve_adequacao: ravInicial.houve_adequacao,
          bimestre: ravInicial.bimestre,
          total_dias_letivos: ravInicial.total_dias_letivos ?? undefined,
          total_faltas: ravInicial.total_faltas ?? undefined,
          descricao_aprendizagem: ravInicial.descricao_aprendizagem,
          local_data: ravInicial.local_data,
          resultado_final: ravInicial.resultado_final ?? undefined,
          status: ravInicial.status,
        }
      : {
          ano_letivo: '2026',
          tem_deficiencia: false,
          houve_adequacao: false,
          status: 'rascunho',
        },
  })

  // Preenche campos padrão do localStorage ao criar novo RAv
  useEffect(() => {
    if (modo !== 'novo') return
    try {
      const raw = localStorage.getItem('rav-defaults')
      if (!raw) return
      const saved = JSON.parse(raw) as Partial<RavSchemaType>
      CAMPOS_PADRAO.forEach(campo => {
        if (saved[campo] !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          form.setValue(campo, saved[campo] as any)
        }
      })
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const bimestre = form.watch('bimestre')
  const status = ravInicial?.status ?? 'rascunho'

  const salvar = async (statusFinal: 'rascunho' | 'finalizado', forcar = false) => {
    // Rascunho: sem validação — salva o que tiver
    // Finalizado com forcar: ignora a validação do cliente mas ainda valida no servidor
    if (statusFinal === 'finalizado' && !forcar) {
      const valido = await form.trigger()
      if (!valido) {
        const erros = form.formState.errors
        const nomes = (Object.keys(erros) as (keyof RavSchemaType)[])
          .map(k => CAMPO_LABEL[k])
          .filter((n): n is string => Boolean(n))
        setCamposComErro(nomes)
        setErro('Há campos obrigatórios não preenchidos. Corrija ou clique em "Finalizar mesmo assim".')
        document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
      }
    }

    setErro(null)
    setCamposComErro([])
    const dados = { ...form.getValues(), status: statusFinal }
    setSalvando(true)

    try {
      const url = modo === 'novo' ? '/api/rav' : `/api/rav/${ravId}`
      const method = modo === 'novo' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forcar ? { ...dados, _forcar: true } : dados),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(typeof data.error === 'string' ? data.error : 'Erro ao salvar. Verifique os campos.')
        return
      }

      if (lembrarDados) {
        const values = form.getValues()
        const defaults: Partial<RavSchemaType> = {}
        CAMPOS_PADRAO.forEach(campo => {
          if (values[campo] !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (defaults as any)[campo] = values[campo]
          }
        })
        localStorage.setItem('rav-defaults', JSON.stringify(defaults))
      }

      if (modo === 'novo') {
        setRavId(data.id)
        router.push(`/rav/${data.id}`)
      } else {
        setSucesso(true)
        setTimeout(() => setSucesso(false), 4000)
        router.refresh()
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={e => e.preventDefault()} className="space-y-8">
      {/* Seção A */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <SecaoA form={form} />
      </div>

      {/* Seção B */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <SecaoB form={form} />
      </div>

      {/* Seção C: Local e Data */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-indigo-700 border-b border-indigo-100 pb-2 flex items-center gap-2">
          <span className="bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">C</span>
          Local e Data
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Local/Data <span className="text-red-500">*</span>
          </label>
          <input
            {...form.register('local_data')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="Ex: Brasília, 12 de maio de 2026"
          />
          {form.formState.errors.local_data && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.local_data.message}</p>
          )}
        </div>
      </div>

      {/* Seção E: Resultado Final (só 4º bimestre) */}
      {bimestre === 4 && (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
          <SecaoE form={form} />
        </div>
      )}

      {/* Feedbacks */}
      {sucesso && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-green-700 text-sm font-medium">RAv atualizado com sucesso!</p>
        </div>
      )}

      {erro && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
          <p className="text-amber-800 text-sm font-medium">{erro}</p>
          {camposComErro.length > 0 && (
            <ul className="text-amber-700 text-xs space-y-0.5 pl-4 list-disc">
              {camposComErro.map(c => <li key={c}>{c}</li>)}
            </ul>
          )}
          {camposComErro.length > 0 && (
            <button
              type="button"
              onClick={() => salvar('finalizado', true)}
              disabled={salvando}
              className="text-sm font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900 disabled:opacity-50"
            >
              Finalizar mesmo assim →
            </button>
          )}
        </div>
      )}

      {/* Botões de ação */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => salvar('rascunho')}
            disabled={salvando}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
          >
            {salvando ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            )}
            Salvar Rascunho
          </button>

          <button
            type="button"
            onClick={() => salvar('finalizado')}
            disabled={salvando}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Finalizar RAv
          </button>

          {/* Botão Exportar — só aparece se status for finalizado e tiver ID */}
          {status === 'finalizado' && ravId && (
            <BotaoExportar
              ravId={ravId}
              estudante={form.getValues('estudante') || 'Estudante'}
              bimestre={bimestre}
            />
          )}
        </div>

        {/* Opção lembrar dados */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
          <input
            type="checkbox"
            checked={lembrarDados}
            onChange={e => setLembrarDados(e.target.checked)}
            className="w-4 h-4 accent-indigo-600"
          />
          <span className="text-sm text-gray-600">
            Lembrar escola, turma e professores para o próximo RAv
          </span>
        </label>
      </div>
    </form>
  )
}
