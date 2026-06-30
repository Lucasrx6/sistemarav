@AGENTS.md

# Sistema RAv — Documentação do Projeto

## O que é este projeto

Sistema web para professoras da rede pública do Distrito Federal (SEEDF) preencherem, salvarem e exportarem o **Registro de Avaliação (RAv)** — documento oficial que atualmente é feito manualmente no Word.

O objetivo final é: a professora acessa o sistema, preenche os dados do estudante, salva no banco, e clica em "Exportar DOCX" para baixar um arquivo `.docx` idêntico ao modelo oficial (`REGISTRO DE AVALIAÇÃO - RAv - 2026.docx`).

---

## Stack

- **Next.js 16** (App Router) — TypeScript
- **Tailwind CSS v4**
- **Supabase** — banco de dados PostgreSQL + autenticação
- **React Hook Form + Zod** — formulário e validação
- **JSZip** — manipulação do arquivo DOCX (substituição de placeholders no XML interno)
- **shadcn/ui** — componentes de UI base

---

## Estrutura de Pastas

```
src/
  app/
    (auth)/login/        → página de login
    (auth)/layout.tsx    → layout da área de auth (fundo degradê)
    (dashboard)/         → área protegida (exige login)
      layout.tsx         → navbar + proteção de rota
      page.tsx           → lista de RAVs do professor
      rav/novo/          → criar novo RAv
      rav/[id]/          → editar RAv existente
      rav/[id]/preview/  → visualizar RAv antes de exportar
    api/rav/             → POST (criar) + GET (listar)
    api/rav/[id]/        → GET + PUT + DELETE
    api/rav/[id]/export/ → POST → gera e retorna o DOCX
  components/rav/
    FormularioRav.tsx    → formulário principal (orquestra as seções)
    SecaoA.tsx           → identificação do estudante
    SecaoB.tsx           → descrição da aprendizagem (textarea)
    SecaoE.tsx           → resultado final (só no 4º bimestre)
    BotaoExportar.tsx    → botão que chama a API de export
  lib/
    supabase/
      client.ts          → cliente Supabase para o browser
      server.ts          → cliente Supabase para Server Components
    validations/
      ravSchema.ts       → schema Zod de validação
    docx/
      exportarRav.ts     → lê o template DOCX e substitui os placeholders
  types/
    rav.ts               → interface TypeScript do RAv

supabase/
  migrations/001_initial.sql → schema do banco (tabelas: escolas, professores, ravs)

scripts/
  gerar-template.mjs     → script para copiar o .docx original para public/templates/

public/
  templates/
    rav-template.docx    → template DOCX base com placeholders {{campo}}
```

---

## Campos do Formulário RAv (mapeados para a tabela `ravs`)

| Campo no banco         | Seção | Descrição                                     |
|------------------------|-------|-----------------------------------------------|
| ano_letivo             | A     | Ano letivo (padrão: 2026)                     |
| cre                    | A     | Coordenação Regional de Ensino                |
| unidade_escolar        | A     | Nome da escola                                |
| bloco                  | A     | 1º Bloco ou 2º Bloco                          |
| ano                    | A     | Ano escolar (ex: 3º Ano)                      |
| turma                  | A     | Turma (ex: 301)                               |
| turno                  | A     | Matutino / Vespertino / Integral               |
| professor_generalista  | A     | Nome da professora responsável                |
| professor_2/3/4        | A     | Professores adicionais (opcional, ETI)        |
| estudante              | A     | Nome completo do estudante                    |
| tem_deficiencia        | A     | Boolean — apresenta deficiência/TEA           |
| houve_adequacao        | A     | Boolean — houve adequação curricular          |
| bimestre               | A     | 1 a 4                                         |
| total_dias_letivos     | A     | Número total de dias letivos                  |
| total_faltas           | A     | Total de faltas do estudante                  |
| descricao_aprendizagem | B     | Texto livre — parecer descritivo              |
| local_data             | C     | Ex: "Brasília, 12 de maio de 2026"            |
| resultado_final        | E     | Só no 4º bimestre (aprovado, reprovado, etc.) |
| status                 | —     | rascunho / finalizado                         |

---

## O que já está construído

- [x] Autenticação (login com e-mail/senha via Supabase)
- [x] Proteção de rotas no layout do dashboard
- [x] Listagem de RAVs com filtro por bimestre
- [x] Exclusão de RAv
- [x] Formulário completo (Seção A, B, C, E)
- [x] Salvar como rascunho e finalizar
- [x] Página de preview do RAv
- [x] Botão de exportar DOCX (chama a API)
- [x] API de exportação (lê template + substitui placeholders + retorna arquivo)
- [x] Schema do banco de dados com RLS
- [x] Template DOCX em `public/templates/rav-template.docx`

---

## Problemas que precisam ser corrigidos (FASE 1 — Correções Críticas)

Estes bugs impedem o sistema de funcionar:

### 1. Inconsistência no nome da tabela
- `src/app/api/rav/route.ts` e `src/app/api/rav/[id]/route.ts` consultam a tabela `'rav'` (singular)
- O banco de dados criou a tabela `'ravs'` (plural)
- **Corrigir:** mudar `.from('rav')` para `.from('ravs')` nos dois arquivos

