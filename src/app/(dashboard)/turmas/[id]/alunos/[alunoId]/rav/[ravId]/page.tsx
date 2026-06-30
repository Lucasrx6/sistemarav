import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { FormularioRavAluno } from '@/components/rav/FormularioRavAluno'
import type { Turma } from '@/types/turma'
import type { Aluno } from '@/types/aluno'
import type { Rav } from '@/types/rav'

export default async function EditarRavAlunoPage({
  params,
}: {
  params: Promise<{ id: string; alunoId: string; ravId: string }>
}) {
  const { id: turmaId, alunoId, ravId } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: turma }, { data: aluno }, { data: rav }] = await Promise.all([
    supabase.from('turmas').select('*').eq('id', turmaId).single(),
    supabase.from('alunos').select('*').eq('id', alunoId).single(),
    supabase.from('ravs').select('*').eq('id', ravId).single(),
  ])

  if (!turma || !aluno || !rav) notFound()

  const a = aluno as Aluno

  return (
    <div className="space-y-6">
      <Link href={`/turmas/${turmaId}/alunos/${alunoId}`}
        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
        ← {a.nome}
      </Link>
      <h1 className="text-xl font-bold text-gray-900">
        Editar RAv — {(rav as Rav).bimestre}º Bimestre
      </h1>
      <FormularioRavAluno
        turma={turma as Turma}
        aluno={a}
        ravInicial={rav as Rav}
        modo="editar"
      />
    </div>
  )
}
