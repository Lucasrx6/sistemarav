import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import type { Turma } from '@/types/turma'
import type { AlunoComRavs } from '@/types/aluno'
import { BotaoExportar } from '@/components/rav/BotaoExportar'

const STATUS_ESTILO: Record<string, { bg: string; texto: string; label: string }> = {
  finalizado: { bg: 'bg-green-50 border-green-200', texto: 'text-green-700', label: 'Finalizado' },
  rascunho:   { bg: 'bg-amber-50 border-amber-200', texto: 'text-amber-700', label: 'Rascunho' },
}

export default async function AlunoPage({ params }: { params: Promise<{ id: string; alunoId: string }> }) {
  const { id: turmaId, alunoId } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: turma }, { data: aluno }] = await Promise.all([
    supabase.from('turmas').select('*').eq('id', turmaId).single(),
    supabase.from('alunos').select('*, ravs(id, bimestre, status, updated_at)').eq('id', alunoId).single(),
  ])

  if (!turma || !aluno) notFound()

  const t = turma as Turma
  const a = aluno as AlunoComRavs

  const ravPorBim: Record<number, { id: string; status: string; updated_at: string }> = {}
  a.ravs?.forEach(r => { ravPorBim[r.bimestre] = r })

  return (
    <div className="space-y-6">
      <Link href={`/turmas/${turmaId}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
        ← {t.ano} Ano — Turma {t.turma}
      </Link>

      {/* Info do aluno */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{a.nome}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{t.unidade_escolar}</p>
            <div className="flex gap-2 mt-2">
              {a.tem_deficiencia && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">TEA / Deficiência</span>}
              {a.houve_adequacao && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Adequação Curricular</span>}
            </div>
          </div>
          <Link href={`/turmas/${turmaId}/alunos/${alunoId}/editar`}
            className="text-sm text-gray-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors">
            Editar
          </Link>
        </div>
      </div>

      {/* Cards de bimestre */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Registros de Avaliação</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(bim => {
            const rav = ravPorBim[bim]
            const estilo = rav ? (STATUS_ESTILO[rav.status] ?? STATUS_ESTILO.rascunho) : null

            return (
              <div key={bim} className={`rounded-xl border p-4 space-y-3 ${estilo ? estilo.bg : 'bg-gray-50 border-gray-200 border-dashed'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">{bim}º Bimestre</span>
                  {estilo && (
                    <span className={`text-xs font-medium ${estilo.texto}`}>{estilo.label}</span>
                  )}
                </div>

                {rav ? (
                  <div className="space-y-2">
                    <Link
                      href={`/turmas/${turmaId}/alunos/${alunoId}/rav/${rav.id}`}
                      className="block w-full text-center text-xs bg-white border border-gray-200 hover:border-indigo-300 text-indigo-600 hover:text-indigo-800 rounded-lg py-1.5 font-medium transition-colors">
                      Editar RAV
                    </Link>
                    {rav.status === 'finalizado' && (
                      <BotaoExportar ravId={rav.id} estudante={a.nome} bimestre={bim} />
                    )}
                  </div>
                ) : (
                  <Link
                    href={`/turmas/${turmaId}/alunos/${alunoId}/rav/novo?bimestre=${bim}`}
                    className="block w-full text-center text-xs border border-dashed border-gray-300 hover:border-indigo-400 text-gray-400 hover:text-indigo-600 rounded-lg py-1.5 font-medium transition-colors">
                    + Criar RAV
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

