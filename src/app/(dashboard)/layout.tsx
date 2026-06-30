import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sistema RAv — SEEDF',
  description: 'Registro de Avaliação das escolas públicas do Distrito Federal.',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let { data: professor } = await supabase
    .from('professores')
    .select('nome, escola_id')
    .eq('id', user.id)
    .single()

  if (!professor) {
    const nomePadrao = (user.user_metadata?.full_name as string | undefined)
      || user.email?.split('@')[0]
      || 'Professor(a)'
    const { data: criado, error: erroCriacao } = await supabase
      .from('professores')
      .insert({ id: user.id, nome: nomePadrao })
      .select('nome, escola_id')
      .single()
    if (erroCriacao) console.error('[layout] Erro ao criar professor:', erroCriacao.message)
    professor = criado
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
  const isAdmin = user.email ? adminEmails.includes(user.email.toLowerCase()) : false

  const handleSignOut = async () => {
    'use server'
    const supabase2 = await createServerClient()
    await supabase2.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-indigo-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/turmas" className="flex items-center gap-3 group">
            <div className="bg-white/10 rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-lg leading-none">Sistema RAv</span>
              <p className="text-indigo-300 text-xs leading-none mt-0.5">SEEDF</p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/turmas"
              className="text-indigo-200 hover:text-white hover:bg-white/10 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
              Turmas
            </Link>
            {isAdmin && (
              <Link href="/admin/convites"
                className="text-indigo-300 hover:text-white hover:bg-white/10 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
                Convites
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{professor?.nome ?? user.email}</p>
              <p className="text-xs text-indigo-300">Professor(a)</p>
            </div>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-indigo-200 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
