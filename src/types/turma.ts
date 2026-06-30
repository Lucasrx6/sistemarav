export interface Turma {
  id: string
  professor_id: string
  created_at: string

  ano_letivo: string
  cre: string
  unidade_escolar: string
  bloco: '1º Bloco' | '2º Bloco'
  ano: string
  turma: string
  turno: 'Matutino' | 'Vespertino' | 'Integral'

  professor_generalista: string
  matricula_professor?: string
  professor_2?: string
  professor_3?: string
  professor_4?: string
  nome_coordenador?: string
  matricula_coordenador?: string
}
