## 🧑‍💼 Spec para Humanos

> ⚠️ **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes. Caso voce decida fazer alteracao, faca atraves do agente para que ela seja refletida em todas as secoes.**

- **Tarefa:** Prisma schema + DB migrations + CRUD API routes (logs + settings) (BE)
- **Objetivo:** Instalar Prisma com PostgreSQL, definir schema (User, HydrationLog, Settings), gerar migrations e implementar 6 API routes autenticadas com validacao zod.
- **Topicos:**
  - Prisma ORM: instalacao, configuracao provider PostgreSQL, schema com 3 modelos e relacoes
  - Migrations: gerar e aplicar migration inicial com indices otimizados
  - API Logs: GET (filtro por data), POST (criar), PUT (editar), DELETE (remover) em `/api/logs`
  - API Settings: GET (upsert padrao), PUT (atualizar) em `/api/settings`
  - Autenticacao: todas as rotas protegidas via `getServerSession` (401 sem sessao)
  - Ownership: verificacao de propriedade em todas as operacoes
  - Validacao: schemas zod para todos os inputs
- **Dependencias:** Prisma, PostgreSQL, NextAuth.js (getServerSession), zod
- **Validacao:** CRUD logs funcional, CRUD settings funcional, auth 401, ownership 404, validacao zod 400, status codes corretos

---

## 🤖 Contexto Detalhado para Agentes

## Bloco 1: O Que? (Descricao)

### 1. Objetivo Tecnico Explicito

Instalar e configurar Prisma ORM com provider PostgreSQL, definir o schema de dados (User, HydrationLog, Settings) com relacoes e indices, gerar a migration inicial, e implementar 6 API routes no Next.js App Router (`/api/logs` e `/api/settings`) com autenticacao via NextAuth, verificacao de ownership, e validacao de input via zod.

### 2. Decomposicao em Cenarios

**Cenario A — Prisma Setup e Schema**
- Instalar `prisma` (devDependency) e `@prisma/client` (dependency)
- Inicializar Prisma com `npx prisma init --datasource-provider postgresql`
- Definir modelos no `prisma/schema.prisma`:
  - `User`: id (String, cuid), email (String, unique), name (String?), image (String?), migrationCompleted (Boolean, default false), createdAt (DateTime), updatedAt (DateTime)
  - `HydrationLog`: id (String, uuid), amount (Int), timestamp (DateTime), userId (String), createdAt (DateTime), updatedAt (DateTime)
  - `Settings`: id (String, cuid), userId (String, unique), dailyGoal (Int, default 2000), presets (Json, default `[200, 300, 500]`), updatedAt (DateTime)
- Relacoes: User hasMany HydrationLog, User hasOne Settings
- Indices: `@@index([userId, timestamp])` em HydrationLog, `@@unique([userId])` em Settings
- Gerar migration: `npx prisma migrate dev --name init`
- Criar instancia singleton do PrismaClient em `lib/prisma.ts`

**Cenario B — Instalar e configurar zod**
- Instalar `zod` como dependency
- Criar schemas de validacao em `lib/validations.ts`:
  - `createLogSchema`: { amount: z.number().int().positive(), timestamp: z.string().datetime(), id: z.string().uuid().optional() }
  - `updateLogSchema`: { amount: z.number().int().positive().optional(), timestamp: z.string().datetime().optional() }
  - `updateSettingsSchema`: { dailyGoal: z.number().int().min(500).max(5000).optional(), presets: z.array(z.number().int().min(50).max(2000)).length(3).optional() }
  - `logsQuerySchema`: { from: z.string().datetime().optional(), to: z.string().datetime().optional() }

**Cenario C — Helper de autenticacao**
- Criar `lib/auth.ts` com funcao helper `getAuthSession()` que encapsula `getServerSession` do NextAuth
- Retorna sessao com `user.id`, `user.email`, `user.name`, `user.image`
- Retorna `null` se nao autenticado
- Nota: assume que NextAuth ja esta configurado (US-010/011); esta task apenas consome a sessao

**Cenario D — API Routes de Logs**
- `GET /api/logs` (app/api/logs/route.ts):
  - Obter sessao; retornar 401 se nao autenticado
  - Parsear query params `from` e `to` com `logsQuerySchema`
  - Buscar logs do usuario (`where: { userId: session.user.id }`) com filtro de data opcional
  - Ordenar por `timestamp DESC`
  - Retornar 200 com array de logs

