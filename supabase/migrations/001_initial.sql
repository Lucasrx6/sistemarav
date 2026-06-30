-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Escolas
CREATE TABLE escolas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  cre TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Professores (estende auth.users do Supabase)
CREATE TABLE professores (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  matricula TEXT,
  escola_id UUID REFERENCES escolas(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RAVs
CREATE TABLE ravs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professor_id UUID NOT NULL REFERENCES professores(id) ON DELETE CASCADE,

  -- Seção A: Identificação
  ano_letivo TEXT DEFAULT '2026',
  cre TEXT,
  unidade_escolar TEXT,
  bloco TEXT CHECK (bloco IN ('1º Bloco', '2º Bloco')),
  ano TEXT,
  turma TEXT,
  turno TEXT CHECK (turno IN ('Matutino', 'Vespertino', 'Integral')),
  professor_generalista TEXT,
  professor_2 TEXT,
  professor_3 TEXT,
  professor_4 TEXT,
  estudante TEXT NOT NULL,
  tem_deficiencia BOOLEAN DEFAULT FALSE,
  houve_adequacao BOOLEAN DEFAULT FALSE,
  bimestre INTEGER CHECK (bimestre BETWEEN 1 AND 4),
  total_dias_letivos INTEGER,
  total_faltas INTEGER,

  -- Seção B: Descrição do processo de aprendizagem (texto livre, campo principal)
  descricao_aprendizagem TEXT,

  -- Seção C: Local e Data
  local_data TEXT,

  -- Seção E: Resultado Final (somente 4º bimestre)
  resultado_final TEXT CHECK (
    resultado_final IS NULL OR
    resultado_final IN ('progressao_continuada', 'aprovado', 'reprovado', 'abandono', 'cursando')
  ),

  -- Controle interno
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'finalizado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE escolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ravs ENABLE ROW LEVEL SECURITY;

-- Policies: professor só vê/edita seus próprios RAVs
CREATE POLICY "professor_own_ravs" ON ravs
  FOR ALL USING (professor_id = auth.uid());

CREATE POLICY "professor_own_profile" ON professores
  FOR ALL USING (id = auth.uid());

CREATE POLICY "escolas_read_all" ON escolas
  FOR SELECT USING (TRUE);

-- Permissões de acesso por role
GRANT ALL ON TABLE escolas TO authenticated;
GRANT ALL ON TABLE professores TO authenticated;
GRANT ALL ON TABLE ravs TO authenticated;
GRANT SELECT ON TABLE escolas TO anon;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ravs_updated_at
  BEFORE UPDATE ON ravs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
