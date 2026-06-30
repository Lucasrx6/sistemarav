import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { exportarRav } from '@/lib/docx/exportarRav'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { data: rav, error } = await supabase
    .from('ravs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !rav) {
    return NextResponse.json({ error: 'RAv não encontrado' }, { status: 404 })
  }

  try {
    const docxBuffer = await exportarRav(rav)
    const nomeLimpo = rav.estudante.replace(/\s+/g, '_').replace(/[^a-zA-ZÀ-ÿ0-9_]/g, '')
    const nomeArquivo = `RAv_${nomeLimpo}_${rav.bimestre}Bim_${rav.ano_letivo}.docx`

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
        'Content-Length': String(docxBuffer.length),
      },
    })
  } catch (err) {
    console.error('Erro ao gerar DOCX:', err)
    return NextResponse.json({ error: 'Erro ao gerar documento' }, { status: 500 })
  }
}
