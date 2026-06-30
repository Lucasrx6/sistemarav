import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { BotaoExportar } from '@/components/rav/BotaoExportar'
import type { Rav } from '@/types/rav'

export const metadata: Metadata = {
  title: 'Preview RAv — Sistema RAv',
}

const RESULTADO_LABEL: Record<string, string> = {
  progressao_continuada: 'Progressão Continuada',
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
  abandono: 'Abandono',
  cursando: 'Cursando',
}

export default async function PreviewRavPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: rav, error } = await supabase
    .from('ravs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !rav) {
    notFound()
  }

  const r = rav as Rav

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/rav/${id}`} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Preview do RAv</h1>
            <p className="text-gray-500 text-sm">{r.estudante} — {r.bimestre}º Bimestre {r.ano_letivo}</p>
          </div>
        </div>
        {r.status === 'finalizado' && (
          <BotaoExportar ravId={id} estudante={r.estudante} bimestre={r.bimestre} />
        )}
      </div>

      {/* Card de preview */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header do documento */}
        <div className="bg-indigo-50 border-b border-indigo-100 px-8 py-5 text-center">
          <h2 className="text-xl font-bold text-indigo-900">REGISTRO DE AVALIAÇÃO — RAv</h2>
          <p className="text-indigo-600 text-sm mt-1">Secretaria de Estado de Educação do Distrito Federal</p>
        </div>

        <div className="p-8 space-y-6 font-serif text-sm text-gray-800">
          {/* Seção A */}
          <section>
            <h3 className="font-bold text-gray-700 mb-3 uppercase tracking-wide text-xs border-b pb-1">A — Identificação</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <Row label="Ano Letivo" value={r.ano_letivo} />
              <Row label="CRE" value={r.cre} />
              <Row label="Unidade Escolar" value={r.unidade_escolar} colSpan />
              <Row label="Bloco" value={r.bloco} />
              <Row label="Ano" value={r.ano} />
              <Row label="Turma" value={r.turma} />
              <Row label="Turno" value={r.turno} />
              <Row label="Professor(a) Generalista" value={r.professor_generalista} colSpan />
              {r.professor_2 && <Row label="Professor(a) 2" value={r.professor_2} />}
              {r.professor_3 && <Row label="Professor(a) 3" value={r.professor_3} />}
              {r.professor_4 && <Row label="Professor(a) 4" value={r.professor_4} />}
              <Row label="Estudante" value={r.estudante} colSpan />
              <Row label="Apresenta Deficiência ou TEA?" value={r.tem_deficiencia ? 'Sim' : 'Não'} />
              <Row label="Houve adequação curricular?" value={r.houve_adequacao ? 'Sim' : 'Não'} />
              <Row label="Bimestre" value={`${r.bimestre}º Bimestre`} />
              {r.total_dias_letivos && <Row label="Total de Dias Letivos" value={String(r.total_dias_letivos)} />}
              {r.total_faltas !== undefined && r.total_faltas !== null && <Row label="Total de Faltas" value={String(r.total_faltas)} />}
            </div>
          </section>

          {/* Seção B */}
          <section>
            <h3 className="font-bold text-gray-700 mb-3 uppercase tracking-wide text-xs border-b pb-1">B — Descrição do Processo de Aprendizagem</h3>
            <div className="bg-gray-50 rounded-lg p-4 min-h-32 whitespace-pre-wrap leading-relaxed">
              {r.descricao_aprendizagem || <span className="text-gray-400 italic">Não preenchido</span>}
            </div>
          </section>

          {/* Seção C */}
          <section>
            <h3 className="font-bold text-gray-700 mb-3 uppercase tracking-wide text-xs border-b pb-1">C — Local e Data</h3>
            <p>{r.local_data}</p>
          </section>

          {/* Seção E */}
          {r.bimestre === 4 && (
            <section>
              <h3 className="font-bold text-gray-700 mb-3 uppercase tracking-wide text-xs border-b pb-1">E — Resultado Final</h3>
              <p className="font-semibold text-indigo-700">
                {r.resultado_final ? RESULTADO_LABEL[r.resultado_final] : <span className="text-gray-400 italic font-normal">Não informado</span>}
              </p>
            </section>
          )}
        </div>
      </div>

      {/* Aviso se for rascunho */}
      {r.status === 'rascunho' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold text-amber-700 text-sm">Este RAv ainda é um rascunho</p>
            <p className="text-amber-600 text-sm">Finalize o RAv para habilitar a exportação do documento DOCX.</p>
            <Link href={`/rav/${id}`} className="text-amber-700 underline text-sm font-medium mt-1 inline-block hover:text-amber-900">
              Voltar para editar →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, colSpan }: { label: string; value: string; colSpan?: boolean }) {
  return (
    <div className={colSpan ? 'col-span-2' : ''}>
      <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}: </span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
