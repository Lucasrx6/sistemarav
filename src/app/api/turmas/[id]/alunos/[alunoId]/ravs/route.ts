import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ravAlunoSchema, ravAlunoRascunhoSchema } from '@/lib/validations/ravSchema'
import type { Turma } from '@/types/turma'
import type { Aluno } from '@/types/aluno'

type Params = { params: Promise<{ id: string; alunoId: string }> }

export async function POST(request: Request, { params }: Params) {
  const { id: turmaId, alunoId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const schema = body.status === 'rascunho' ? ravAlunoRascunhoSchema : ravAlunoSchema
    const validData = schema.parse(body)

    // Carrega turma + aluno para desnormalizar no RAV
    const [{ data: turma, error: errTurma }, { data: aluno, error: errAluno }] = await Promise.all([
      supabase.from('turmas').select('*').eq('id', turmaId).single(),
      supabase.from('alunos').select('*').eq('id', alunoId).single(),
    ])

    if (errTurma || !turma) return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 })
    if (errAluno || !aluno) return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })

    const t = turma as Turma
    const a = aluno as Aluno

    const { data, error } = await supabase
      .from('ravs')
      .insert({
        professor_id: user.id,
        aluno_id: alunoId,
        // Dados herdados da turma
        ano_letivo: t.ano_letivo,
        cre: t.cre,
        unidade_escolar: t.unidade_escolar,
        bloco: t.bloco,
        ano: t.ano,
        turma: t.turma,
        turno: t.turno,
        professor_generalista: t.professor_generalista,
        matricula_professor: t.matricula_professor,
        professor_2: t.professor_2,
        professor_3: t.professor_3,
        professor_4: t.professor_4,
        nome_coordenador: t.nome_coordenador,
        matricula_coordenador: t.matricula_coordenador,
        // Dados do aluno
        estudante: a.nome,
        tem_deficiencia: a.tem_deficiencia,
        houve_adequacao: a.houve_adequacao,
        // Dados específicos do bimestre
        ...validData,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro de validação'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
