'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  turmaId: string
  bimestre: number
  totalAlunos: number
  jaTemRav: number
}

export function BotaoGerarBimestre({ turmaId, bimestre, totalAlunos, jaTemRav }: Props) {
  const router = useRouter()
  const [gerando, setGerando] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)

  const faltam = totalAlunos - jaTemRav
  if (faltam === 0) return null

  const gerar = async () => {
    if (!confirm(`Criar RAVs em rascunho para ${faltam} aluno(s) no ${bimestre}º bimestre?`)) return
    setGerando(true)
    setMensagem(null)
    try {
      const res = await fetch(`/api/turmas/${turmaId}/gerar-bimestre`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bimestre }),
      })
      const data = await res.json()
      if (!res.ok) { setMensagem(data.error ?? 'Erro ao gerar'); return }
      setMensagem(data.mensagem)
      router.refresh()
    } catch {
      setMensagem('Erro de conexão.')
    } finally {
      setGerando(false)
    }
  }

  return (
    <div>
      <button
        onClick={gerar}
        disabled={gerando}
        title={`Criar RAVs em rascunho para os ${faltam} alunos sem RAV no ${bimestre}º bimestre`}
        className="w-full text-xs text-gray-600 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 rounded-lg py-1.5 font-medium transition-colors disabled:opacity-50"
      >
        {gerando ? 'Gerando...' : `Gerar ${faltam} RAV${faltam > 1 ? 's' : ''}`}
      </button>
      {mensagem && <p className="text-green-600 text-xs mt-1">{mensagem}</p>}
    </div>
  )
}
