import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { alunoSchema } from '@/lib/validations/alunoSchema'

type Params = { params: Promise<{ id: string; alunoId: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { alunoId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('alunos')
    .select('*')
    .eq('id', alunoId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: Params) {
  const { alunoId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const validData = alunoSchema.parse(body)

    const { data, error } = await supabase
      .from('alunos')
      .update(validData)
      .eq('id', alunoId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro de validação'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { alunoId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { error } = await supabase.from('alunos').delete().eq('id', alunoId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
