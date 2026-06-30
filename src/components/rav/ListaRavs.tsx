'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Rav } from '@/types/rav'

const STATUS_BADGE: Record<string, string> = {
  rascunho: 'bg-amber-100 text-amber-700',
  finalizado: 'bg-emerald-100 text-emerald-700',
}

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  finalizado: 'Finalizado',
}

interface ListaRavsProps {
  ravs: Rav[]
  mensagemVazia?: string
  onExcluir: (id: string) => Promise<void>
  onDuplicar: (id: string) => Promise<void>
}

export function ListaRavs({ ravs, mensagemVazia, onExcluir, onDuplicar }: ListaRavsProps) {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [exportando, setExportando] = useState(false)
  const [duplicando, setDuplicando] = useState<string | null>(null)

  const toggleSelecionado = (id: string) => {
    setSelecionados(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const exportarSelecionados = async () => {
    if (selecionados.size === 0) return
    setExportando(true)
    try {
      const res = await fetch('/api/rav/export-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selecionados] }),
      })
      if (!res.ok) throw new Error('Erro ao exportar')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'RAv_estudantes.docx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert('Erro ao exportar. Tente novamente.')
    } finally {
      setExportando(false)
    }
  }

  const handleDuplicar = async (id: string, bimestre: number) => {
    if (bimestre >= 4) {
      alert('Este RAv já está no 4º bimestre, não é possível duplicar.')
      return
    }
    if (!confirm(`Criar cópia deste RAv para o ${bimestre + 1}º bimestre?`)) return
    setDuplicando(id)
    try {
      await onDuplicar(id)
    } catch {
      alert('Erro ao duplicar RAv.')
      setDuplicando(null)
    }
  }

  if (ravs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-gray-700 font-semibold text-lg mb-1">Nenhum RAv encontrado</h3>
        <p className="text-gray-400 text-sm mb-6">
          {mensagemVazia ?? 'Crie seu primeiro Registro de Avaliação.'}
        </p>
        <Link
          href="/rav/novo"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Criar Primeiro RAv
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Barra de exportação em lote */}
      {selecionados.size > 0 && (
        <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between gap-4">
          <span className="text-sm text-indigo-700 font-medium">
            {selecionados.size} RAv{selecionados.size !== 1 ? 's' : ''} selecionado{selecionados.size !== 1 ? 's' : ''}
          </span>
          <button
            onClick={exportarSelecionados}
            disabled={exportando}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {exportando ? 'Exportando...' : 'Exportar Selecionados (.docx)'}
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="w-10 px-4 py-3"></th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Estudante</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Ano / Turma</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Bimestre</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-right px-5 py-3 font-semibold text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ravs.map((rav) => (
              <tr
                key={rav.id}
                className={`hover:bg-gray-50/50 transition-colors ${selecionados.has(rav.id) ? 'bg-indigo-50/40' : ''}`}
              >
                <td className="px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={selecionados.has(rav.id)}
                    onChange={() => toggleSelecionado(rav.id)}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                </td>
                <td className="px-5 py-3.5">
                  <p className="font-medium text-gray-800">{rav.estudante}</p>
                  <p className="text-xs text-gray-400">{rav.unidade_escolar}</p>
                </td>
                <td className="px-4 py-3.5 text-gray-600">
                  {[rav.ano, rav.turma].filter(Boolean).join(' ')}
                </td>
                <td className="px-4 py-3.5 text-gray-600">{rav.bimestre}º Bimestre</td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[rav.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABEL[rav.status] ?? rav.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1 flex-wrap">
                    <Link
                      href={`/rav/${rav.id}`}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/rav/${rav.id}/preview`}
                      className="text-gray-500 hover:text-gray-700 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Preview
                    </Link>
                    {rav.bimestre < 4 && (
                      <button
                        type="button"
                        onClick={() => handleDuplicar(rav.id, rav.bimestre)}
                        disabled={duplicando === rav.id}
                        className="text-violet-600 hover:text-violet-800 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-violet-50 transition-colors disabled:opacity-50"
                      >
                        {duplicando === rav.id ? '...' : `Dup. ${rav.bimestre + 1}º Bim.`}
                      </button>
                    )}
                    <form action={onExcluir.bind(null, rav.id)}>
                      <button
                        type="submit"
                        className="text-red-500 hover:text-red-700 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Excluir
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
        <p className="text-xs text-gray-400">
          {ravs.length} registro{ravs.length !== 1 ? 's' : ''} encontrado{ravs.length !== 1 ? 's' : ''}
          {selecionados.size > 0 && ` · ${selecionados.size} selecionado${selecionados.size !== 1 ? 's' : ''}`}
        </p>
      </div>
    </div>
  )
}
