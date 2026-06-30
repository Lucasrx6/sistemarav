import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { FormularioRavAluno } from '@/components/rav/FormularioRavAluno'
import type { Turma } from '@/types/turma'
import type { Aluno } from '@/types/aluno'

export default async function NovoRavAlunoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; alunoId: string }>
  searchParams: Promise<{ bimestre?: string }>
}) {
  const { id: turmaId, alunoId } = await params
  const { bimestre: bimStr } = await searchParams
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: turma }, { data: aluno }] = await Promise.all([
    supabase.from('turmas').select('*').eq('id', turmaId).single(),
    supabase.from('alunos').select('*').eq('id', alunoId).single(),
  ])

  if (!turma || !aluno) notFound()

  const bimestreInicial = bimStr ? parseInt(bimStr) : undefined

  return (
    <div className="space-y-6">
      <Link href={`/turmas/${turmaId}/alunos/${alunoId}`}
        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
        ← {(aluno as Aluno).nome}
      </Link>
      <h1 className="text-xl font-bold text-gray-900">Novo RAv</h1>
      <FormularioRavAluno
        turma={turma as Turma}
        aluno={aluno as Aluno}
        bimestreInicial={bimestreInicial}
        modo="novo"
      />
    </div>
  )
}
