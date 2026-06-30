import JSZip from 'jszip';
import fs from 'fs/promises';
import path from 'path';

// ─── Utilitários ─────────────────────────────────────────────────────────────

function inserirNaCelula(xml, cellStart, placeholder) {
  const cellEnd = xml.indexOf('</w:tc>', cellStart);
  const firstPEnd = xml.indexOf('</w:p>', cellStart);
  if (firstPEnd === -1 || firstPEnd > cellEnd) {
    console.warn('[AVISO] Não achou </w:p> na célula para:', placeholder);
    return xml;
  }
  const run = `<w:r><w:rPr><w:rFonts w:eastAsia="Times New Roman" w:cs="Times New Roman" w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve">${placeholder}</w:t></w:r>`;
  return xml.substring(0, firstPEnd) + run + xml.substring(firstPEnd);
}

function inserirProximaLinha(xml, labelText, placeholder) {
  const labelPos = xml.indexOf(`>${labelText}</w:t>`);
  if (labelPos === -1) { console.warn('[AVISO] Label não encontrado:', labelText); return xml; }
  const fimLinhaLabel = xml.indexOf('</w:tr>', labelPos) + '</w:tr>'.length;
  const proximaLinha = xml.indexOf('<w:tr>', fimLinhaLabel);
  const fimPrimeiraCelula = xml.indexOf('</w:tc>', proximaLinha) + '</w:tc>'.length;
  const celulaValor = xml.indexOf('<w:tc>', fimPrimeiraCelula);
  xml = inserirNaCelula(xml, celulaValor, placeholder);
  console.log('[OK] (próxima linha)', labelText, '→', placeholder);
  return xml;
}

function inserirNaMesmaCelula(xml, labelCloseText, placeholder) {
  const labelPos = xml.indexOf(labelCloseText);
  if (labelPos === -1) { console.warn('[AVISO] Não encontrado:', labelCloseText); return xml; }
  const cellStart = xml.lastIndexOf('<w:tc>', labelPos);
  xml = inserirNaCelula(xml, cellStart, placeholder);
  console.log('[OK] (mesma célula)', labelCloseText.replace(/[><]/g, '').substring(0, 28), '→', placeholder.trim());
  return xml;
}

function inserirNaMesmaCelulaFrom(xml, labelCloseText, placeholder, from) {
  const labelPos = xml.indexOf(labelCloseText, from);
  if (labelPos === -1) { console.warn('[AVISO] Não encontrado a partir de', from, ':', labelCloseText); return [xml, from]; }
  const cellStart = xml.lastIndexOf('<w:tc>', labelPos);
  xml = inserirNaCelula(xml, cellStart, placeholder);
  console.log('[OK] (mesma célula, from)', labelCloseText.replace(/[><]/g, '').substring(0, 25), '→', placeholder.trim());
  return [xml, labelPos + 1];
}

