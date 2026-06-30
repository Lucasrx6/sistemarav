'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegistroPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  const inputCls = 'w-full bg-white/10 border border-white/30 text-white placeholder-indigo-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-white/50 focus:border-white/60 outline-none transition'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (senha !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }
    setCarregando(true)
    setErro(null)

    const res = await fetch('/api/auth/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    })
    const data = await res.json()

    if (!res.ok) {
      setErro(data.error ?? 'Erro ao criar conta.')
      setCarregando(false)
      return
    }

    setSucesso(true)
    setTimeout(() => router.push('/login'), 3000)
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Sistema RAv</h1>
        <p className="text-indigo-200 mt-1 text-sm">Registro de Avaliação — SEEDF</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-6">Criar conta</h2>

        {sucesso ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold">Conta criada com sucesso!</p>
            <p className="text-indigo-200 text-sm">Redirecionando para o login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-indigo-100 mb-1.5">
                Nome completo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={e => setNome(e.target.value)}
                className={inputCls}
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-100 mb-1.5">
                E-mail <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputCls}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-100 mb-1.5">
                Senha <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                className={inputCls}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-100 mb-1.5">
                Confirmar senha <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmar}
                onChange={e => setConfirmar(e.target.value)}
                className={inputCls}
                placeholder="Repita a senha"
              />
            </div>

            {erro && (
              <div className="bg-red-500/20 border border-red-400/40 rounded-xl p-3">
                <p className="text-red-200 text-sm">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-white text-indigo-900 font-semibold py-3 px-6 rounded-xl hover:bg-indigo-50 disabled:opacity-70 transition-all text-sm shadow-lg mt-2"
            >
              {carregando ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Criando conta...
                </span>
              ) : 'Criar conta'}
            </button>
          </form>
        )}
      </div>

      <p className="text-center mt-6">
        <Link href="/login" className="text-indigo-300 hover:text-white text-sm transition-colors">
          ← Voltar para o login
        </Link>
      </p>
    </div>
  )
}
