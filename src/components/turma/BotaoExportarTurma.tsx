'use client'

import { useState } from 'react'

interface Props {
  turmaId: string
  bimestre: number
  label?: string
}

export function BotaoExportarTurma({ turmaId, bimestre, label = 'Exportar Turma' }: Props) {
  const [exportando, setExportando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const exportar = async () => {
    setExportando(true)
    setErro(null)
    try {
      const res = await fetch(`/api/turmas/${turmaId}/exportar-bimestre`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bimestre, apenas_finalizados: true }),
      })

      if (!res.ok) {
        const data = await res.json()
        setErro(data.error ?? 'Erro ao exportar')
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `turma-${bimestre}bim.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setErro('Erro de conexão.')
    } finally {
      setExportando(false)
    }
  }

  return (
    <div>
      <button
        onClick={exportar}
        disabled={exportando}
        title={`Exportar todos os RAVs finalizados do ${bimestre}º bimestre em um único DOCX`}
        className="w-full text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 rounded-lg py-1.5 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exportando ? 'Gerando...' : label}
      </button>
      {erro && <p className="text-red-500 text-xs mt-1">{erro}</p>}
    </div>
  )
}