- `POST /api/logs` (app/api/logs/route.ts):
  - Obter sessao; retornar 401 se nao autenticado
  - Validar body com `createLogSchema`; retornar 400 se invalido
  - Criar log com `prisma.hydrationLog.create()`:
    - Se `id` fornecido no body, usar esse ID (suporte a migracao)
    - Se nao, gerar UUID automatico (default do Prisma)
    - `userId` vem da sessao
  - Retornar 201 com log criado

- `PUT /api/logs/[id]` (app/api/logs/[id]/route.ts):
  - Obter sessao; retornar 401 se nao autenticado
  - Validar body com `updateLogSchema`; retornar 400 se invalido
  - Buscar log por id; retornar 404 se nao encontrado
  - Verificar ownership (`log.userId === session.user.id`); retornar 404 se nao for dono (nao revelar existencia)
  - Atualizar log com `prisma.hydrationLog.update()`
  - Retornar 200 com log atualizado

- `DELETE /api/logs/[id]` (app/api/logs/[id]/route.ts):
  - Obter sessao; retornar 401 se nao autenticado
  - Buscar log por id; retornar 404 se nao encontrado
  - Verificar ownership; retornar 404 se nao for dono
  - Deletar log com `prisma.hydrationLog.delete()`
  - Retornar 204 (sem body)

**Cenario E — API Routes de Settings**
- `GET /api/settings` (app/api/settings/route.ts):
  - Obter sessao; retornar 401 se nao autenticado
  - Buscar settings por `userId`
  - Se nao existir: criar com defaults (`dailyGoal: 2000`, `presets: [200, 300, 500]`) via upsert
  - Retornar 200 com settings

- `PUT /api/settings` (app/api/settings/route.ts):
  - Obter sessao; retornar 401 se nao autenticado
  - Validar body com `updateSettingsSchema`; retornar 400 se invalido
  - Upsert: criar se nao existir, atualizar se existir
  - Retornar 200 com settings atualizadas

**Cenario F — Tratamento de erros**
- Todas as rotas devem capturar erros inesperados e retornar 500 com `{ error: "Internal server error" }`
- Erros de validacao zod retornam 400 com `{ error: "Validation error", details: zodError.issues }`
- Nunca expor stack traces ou detalhes internos do banco

### 3. Criterios de Aceite por Cenario

| Cenario | Criterio | Resultado Esperado |
|---------|----------|--------------------|
| A | Schema Prisma criado com 3 modelos | `npx prisma validate` passa sem erros |
| A | Migration gerada e aplicada | Tabelas User, HydrationLog, Settings existem no banco |
| A | Indices criados | HydrationLog(userId, timestamp) e Settings(userId) unique |
| A | PrismaClient singleton | `lib/prisma.ts` exporta instancia reutilizavel |
| B | Schemas zod definidos | Todos os 4 schemas validam corretamente inputs validos e invalidos |
| C | Helper de auth funcional | Retorna sessao ou null; encapsula getServerSession |
| D | GET /api/logs retorna logs | 200 com array de logs do usuario autenticado |
| D | GET /api/logs com filtro de data | Query params `from`/`to` filtram por periodo |
| D | POST /api/logs cria log | 201 com log criado; aceita id opcional |
| D | PUT /api/logs/[id] atualiza | 200 com log atualizado; verifica ownership |
| D | DELETE /api/logs/[id] remove | 204 sem body; verifica ownership |
| D | Rotas de logs sem sessao | 401 `{ error: "Unauthorized" }` |
| E | GET /api/settings retorna | 200 com settings; cria defaults na primeira leitura |
| E | PUT /api/settings atualiza | 200 com settings atualizadas; upsert funcional |
| E | Rotas de settings sem sessao | 401 `{ error: "Unauthorized" }` |
| F | Input invalido | 400 com detalhes do erro zod |
| F | Erro interno | 500 com mensagem generica, sem stack trace |

## Bloco 2: Como? (Implementacao)

### 4. Codigo de Referencia

**Referencia: Estrutura de API routes no Next.js App Router**

O projeto usa Next.js 16 App Router. API routes sao definidas em `app/api/` com `route.ts`.

