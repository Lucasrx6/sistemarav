import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const { nome, email, senha } = await request.json() as {
    nome: string
    email: string
    senha: string
  }

  if (!nome || !email || !senha) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 })
  }
  if (senha.length < 6) {
    return NextResponse.json({ error: 'A senha deve ter no mínimo 6 caracteres.' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  })

  if (authError) {
    const jaExiste = authError.message.includes('already registered') || authError.message.includes('already been registered')
    return NextResponse.json(
      { error: jaExiste ? 'Este e-mail já está cadastrado.' : authError.message },
      { status: 400 }
    )
  }

  const userId = authData.user.id

  const { error: profError } = await admin
    .from('professores')
    .insert({ id: userId, nome: nome.trim() })

  if (profError) {
    await admin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: 'Erro ao criar perfil. Tente novamente.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
