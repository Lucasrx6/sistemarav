import * as z from 'zod'

export const turmaSchema = z.object({
  ano_letivo: z.string().min(4, 'Ano letivo inválido.'),
  cre: z.string().min(1, 'CRE obrigatória.'),
  unidade_escolar: z.string().min(3, 'Nome da escola obrigatório.'),
  bloco: z.enum(['1º Bloco', '2º Bloco'], { message: 'Selecione o bloco.' }),
  ano: z.string().min(1, 'Ano obrigatório.'),
  turma: z.string().min(1, 'Turma obrigatória.'),
  turno: z.enum(['Matutino', 'Vespertino', 'Integral'], { message: 'Selecione o turno.' }),
  professor_generalista: z.string().min(3, 'Nome da professora obrigatório.'),
  matricula_professor: z.string().optional(),
  professor_2: z.string().optional(),
  professor_3: z.string().optional(),
  professor_4: z.string().optional(),
  nome_coordenador: z.string().optional(),
  matricula_coordenador: z.string().optional(),
})

export type TurmaSchemaType = z.infer<typeof turmaSchema>
