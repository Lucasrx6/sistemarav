import type { Metadata } from 'next'
import Link from 'next/link'
import { FormularioRav } from '@/components/rav/FormularioRav'

export const metadata: Metadata = {
  title: 'Novo RAv — Sistema RAv',
}

export default function NovoRavPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Registro de Avaliação</h1>
          <p className="text-gray-500 text-sm">Preencha todos os campos obrigatórios</p>
        </div>
      </div>

      <FormularioRav modo="novo" />
    </div>
  )
}
