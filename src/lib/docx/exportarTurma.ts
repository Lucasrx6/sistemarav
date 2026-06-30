import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import JSZip from 'jszip'
import fs from 'fs/promises'
import path from 'path'
import type { Rav } from '@/types/rav'

const TEMPLATE_PATH = path.resolve(process.cwd(), 'public', 'templates', 'rav-template.docx')

const RESULTADO_LABEL: Record<string, string> = {
  progressao_continuada: 'Progressão Continuada',
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
  abandono: 'Abandono',
  cursando: 'Cursando',
}

function ravParaVariaveis(dados: Rav): Record<string, string> {
  return {
    ano_letivo:             dados.ano_letivo              || '',
    cre:                    dados.cre                     || '',
    unidade_escolar:        dados.unidade_escolar         || '',
    bloco:                  dados.bloco                   || '',
    ano:                    dados.ano                     || '',
    turma:                  dados.turma                   || '',
    turno:                  dados.turno                   || '',
    professor_generalista:  dados.professor_generalista   || '',
    professor_2:            dados.professor_2             || '',
    professor_3:            dados.professor_3             || '',
    professor_4:            dados.professor_4             || '',
    estudante:              dados.estudante               || '',
    tem_deficiencia:        dados.tem_deficiencia  ? 'Sim' : 'Não',
    houve_adequacao:        dados.houve_adequacao  ? 'Sim' : 'Não',
    bimestre:               dados.bimestre != null ? String(dados.bimestre) : '',
    total_dias_letivos:     dados.total_dias_letivos != null ? String(dados.total_dias_letivos) : '',
    total_faltas:           dados.total_faltas      != null ? String(dados.total_faltas)      : '',
    matricula_professor:    dados.matricula_professor     || '',
    nome_coordenador:       dados.nome_coordenador        || '',
    matricula_coordenador:  dados.matricula_coordenador   || '',
    descricao_aprendizagem: dados.descricao_aprendizagem  || '',
    local_data:             dados.local_data              || '',
    resultado_final:        dados.resultado_final
      ? (RESULTADO_LABEL[dados.resultado_final] ?? dados.resultado_final)
      : '',
  }
}

function renderizarRav(templateBuffer: Buffer, dados: Rav): Buffer {
  const zip = new PizZip(templateBuffer)
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })
  doc.render(ravParaVariaveis(dados))
  return doc.getZip().generate({ type: 'nodebuffer' }) as Buffer
}

async function extrairCorpoSemSectPr(docxBuffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(docxBuffer)
  const xml = await zip.file('word/document.xml')!.async('string')
  const bodyStart = xml.indexOf('<w:body>') + '<w:body>'.length
  const sectPrStart = xml.lastIndexOf('<w:sectPr')
  const bodyEnd = sectPrStart !== -1 ? sectPrStart : xml.indexOf('</w:body>')
  return xml.substring(bodyStart, bodyEnd)
}

export async function exportarTurma(ravs: Rav[]): Promise<Buffer> {
  if (ravs.length === 0) throw new Error('Nenhum RAV para exportar')

  const templateBuffer = await fs.readFile(TEMPLATE_PATH)

  const corpos: string[] = []
  for (const rav of ravs) {
    const docxBuffer = renderizarRav(templateBuffer, rav)
    const corpo = await extrairCorpoSemSectPr(docxBuffer)
    corpos.push(corpo)
  }

  // Extrai sectPr do template para usar no documento final
  const templateZip = await JSZip.loadAsync(templateBuffer)
  let templateXml = await templateZip.file('word/document.xml')!.async('string')
  const sectPrMatch = templateXml.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/)
  const sectPr = sectPrMatch ? sectPrMatch[0] : ''

  // Une os corpos com quebra de página entre cada aluno
  const pageBreak = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'
  const fullBodyContent = corpos.join(pageBreak) + sectPr

  const bodyStart = templateXml.indexOf('<w:body>') + '<w:body>'.length
  const bodyEnd = templateXml.lastIndexOf('</w:body>')
  templateXml = templateXml.substring(0, bodyStart) + fullBodyContent + templateXml.substring(bodyEnd)

  templateZip.file('word/document.xml', templateXml)
  return templateZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }) as Promise<Buffer>
}
