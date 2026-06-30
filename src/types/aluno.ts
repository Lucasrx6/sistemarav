export interface Aluno {
  id: string
  turma_id: string
  professor_id: string
  created_at: string

  nome: string
  tem_deficiencia: boolean
  houve_adequacao: boolean
}

export interface AlunoComRavs extends Aluno {
  ravs?: Array<{
    id: string
    bimestre: number
    status: 'rascunho' | 'finalizado'
    updated_at: string
  }>
}
