-- Adiciona campos de assinatura da Seção D
ALTER TABLE ravs ADD COLUMN IF NOT EXISTS matricula_professor TEXT;
ALTER TABLE ravs ADD COLUMN IF NOT EXISTS nome_coordenador TEXT;
ALTER TABLE ravs ADD COLUMN IF NOT EXISTS matricula_coordenador TEXT;
