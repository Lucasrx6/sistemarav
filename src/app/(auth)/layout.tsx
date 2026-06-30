import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login — Sistema RAv',
  description: 'Acesse o Sistema de Registro de Avaliação das escolas públicas do DF.',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 flex items-center justify-center p-4">
      {children}
    </div>
  )
}
