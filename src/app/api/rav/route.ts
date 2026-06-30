import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ravSchema, ravRascunhoSchema } from '@/lib/validations/ravSchema';

export async function GET(request: Request) {
  const supabase = await createClient();
  
  // Obter o usuário autenticado
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Obter os RAvs do usuário
  const { data, error } = await supabase
    .from('ravs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  
  // Obter o usuário autenticado
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const schema = (body.status === 'rascunho' || body._forcar) ? ravRascunhoSchema : ravSchema;
    const validData = schema.parse(body);

    // Inserir no banco
    const { data, error } = await supabase
      .from('ravs')
      .insert({ ...validData, professor_id: user.id })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro de validação' }, { status: 400 });
  }
}
