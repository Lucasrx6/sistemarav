import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ListaTurmas } from '@/components/turma/ListaTurmas'
import type { Turma } from '@/types/turma'

export const metadata: Metadata = { title: 'Minhas Turmas — Sistema RAv' }

async function excluirTurma(id: string) {
  'use server'
  const supabase = await createServerClient()
  await supabase.from('turmas').delete().eq('id', id)
  redirect('/turmas')
}

export default async function TurmasPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: turmasData }, { data: alunosData }] = await Promise.all([
    supabase.from('turmas').select('*').order('created_at', { ascending: false }),
    supabase.from('alunos').select('turma_id').eq('professor_id', user.id),
  ])

  const turmas: Turma[] = turmasData ?? []

  const contagemAlunos = (alunosData ?? []).reduce((acc, a) => {
    acc[a.turma_id] = (acc[a.turma_id] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Turmas</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gerencie suas turmas e os RAVs dos alunos</p>
        </div>
        <Link href="/turmas/nova"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Turma
        </Link>
      </div>

      <ListaTurmas turmas={turmas} contagemAlunos={contagemAlunos} onExcluir={excluirTurma} />
    </div>
  )
}
