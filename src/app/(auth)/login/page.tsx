'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregando(true)
    setErro(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      setErro('E-mail ou senha inválidos. Verifique suas credenciais.')
      setCarregando(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo / Cabeçalho */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Sistema RAv</h1>
        <p className="text-indigo-200 mt-1 text-sm">Registro de Avaliação — SEEDF</p>
      </div>

      {/* Card de Login */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-6">Entrar na sua conta</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-indigo-100 mb-1.5">
              E-mail institucional
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/30 text-white placeholder-indigo-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-white/50 focus:border-white/60 outline-none transition"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-indigo-100 mb-1.5">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              required
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="w-full bg-white/10 border border-white/30 text-white placeholder-indigo-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-white/50 focus:border-white/60 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {erro && (
            <div className="bg-red-500/20 border border-red-400/40 rounded-xl p-3">
              <p className="text-red-200 text-sm">{erro}</p>
            </div>
          )}

          <button
            type="submit"
            id="btn-login"
            disabled={carregando}
            className="w-full bg-white text-indigo-900 font-semibold py-3 px-6 rounded-xl hover:bg-indigo-50 disabled:opacity-70 transition-all text-sm shadow-lg"
          >
            {carregando ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Entrando...
              </span>
            ) : 'Entrar'}
          </button>
        </form>
      </div>

      <p className="text-center mt-5">
        <Link href="/registro" className="text-indigo-300 hover:text-white text-sm transition-colors">
          Primeiro acesso? Use seu código de convite →
        </Link>
      </p>

      <p className="text-center text-indigo-300/60 text-xs mt-4">
        Secretaria de Estado de Educação do Distrito Federal
      </p>
    </div>
  )
}
