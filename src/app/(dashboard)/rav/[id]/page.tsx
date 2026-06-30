import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { FormularioRav } from '@/components/rav/FormularioRav'
import type { Rav } from '@/types/rav'

export const metadata: Metadata = {
  title: 'Editar RAv — Sistema RAv',
}

export default async function EditarRavPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: rav, error } = await supabase
    .from('ravs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !rav) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editando RAv</h1>
          <p className="text-gray-500 text-sm">
            {rav.estudante} — {rav.bimestre}º Bimestre {rav.ano_letivo}
          </p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${
          rav.status === 'finalizado'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-amber-100 text-amber-700'
        }`}>
          {rav.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
        </span>
      </div>

      <FormularioRav ravInicial={rav as Rav} modo="editar" />
    </div>
  )
}
