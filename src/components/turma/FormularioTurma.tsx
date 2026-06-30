'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { turmaSchema, type TurmaSchemaType } from '@/lib/validations/turmaSchema'
import type { Turma } from '@/types/turma'

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition'

interface Props {
  turmaInicial?: Turma
  modo: 'nova' | 'editar'
}

export function FormularioTurma({ turmaInicial, modo }: Props) {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<TurmaSchemaType>({
    resolver: zodResolver(turmaSchema) as any,
    defaultValues: turmaInicial
      ? {
          ano_letivo:            turmaInicial.ano_letivo,
          cre:                   turmaInicial.cre,
          unidade_escolar:       turmaInicial.unidade_escolar,
          bloco:                 turmaInicial.bloco,
          ano:                   turmaInicial.ano,
          turma:                 turmaInicial.turma,
          turno:                 turmaInicial.turno,
          professor_generalista: turmaInicial.professor_generalista,
          matricula_professor:   turmaInicial.matricula_professor ?? undefined,
          professor_2:           turmaInicial.professor_2 ?? undefined,
          professor_3:           turmaInicial.professor_3 ?? undefined,
          professor_4:           turmaInicial.professor_4 ?? undefined,
          nome_coordenador:      turmaInicial.nome_coordenador ?? undefined,
          matricula_coordenador: turmaInicial.matricula_coordenador ?? undefined,
        }
      : { ano_letivo: '2026' },
  })

  const { register, watch, setValue, formState: { errors } } = form
  const bloco = watch('bloco')
  const turno = watch('turno')

  const salvar = async () => {
    const valido = await form.trigger()
    if (!valido) return

    setSalvando(true)
    setErro(null)

    try {
      const url    = modo === 'nova' ? '/api/turmas' : `/api/turmas/${turmaInicial!.id}`
      const method = modo === 'nova' ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.getValues()),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Erro ao salvar.'); return }
      router.push(`/turmas/${data.id}`)
      router.refresh()
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Escola */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-indigo-700 border-b border-indigo-100 pb-2">Escola</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ano Letivo <span className="text-red-500">*</span></label>
            <input {...register('ano_letivo')} className={inputCls} placeholder="2026" />
            {errors.ano_letivo && <p className="text-red-500 text-xs mt-1">{errors.ano_letivo.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CRE <span className="text-red-500">*</span></label>
            <input {...register('cre')} className={inputCls} placeholder="Ex: Plano Piloto" />
            {errors.cre && <p className="text-red-500 text-xs mt-1">{errors.cre.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unidade Escolar <span className="text-red-500">*</span></label>
          <input {...register('unidade_escolar')} className={inputCls} placeholder="Nome completo da escola" />
          {errors.unidade_escolar && <p className="text-red-500 text-xs mt-1">{errors.unidade_escolar.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bloco <span className="text-red-500">*</span></label>
          <div className="flex gap-4">
            {(['1º Bloco', '2º Bloco'] as const).map(b => (
              <button key={b} type="button" onClick={() => setValue('bloco', b)}
                className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${bloco === b ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                {b}
              </button>
            ))}
          </div>
          {errors.bloco && <p className="text-red-500 text-xs mt-1">{errors.bloco.message}</p>}
        </div>
      </div>

      {/* Turma */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-indigo-700 border-b border-indigo-100 pb-2">Turma</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ano <span className="text-red-500">*</span></label>
            <select {...register('ano')} className={`${inputCls} bg-white`}>
              <option value="">Selecione...</option>
              {['1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', '9º'].map(a => (
                <option key={a} value={a}>{a} Ano</option>
              ))}
            </select>
            {errors.ano && <p className="text-red-500 text-xs mt-1">{errors.ano.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turma <span className="text-red-500">*</span></label>
            <input {...register('turma')} className={inputCls} placeholder="Ex: A, B, 301..." />
            {errors.turma && <p className="text-red-500 text-xs mt-1">{errors.turma.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Turno <span className="text-red-500">*</span></label>
          <div className="flex gap-3">
            {(['Matutino', 'Vespertino', 'Integral'] as const).map(t => (
              <button key={t} type="button" onClick={() => setValue('turno', t)}
                className={`flex-1 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${turno === t ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                {t}
              </button>
            ))}
          </div>
          {errors.turno && <p className="text-red-500 text-xs mt-1">{errors.turno.message}</p>}
        </div>
      </div>

      {/* Professores */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-indigo-700 border-b border-indigo-100 pb-2">Professores</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Professor(a) Generalista <span className="text-red-500">*</span></label>
            <input {...register('professor_generalista')} className={inputCls} placeholder="Nome completo" />
            {errors.professor_generalista && <p className="text-red-500 text-xs mt-1">{errors.professor_generalista.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula <span className="text-gray-400 text-xs">(opcional)</span></label>
            <input {...register('matricula_professor')} className={inputCls} placeholder="Ex: 123456" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[2, 3, 4].map(n => (
            <div key={n}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Professor(a) {n} <span className="text-gray-400 text-xs">(ETI)</span>
              </label>
              <input
                {...register(`professor_${n}` as 'professor_2' | 'professor_3' | 'professor_4')}
                className={inputCls} placeholder="Nome completo"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Coordenador(a) Pedagógico(a) <span className="text-gray-400 text-xs">(opcional)</span></label>
            <input {...register('nome_coordenador')} className={inputCls} placeholder="Nome completo" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula <span className="text-gray-400 text-xs">(opcional)</span></label>
            <input {...register('matricula_coordenador')} className={inputCls} placeholder="Ex: 654321" />
          </div>
        </div>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{erro}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
          Cancelar
        </button>
        <button type="button" onClick={salvar} disabled={salvando}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm">
          {salvando ? 'Salvando...' : modo === 'nova' ? 'Criar Turma' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  )
}
