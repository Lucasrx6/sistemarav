-- Tabela de turmas
CREATE TABLE turmas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professor_id UUID NOT NULL REFERENCES professores(id) ON DELETE CASCADE,

  ano_letivo TEXT NOT NULL DEFAULT '2026',
  cre TEXT,
  unidade_escolar TEXT,
  bloco TEXT CHECK (bloco IN ('1º Bloco', '2º Bloco')),
  ano TEXT,
  turma TEXT,
  turno TEXT CHECK (turno IN ('Matutino', 'Vespertino', 'Integral')),

  professor_generalista TEXT,
  matricula_professor TEXT,
  professor_2 TEXT,
  professor_3 TEXT,
  professor_4 TEXT,
  nome_coordenador TEXT,
  matricula_coordenador TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de alunos (vinculados a uma turma)
CREATE TABLE alunos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES professores(id) ON DELETE CASCADE,

  nome TEXT NOT NULL,
  tem_deficiencia BOOLEAN DEFAULT FALSE,
  houve_adequacao BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FK em ravs para ligar ao aluno (nullable — RAVs antigos não têm)
ALTER TABLE ravs ADD COLUMN IF NOT EXISTS aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE;

-- RLS
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "professor_own_turmas" ON turmas
  FOR ALL USING (professor_id = auth.uid());

ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "professor_own_alunos" ON alunos
  FOR ALL USING (professor_id = auth.uid());

-- Grants
GRANT ALL ON TABLE turmas TO authenticated;
GRANT ALL ON TABLE alunos TO authenticated;

-- Trigger updated_at em turmas
CREATE TRIGGER turmas_updated_at
  BEFORE UPDATE ON turmas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
