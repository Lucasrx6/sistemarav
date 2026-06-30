import * as z from 'zod'

export const alunoSchema = z.object({
  nome: z.string().min(2, 'Nome do estudante obrigatório.'),
  tem_deficiencia: z.boolean(),
  houve_adequacao: z.boolean(),
})

export type AlunoSchemaType = z.infer<typeof alunoSchema>
