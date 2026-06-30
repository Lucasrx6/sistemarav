'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = { turmaId: string }

type Resultado = {
  criados: number
  pulados: number
  erros: string[]
  total: number
  mensagem: string
}

async function extrairTextoPdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

  const buffer = await file.arrayBuffer()
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise

  const linhas: string[] = []

  for (let i = 1; i <= doc.numPages; i++) {
    const pagina = await doc.getPage(i)
    const conteudo = await pagina.getTextContent()

    let linhaAtual = ''
    let xFim = 0
    let yAtual: number | null = null

    for (const item of conteudo.items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ti = item as any
      if (!('str' in ti) || !ti.str) continue

      const x: number = ti.transform[4]
      const y: number = ti.transform[5]

      if (yAtual === null) {
        yAtual = y
        linhaAtual = ti.str
        xFim = x + ti.width
      } else if (Math.abs(y - yAtual) > 3) {
        // Mudança de linha — persiste a linha atual e começa nova
        const trimmed = linhaAtual.replace(/\s+/g, ' ').trim()
        if (trimmed) linhas.push(trimmed)
        linhaAtual = ti.str
        xFim = x + ti.width
        yAtual = y
      } else {
        // Mesma linha — adiciona espaço só se há gap entre os itens
        const gap = x - xFim
        if (gap > 0.5 && !linhaAtual.endsWith(' ') && !ti.str.startsWith(' ')) {
          linhaAtual += ' '
        }
        linhaAtual += ti.str
        xFim = x + ti.width
      }

      if (ti.hasEOL) {
        const trimmed = linhaAtual.replace(/\s+/g, ' ').trim()
        if (trimmed) linhas.push(trimmed)
        linhaAtual = ''
        xFim = 0
        yAtual = null
      }
    }

    if (linhaAtual.trim()) {
      linhas.push(linhaAtual.replace(/\s+/g, ' ').trim())
    }
  }

  return linhas.join('\n')
}

export function BotaoCarregarAlunos({ turmaId }: Props) {
  const [aberto, setAberto] = useState(false)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [bimestre, setBimestre] = useState('2')
  const [localData, setLocalData] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [fase, setFase] = useState<string | null>(null)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

  function fechar() {
    setAberto(false)
    setArquivo(null)
    setResultado(null)
    setErro(null)
    setFase(null)
    setBimestre('2')
    setLocalData('')
  }

  async function handleImportar() {
    if (!arquivo) return
    setCarregando(true)
    setErro(null)

    let texto: string
    try {
      setFase('Extraindo texto do PDF...')
      texto = await extrairTextoPdf(arquivo)
    } catch {
      setErro('Não foi possível ler o PDF. Verifique se o arquivo é válido e não está protegido por senha.')
      setCarregando(false)
      setFase(null)
      return
    }

    try {
      setFase('Importando alunos...')
      const res = await fetch(`/api/turmas/${turmaId}/importar-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto,
          bimestre: parseInt(bimestre),
          local_data: localData.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.error ?? 'Erro ao importar')
      } else {
        setResultado(data)
        router.refresh()
      }
    } catch {
      setErro('Erro de conexão')
    } finally {
      setCarregando(false)
      setFase(null)
    }
  }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Importar PDF
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Importar alunos do PDF</h2>
              <button onClick={fechar} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {resultado ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                  <p className="text-sm font-semibold text-green-800 mb-2">{resultado.mensagem}</p>
                  <div className="text-sm text-green-700 space-y-0.5">
                    <p>{resultado.total} aluno(s) encontrado(s) no PDF</p>
                    <p>{resultado.criados} RAV(s) criado(s) com sucesso</p>
                    {resultado.pulados > 0 && (
                      <p className="text-yellow-700">{resultado.pulados} RAV(s) já existia(m) — pulado(s)</p>
                    )}
                  </div>
                </div>

                {resultado.erros.length > 0 && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                    <p className="text-sm font-semibold text-red-800 mb-1">Erros ({resultado.erros.length}):</p>
                    <ul className="space-y-0.5">
                      {resultado.erros.map((e, i) => (
                        <li key={i} className="text-xs text-red-700">{e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={fechar}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Suba o relatório em PDF com os pareceres descritivos. Cada aluno será criado automaticamente e um RAV rascunho será gerado com o texto do parecer.
                </p>

                {/* Área de upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Arquivo PDF <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
                  >
                    {arquivo ? (
                      <div>
                        <svg className="w-8 h-8 text-indigo-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-indigo-700">{arquivo.name}</p>
                        <p className="text-xs text-gray-400 mt-1">Clique para trocar</p>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-gray-600 font-medium">Clique para selecionar o PDF</p>
                        <p className="text-xs text-gray-400 mt-1">Relatório com pareceres dos alunos</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={e => setArquivo(e.target.files?.[0] ?? null)}
                  />
                </div>

                {/* Bimestre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bimestre dos RAVs</label>
                  <select value={bimestre} onChange={e => setBimestre(e.target.value)} className={inputCls}>
                    <option value="1">1º Bimestre</option>
                    <option value="2">2º Bimestre</option>
                    <option value="3">3º Bimestre</option>
                    <option value="4">4º Bimestre</option>
                  </select>
                </div>

                {/* Local e data */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Local e data
                    <span className="text-gray-400 font-normal ml-1">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Brasília, 30 de junho de 2026"
                    value={localData}
                    onChange={e => setLocalData(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {erro && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                    <p className="text-sm text-red-700">{erro}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={fechar}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleImportar}
                    disabled={!arquivo || carregando}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {carregando ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {fase ?? 'Processando...'}
                      </span>
                    ) : 'Importar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
