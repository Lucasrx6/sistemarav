import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { alunoSchema } from '@/lib/validations/alunoSchema'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('alunos')
    .select('*')
    .eq('turma_id', id)
    .order('nome', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request, { params }: Params) {
  const { id: turma_id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const validData = alunoSchema.parse(body)

    const { data, error } = await supabase
      .from('alunos')
      .insert({ ...validData, turma_id, professor_id: user.id })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro de validação'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
