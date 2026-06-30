'use client'

import { UseFormReturn } from 'react-hook-form'
import type { RavSchemaType } from '@/lib/validations/ravSchema'

const OPCOES_RESULTADO = [
  { value: 'progressao_continuada', label: 'Progressão Continuada' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'reprovado', label: 'Reprovado' },
  { value: 'abandono', label: 'Abandono' },
  { value: 'cursando', label: 'Cursando' },
] as const

interface SecaoEProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<RavSchemaType, any, any>
}

export function SecaoE({ form }: SecaoEProps) {
  const { watch, setValue, formState: { errors } } = form
  const resultadoFinal = watch('resultado_final')

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-indigo-700 border-b border-indigo-100 pb-2 flex items-center gap-2">
        <span className="bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">E</span>
        Resultado Final
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-normal ml-1">
          Somente 4º Bimestre
        </span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {OPCOES_RESULTADO.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setValue('resultado_final', value)}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
              resultadoFinal === value
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-gray-50'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              resultadoFinal === value ? 'border-indigo-600' : 'border-gray-400'
            }`}>
              {resultadoFinal === value && (
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              )}
            </div>
            {label}
          </button>
        ))}
      </div>

      {errors.resultado_final && (
        <p className="text-red-500 text-xs mt-1">{errors.resultado_final.message}</p>
      )}
    </div>
  )
}
