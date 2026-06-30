import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const SENTINEL_BOOTSTRAP = '__bootstrap__'

async function validarCodigo(admin: ReturnType<typeof createAdminClient>, codigoRaw: string) {
  const codigo = codigoRaw.toUpperCase().replace(/[^A-Z0-9]/g, '')

  // Código bootstrap definido nas variáveis de ambiente (uso único)
  const bootstrapEnv = (process.env.BOOTSTRAP_CODE ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (bootstrapEnv && codigo === bootstrapEnv) {
    const { data: jaUsado } = await admin
      .from('convites')
      .select('id')
      .eq('codigo', SENTINEL_BOOTSTRAP)
      .eq('usado', true)
      .maybeSingle()

    if (jaUsado) {
      return { error: 'Código bootstrap já foi utilizado. Solicite um convite ao administrador.' }
    }
    return { bootstrap: true as const }
  }

  // Convite gerado normalmente
  const { data: convite } = await admin
    .from('convites')
    .select('*')
    .eq('codigo', codigo)
    .eq('usado', false)
    .maybeSingle()

  if (!convite) {
    return { error: 'Código de convite inválido ou já utilizado.' }
  }
  return { convite }
}

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: '[config] NEXT_PUBLIC_SUPABASE_URL não definida.' }, { status: 500 })
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: '[config] SUPABASE_SERVICE_ROLE_KEY não definida no servidor.' }, { status: 500 })
  }

  let body: { codigo?: string; nome?: string; email?: string; senha?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  const { codigo, nome, email, senha } = body

  if (!codigo || !nome || !email || !senha) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 })
  }
  if (senha.length < 6) {
    return NextResponse.json({ error: 'A senha deve ter no mínimo 6 caracteres.' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()

    const resultado = await validarCodigo(admin, codigo)
    if (resultado.error) {
      return NextResponse.json({ error: resultado.error }, { status: 400 })
    }

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    })

    if (authError) {
      console.error('[registrar] auth.admin.createUser error:', authError.message)
      const jaExiste = authError.message.includes('already registered') || authError.message.includes('already been registered')
      return NextResponse.json(
        { error: jaExiste ? 'Este e-mail já está cadastrado.' : `Erro ao criar usuário: ${authError.message}` },
        { status: 400 }
      )
    }

    const userId = authData.user.id

    const { error: profError } = await admin
      .from('professores')
      .insert({ id: userId, nome: nome.trim() })

    if (profError) {
      console.error('[registrar] professores insert error:', profError.message)
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: `Erro ao criar perfil: ${profError.message}` },
        { status: 500 }
      )
    }

    // Marca o código como usado
    if (resultado.bootstrap) {
      await admin.from('convites').upsert(
        { codigo: SENTINEL_BOOTSTRAP, usado: true, usado_por: userId, usado_em: new Date().toISOString() },
        { onConflict: 'codigo' }
      )
    } else if (resultado.convite) {
      await admin
        .from('convites')
        .update({ usado: true, usado_por: userId, usado_em: new Date().toISOString() })
        .eq('id', resultado.convite.id)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[registrar] erro inesperado:', e)
    return NextResponse.json({ error: 'Erro interno do servidor. Verifique os logs do Vercel.' }, { status: 500 })
  }
}
