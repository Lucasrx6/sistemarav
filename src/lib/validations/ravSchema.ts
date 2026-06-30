import * as z from 'zod'

export const ravSchema = z.object({
  ano_letivo: z.string().min(4, 'Ano letivo inválido.'),
  cre: z.string().min(1, 'CRE obrigatória.'),
  unidade_escolar: z.string().min(3, 'Nome da escola obrigatório.'),
  bloco: z.enum(['1º Bloco', '2º Bloco'], { message: 'Selecione o bloco.' }),
  ano: z.string().min(1, 'Ano obrigatório.'),
  turma: z.string().min(1, 'Turma obrigatória.'),
  turno: z.enum(['Matutino', 'Vespertino', 'Integral'], { message: 'Selecione o turno.' }),
  professor_generalista: z.string().min(3, 'Nome da professora obrigatório.'),
  professor_2: z.string().optional(),
  professor_3: z.string().optional(),
  professor_4: z.string().optional(),
  matricula_professor: z.string().optional(),
  nome_coordenador: z.string().optional(),
  matricula_coordenador: z.string().optional(),
  estudante: z.string().min(3, 'Nome do estudante obrigatório.'),
  tem_deficiencia: z.boolean(),
  houve_adequacao: z.boolean(),
  bimestre: z.coerce.number().min(1).max(4, 'Bimestre inválido.'),
  total_dias_letivos: z.preprocess(
    (v) => (v === '' || v === null || v === undefined || (typeof v === 'number' && isNaN(v))) ? undefined : Number(v),
    z.number().min(1).optional()
  ),
  total_faltas: z.preprocess(
    (v) => (v === '' || v === null || v === undefined || (typeof v === 'number' && isNaN(v))) ? undefined : Number(v),
    z.number().min(0).optional()
  ),
  descricao_aprendizagem: z.string().min(10, 'A descrição deve ter ao menos 10 caracteres.'),
  local_data: z.string().min(1, 'Local e data obrigatórios.'),
  resultado_final: z
    .enum(['progressao_continuada', 'aprovado', 'reprovado', 'abandono', 'cursando'])
    .nullish(),
  status: z.enum(['rascunho', 'finalizado']),
})

export type RavSchemaType = z.infer<typeof ravSchema>

// Schema parcial para rascunhos — aceita campos em branco
export const ravRascunhoSchema = ravSchema.partial()

// Schema para RAV no fluxo Turma → Aluno (só campos editáveis pelo professor por bimestre)
export const ravAlunoSchema = z.object({
  bimestre: z.coerce.number().min(1).max(4, 'Bimestre inválido.'),
  total_dias_letivos: z.preprocess(
    (v) => (v === '' || v === null || v === undefined || (typeof v === 'number' && isNaN(v))) ? undefined : Number(v),
    z.number().min(1).optional()
  ),
  total_faltas: z.preprocess(
    (v) => (v === '' || v === null || v === undefined || (typeof v === 'number' && isNaN(v))) ? undefined : Number(v),
    z.number().min(0).optional()
  ),
  descricao_aprendizagem: z.string().min(10, 'A descrição deve ter ao menos 10 caracteres.'),
  local_data: z.string().min(1, 'Local e data obrigatórios.'),
  resultado_final: z
    .enum(['progressao_continuada', 'aprovado', 'reprovado', 'abandono', 'cursando'])
    .nullish(),
  status: z.enum(['rascunho', 'finalizado']),
})

export const ravAlunoRascunhoSchema = ravAlunoSchema.partial()

export type RavAlunoSchemaType = z.infer<typeof ravAlunoSchema>
