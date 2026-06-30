import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import fs from 'fs/promises'
import path from 'path'
import type { Rav } from '@/types/rav'

// Alias exportado para manter compatibilidade com o tipo antigo
export type RavData = Rav

const RESULTADO_LABEL: Record<string, string> = {
  progressao_continuada: 'Progressão Continuada',
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
  abandono: 'Abandono',
  cursando: 'Cursando',
}

export async function exportarRav(dados: Rav): Promise<Buffer> {
  const templatePath = path.resolve(process.cwd(), 'public', 'templates', 'rav-template.docx')
  const templateBuffer = await fs.readFile(templatePath)

  const zip = new PizZip(templateBuffer)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  })

  doc.render({
    ano_letivo:            dados.ano_letivo              || '',
    cre:                   dados.cre                     || '',
    unidade_escolar:       dados.unidade_escolar         || '',
    bloco:                 dados.bloco                   || '',
    ano:                   dados.ano                     || '',
    turma:                 dados.turma                   || '',
    turno:                 dados.turno                   || '',
    professor_generalista: dados.professor_generalista   || '',
    professor_2:           dados.professor_2             || '',
    professor_3:           dados.professor_3             || '',
    professor_4:           dados.professor_4             || '',
    estudante:             dados.estudante               || '',
    tem_deficiencia:       dados.tem_deficiencia ? 'Sim' : 'Não',
    houve_adequacao:       dados.houve_adequacao  ? 'Sim' : 'Não',
    bimestre:              dados.bimestre != null ? String(dados.bimestre) : '',
    total_dias_letivos:    dados.total_dias_letivos != null ? String(dados.total_dias_letivos) : '',
    total_faltas:          dados.total_faltas      != null ? String(dados.total_faltas)      : '',
    matricula_professor:   dados.matricula_professor     || '',
    nome_coordenador:      dados.nome_coordenador        || '',
    matricula_coordenador: dados.matricula_coordenador   || '',
    descricao_aprendizagem: dados.descricao_aprendizagem || '',
    local_data:            dados.local_data              || '',
    resultado_final:       dados.resultado_final
      ? (RESULTADO_LABEL[dados.resultado_final] ?? dados.resultado_final)
      : '',
  })

  return doc.getZip().generate({ type: 'nodebuffer' }) as Buffer
}
