'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { AlunoComRavs } from '@/types/aluno'

const STATUS_COR: Record<string, string> = {
  finalizado: 'bg-green-100 text-green-700 border-green-200',
  rascunho:   'bg-amber-100 text-amber-700 border-amber-200',
}
const STATUS_LABEL: Record<string, string> = {
  finalizado: '✓',
  rascunho:   '~',
}

interface Props {
  turmaId: string
  alunos: AlunoComRavs[]
  onExcluir: (alunoId: string) => Promise<void>
}

export function ListaAlunos({ turmaId, alunos, onExcluir }: Props) {
  const [excluindo, setExcluindo] = useState<string | null>(null)

  if (alunos.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
        <p className="text-gray-400 text-sm">Nenhum aluno cadastrado nesta turma ainda.</p>
      </div>
    )
  }

  const handleExcluir = async (alunoId: string, nome: string) => {
    if (!confirm(`Excluir "${nome}"? Todos os RAVs deste aluno serão excluídos.`)) return
    setExcluindo(alunoId)
    await onExcluir(alunoId)
    setExcluindo(null)
  }

  return (
    <div className="space-y-2">
      {alunos.map(aluno => {
        const ravPorBim: Record<number, { id: string; status: string }> = {}
        aluno.ravs?.forEach(r => { ravPorBim[r.bimestre] = { id: r.id, status: r.status } })

        return (
          <div key={aluno.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 p-4">
              {/* Info do aluno */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/turmas/${turmaId}/alunos/${aluno.id}`}
                    className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors truncate">
                    {aluno.nome}
                  </Link>
                  {aluno.tem_deficiencia && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">TEA/Def.</span>
                  )}
                  {aluno.houve_adequacao && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Adequação</span>
                  )}
                </div>

                {/* Badges dos bimestres */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[1, 2, 3, 4].map(bim => {
                    const rav = ravPorBim[bim]
                    if (rav) {
                      return (
                        <Link key={bim}
                          href={`/turmas/${turmaId}/alunos/${aluno.id}/rav/${rav.id}`}
                          className={`text-xs px-2 py-0.5 rounded border font-medium transition-opacity hover:opacity-80 ${STATUS_COR[rav.status]}`}>
                          {bim}º {STATUS_LABEL[rav.status] ?? '?'}
                        </Link>
                      )
                    }
                    return (
                      <Link key={bim}
                        href={`/turmas/${turmaId}/alunos/${aluno.id}/rav/novo?bimestre=${bim}`}
                        className="text-xs px-2 py-0.5 rounded border border-dashed border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors">
                        {bim}º +
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Ações rápidas */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/turmas/${turmaId}/alunos/${aluno.id}`}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                  Ver RAVs
                </Link>
                <button
                  onClick={() => handleExcluir(aluno.id, aluno.nome)}
                  disabled={excluindo === aluno.id}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50">
                  {excluindo === aluno.id ? '...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