### 2. Função exportada com nome errado
- `src/lib/docx/exportarRav.ts` exporta `exportarRavParaDocx`
- `src/app/api/rav/[id]/export/route.ts` importa `exportarRav` (nome diferente)
- **Corrigir:** alinhar o nome da função (usar `exportarRav` em ambos)

### 3. Schema Zod desatualizado
- `src/lib/validations/ravSchema.ts` usa campos antigos (`aluno_nome`, `escola_nome`, etc.)
- O formulário usa campos novos (`estudante`, `unidade_escolar`, etc.)
- **Corrigir:** reescrever o `ravSchema.ts` com os campos corretos da tabela `ravs`

### 4. Interface TypeScript desatualizada
- `src/types/rav.ts` define `RavData` com campos antigos
- O sistema usa uma interface `Rav` com campos novos, mas ela não está declarada no types
- **Corrigir:** reescrever `src/types/rav.ts` com a interface `Rav` correta

### 5. Import de `createServerClient` inexistente
- `src/app/(dashboard)/layout.tsx` e `src/app/api/rav/[id]/export/route.ts` importam `createServerClient` de `@/lib/supabase/server`
- O arquivo `server.ts` só exporta `createClient`
- **Corrigir:** ou renomear a exportação para `createServerClient`, ou ajustar os imports para `createClient`

### 6. Middleware ausente
- O Supabase SSR requer um `middleware.ts` na raiz do projeto para renovar o token de sessão automaticamente
- **Criar:** `src/middleware.ts` com o padrão do `@supabase/ssr`

---

## Fase 2 — Template DOCX com Placeholders

O template em `public/templates/rav-template.docx` ainda é uma cópia do original sem placeholders.

**O que precisa ser feito:**
1. Abrir o arquivo `REGISTRO DE AVALIAÇÃO - RAv - 2026.docx` no Word
2. Substituir cada campo fixo pelos placeholders correspondentes (ex: onde está o nome do estudante, digitar `{{estudante}}`)
3. Salvar e sobrescrever `public/templates/rav-template.docx`

**Placeholders a inserir no Word:**

```
{{ano_letivo}}            → ano letivo
{{cre}}                   → coordenação regional
{{unidade_escolar}}       → nome da escola
{{bloco}}                 → 1º Bloco ou 2º Bloco
{{ano}}                   → ano escolar
{{turma}}                 → turma
{{turno}}                 → turno
{{professor_generalista}} → nome da professora
{{professor_2}}           → professor adicional (se houver)
{{professor_3}}           → professor adicional (se houver)
{{professor_4}}           → professor adicional (se houver)
{{estudante}}             → nome do estudante
{{tem_deficiencia}}       → Sim / Não
{{houve_adequacao}}       → Sim / Não
{{bimestre}}              → número do bimestre
{{total_dias_letivos}}    → total de dias letivos
{{total_faltas}}          → total de faltas
{{descricao_aprendizagem}} → texto do parecer
{{local_data}}            → local e data
{{resultado_final}}       → resultado (só 4º bimestre)
```

> **Atenção:** No Word, às vezes ao digitar `{{campo}}` o XML interno quebra o texto em múltiplas tags. Isso faz a substituição falhar. Para evitar: **cole o texto do placeholder como texto simples**, sem formatações especiais, e verifique se ele fica em uma única linha/run no XML.

---

## Fase 3 — Funcionalidades Faltantes

Após corrigir os bugs e o template:

- [ ] **Configurar variáveis de ambiente**: criar `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] **Rodar a migration**: aplicar `supabase/migrations/001_initial.sql` no projeto Supabase
- [ ] **Cadastro de professor**: após login, a tabela `professores` precisa ter um registro com o `id` do usuário. Hoje não há tela de cadastro. Opções: criar via SQL diretamente ou adicionar uma tela simples de "completar perfil"
- [ ] **Testar o fluxo completo**: login → criar RAv → salvar → preview → exportar DOCX
- [ ] **Verificar o DOCX exportado**: abrir o arquivo gerado e confirmar que os campos estão preenchidos corretamente

---

## Fase 4 — Melhorias (após tudo funcionando)

- [ ] Cálculo automático do percentual de frequência (`(dias_letivos - faltas) / dias_letivos * 100`)
- [ ] Listagem de RAVs do mesmo estudante (histórico por estudante)
- [ ] Busca por nome do estudante no dashboard
- [ ] Página de "completar perfil" para novos professores

---

## Regras para o desenvolvimento

- Linguagem simples e sem abstrações desnecessárias
- Não criar componentes genéricos reutilizáveis — cada seção é específica do RAv
- Não usar bibliotecas extras além das já instaladas
- Manter a identidade visual atual: indigo + branco + Tailwind
- Nunca adicionar comentários que descrevam *o que* o código faz — apenas *por que* quando não for óbvio
- Sempre testar no browser após mudanças visuais

---

## Como rodar localmente

```bash
npm install
npm run dev
# Acessa em http://localhost:3000
```

Para criar o template (após corrigir o script):
```bash
npm run gerar-template
```
