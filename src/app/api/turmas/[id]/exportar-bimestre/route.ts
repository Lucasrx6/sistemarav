import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exportarTurma } from '@/lib/docx/exportarTurma'
import type { Rav } from '@/types/rav'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const { id: turmaId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json() as { bimestre: number; apenas_finalizados?: boolean }
  const { bimestre, apenas_finalizados = true } = body

  // Busca RAVs desta turma neste bimestre (via aluno_id → turma_id)
  let query = supabase
    .from('ravs')
    .select('*, aluno:alunos!aluno_id(turma_id)')
    .eq('bimestre', bimestre)
    .not('aluno_id', 'is', null)

  if (apenas_finalizados) {
    query = query.eq('status', 'finalizado')
  }

  const { data: ravsRaw, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Filtra só os RAVs desta turma
  const ravs = ((ravsRaw ?? []) as Array<Rav & { aluno?: { turma_id: string } }>)
    .filter(r => r.aluno?.turma_id === turmaId)
    .map(({ aluno: _aluno, ...r }) => r as Rav)

  if (ravs.length === 0) {
    return NextResponse.json(
      { error: `Nenhum RAV ${apenas_finalizados ? 'finalizado ' : ''}encontrado para o ${bimestre}º bimestre.` },
      { status: 404 }
    )
  }

  // Ordena por nome do estudante
  ravs.sort((a, b) => a.estudante.localeCompare(b.estudante))

  try {
    const buffer = await exportarTurma(ravs)
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="turma-${bimestre}bim.docx"`,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao gerar DOCX'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
