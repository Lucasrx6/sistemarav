'use client'

import { UseFormReturn } from 'react-hook-form'
import type { RavSchemaType } from '@/lib/validations/ravSchema'

interface SecaoBProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<RavSchemaType, any, any>
}

export function SecaoB({ form }: SecaoBProps) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-indigo-700 border-b border-indigo-100 pb-2 flex items-center gap-2">
        <span className="bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">B</span>
        Descrição do Processo de Aprendizagem
      </h2>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
        <p className="text-sm text-indigo-700">
          <strong>Orientação:</strong> Descreva as aprendizagens evidenciadas, dificuldades percebidas,
          estratégias utilizadas e resultados das intervenções pedagógicas realizadas no bimestre.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('descricao_aprendizagem')}
          rows={10}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-y font-sans leading-relaxed"
          placeholder="Escreva aqui a descrição detalhada do processo de aprendizagem do(a) estudante neste bimestre..."
        />
        {errors.descricao_aprendizagem && (
          <p className="text-red-500 text-xs mt-1">{errors.descricao_aprendizagem.message}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">Este campo será exportado para a seção B do documento oficial.</p>
      </div>
    </div>
  )
}
