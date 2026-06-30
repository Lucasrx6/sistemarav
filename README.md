# Sistema RAv — SEEDF

Sistema web para professoras da rede pública do Distrito Federal preencherem, salvarem e exportarem o **Registro de Avaliação (RAv)** — documento oficial que substituí o preenchimento manual no Word.

> Desenvolvido para as escolas da Secretaria de Estado de Educação do Distrito Federal (SEEDF).

---

## Funcionalidades

- **Gestão de Turmas** — cadastre a turma uma vez e reutilize os dados em todos os RAVs
- **Cadastro de Alunos** — alunos vinculados à turma com indicação de TEA/deficiência e adequação curricular
- **RAVs por Bimestre** — crie e edite o registro de cada aluno em cada bimestre
- **Geração em lote** — crie RAVs em rascunho para toda a turma com um clique
- **Exportação individual** — baixe o `.docx` de um aluno específico
- **Exportação da turma** — baixe um único `.docx` com todos os alunos do bimestre, cada um em sua própria página
- **Progresso visual** — acompanhe quantos RAVs foram finalizados por bimestre
- **Autenticação** — login seguro via Supabase Auth

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Estilo | Tailwind CSS v4 |
| Banco de dados | Supabase (PostgreSQL + Auth) |
| Formulários | React Hook Form + Zod |
| Exportação DOCX | docxtemplater + PizZip + JSZip |
| UI base | shadcn/ui |

---

## Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/login/           → página de login
│   ├── (dashboard)/
│   │   ├── layout.tsx          → navbar + proteção de rota
│   │   ├── page.tsx            → redireciona para /turmas
│   │   ├── turmas/             → lista de turmas
│   │   │   ├── nova/           → criar turma
│   │   │   └── [id]/
│   │   │       ├── page.tsx    → detalhe da turma + alunos + progresso
│   │   │       ├── editar/     → editar dados da turma
│   │   │       └── alunos/
│   │   │           ├── novo/   → adicionar aluno
│   │   │           └── [alunoId]/
│   │   │               ├── page.tsx   → histórico de RAVs do aluno
│   │   │               ├── editar/    → editar aluno
│   │   │               └── rav/
│   │   │                   ├── novo/       → criar RAV
│   │   │                   └── [ravId]/    → editar RAV
│   └── api/
│       ├── rav/                → CRUD de RAVs (fluxo direto/legado)
│       │   └── [id]/export/    → exportar DOCX individual
│       └── turmas/             → CRUD de turmas
│           └── [id]/
│               ├── alunos/     → CRUD de alunos
│               │   └── [alunoId]/ravs/  → criar RAV no fluxo turma
│               ├── gerar-bimestre/      → criar RAVs em lote
│               └── exportar-bimestre/   → DOCX da turma inteira
├── components/
│   ├── turma/                  → FormularioTurma, ListaTurmas, BotaoGerarBimestre, BotaoExportarTurma
│   ├── aluno/                  → FormularioAluno, ListaAlunos
│   └── rav/                    → FormularioRav, FormularioRavAluno, BotaoExportar, SecaoA/B/E
├── lib/
│   ├── supabase/               → client.ts + server.ts
│   ├── validations/            → ravSchema, turmaSchema, alunoSchema
│   └── docx/
│       ├── exportarRav.ts      → exportação individual
│       └── exportarTurma.ts    → exportação em lote (DOCX único com page breaks)
└── types/
    ├── rav.ts
    ├── turma.ts
    └── aluno.ts

supabase/
└── migrations/
    ├── 001_initial.sql         → tabelas: escolas, professores, ravs
    ├── 002_add_signature_fields.sql  → matricula_professor, nome_coordenador, matricula_coordenador
    └── 003_turmas_alunos.sql   → tabelas: turmas, alunos; FK aluno_id em ravs

scripts/
└── gerar-template.mjs          → gera public/templates/rav-template.docx a partir do original

public/
└── templates/
    └── rav-template.docx       → template com placeholders {campo}
```

---

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- [Supabase CLI](https://supabase.com/docs/guides/cli) (para rodar localmente)
- ou um projeto Supabase na nuvem

---

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

Para o Supabase local, obtenha as chaves com:

```bash
supabase start
```

Para produção, copie a URL e a chave anônima do painel em **Project Settings → API**.

### 3. Banco de dados

Aplique as migrations em ordem no **SQL Editor** do Supabase (`http://localhost:54323`):

```
supabase/migrations/001_initial.sql
supabase/migrations/002_add_signature_fields.sql
supabase/migrations/003_turmas_alunos.sql
```

Ou rode via CLI:

```bash
supabase db push
```

