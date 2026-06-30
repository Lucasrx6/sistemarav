import type { Metadata } from 'next'
import Link from 'next/link'
import { FormularioTurma } from '@/components/turma/FormularioTurma'

export const metadata: Metadata = { title: 'Nova Turma — Sistema RAv' }

export default function NovaTurmaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/turmas" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
          ← Minhas Turmas
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nova Turma</h1>
        <p className="text-gray-500 text-sm mt-0.5">Cadastre os dados que se repetem para toda a turma</p>
      </div>
      <FormularioTurma modo="nova" />
    </div>
  )
}
