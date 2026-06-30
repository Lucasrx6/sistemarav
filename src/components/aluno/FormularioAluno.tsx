'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { alunoSchema, type AlunoSchemaType } from '@/lib/validations/alunoSchema'
import type { Aluno } from '@/types/aluno'

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition'

interface Props {
  turmaId: string
  alunoInicial?: Aluno
  modo: 'novo' | 'editar'
}

export function FormularioAluno({ turmaId, alunoInicial, modo }: Props) {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<AlunoSchemaType>({
    resolver: zodResolver(alunoSchema) as any,
    defaultValues: alunoInicial
      ? {
          nome: alunoInicial.nome,
          tem_deficiencia: alunoInicial.tem_deficiencia,
          houve_adequacao: alunoInicial.houve_adequacao,
        }
      : { tem_deficiencia: false, houve_adequacao: false },
  })

  const { register, watch, setValue, formState: { errors } } = form
  const temDeficiencia = watch('tem_deficiencia')
  const houveAdequacao = watch('houve_adequacao')

  const salvar = async () => {
    const valido = await form.trigger()
    if (!valido) return

    setSalvando(true)
    setErro(null)

    try {
      const url    = modo === 'novo'
        ? `/api/turmas/${turmaId}/alunos`
        : `/api/turmas/${turmaId}/alunos/${alunoInicial!.id}`
      const method = modo === 'novo' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.getValues()),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Erro ao salvar.'); return }
      router.push(`/turmas/${turmaId}`)
      router.refresh()
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome do(a) Estudante <span className="text-red-500">*</span>
        </label>
        <input
          {...register('nome')}
          className={inputCls}
          placeholder="Nome completo do estudante"
          autoFocus
        />
        {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${temDeficiencia ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
          onClick={() => setValue('tem_deficiencia', !temDeficiencia)}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${temDeficiencia ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400'}`}>
            {temDeficiencia && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-700">Apresenta Deficiência ou TEA?</span>
        </div>

        <div
          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${houveAdequacao ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
          onClick={() => setValue('houve_adequacao', !houveAdequacao)}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${houveAdequacao ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400'}`}>
            {houveAdequacao && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-700">Houve adequação curricular?</span>
        </div>
      </div>

      {erro && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{erro}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
          Cancelar
        </button>
        <button type="button" onClick={salvar} disabled={salvando}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm">
          {salvando ? 'Salvando...' : modo === 'novo' ? 'Adicionar Aluno' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  )
}
