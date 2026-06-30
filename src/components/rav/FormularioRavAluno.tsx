'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ravAlunoSchema, ravAlunoRascunhoSchema, type RavAlunoSchemaType } from '@/lib/validations/ravSchema'
import type { Rav } from '@/types/rav'
import type { Aluno } from '@/types/aluno'
import type { Turma } from '@/types/turma'
import { BotaoExportar } from './BotaoExportar'

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition'

interface Props {
  turma: Turma
  aluno: Aluno
  ravInicial?: Rav
  bimestreInicial?: number
  modo: 'novo' | 'editar'
}

export function FormularioRavAluno({ turma, aluno, ravInicial, bimestreInicial, modo }: Props) {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)
  const [ravId, setRavId] = useState<string | null>(ravInicial?.id ?? null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<RavAlunoSchemaType>({
    resolver: zodResolver(ravAlunoRascunhoSchema) as any,
    defaultValues: ravInicial
      ? {
          bimestre:               ravInicial.bimestre,
          total_dias_letivos:     ravInicial.total_dias_letivos ?? undefined,
          total_faltas:           ravInicial.total_faltas ?? undefined,
          descricao_aprendizagem: ravInicial.descricao_aprendizagem,
          local_data:             ravInicial.local_data,
          resultado_final:        ravInicial.resultado_final ?? undefined,
          status:                 ravInicial.status,
        }
      : {
          bimestre:   bimestreInicial ?? undefined,
          status:     'rascunho',
        },
  })

  const { register, watch, formState: { errors } } = form
  const bimestre = watch('bimestre')
  const status = ravInicial?.status ?? 'rascunho'

  const salvar = async (statusFinal: 'rascunho' | 'finalizado') => {
    if (statusFinal === 'finalizado') {
      const schema = ravAlunoSchema
      const result = schema.safeParse({ ...form.getValues(), status: statusFinal })
      if (!result.success) {
        setErro('Preencha todos os campos obrigatórios antes de finalizar.')
        return
      }
    }

    setSalvando(true)
    setErro(null)

    try {
      const dados = { ...form.getValues(), status: statusFinal, _aluno_flow: true }

      let url: string
      let method: string
      if (modo === 'novo') {
        url    = `/api/turmas/${turma.id}/alunos/${aluno.id}/ravs`
        method = 'POST'
      } else {
        url    = `/api/rav/${ravId}`
        method = 'PUT'
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Erro ao salvar.'); return }

      if (modo === 'novo') {
        setRavId(data.id)
        router.push(`/turmas/${turma.id}/alunos/${aluno.id}/rav/${data.id}`)
        router.refresh()
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
    <div className="space-y-6">
      {/* Contexto: turma + aluno (somente leitura) */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-1">
        <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide">Turma</p>
        <p className="font-semibold text-indigo-900">
          {turma.ano} Ano — Turma {turma.turma} | {turma.unidade_escolar}
        </p>
        <p className="text-sm text-indigo-700 font-medium mt-1">{aluno.nome}</p>
        <div className="flex gap-2 mt-1">
          {aluno.tem_deficiencia && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">TEA/Def.</span>}
          {aluno.houve_adequacao && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Adequação</span>}
        </div>
      </div>

      {/* Bimestre + Frequência */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="text-base font-semibold text-indigo-700 border-b border-indigo-100 pb-2">Avaliação</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bimestre <span className="text-red-500">*</span></label>
            <select {...register('bimestre', { valueAsNumber: true })} className={`${inputCls} bg-white`}>
              <option value="">Selecione...</option>
              {[1, 2, 3, 4].map(b => <option key={b} value={b}>{b}º Bimestre</option>)}
            </select>
            {errors.bimestre && <p className="text-red-500 text-xs mt-1">{errors.bimestre.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total de Dias Letivos</label>
            <input type="number" {...register('total_dias_letivos')} className={inputCls} placeholder="Ex: 50" min={1} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total de Faltas</label>
            <input type="number" {...register('total_faltas')} className={inputCls} placeholder="Ex: 3" min={0} />
          </div>
        </div>
      </div>

      {/* Descrição */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-indigo-700 border-b border-indigo-100 pb-2 mb-4">
          B — Descrição do processo de aprendizagem
        </h2>
        <textarea
          {...register('descricao_aprendizagem')}
          rows={10}
          className={`${inputCls} resize-none leading-relaxed`}
          placeholder="Descreva o processo de aprendizagem do(a) estudante neste bimestre..."
        />
        {errors.descricao_aprendizagem && (
          <p className="text-red-500 text-xs mt-1">{errors.descricao_aprendizagem.message}</p>
        )}
      </div>

      {/* Local e Data */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-indigo-700 border-b border-indigo-100 pb-2 mb-4">C — Local e Data</h2>
        <input
          {...register('local_data')}
          className={inputCls}
          placeholder="Ex: Brasília, 12 de maio de 2026"
        />
        {errors.local_data && <p className="text-red-500 text-xs mt-1">{errors.local_data.message}</p>}
      </div>

      {/* Resultado Final (só 4º bimestre) */}
      {bimestre === 4 && (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
          <h2 className="text-base font-semibold text-amber-700 border-b border-amber-100 pb-2 mb-4">E — Resultado Final</h2>
          <select {...register('resultado_final')} className={`${inputCls} bg-white`}>
            <option value="">Selecione o resultado...</option>
            <option value="progressao_continuada">Progressão Continuada</option>
            <option value="aprovado">Aprovado</option>
            <option value="reprovado">Reprovado</option>
            <option value="abandono">Abandono</option>
            <option value="cursando">Cursando</option>
          </select>
        </div>
      )}

      {/* Feedbacks */}
      {sucesso && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-700 text-sm font-medium">RAv atualizado com sucesso!</p>
        </div>
      )}
      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{erro}</p>
        </div>
      )}

      {/* Ações */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => salvar('rascunho')} disabled={salvando}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all">
            {salvando ? 'Salvando...' : 'Salvar Rascunho'}
          </button>
          <button type="button" onClick={() => salvar('finalizado')} disabled={salvando}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm">
            Finalizar RAv
          </button>
          {status === 'finalizado' && ravId && (
            <BotaoExportar ravId={ravId} estudante={aluno.nome} bimestre={bimestre} />
          )}
        </div>
      </div>
    </div>
  )
}
