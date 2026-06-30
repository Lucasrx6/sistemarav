'use client'

import { useState } from 'react'

interface BotaoExportarProps {
  ravId: string
  estudante: string
  bimestre: number
}

export function BotaoExportar({ ravId, estudante, bimestre }: BotaoExportarProps) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const exportarDocx = async () => {
    setLoading(true)
    setErro(null)
    try {
      const res = await fetch(`/api/rav/${ravId}/export`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErro(data.error || 'Erro ao exportar o documento.')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `RAv_${estudante.replace(/\s+/g, '_')}_${bimestre}Bim.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setErro('Erro de conexão ao tentar exportar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={exportarDocx}
        disabled={loading}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Gerando DOCX...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Exportar DOCX
          </>
        )}
      </button>
      {erro && <p className="text-red-500 text-xs">{erro}</p>}
    </div>
  )
}
