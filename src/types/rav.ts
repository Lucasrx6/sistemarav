export interface Rav {
  id: string
  professor_id: string
  created_at: string
  updated_at: string

  // Seção A — Identificação
  ano_letivo: string
  cre: string
  unidade_escolar: string
  bloco: '1º Bloco' | '2º Bloco'
  ano: string
  turma: string
  turno: 'Matutino' | 'Vespertino' | 'Integral'
  professor_generalista: string
  professor_2?: string
  professor_3?: string
  professor_4?: string
  estudante: string
  tem_deficiencia: boolean
  houve_adequacao: boolean
  bimestre: number
  total_dias_letivos?: number
  total_faltas?: number

  // Seção B — Descrição da aprendizagem
  descricao_aprendizagem: string

  // Seção C — Local e Data
  local_data: string

  // Seção D — Assinaturas
  matricula_professor?: string
  nome_coordenador?: string
  matricula_coordenador?: string

  // Seção E — Resultado final (somente 4º bimestre)
  resultado_final?: 'progressao_continuada' | 'aprovado' | 'reprovado' | 'abandono' | 'cursando'

  status: 'rascunho' | 'finalizado'

  // FK para aluno (presente quando criado pelo fluxo Turma → Aluno)
  aluno_id?: string
}

// Tipo usado no exportarRav — espelha a interface Rav
export type RavData = Rav
