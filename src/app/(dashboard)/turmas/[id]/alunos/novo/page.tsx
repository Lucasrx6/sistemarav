import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { FormularioAluno } from '@/components/aluno/FormularioAluno'
import type { Turma } from '@/types/turma'

export default async function NovoAlunoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase.from('turmas').select('*').eq('id', id).single()
  if (!data) notFound()

  const t = data as Turma

  return (
    <div className="space-y-6">
      <Link href={`/turmas/${id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
        ← {t.ano} Ano — Turma {t.turma}
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Adicionar Aluno</h1>
        <p className="text-gray-500 text-sm mt-0.5">{t.unidade_escolar}</p>
      </div>
      <FormularioAluno turmaId={id} modo="novo" />
    </div>
  )
}
