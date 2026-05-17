## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes. Caso voce decida fazer alteracao, faca atraves do agente para que ela seja refletida em todas as secoes.**

- **Tarefa:** Migration API endpoint + migrationCompleted flag (BE)
- **Objetivo:** Criar endpoint POST /api/migration que recebe dados locais do usuario, valida, persiste no banco e marca migracao como completa; e GET /api/migration/status para consultar o estado
- **Topicos:**
  - POST /api/migration: recebe logs, dailyGoal, presets do cliente
  - Validacao de payload com zod (logs array, dailyGoal number, presets number array)
  - Persistencia: HydrationLog entries e Settings vinculados ao userId da sessao
  - Flag migrationCompleted = true no modelo User apos sucesso
  - GET /api/migration/status: retorna { migrationCompleted: boolean }
  - Autenticacao obrigatoria (401 sem sessao)
  - Tratamento de erros com HTTP status codes adequados
- **Dependencias:** Prisma (schema User, HydrationLog, Settings de US-013), NextAuth.js (sessao de US-010), zod
- **Validacao:** Payload valido persiste e marca flag; sem sessao retorna 401; payload invalido retorna 400; dados duplicados tratados

---

## Contexto Detalhado para Agentes

## Bloco 1: O Que? (Descricao)

### 1. Objetivo Tecnico Explicito

Implementar duas API routes em Next.js App Router:
1. `POST /api/migration` — Recebe o payload completo de dados locais (logs, dailyGoal, presets), valida com zod, persiste no banco de dados via Prisma (HydrationLog entries + Settings), e marca `migrationCompleted = true` no modelo User.
2. `GET /api/migration/status` — Retorna o estado da flag `migrationCompleted` para o usuario autenticado.

Ambos endpoints exigem sessao autenticada via NextAuth.js.

### 2. Decomposicao em Cenarios

**Cenario A — POST /api/migration (caminho feliz):**
- Usuario autenticado envia POST com payload valido:
  ```json
  {
    "logs": [
      { "id": "log-1707580800000-ab3f", "amount": 300, "timestamp": "2026-02-10T14:00:00.000Z" },
      { "id": "log-1707580900000-cd5e", "amount": 500, "timestamp": "2026-02-10T16:00:00.000Z" }
    ],
    "dailyGoal": 2500,
    "presets": [200, 350, 500]
  }
  ```
- Backend valida payload com zod
- Persiste cada log na tabela HydrationLog vinculado ao userId da sessao
- Cria ou atualiza Settings com dailyGoal e presets para o userId
- Marca `migrationCompleted = true` no User
- Retorna 200 com `{ success: true, migratedLogs: number }`

**Cenario B — POST /api/migration (usuario nao autenticado):**
- Request sem sessao valida
- Retorna 401 `{ error: "Authentication required" }`

**Cenario C — POST /api/migration (payload invalido):**
- Payload faltando campos obrigatorios ou com tipos errados
- Exemplos: logs nao e array, log sem id, amount <= 0, timestamp invalido, dailyGoal <= 0, presets nao e array
- Retorna 400 com `{ error: "Validation failed", details: [...] }`

**Cenario D — POST /api/migration (migracao ja realizada):**
- Usuario com `migrationCompleted = true` tenta migrar novamente
- Retorna 409 `{ error: "Migration already completed" }`
- Previne duplicacao de dados

**Cenario E — POST /api/migration (logs com IDs duplicados):**
- Payload contem logs cujos IDs ja existem no banco (re-tentativa apos falha parcial)
- Usar upsert ou skipDuplicates para lidar com idempotencia
- Nao falhar — contar apenas logs efetivamente inseridos

**Cenario F — GET /api/migration/status:**
- Usuario autenticado consulta status
- Retorna 200 `{ migrationCompleted: true }` ou `{ migrationCompleted: false }`
- Sem sessao retorna 401

**Cenario G — Tratamento de erros internos:**
- Falha no banco de dados durante persistencia
- Operacao deve ser atomica (transacao Prisma): se falhar no meio, rollback completo
- Retorna 500 `{ error: "Migration failed. Please try again." }`

### 3. Criterios de Aceite por Cenario

**Cenario A:**
- Logs persistidos na tabela HydrationLog com userId correto
- Settings criado/atualizado com dailyGoal e presets
- User.migrationCompleted marcado como true
- Response 200 com contagem de logs migrados

**Cenario B:**
- Response 401 sem nenhuma alteracao no banco

**Cenario C:**
- Response 400 com detalhes de validacao
- Nenhum dado persistido

**Cenario D:**
- Response 409 sem duplicar dados

**Cenario E:**
- Logs novos inseridos, duplicados ignorados
- Response 200 com contagem correta dos inseridos

**Cenario F:**
- Response 200 com estado correto da flag
- Response 401 sem sessao

**Cenario G:**
- Response 500
- Nenhum dado parcial no banco (transacao atomica)

## Bloco 2: Como? (Implementacao)

### 4. Codigo de Referencia

**Prisma schema (definido em US-013, necessario para esta task):**