```
app/
  api/
    logs/
      route.ts          # GET (listar) + POST (criar)
      [id]/
        route.ts        # PUT (atualizar) + DELETE (remover)
    settings/
      route.ts          # GET (ler) + PUT (atualizar)
```

**Referencia: Padrao de API route no Next.js App Router**

```typescript
// app/api/logs/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // ... implementation
  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: NextRequest) {
  // ... implementation
  return NextResponse.json(created, { status: 201 });
}
```

**Referencia: Singleton PrismaClient (padrao Next.js)**

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Referencia: Store existente (hooks/use-hydration-store.ts)**

O store atual usa Zustand com persist middleware e localStorage. As actions existentes que a API deve espelhar:
- `addLog(amount)` — gera id `log-${Date.now()}-...`, timestamp `new Date().toISOString()`
- `deleteLog(id)` — filtra por id
- `editLog(id, newAmount)` — atualiza amount por id
- `setDailyGoal(goal)` — set direto
- `setPresets(presets)` — set direto

Path: `hooks/use-hydration-store.ts` (linhas 114-188)

**Referencia: Tipos existentes (lib/types.ts)**

```typescript
// lib/types.ts
export type HydrationLog = {
  id: string;
  amount: number;
  timestamp: string;
};
```

**Referencia: Constantes existentes (lib/constants.ts)**

```typescript
// lib/constants.ts
export const DEFAULT_GOAL = 2000;
export const DEFAULT_PRESETS = [200, 300, 500];
export const STORAGE_KEY = "hydra-store";
```

### 5. Contratos e Estruturas de Dados

**Prisma Schema:**

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                 String         @id @default(cuid())
  email              String         @unique
  name               String?
  image              String?
  migrationCompleted Boolean        @default(false)
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt

  logs     HydrationLog[]
  settings Settings?
}

model HydrationLog {
  id        String   @id @default(uuid())
  amount    Int
  timestamp DateTime
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, timestamp])
}

