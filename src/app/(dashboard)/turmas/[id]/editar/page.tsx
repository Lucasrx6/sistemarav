import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { FormularioTurma } from '@/components/turma/FormularioTurma'
import type { Turma } from '@/types/turma'

export default async function EditarTurmaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase.from('turmas').select('*').eq('id', id).single()
  if (!data) notFound()

  return (
    <div className="space-y-6">
      <Link href={`/turmas/${id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
        ← Voltar para a Turma
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Turma</h1>
        <p className="text-gray-500 text-sm mt-0.5">{(data as Turma).ano} Ano — Turma {(data as Turma).turma}</p>
      </div>
      <FormularioTurma turmaInicial={data as Turma} modo="editar" />
    </div>
  )
}