O schema Prisma deve conter (conforme US-013):
```prisma
model User {
  id                 String         @id @default(cuid())
  email              String         @unique
  name               String?
  image              String?
  migrationCompleted Boolean        @default(false)
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt
  logs               HydrationLog[]
  settings           Settings?
  // ... NextAuth fields (accounts, sessions)
}

model HydrationLog {
  id        String   @id
  amount    Int
  timestamp DateTime
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, timestamp])
}

model Settings {
  id        String   @id @default(cuid())
  userId    String   @unique
  dailyGoal Int      @default(2000)
  presets   Json     @default("[200, 300, 500]")
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Pattern de API route no Next.js App Router:**
```typescript
// app/api/migration/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // ou auth() do NextAuth v5
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  // ... validacao e persistencia
}
```

**Pattern de validacao com zod:**
```typescript
import { z } from "zod";

const migrationLogSchema = z.object({
  id: z.string().min(1),
  amount: z.number().int().positive(),
  timestamp: z.string().datetime(),
});

const migrationPayloadSchema = z.object({
  logs: z.array(migrationLogSchema),
  dailyGoal: z.number().int().positive(),
  presets: z.array(z.number().int().positive()),
});
```

**Pattern de transacao Prisma:**
```typescript
await prisma.$transaction(async (tx) => {
  // Upsert Settings
  await tx.settings.upsert({
    where: { userId },
    create: { userId, dailyGoal, presets },
    update: { dailyGoal, presets },
  });

  // Create logs (skip duplicates)
  await tx.hydrationLog.createMany({
    data: logs.map((log) => ({
      id: log.id,
      amount: log.amount,
      timestamp: new Date(log.timestamp),
      userId,
    })),
    skipDuplicates: true,
  });

  // Mark migration completed
  await tx.user.update({
    where: { id: userId },
    data: { migrationCompleted: true },
  });
});
```

**Zustand store — referencia do tipo HydrationLog local** (`lib/types.ts`):
```typescript
export type HydrationLog = {
  id: string;
  amount: number;
  timestamp: string; // ISO 8601
};
```

**Store existente** (`hooks/use-hydration-store.ts`):
- Store usa `STORAGE_KEY = "hydra-store"` com persist middleware
- State: `{ logs: HydrationLog[], dailyGoal: number, presets: number[] }`
- IDs de log seguem pattern: `log-${Date.now()}-${random}`

### 5. Contratos e Estruturas de Dados

**POST /api/migration**

Request:
```typescript
// Content-Type: application/json
{
  logs: Array<{
    id: string;         // ID original do localStorage (ex: "log-1707580800000-ab3f")
    amount: number;     // ml (inteiro positivo)
    timestamp: string;  // ISO 8601 (ex: "2026-02-10T14:00:00.000Z")
  }>;
  dailyGoal: number;    // ml (inteiro positivo, ex: 2000)
  presets: number[];    // ml (array de inteiros positivos, ex: [200, 300, 500])
}
```

Response (sucesso — 200):
```json
{
  "success": true,
  "migratedLogs": 87
}
```

Response (erro validacao — 400):
```json
{
  "error": "Validation failed",
  "details": [
    { "path": ["logs", 3, "amount"], "message": "Number must be greater than 0" }
  ]
}
```

Response (nao autenticado — 401):
```json
{
  "error": "Authentication required"
}
```

Response (ja migrado — 409):
```json
{
  "error": "Migration already completed"
}
```

Response (erro interno — 500):
```json
{
  "error": "Migration failed. Please try again."
}
```

**GET /api/migration/status**

Response (200):
```json
{
  "migrationCompleted": false
}
```

### 6. Dependencias e Interacoes

| Dependencia | Status | Uso |
|-------------|--------|-----|
| `next-auth` / NextAuth.js | De US-010 | Sessao autenticada (`getServerSession`) |
| `@prisma/client` + Prisma | De US-013 | ORM para persistencia |
| `zod` | A INSTALAR (se nao existir) | Validacao de payload |
| `lib/auth.ts` | De US-010 | Config NextAuth (`authOptions`) |
| `lib/prisma.ts` | De US-013 | Singleton do PrismaClient |
| Schema Prisma (User, HydrationLog, Settings) | De US-013 | Modelos do banco |

**Arquivos a criar:**
- `app/api/migration/route.ts` — POST handler (migracao completa)
- `app/api/migration/status/route.ts` — GET handler (consulta flag)
- `lib/validations/migration.ts` — Schema zod (opcional, pode ficar inline)

**Dependencias entre User Stories:**
- **US-010** (Google Auth Setup): fornece NextAuth config, sessao, `lib/auth.ts`
- **US-013** (Cloud Sync & Dual-Mode): fornece Prisma setup, schema do banco, `lib/prisma.ts`
- Esta task (US-012 BE) **deve ser implementada APOS** US-010 e US-013 estarem prontas

**Arquivos existentes que NAO devem ser alterados:**
- `hooks/use-hydration-store.ts` — Store local (nao e responsabilidade desta task)
- `lib/types.ts` — Tipos de dominio local
- `components/ui/*` — Componentes shadcn

### 7. Requisitos Nao-Funcionais

- **Performance:** A migracao pode envolver centenas de logs. Usar `createMany` com `skipDuplicates` para batch insert eficiente (uma unica query SQL). Nao iterar com creates individuais.
- **Atomicidade:** Toda a operacao (logs + settings + flag) deve estar dentro de uma transacao Prisma. Falha parcial = rollback total.
- **Idempotencia:** Re-tentativas apos falha nao devem duplicar dados. `skipDuplicates` no createMany + check de `migrationCompleted` antes de processar.
- **Seguranca:** Validacao rigorosa do payload (zod). Nunca confiar no input do cliente. Verificar sessao em todos os endpoints. userId vem da sessao, nunca do payload.
- **Logging:** `console.error` para falhas de banco/transacao com contexto (userId, numero de logs tentados). Nao logar dados pessoais (conteudo dos logs).
- **Limites:** Considerar um limite maximo de logs por migracao (ex: 10.000) para evitar payloads absurdamente grandes. Retornar 400 se excedido.
- **Timeout:** Para payloads muito grandes, a transacao pode demorar. Configurar timeout do Prisma adequadamente ou dividir em chunks se necessario (edge case para volumes extremos).

## Bloco 3: Como Validar? (Validacao)

### 8. Cenarios de Teste (BDD)

**Cenario 1: Migracao completa com sucesso**
```
Given o usuario esta autenticado com sessao valida
And migrationCompleted e false no banco
When POST /api/migration com payload valido (50 logs, dailyGoal 2500, presets [200, 350, 500])
Then response status e 200
And response body contem { success: true, migratedLogs: 50 }
And 50 registros existem na tabela HydrationLog vinculados ao userId
And Settings existe com dailyGoal 2500 e presets [200, 350, 500] para o userId
And User.migrationCompleted e true
```

**Cenario 2: Migracao sem sessao autenticada**
```
Given nenhuma sessao ativa (cookie ausente ou invalido)
When POST /api/migration com payload valido
Then response status e 401
And response body contem { error: "Authentication required" }
And nenhum registro foi criado no banco
```

**Cenario 3: Payload invalido — logs com amount negativo**
```
Given o usuario esta autenticado
When POST /api/migration com log contendo amount: -100
Then response status e 400
And response body contem detalhes de validacao indicando o campo invalido
And nenhum dado persistido no banco
```

**Cenario 4: Payload invalido — timestamp mal formatado**
```
Given o usuario esta autenticado
When POST /api/migration com log contendo timestamp: "not-a-date"
Then response status e 400
And nenhum dado persistido no banco
```

**Cenario 5: Migracao ja realizada (duplicidade)**
```
Given o usuario esta autenticado
And User.migrationCompleted ja e true
When POST /api/migration com payload valido
Then response status e 409
And response body contem { error: "Migration already completed" }
And nenhum dado adicional no banco
```

**Cenario 6: Re-tentativa com logs duplicados**
```
Given o usuario esta autenticado
And migrationCompleted e false
And ja existem 10 logs no banco de uma tentativa anterior parcial
When POST /api/migration com 50 logs (incluindo os 10 ja existentes)
Then response status e 200
And migratedLogs reflete o total tentado ou efetivamente inserido
And nao ha logs duplicados no banco
And migrationCompleted marcado como true
```

**Cenario 7: Falha de banco — transacao atomica**
```
Given o usuario esta autenticado
And o banco falha durante a operacao de insert
When POST /api/migration com payload valido
Then response status e 500
And response body contem { error: "Migration failed. Please try again." }
And nenhum dado parcial no banco (rollback da transacao)
And User.migrationCompleted permanece false
```

**Cenario 8: GET /api/migration/status — usuario nao migrou**
```
Given o usuario esta autenticado
And User.migrationCompleted e false
When GET /api/migration/status
Then response status e 200
And response body contem { migrationCompleted: false }
```

**Cenario 9: GET /api/migration/status — usuario ja migrou**
```
Given o usuario esta autenticado
And User.migrationCompleted e true
When GET /api/migration/status
Then response status e 200
And response body contem { migrationCompleted: true }
```

**Cenario 10: GET /api/migration/status — sem sessao**
```
Given nenhuma sessao ativa
When GET /api/migration/status
Then response status e 401
And response body contem { error: "Authentication required" }
```

**Cenario 11: Migracao com payload vazio (logs array vazio)**
```
Given o usuario esta autenticado
And migrationCompleted e false
When POST /api/migration com { logs: [], dailyGoal: 2000, presets: [200, 300, 500] }
Then response status e 200
And migratedLogs e 0
And Settings persistido com defaults
And migrationCompleted marcado como true
```

**Cenario 12: Migracao com volume grande (edge case)**
```
Given o usuario esta autenticado
When POST /api/migration com 5000 logs
Then response completa sem timeout
And todos os logs persistidos corretamente
And migrationCompleted marcado como true
```