// Substitui o conteúdo inteiro da célula de assinatura por 2 parágrafos centralizados:
// 1. Nome + matrícula (placeholder)
// 2. Label da assinatura (texto fixo)
function substituirCelulaAssinatura(xml, assinaturaLabel, nomeTexto, from = 0) {
  const labelPos = xml.indexOf(`>${assinaturaLabel}</w:t>`, from);
  if (labelPos === -1) { console.warn('[AVISO] Assinatura não achada:', assinaturaLabel); return [xml, from]; }
  const cellStart = xml.lastIndexOf('<w:tc>', labelPos);
  const tcPrEnd   = xml.indexOf('</w:tcPr>', cellStart) + '</w:tcPr>'.length;
  const cellEnd   = xml.indexOf('</w:tc>', labelPos); // posição do '<' em '</w:tc>'

  const pPr  = `<w:pPr><w:pStyle w:val="Normal"/><w:spacing w:lineRule="auto" w:line="240" w:before="0" w:after="0"/><w:ind w:end="225"/><w:jc w:val="center"/></w:pPr>`;
  const rPr  = `<w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>`;
  const pNome  = `<w:p>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${nomeTexto}</w:t></w:r></w:p>`;
  const pLabel = `<w:p>${pPr}<w:r>${rPr}<w:t>${assinaturaLabel}</w:t></w:r></w:p>`;

  const novo = pNome + pLabel;
  xml = xml.substring(0, tcPrEnd) + novo + xml.substring(cellEnd);

  console.log('[OK] Assinatura substituída:', nomeTexto.substring(0, 35));
  return [xml, tcPrEnd + novo.length + 7]; // inicia busca após o </w:tc> desta célula
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function gerarTemplate() {
  const docOrigem = path.resolve(process.cwd(), 'REGISTRO DE AVALIAÇÃO - RAv - 2026.docx');
  const docDestino = path.resolve(process.cwd(), 'public', 'templates', 'rav-template.docx');

  console.log('Lendo:', docOrigem);
  const buf = await fs.readFile(docOrigem);
  const zip = await JSZip.loadAsync(buf);
  let xml = await zip.file('word/document.xml').async('string');

  console.log('\nAplicando placeholders...\n');

  // ── Correção 1: Turno — mesclar com as 3 colunas vazias à direita ──────────
  // Turno(841, 1 gridCol) + Matutino(1550, gridSpan=3) + Vespertino(1829, 1) + Integral(2402, 1)
  // = 6622 twips, 6 gridCols → cabe "Turno: Vespertino" sem quebrar
  {
    const turnoRowStart = xml.lastIndexOf('<w:tr>', xml.indexOf('>Turno:</w:t>'));
    const turnoRowEnd   = xml.indexOf('</w:tr>', turnoRowStart) + 7;
    let row = xml.substring(turnoRowStart, turnoRowEnd);

    // Wideia a célula Turno e marca gridSpan=6
    row = row.replace(
      '<w:tcW w:w="841" w:type="dxa"/>',
      '<w:tcW w:w="6622" w:type="dxa"/><w:gridSpan w:val="6"/>'
    );

    // Adiciona borda direita (end) à célula Turno antes de remover as células vizinhas
    // A borda direita vem da célula Integral (a mais à direita, que tinha <w:end>)
    const turnoCellPosInRow = row.lastIndexOf('<w:tc>', row.indexOf('>Turno:</w:t>'));
    const turnoBordersEndPos = row.indexOf('</w:tcBorders>', turnoCellPosInRow);
    row = row.substring(0, turnoBordersEndPos) +
          '<w:end w:val="single" w:sz="4" w:space="0" w:color="000000"/>' +
          row.substring(turnoBordersEndPos);

    // Remove as células Matutino, Vespertino e Integral do row
    const matutinoPos   = row.indexOf('(   )Matutino');
    const matutinoStart = row.lastIndexOf('<w:tc>', matutinoPos);
    const integralEnd   = row.lastIndexOf('</w:tc>') + 7; // último </w:tc> = Integral
    row = row.substring(0, matutinoStart) + row.substring(integralEnd);

    xml = xml.substring(0, turnoRowStart) + row + xml.substring(turnoRowEnd);
    console.log('[OK] Turno mesclado (6622 twips, gridSpan=6)');
  }

  // ── Correção 2: Bimestre — remover 8 espaços antes do label no original ────
  {
    const bPos = xml.indexOf('>Bimestre</w:t>');
    const bCellStart = xml.lastIndexOf('<w:tc>', bPos);
    const bCellEnd   = xml.indexOf('</w:tc>', bPos) + 7;
    let bCell = xml.substring(bCellStart, bCellEnd);
    // Remove runs cujo único conteúdo são espaços (artefato do Word original)
    bCell = bCell.replace(/<w:t xml:space="preserve">[ \t]+<\/w:t>/g, '<w:t></w:t>');
    xml = xml.substring(0, bCellStart) + bCell + xml.substring(bCellEnd);
    console.log('[OK] Bimestre — espaços iniciais removidos');
  }

  // ── Seção A: mesma célula (cada label ocupa sua própria linha larga) ───────
  xml = inserirNaMesmaCelula(xml, '>Ano Letivo:</w:t>',                    ' {ano_letivo}');
  xml = inserirNaMesmaCelula(xml, '>Coordenação Regional de Ensino:</w:t>', ' {cre}');
  xml = inserirNaMesmaCelula(xml, '>Unidade Escolar:</w:t>',               ' {unidade_escolar}');
  xml = inserirNaMesmaCelula(xml, '>Estudante:</w:t>',                     ' {estudante}');
  xml = inserirNaMesmaCelula(xml, '>Ano: </w:t>',                       '{ano}');
  xml = inserirNaMesmaCelula(xml, '>Turma: </w:t>',                     '{turma}');
  xml = inserirNaMesmaCelula(xml, '>Turno:</w:t>',                      ' {turno}');
  xml = inserirNaMesmaCelula(xml, '>Professor(a) generalista:</w:t>',   ' {professor_generalista}');
  xml = inserirNaMesmaCelula(xml, '>Bimestre</w:t>',                    ' {bimestre}');
  xml = inserirNaMesmaCelula(xml, '>Total de dias letivos:</w:t>',      ' {total_dias_letivos}');
  xml = inserirNaMesmaCelula(xml, '>Total de Faltas:</w:t>',            ' {total_faltas}');

  // ── Professor(a) 2, 3, 4 ─────────────────────────────────────────────────
  let searchFrom = 0;
  for (const placeholder of [' {professor_2}', ' {professor_3}', ' {professor_4}']) {
    [xml, searchFrom] = inserirNaMesmaCelulaFrom(xml, '>Professor(a):</w:t>', placeholder, searchFrom);
  }

  // ── Checkboxes ─────────────────────────────────────────────────────────────
  xml = xml.replace('<w:t>Bloco: (   ) 1º Bloco   (   ) 2º Bloco</w:t>', '<w:t>Bloco: {bloco}</w:t>');
  console.log('[OK] Bloco');

  xml = xml.replace('<w:t>Apresenta Deficiência ou TEA? (  ) não (  ) sim</w:t>', '<w:t>Apresenta Deficiência ou TEA? {tem_deficiencia}</w:t>');
  console.log('[OK] Deficiência/TEA');

  xml = xml.replace('<w:t>Houve adequação curricular?  (  ) não (  ) sim</w:t>', '<w:t>Houve adequação curricular? {houve_adequacao}</w:t>');
  console.log('[OK] Adequação curricular');

  // ── Seção B — sem indent de parágrafo ─────────────────────────────────────
  const posB = xml.indexOf('>B</w:t>');
  if (posB !== -1) {
    const fimCelulaB = xml.indexOf('</w:tc>', posB) + '</w:tc>'.length;
    const celulaConteudoB = xml.indexOf('<w:tc>', fimCelulaB);
    const fimTcPrB = xml.indexOf('</w:tcPr>', celulaConteudoB) + '</w:tcPr>'.length;
    const fimCelulaConteudoB = xml.indexOf('</w:tc>', fimTcPrB);

    const paragrafoBSimples =
      `<w:p>` +
        `<w:pPr><w:pStyle w:val="Normal"/>` +
          `<w:spacing w:lineRule="auto" w:line="276" w:before="0" w:after="0"/>` +
          `<w:jc w:val="both"/>` +
          `<w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>` +
        `</w:pPr>` +
        `<w:r><w:rPr><w:rFonts w:eastAsia="Times New Roman" w:cs="Times New Roman" w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>` +
          `<w:t>{descricao_aprendizagem}</w:t>` +
        `</w:r>` +
      `</w:p>`;

    xml = xml.substring(0, fimTcPrB) + paragrafoBSimples + xml.substring(fimCelulaConteudoB);
    console.log('[OK] Seção B (sem indent)');
  }

  // ── Seção C — espaço antes do placeholder ─────────────────────────────────
  const posC = xml.indexOf('>C</w:t>');
  if (posC !== -1) {
    const fimCelulaC = xml.indexOf('</w:tc>', posC) + '</w:tc>'.length;
    const celulaConteudoC = xml.indexOf('<w:tc>', fimCelulaC);
    xml = inserirNaCelula(xml, celulaConteudoC, ' {local_data}');
    console.log('[OK] Seção C (local/data com espaço)');
  }

  // ── Seção D: nomes e matrículas nas assinaturas ───────────────────────────
  const profLabel = 'Assinatura/Matrícula do(a) Professor(a)';
  let dFrom = 0;
  [xml, dFrom] = substituirCelulaAssinatura(xml, profLabel, '{professor_generalista} - {matricula_professor}', dFrom);
  [xml, dFrom] = substituirCelulaAssinatura(xml, profLabel, '{professor_2}', dFrom);
  [xml, dFrom] = substituirCelulaAssinatura(xml, profLabel, '{professor_3}', dFrom);
  [xml, dFrom] = substituirCelulaAssinatura(xml, profLabel, '{professor_4}', dFrom);
  [xml]        = substituirCelulaAssinatura(xml, 'Assinatura/Matrícula do(a) Coordenador(a) Pedagógico', '{nome_coordenador} - {matricula_coordenador}');
  console.log('[OK] Seção D (assinaturas)');

  // ── Seção E ────────────────────────────────────────────────────────────────
  xml = xml.replace(
    '(    ) Progressão Continuada  (   ) Aprovado   (    ) Reprovado   (   ) Abandono    (   ) Cursando ',
    '{resultado_final}'
  );
  console.log('[OK] Seção E (resultado final)');

  // ── Verificar placeholders ─────────────────────────────────────────────────
  const placeholders = [...new Set((xml.match(/\{[a-z_0-9]+\}/g) || []))].sort();
  console.log('\nPLACEHOLDERS inseridos:', placeholders.join(', '));

  const esperados = [
    '{ano}', '{ano_letivo}', '{bimestre}', '{bloco}', '{cre}',
    '{descricao_aprendizagem}', '{estudante}', '{houve_adequacao}',
    '{local_data}', '{matricula_coordenador}', '{matricula_professor}',
    '{nome_coordenador}', '{professor_2}', '{professor_3}', '{professor_4}',
    '{professor_generalista}', '{resultado_final}', '{tem_deficiencia}',
    '{total_dias_letivos}', '{total_faltas}', '{turma}', '{turno}',
    '{unidade_escolar}',
  ];
  const faltando = esperados.filter(p => !placeholders.includes(p));
  if (faltando.length > 0) console.warn('\n[AVISO] Faltando:', faltando.join(', '));

  // ── Salvar ────────────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  await fs.mkdir(path.dirname(docDestino), { recursive: true });
  const out = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  await fs.writeFile(docDestino, out);
  console.log('\nTemplate salvo em:', docDestino);
}

gerarTemplate().catch(err => {
  console.error('ERRO:', err.message);
  process.exit(1);
});
