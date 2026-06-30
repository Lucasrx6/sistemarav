'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Turma } from '@/types/turma'

interface Props {
  turmas: Turma[]
  contagemAlunos: Record<string, number>
  onExcluir: (id: string) => Promise<void>
}

export function ListaTurmas({ turmas, contagemAlunos, onExcluir }: Props) {
  const [excluindo, setExcluindo] = useState<string | null>(null)

  if (turmas.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">Nenhuma turma cadastrada</p>
        <p className="text-gray-400 text-sm mt-1">Crie sua primeira turma para começar</p>
      </div>
    )
  }

  const handleExcluir = async (turma: Turma) => {
    const alunos = contagemAlunos[turma.id] ?? 0
    const aviso = alunos > 0
      ? `Esta turma tem ${alunos} aluno(s). Todos os alunos e RAVs serão excluídos. Confirma?`
      : 'Excluir esta turma?'
    if (!confirm(aviso)) return
    setExcluindo(turma.id)
    await onExcluir(turma.id)
    setExcluindo(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {turmas.map(turma => {
        const alunos = contagemAlunos[turma.id] ?? 0
        return (
          <div key={turma.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <Link href={`/turmas/${turma.id}`} className="block p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {turma.ano} Ano — Turma {turma.turma}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{turma.unidade_escolar}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{turma.turno}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{turma.bloco}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{turma.ano_letivo}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-indigo-600">{alunos}</p>
                  <p className="text-xs text-gray-400">{alunos === 1 ? 'aluno' : 'alunos'}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 truncate">
                Prof. {turma.professor_generalista}
              </p>
            </Link>

            <div className="border-t border-gray-100 px-5 py-3 flex gap-3">
              <Link href={`/turmas/${turma.id}/alunos/novo`}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                + Aluno
              </Link>
              <Link href={`/turmas/${turma.id}/editar`}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                Editar
              </Link>
              <button
                onClick={() => handleExcluir(turma)}
                disabled={excluindo === turma.id}
                className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 ml-auto">
                {excluindo === turma.id ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
