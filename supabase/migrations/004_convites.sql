CREATE TABLE convites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT UNIQUE NOT NULL,
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  usado BOOLEAN DEFAULT FALSE NOT NULL,
  usado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  usado_em TIMESTAMPTZ
);

ALTER TABLE convites ENABLE ROW LEVEL SECURITY;

-- Sem políticas públicas: acesso apenas via service role (API do servidor)
