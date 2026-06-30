import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { exportarRav } from '@/lib/docx/exportarRav'
import PizZip from 'pizzip'
import type { Rav } from '@/types/rav'

function mergeDocxBuffers(buffers: Buffer[]): Buffer {
  if (buffers.length === 1) return buffers[0]

  const baseZip = new PizZip(buffers[0])
  let baseXml = baseZip.file('word/document.xml')!.asText()

  const paginaBreak = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'

  for (let i = 1; i < buffers.length; i++) {
    const zip = new PizZip(buffers[i])
    const xml = zip.file('word/document.xml')!.asText()

    const bodyStart = xml.indexOf('<w:body>') + '<w:body>'.length
    const sectPrPos = xml.lastIndexOf('<w:sectPr')
    const bodyEnd = sectPrPos > 0 ? sectPrPos : xml.lastIndexOf('</w:body>')
    const bodyContent = xml.substring(bodyStart, bodyEnd)

    const insertPoint = baseXml.lastIndexOf('<w:sectPr')
    if (insertPoint > 0) {
      baseXml =
        baseXml.substring(0, insertPoint) +
        paginaBreak +
        bodyContent +
        baseXml.substring(insertPoint)
    }
  }

  baseZip.file('word/document.xml', baseXml)
  return baseZip.generate({ type: 'nodebuffer' }) as Buffer
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const ids: unknown = body?.ids

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'Nenhum ID fornecido' }, { status: 400 })
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { data: ravs, error } = await supabase
    .from('ravs')
    .select('*')
    .in('id', ids as string[])
    .order('estudante', { ascending: true })

  if (error || !ravs || ravs.length === 0) {
    return NextResponse.json({ error: 'RAVs não encontrados' }, { status: 404 })
  }

  try {
    const buffers = await Promise.all((ravs as Rav[]).map(rav => exportarRav(rav)))
    const merged = mergeDocxBuffers(buffers)

    return new NextResponse(new Uint8Array(merged), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="RAv_estudantes.docx"',
        'Content-Length': String(merged.length),
      },
    })
  } catch (err) {
    console.error('Erro ao gerar DOCX em lote:', err)
    return NextResponse.json({ error: 'Erro ao gerar documento' }, { status: 500 })
  }
}
