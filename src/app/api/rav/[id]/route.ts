import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ravSchema, ravRascunhoSchema, ravAlunoSchema, ravAlunoRascunhoSchema } from '@/lib/validations/ravSchema';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('ravs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    let schema
    if (body._aluno_flow) {
      schema = body.status === 'rascunho' ? ravAlunoRascunhoSchema : ravAlunoSchema
    } else {
      schema = (body.status === 'rascunho' || body._forcar) ? ravRascunhoSchema : ravSchema
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _aluno_flow, _forcar, ...resto } = body
    const validData = schema.parse(resto);

    const { data, error } = await supabase
      .from('ravs')
      .update(validData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro de validação' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { error } = await supabase
    .from('ravs')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
