import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ListaAlunos } from '@/components/aluno/ListaAlunos'
import type { Turma } from '@/types/turma'
import type { AlunoComRavs } from '@/types/aluno'
import { BotaoExportarTurma } from '@/components/turma/BotaoExportarTurma'
import { BotaoGerarBimestre } from '@/components/turma/BotaoGerarBimestre'
import { BotaoCarregarAlunos } from '@/components/turma/BotaoCarregarAlunos'

export const metadata: Metadata = { title: 'Turma — Sistema RAv' }

async function excluirAluno(alunoId: string) {
  'use server'
  const supabase = await createServerClient()
  await supabase.from('alunos').delete().eq('id', alunoId)
  redirect('.')
}

export default async function TurmaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: turma } = await supabase
    .from('turmas')
    .select('*')
    .eq('id', id)
    .single()

  if (!turma) notFound()

  const { data: alunosData } = await supabase
    .from('alunos')
    .select('*, ravs(id, bimestre, status, updated_at)')
    .eq('turma_id', id)
    .order('nome')

  const t = turma as Turma
  const alunos: AlunoComRavs[] = (alunosData ?? []) as AlunoComRavs[]

  // Calcula progresso por bimestre
  const progresso = [1, 2, 3, 4].map(bim => {
    const ravsDoBim = alunos.flatMap(a => (a.ravs ?? []).filter(r => r.bimestre === bim))
    return {
      bimestre: bim,
      total: alunos.length,
      comRav: ravsDoBim.length,
      finalizados: ravsDoBim.filter(r => r.status === 'finalizado').length,
    }
  })

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link href="/turmas" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
        ← Minhas Turmas
      </Link>

      {/* Header da turma */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t.ano} Ano — Turma {t.turma}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{t.unidade_escolar} · {t.cre}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{t.turno}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t.bloco}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t.ano_letivo}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Prof. {t.professor_generalista}{t.matricula_professor ? ` — Mat. ${t.matricula_professor}` : ''}</p>
            {t.nome_coordenador && (
              <p className="text-sm text-gray-500">Coord. {t.nome_coordenador}{t.matricula_coordenador ? ` — Mat. ${t.matricula_coordenador}` : ''}</p>
            )}
          </div>
          <Link href={`/turmas/${id}/editar`}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 hover:border-indigo-400 px-4 py-2 rounded-lg transition-colors flex-shrink-0">
            Editar Turma
          </Link>
        </div>
      </div>

      {/* Progresso por bimestre */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {progresso.map(({ bimestre, total, comRav, finalizados }) => (
          <div key={bimestre} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">{bimestre}º Bim.</span>
              <span className="text-xs text-gray-400">{finalizados}/{total}</span>
            </div>

            {/* Barra de progresso */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: total > 0 ? `${(finalizados / total) * 100}%` : '0%' }}
              />
            </div>

            <div className="flex flex-col gap-1">
              {comRav > 0 && (
                <BotaoExportarTurma turmaId={id} bimestre={bimestre} label="Exportar" />
              )}
              <BotaoGerarBimestre turmaId={id} bimestre={bimestre} totalAlunos={total} jaTemRav={comRav} />
            </div>
          </div>
        ))}
      </div>

      {/* Lista de alunos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-gray-900">
            Alunos <span className="text-gray-400 text-base font-normal">({alunos.length})</span>
          </h2>
          <div className="flex items-center gap-2">
            <BotaoCarregarAlunos turmaId={id} />
            <Link href={`/turmas/${id}/alunos/novo`}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Aluno
            </Link>
          </div>
        </div>
        <ListaAlunos turmaId={id} alunos={alunos} onExcluir={excluirAluno} />
      </div>
    </div>
  )
}
