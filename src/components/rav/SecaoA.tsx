'use client'

import { UseFormReturn } from 'react-hook-form'
import type { RavSchemaType } from '@/lib/validations/ravSchema'

interface SecaoAProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<RavSchemaType, any, any>
}

export function SecaoA({ form }: SecaoAProps) {
  const { register, watch, setValue, formState: { errors } } = form
  const bloco = watch('bloco')
  const turno = watch('turno')
  const temDeficiencia = watch('tem_deficiencia')
  const houveAdequacao = watch('houve_adequacao')

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-indigo-700 border-b border-indigo-100 pb-2 flex items-center gap-2">
        <span className="bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">A</span>
        Identificação
      </h2>

      {/* Linha 1: Ano Letivo + CRE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ano Letivo <span className="text-red-500">*</span></label>
          <input
            {...register('ano_letivo')}
            defaultValue="2026"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="2026"
          />
          {errors.ano_letivo && <p className="text-red-500 text-xs mt-1">{errors.ano_letivo.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Coordenação Regional de Ensino <span className="text-red-500">*</span></label>
          <input
            {...register('cre')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="Ex: Plano Piloto"
          />
          {errors.cre && <p className="text-red-500 text-xs mt-1">{errors.cre.message}</p>}
        </div>
      </div>

      {/* Unidade Escolar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Unidade Escolar <span className="text-red-500">*</span></label>
        <input
          {...register('unidade_escolar')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          placeholder="Nome completo da escola"
        />
        {errors.unidade_escolar && <p className="text-red-500 text-xs mt-1">{errors.unidade_escolar.message}</p>}
      </div>

      {/* Bloco */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bloco <span className="text-red-500">*</span></label>
        <div className="flex gap-4">
          {(['1º Bloco', '2º Bloco'] as const).map(b => (
            <button
              key={b}
              type="button"
              onClick={() => setValue('bloco', b)}
              className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                bloco === b
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        {errors.bloco && <p className="text-red-500 text-xs mt-1">{errors.bloco.message}</p>}
      </div>

      {/* Ano + Turma */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ano <span className="text-red-500">*</span></label>
          <select
            {...register('ano')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
          >
            <option value="">Selecione...</option>
            {['4º', '5º', '6º', '7º', '8º', '9º'].map(a => (
              <option key={a} value={a}>{a} Ano</option>
            ))}
          </select>
          {errors.ano && <p className="text-red-500 text-xs mt-1">{errors.ano.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Turma <span className="text-red-500">*</span></label>
          <select
            {...register('turma')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
          >
            <option value="">Selecione...</option>
            {['A', 'B', 'C', 'D', 'E', 'F'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.turma && <p className="text-red-500 text-xs mt-1">{errors.turma.message}</p>}
        </div>
      </div>

      {/* Turno */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Turno <span className="text-red-500">*</span></label>
        <div className="flex gap-3">
          {(['Matutino', 'Vespertino', 'Integral'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setValue('turno', t)}
              className={`flex-1 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                turno === t
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {errors.turno && <p className="text-red-500 text-xs mt-1">{errors.turno.message}</p>}
      </div>

      {/* Professor Generalista + Matrícula */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Professor(a) Generalista <span className="text-red-500">*</span></label>
          <input
            {...register('professor_generalista')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="Nome completo"
          />
          {errors.professor_generalista && <p className="text-red-500 text-xs mt-1">{errors.professor_generalista.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula <span className="text-gray-400 text-xs">(opcional)</span></label>
          <input
            {...register('matricula_professor')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="Ex: 123456"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[2, 3, 4].map(n => (
          <div key={n}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professor(a) {n} <span className="text-gray-400 text-xs">(opcional / ETI)</span>
            </label>
            <input
              {...register(`professor_${n}` as 'professor_2' | 'professor_3' | 'professor_4')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="Nome completo"
            />
          </div>
        ))}
      </div>

      {/* Coordenador Pedagógico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Coordenador(a) Pedagógico(a) <span className="text-gray-400 text-xs">(opcional)</span></label>
          <input
            {...register('nome_coordenador')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="Nome completo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula <span className="text-gray-400 text-xs">(opcional)</span></label>
          <input
            {...register('matricula_coordenador')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="Ex: 654321"
          />
        </div>
      </div>

      {/* Estudante */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do(a) Estudante <span className="text-red-500">*</span></label>
        <input
          {...register('estudante')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          placeholder="Nome completo do estudante"
        />
        {errors.estudante && <p className="text-red-500 text-xs mt-1">{errors.estudante.message}</p>}
      </div>

      {/* Checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
            temDeficiencia ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
          }`}
          onClick={() => setValue('tem_deficiencia', !temDeficiencia)}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            temDeficiencia ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400'
          }`}>
            {temDeficiencia && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </div>
          <span className="text-sm text-gray-700">Apresenta Deficiência ou TEA?</span>
        </div>

        <div
          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
            houveAdequacao ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
          }`}
          onClick={() => setValue('houve_adequacao', !houveAdequacao)}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            houveAdequacao ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400'
          }`}>
            {houveAdequacao && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </div>
          <span className="text-sm text-gray-700">Houve adequação curricular?</span>
        </div>
      </div>

      {/* Bimestre + Dias + Faltas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bimestre <span className="text-red-500">*</span></label>
          <select
            {...register('bimestre', { valueAsNumber: true })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
          >
            <option value="">Selecione...</option>
            {[1, 2, 3, 4].map(b => (
              <option key={b} value={b}>{b}º Bimestre</option>
            ))}
          </select>
          {errors.bimestre && <p className="text-red-500 text-xs mt-1">{errors.bimestre.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total de Dias Letivos</label>
          <input
            type="number"
            {...register('total_dias_letivos')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="Ex: 50"
            min={1}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total de Faltas</label>
          <input
            type="number"
            {...register('total_faltas')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="Ex: 3"
            min={0}
          />
        </div>
      </div>
    </div>
  )
}
