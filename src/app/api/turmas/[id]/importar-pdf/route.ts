import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

interface StudentEntry {
  nome: string
  descricao: string
  tem_deficiencia: boolean
  houve_adequacao: boolean
}

function parseStudents(text: string): StudentEntry[] {
  // Cada parecer começa com "A estudante Nome," ou "O estudante Nome,"
  const pattern = /(?:A|O) estudante ([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][^,]+),/g
  const starts: Array<{ index: number; nome: string }> = []
  let match
  while ((match = pattern.exec(text)) !== null) {
    starts.push({ index: match.index, nome: match[1].trim() })
  }
  if (starts.length === 0) return []
  return starts.map((s, i) => {
    const end = i < starts.length - 1 ? starts[i + 1].index : text.length
    const content = text.slice(s.index, end).trim()
    return {
      nome: s.nome,
      descricao: content,
      tem_deficiencia: /\b(?:TEA|Transtorno do Espectro Autista|deficiência)\b/i.test(content),
      houve_adequacao: /adequação curricular/i.test(content),
    }
  })
}

export async function POST(request: Request, { params }: Params) {
  const { id: turmaId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  let body: { texto: string; bimestre: number; local_data?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 })
  }

  const { texto, bimestre = 1, local_data: localData = '' } = body
  if (!texto) return NextResponse.json({ error: 'Texto não enviado' }, { status: 400 })

  const { data: turma } = await supabase
    .from('turmas')
    .select('*')
    .eq('id', turmaId)
    .eq('professor_id', user.id)
    .single()
  if (!turma) return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 })

  const students = parseStudents(texto)
  if (students.length === 0) {
    return NextResponse.json(
      { error: 'Nenhum aluno encontrado. O PDF deve conter pareceres iniciados com "A estudante Nome," ou "O estudante Nome,".' },
      { status: 400 }
    )
  }

  const { data: alunosExistentes } = await supabase
    .from('alunos')
    .select('id, nome')
    .eq('turma_id', turmaId)

  let criados = 0, pulados = 0
  const erros: string[] = []

  for (const student of students) {
    try {
      let alunoId: string
      const existente = alunosExistentes?.find(
        a => a.nome.toLowerCase().trim() === student.nome.toLowerCase().trim()
      )

      if (existente) {
        alunoId = existente.id
      } else {
        const { data: novoAluno, error } = await supabase
          .from('alunos')
          .insert({
            turma_id: turmaId,
            professor_id: user.id,
            nome: student.nome,
            tem_deficiencia: student.tem_deficiencia,
            houve_adequacao: student.houve_adequacao,
          })
          .select('id')
          .single()
        if (error || !novoAluno) {
          erros.push(`${student.nome}: falha ao criar aluno`)
          continue
        }
        alunoId = novoAluno.id
      }

      const { data: ravExistente } = await supabase
        .from('ravs')
        .select('id')
        .eq('aluno_id', alunoId)
        .eq('bimestre', bimestre)
        .maybeSingle()

      if (ravExistente) {
        pulados++
        continue
      }

      const { error: ravError } = await supabase.from('ravs').insert({
        professor_id: user.id,
        aluno_id: alunoId,
        ano_letivo: turma.ano_letivo,
        cre: turma.cre,
        unidade_escolar: turma.unidade_escolar,
        bloco: turma.bloco,
        ano: turma.ano,
        turma: turma.turma,
        turno: turma.turno,
        professor_generalista: turma.professor_generalista,
        matricula_professor: turma.matricula_professor ?? null,
        professor_2: turma.professor_2 ?? null,
        professor_3: turma.professor_3 ?? null,
        professor_4: turma.professor_4 ?? null,
        nome_coordenador: turma.nome_coordenador ?? null,
        matricula_coordenador: turma.matricula_coordenador ?? null,
        estudante: student.nome,
        tem_deficiencia: student.tem_deficiencia,
        houve_adequacao: student.houve_adequacao,
        bimestre,
        descricao_aprendizagem: student.descricao,
        local_data: localData,
        total_dias_letivos: null,
        total_faltas: null,
        status: 'rascunho',
      })

      if (ravError) {
        erros.push(`${student.nome}: ${ravError.message}`)
      } else {
        criados++
      }
    } catch {
      erros.push(`${student.nome}: erro inesperado`)
    }
  }

  return NextResponse.json({
    criados,
    pulados,
    erros,
    total: students.length,
    mensagem: `${criados} RAV(s) importado(s)${pulados > 0 ? `, ${pulados} já existia(m)` : ''}${erros.length > 0 ? `, ${erros.length} erro(s)` : ''}.`,
  })
}
