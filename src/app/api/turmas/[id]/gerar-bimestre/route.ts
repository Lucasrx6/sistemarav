import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Turma } from '@/types/turma'
import type { Aluno } from '@/types/aluno'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const { id: turmaId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json() as {
    bimestre: number
    local_data?: string
    total_dias_letivos?: number
  }

  const { bimestre, local_data, total_dias_letivos } = body
  if (!bimestre || bimestre < 1 || bimestre > 4) {
    return NextResponse.json({ error: 'Bimestre inválido' }, { status: 400 })
  }

  const [{ data: turma, error: errTurma }, { data: alunos, error: errAlunos }] = await Promise.all([
    supabase.from('turmas').select('*').eq('id', turmaId).single(),
    supabase.from('alunos').select('*').eq('turma_id', turmaId).order('nome'),
  ])

  if (errTurma || !turma) return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 })
  if (errAlunos) return NextResponse.json({ error: errAlunos.message }, { status: 500 })
  if (!alunos || alunos.length === 0) return NextResponse.json({ error: 'Nenhum aluno cadastrado nesta turma' }, { status: 400 })

  // Busca quais alunos já têm RAV para este bimestre
  const { data: ravsExistentes } = await supabase
    .from('ravs')
    .select('aluno_id')
    .in('aluno_id', alunos.map((a: Aluno) => a.id))
    .eq('bimestre', bimestre)

  const alunos_com_rav = new Set((ravsExistentes ?? []).map((r: { aluno_id: string }) => r.aluno_id))
  const alunosPendentes = (alunos as Aluno[]).filter(a => !alunos_com_rav.has(a.id))

  if (alunosPendentes.length === 0) {
    return NextResponse.json({ criados: 0, mensagem: 'Todos os alunos já têm RAV para este bimestre.' })
  }

  const t = turma as Turma
  const registros = alunosPendentes.map((a: Aluno) => ({
    professor_id: user.id,
    aluno_id: a.id,
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
    estudante: a.nome,
    tem_deficiencia: a.tem_deficiencia,
    houve_adequacao: a.houve_adequacao,
    bimestre,
    local_data: local_data ?? null,
    total_dias_letivos: total_dias_letivos ?? null,
    descricao_aprendizagem: '',
    status: 'rascunho',
  }))

  const { error: errInsert } = await supabase.from('ravs').insert(registros)
  if (errInsert) return NextResponse.json({ error: errInsert.message }, { status: 500 })

  return NextResponse.json({
    criados: alunosPendentes.length,
    pulados: alunos_com_rav.size,
    mensagem: `${alunosPendentes.length} RAV(s) criado(s) com sucesso.`,
  })
}