### 4. Template DOCX

O arquivo `public/templates/rav-template.docx` já está incluso no repositório e é gerado a partir do documento oficial com placeholders `{campo}`.

Para regerar o template a partir do arquivo original:

```bash
# Coloque o arquivo original na raiz do projeto com o nome exato:
# "REGISTRO DE AVALIAÇÃO - RAv - 2026.docx"

npm run gerar-template
```

---

## Rodando localmente

```bash
npm run dev
```

Acesse em [http://localhost:3000](http://localhost:3000).

---

## Fluxo de uso

### Criar uma turma

1. Acesse **Minhas Turmas** → **Nova Turma**
2. Preencha escola, CRE, ano, turma, turno, bloco e professores
3. Os dados da turma são reutilizados em todos os RAVs dos alunos

### Cadastrar alunos

1. Dentro da turma, clique em **Adicionar Aluno**
2. Informe o nome, se possui TEA/deficiência e se houve adequação curricular

### Criar RAVs

**Individualmente:**
Na tela do aluno, clique em `+ Criar RAV` no card do bimestre desejado.

**Em lote (turma inteira):**
Na tela da turma, clique em **Gerar N RAVs** abaixo do bimestre desejado.
O sistema cria rascunhos para todos os alunos que ainda não têm RAV naquele bimestre.

### Exportar

**Individual:** No RAV finalizado, clique em **Exportar DOCX**.

**Turma inteira:** Na tela da turma, clique em **Exportar** abaixo do bimestre.
Gera um único `.docx` com todos os RAVs finalizados, cada aluno em uma página separada.

---

## Banco de dados

### Tabelas principais

| Tabela | Descrição |
|--------|-----------|
| `professores` | Perfil do professor (estende `auth.users`) |
| `turmas` | Dados recorrentes da turma (escola, professores, turno) |
| `alunos` | Alunos vinculados a uma turma |
| `ravs` | Registros de Avaliação (denormalizados — herdam dados da turma/aluno na criação) |

### Campos do RAV

| Campo | Seção | Descrição |
|-------|-------|-----------|
| `estudante` | A | Nome do aluno |
| `ano_letivo` | A | Ano letivo |
| `cre` | A | Coordenação Regional de Ensino |
| `unidade_escolar` | A | Nome da escola |
| `bloco` | A | 1º Bloco / 2º Bloco |
| `ano` | A | Ano escolar |
| `turma` | A | Identificador da turma |
| `turno` | A | Matutino / Vespertino / Integral |
| `professor_generalista` | A | Professora responsável |
| `matricula_professor` | D | Matrícula da professora |
| `professor_2/3/4` | A | Professores adicionais (ETI) |
| `nome_coordenador` | D | Coordenador(a) pedagógico(a) |
| `matricula_coordenador` | D | Matrícula do coordenador |
| `tem_deficiencia` | A | Possui TEA ou deficiência |
| `houve_adequacao` | A | Houve adequação curricular |
| `bimestre` | A | 1 a 4 |
| `total_dias_letivos` | A | Total de dias letivos do bimestre |
| `total_faltas` | A | Total de faltas do aluno |
| `descricao_aprendizagem` | B | Parecer descritivo (texto livre) |
| `local_data` | C | Local e data da assinatura |
| `resultado_final` | E | Apenas no 4º bimestre |
| `status` | — | `rascunho` ou `finalizado` |
| `aluno_id` | — | FK para `alunos` (presente no fluxo Turma → Aluno) |

### Row Level Security

Cada professor acessa apenas seus próprios dados. As políticas RLS do Supabase garantem isolamento por `professor_id = auth.uid()`.

---

## Exportação DOCX

O template `public/templates/rav-template.docx` contém placeholders no formato `{campo}` (docxtemplater). Na exportação:

1. O template é lido com **PizZip**
2. Os placeholders são substituídos pelos dados do RAV via **docxtemplater**
3. O arquivo `.docx` resultante é retornado como download

**Exportação em lote:** Para cada aluno, o conteúdo `<w:body>` do DOCX gerado é extraído (sem o `<w:sectPr>`) e os corpos são concatenados com uma quebra de página OOXML (`<w:br w:type="page"/>`). O `<w:sectPr>` original (que define margens e tamanho A4) é mantido apenas uma vez no final.

---

## Scripts disponíveis

```bash
npm run dev            # servidor de desenvolvimento
npm run build          # build de produção
npm run start          # servidor de produção
npm run lint           # lint do código
npm run gerar-template # gera o template DOCX com placeholders
```

---

## Licença

Projeto desenvolvido para uso interno das escolas públicas do Distrito Federal.
