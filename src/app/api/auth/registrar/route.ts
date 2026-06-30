import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const { codigo, nome, email, senha } = await request.json() as {
    codigo: string
    nome: string
    email: string
    senha: string
  }

  if (!codigo || !nome || !email || !senha) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 })
  }
  if (senha.length < 6) {
    return NextResponse.json({ error: 'A senha deve ter no mínimo 6 caracteres.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Valida o convite
  const { data: convite, error: conviteError } = await admin
    .from('convites')
    .select('*')
    .eq('codigo', codigo.toUpperCase().replace(/[^A-Z0-9]/g, ''))
    .eq('usado', false)
    .maybeSingle()

  if (conviteError || !convite) {
    return NextResponse.json({ error: 'Código de convite inválido ou já utilizado.' }, { status: 400 })
  }

  // Cria o usuário no Supabase Auth
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  })

  if (authError) {
    if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 400 })
    }
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  const userId = authData.user.id

  // Cria o perfil do professor
  const { error: profError } = await admin
    .from('professores')
    .insert({ id: userId, nome: nome.trim() })

  if (profError) {
    // Tenta reverter a criação do usuário para não deixar estado inconsistente
    await admin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: 'Erro ao criar perfil. Tente novamente.' }, { status: 500 })
  }

  // Marca o convite como usado
  await admin
    .from('convites')
    .update({ usado: true, usado_por: userId, usado_em: new Date().toISOString() })
    .eq('id', convite.id)

  return NextResponse.json({ ok: true })
}
