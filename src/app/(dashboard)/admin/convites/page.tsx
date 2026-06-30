'use client'

import { useEffect, useState } from 'react'

interface Convite {
  id: string
  codigo: string
  criado_em: string
  usado: boolean
  usado_em: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminConvitesPage() {
  const [convites, setConvites] = useState<Convite[]>([])
  const [carregando, setCarregando] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [copiado, setCopiado] = useState<string | null>(null)

  async function carregar() {
    setCarregando(true)
    const res = await fetch('/api/admin/convites')
    if (res.status === 403) {
      setErro('Você não tem permissão para acessar esta página.')
      setCarregando(false)
      return
    }
    const data = await res.json()
    setConvites(data)
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  async function gerarConvite() {
    setGerando(true)
    const res = await fetch('/api/admin/convites', { method: 'POST' })
    if (res.ok) {
      await carregar()
    }
    setGerando(false)
  }

  async function excluirConvite(id: string) {
    await fetch('/api/admin/convites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await carregar()
  }

  async function copiar(codigo: string) {
    await navigator.clipboard.writeText(codigo)
    setCopiado(codigo)
    setTimeout(() => setCopiado(null), 2000)
  }

  const livres = convites.filter(c => !c.usado)
  const usados = convites.filter(c => c.usado)

  if (erro) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600 font-semibold">{erro}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Convites</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gere códigos para liberar o acesso de novas professoras.
          </p>
        </div>
        <button
          onClick={gerarConvite}
          disabled={gerando}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {gerando ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
          )}
          Gerar convite
        </button>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-16">
          <svg className="w-6 h-6 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        </div>
      ) : (
        <>
          {/* Convites disponíveis */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-sm">
                Disponíveis <span className="text-gray-400 font-normal">({livres.length})</span>
              </h2>
            </div>
            {livres.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Nenhum convite disponível. Gere um acima.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {livres.map(c => (
                  <li key={c.id} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-mono text-lg font-bold text-indigo-700 tracking-widest">{c.codigo}</span>
                      <p className="text-xs text-gray-400 mt-0.5">Gerado em {formatDate(c.criado_em)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copiar(c.codigo)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {copiado === c.codigo ? (
                          <>
                            <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                            </svg>
                            Copiado
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                            </svg>
                            Copiar
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => excluirConvite(c.id)}
                        className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Convites já utilizados */}
          {usados.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 text-sm">
                  Utilizados <span className="text-gray-400 font-normal">({usados.length})</span>
                </h2>
              </div>
              <ul className="divide-y divide-gray-50">
                {usados.map(c => (
                  <li key={c.id} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-mono text-sm text-gray-400 tracking-widest line-through">{c.codigo}</span>
                      {c.usado_em && (
                        <p className="text-xs text-gray-400 mt-0.5">Usado em {formatDate(c.usado_em)}</p>
                      )}
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Utilizado</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