model Settings {
  id        String   @id @default(cuid())
  userId    String   @unique
  dailyGoal Int      @default(2000)
  presets   Json     @default("[200, 300, 500]")
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**API Contracts:**

**GET /api/logs**
```
Request:
  Query: ?from=2026-01-01T00:00:00Z&to=2026-01-31T23:59:59Z (opcionais)
  Headers: Cookie (session)

Response 200:
  [
    {
      "id": "a1b2c3d4-...",
      "amount": 300,
      "timestamp": "2026-02-12T14:30:00.000Z",
      "userId": "clx...",
      "createdAt": "2026-02-12T14:30:00.000Z",
      "updatedAt": "2026-02-12T14:30:00.000Z"
    }
  ]

Response 401: { "error": "Unauthorized" }
```

**POST /api/logs**
```
Request:
  Body: { "amount": 300, "timestamp": "2026-02-12T14:30:00.000Z", "id": "optional-uuid" }
  Headers: Cookie (session)

Response 201:
  {
    "id": "a1b2c3d4-...",
    "amount": 300,
    "timestamp": "2026-02-12T14:30:00.000Z",
    "userId": "clx...",
    "createdAt": "2026-02-12T14:30:00.000Z",
    "updatedAt": "2026-02-12T14:30:00.000Z"
  }

Response 400: { "error": "Validation error", "details": [...] }
Response 401: { "error": "Unauthorized" }
```

**PUT /api/logs/[id]**
```
Request:
  Params: id (UUID)
  Body: { "amount": 500 } ou { "timestamp": "2026-02-12T15:00:00.000Z" } ou ambos
  Headers: Cookie (session)

Response 200: { ...log atualizado }
Response 400: { "error": "Validation error", "details": [...] }
Response 401: { "error": "Unauthorized" }
Response 404: { "error": "Not found" }
```

**DELETE /api/logs/[id]**
```
Request:
  Params: id (UUID)
  Headers: Cookie (session)

Response 204: (sem body)
Response 401: { "error": "Unauthorized" }
Response 404: { "error": "Not found" }
```

**GET /api/settings**
```
Request:
  Headers: Cookie (session)

Response 200:
  {
    "id": "clx...",
    "userId": "clx...",
    "dailyGoal": 2000,
    "presets": [200, 300, 500],
    "updatedAt": "2026-02-12T14:30:00.000Z"
  }

Response 401: { "error": "Unauthorized" }
```

**PUT /api/settings**
```
Request:
  Body: { "dailyGoal": 3000 } ou { "presets": [200, 500, 750] } ou ambos
  Headers: Cookie (session)

Response 200: { ...settings atualizadas }
Response 400: { "error": "Validation error", "details": [...] }
Response 401: { "error": "Unauthorized" }
```

### 6. Dependencias e Interacoes

**Dependencias a instalar:**
- `prisma` (devDependency) — CLI para migrations e gerador
- `@prisma/client` (dependency) — cliente ORM runtime
- `zod` (dependency) — validacao de input

**Dependencias existentes utilizadas:**
- `next` 16.1.6 — App Router, API routes (`NextRequest`, `NextResponse`)
- NextAuth.js — `getServerSession` para autenticacao (assume configuracao existente de US-010/011)

**Arquivos a criar:**
| Arquivo | Descricao |
|---------|-----------|
| `prisma/schema.prisma` | Schema com modelos User, HydrationLog, Settings |
| `lib/prisma.ts` | Singleton PrismaClient |
| `lib/validations.ts` | Schemas zod para inputs das APIs |
| `lib/auth.ts` | Helper `getAuthSession()` |
| `app/api/logs/route.ts` | GET + POST logs |
| `app/api/logs/[id]/route.ts` | PUT + DELETE log por id |
| `app/api/settings/route.ts` | GET + PUT settings |

**Componentes existentes reutilizados:**
- `lib/constants.ts` (`DEFAULT_GOAL`, `DEFAULT_PRESETS`) — usar para defaults do schema e upsert de settings
- `lib/types.ts` (`HydrationLog`) — referencia para compatibilidade de formato

**Variavel de ambiente necessaria:**
- `DATABASE_URL` — connection string do PostgreSQL (adicionar ao `.env` e `.env.example`)

**Integracao com NextAuth:**
- O modelo `User` do Prisma deve ser compativel com o adapter do NextAuth (se `@auth/prisma-adapter` for usado)
- Se NextAuth nao estiver configurado ainda, o helper `getAuthSession()` deve ter fallback claro e documentado

### 7. Requisitos Nao-Funcionais

**Performance:**
- GET /api/logs com 500+ entries deve responder em < 2s
- Indice composto `(userId, timestamp)` garante queries eficientes por periodo
- Paginacao nao e necessaria no MVP mas a query deve suportar adicao futura (limit/offset)

**Seguranca:**
- Todas as rotas exigem sessao autenticada (401 sem sessao)
- Ownership check em todas as operacoes — nunca expor dados de outros usuarios
- Retornar 404 (nao 403) quando ownership falha, para nao revelar existencia do recurso
- Validacao de input em todas as rotas via zod
- Nunca expor stack traces ou mensagens de erro internas

**Logging:**
- `console.error` para erros inesperados (capturados no catch generico)
- Nao logar dados sensiveis (tokens, emails)

**Estrutura de arquivos:**
- Seguir convencao existente do projeto: named exports, TypeScript strict
- API routes em `app/api/` conforme padrao Next.js App Router
- Libs utilitarias em `lib/`
- Prisma schema em `prisma/`

**Formatadores:**
- ESLint 9 flat config com `next/core-web-vitals` + `next/typescript` — codigo deve passar no lint
- TypeScript strict mode — sem `any`, sem `@ts-ignore`

## Bloco 3: Como Validar? (Validacao)

### 8. Cenarios de Teste (BDD)

**Cenario 1: GET /api/logs — usuario autenticado obtem seus logs**
```
Dado que o usuario esta autenticado com sessao valida
E possui 5 logs de hidratacao no banco
Quando faz GET /api/logs
Entao recebe status 200
E o body contem array com 5 logs
E os logs estao ordenados por timestamp DESC
E todos os logs pertencem ao usuario autenticado
```

**Cenario 2: GET /api/logs — filtro por periodo**
```
Dado que o usuario esta autenticado
E possui logs nos dias 2026-02-10, 2026-02-11, 2026-02-12
Quando faz GET /api/logs?from=2026-02-11T00:00:00Z&to=2026-02-11T23:59:59Z
Entao recebe status 200
E o body contem apenas logs do dia 2026-02-11
```

**Cenario 3: GET /api/logs — sem autenticacao**
```
Dado que o usuario nao possui sessao ativa
Quando faz GET /api/logs
Entao recebe status 401
E o body contem { "error": "Unauthorized" }
```

**Cenario 4: POST /api/logs — criar log com sucesso**
```
Dado que o usuario esta autenticado
Quando faz POST /api/logs com body { "amount": 300, "timestamp": "2026-02-12T14:30:00.000Z" }
Entao recebe status 201
E o body contem o log criado com id gerado automaticamente
E o log tem userId igual ao usuario autenticado
E o log esta persistido no banco
```

**Cenario 5: POST /api/logs — criar log com id customizado (migracao)**
```
Dado que o usuario esta autenticado
Quando faz POST /api/logs com body { "amount": 500, "timestamp": "2026-02-12T10:00:00.000Z", "id": "custom-uuid-123" }
Entao recebe status 201
E o log criado tem id "custom-uuid-123"
```

**Cenario 6: POST /api/logs — validacao falha**
```
Dado que o usuario esta autenticado
Quando faz POST /api/logs com body { "amount": -100, "timestamp": "invalido" }
Entao recebe status 400
E o body contem { "error": "Validation error", "details": [...] }
E nenhum log e criado no banco
```

**Cenario 7: PUT /api/logs/[id] — atualizar log proprio**
```
Dado que o usuario esta autenticado
E possui um log com id "abc-123" e amount 300
Quando faz PUT /api/logs/abc-123 com body { "amount": 500 }
Entao recebe status 200
E o body contem o log com amount 500
E o log esta atualizado no banco
```

**Cenario 8: PUT /api/logs/[id] — log de outro usuario**
```
Dado que o usuario A esta autenticado
E existe um log com id "xyz-789" pertencente ao usuario B
Quando o usuario A faz PUT /api/logs/xyz-789 com body { "amount": 500 }
Entao recebe status 404
E o body contem { "error": "Not found" }
E o log nao e alterado
```

**Cenario 9: DELETE /api/logs/[id] — remover log proprio**
```
Dado que o usuario esta autenticado
E possui um log com id "abc-123"
Quando faz DELETE /api/logs/abc-123
Entao recebe status 204
E o response nao tem body
E o log nao existe mais no banco
```

**Cenario 10: DELETE /api/logs/[id] — log inexistente**
```
Dado que o usuario esta autenticado
Quando faz DELETE /api/logs/nao-existe
Entao recebe status 404
E o body contem { "error": "Not found" }
```

**Cenario 11: GET /api/settings — primeira leitura (upsert)**
```
Dado que o usuario esta autenticado
E nao possui registro de settings no banco
Quando faz GET /api/settings
Entao recebe status 200
E o body contem { "dailyGoal": 2000, "presets": [200, 300, 500] }
E um registro de settings e criado no banco com esses defaults
```

**Cenario 12: GET /api/settings — leitura subsequente**
```
Dado que o usuario esta autenticado
E possui settings com dailyGoal 3000
Quando faz GET /api/settings
Entao recebe status 200
E o body contem { "dailyGoal": 3000, ... }
```

**Cenario 13: PUT /api/settings — atualizar dailyGoal**
```
Dado que o usuario esta autenticado
Quando faz PUT /api/settings com body { "dailyGoal": 3000 }
Entao recebe status 200
E o body contem settings com dailyGoal 3000
E presets permanecem inalterados
```

**Cenario 14: PUT /api/settings — validacao de ranges**
```
Dado que o usuario esta autenticado
Quando faz PUT /api/settings com body { "dailyGoal": 100 }
Entao recebe status 400
E o body contem erro de validacao indicando que dailyGoal deve ser entre 500 e 5000
```

**Cenario 15: PUT /api/settings — validacao de presets**
```
Dado que o usuario esta autenticado
Quando faz PUT /api/settings com body { "presets": [10, 5000, 200] }
Entao recebe status 400
E o body contem erro de validacao indicando range invalido dos presets (50-2000)
```

**Cenario 16: PUT /api/settings — upsert para usuario sem settings**
```
Dado que o usuario esta autenticado
E nao possui registro de settings no banco
Quando faz PUT /api/settings com body { "dailyGoal": 2500 }
Entao recebe status 200
E um registro de settings e criado com dailyGoal 2500 e presets default [200, 300, 500]
```
