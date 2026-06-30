import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { FormularioAluno } from '@/components/aluno/FormularioAluno'
import type { Aluno } from '@/types/aluno'

export default async function EditarAlunoPage({
  params,
}: {
  params: Promise<{ id: string; alunoId: string }>
}) {
  const { id: turmaId, alunoId } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase.from('alunos').select('*').eq('id', alunoId).single()
  if (!data) notFound()

  return (
    <div className="space-y-6">
      <Link href={`/turmas/${turmaId}/alunos/${alunoId}`}
        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
        ← Voltar
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Editar Aluno</h1>
      <FormularioAluno turmaId={turmaId} alunoInicial={data as Aluno} modo="editar" />
    </div>
  )
}
