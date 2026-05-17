## 🧑‍💼 Spec para Humanos

> ⚠️ **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes. Caso voce decida fazer alteracao, faca atraves do agente para que ela seja refletida em todas as secoes.**

- **Tarefa:** Dual-mode store + optimistic updates + offline queue + sync indicator (FE)
- **Objetivo:** Refatorar o Zustand store para operar em dois modos (guest/cloud), com updates otimistas, fila offline e indicador de sync.
- **Topicos:**
  - Dual-mode store: guest mode (localStorage, comportamento atual) vs cloud mode (API sync)
  - Deteccao de modo via useSession do NextAuth
  - Transicao sign-in/sign-out: carregar dados do servidor ou limpar e voltar a guest
  - Optimistic updates: addLog, removeLog, updateLog, setDailyGoal, setPresets com rollback em falha
  - Debounce para settings (300-500ms)
  - Offline queue: fila persistida em localStorage, processamento FIFO ao reconectar
  - Sync status component: synced (verde), syncing (spinner), offline (amarelo), error (vermelho)
- **Dependencias:** Zustand 5, NextAuth.js (useSession), T001-BE (API routes)
- **Validacao:** Guest mode inalterado, cloud CRUD via API, rollback funcional, offline queue processa ao reconectar, sync indicator correto

---

## 🤖 Contexto Detalhado para Agentes

## Bloco 1: O Que? (Descricao)

### 1. Objetivo Tecnico Explicito

Refatorar o Zustand store existente (`hooks/use-hydration-store.ts`) para suportar dois modos de operacao: **guest mode** (comportamento atual com localStorage, zero mudanca) e **cloud mode** (Zustand como cache local + sincronizacao via API). Implementar updates otimistas com rollback em caso de falha, fila de operacoes offline persistida em localStorage, e componente indicador de status de sincronizacao.

### 2. Decomposicao em Cenarios

**Cenario A — API Client Layer**
- Criar `lib/api-client.ts` com funcoes tipadas para comunicacao com as API routes do BE (T001-BE):
  - `fetchLogs(params?: { from?: string; to?: string })` — GET /api/logs
  - `createLog(data: { amount: number; timestamp: string; id?: string })` — POST /api/logs
  - `updateLog(id: string, data: { amount?: number; timestamp?: string })` — PUT /api/logs/[id]
  - `deleteLog(id: string)` — DELETE /api/logs/[id]
  - `fetchSettings()` — GET /api/settings
  - `updateSettings(data: { dailyGoal?: number; presets?: number[] })` — PUT /api/settings
- Todas as funcoes usam `fetch` nativo com tratamento de erros padronizado
- Retornam dados tipados ou lancam erro tipado (`ApiError`)

**Cenario B — Dual-mode store refactor**
- Manter a assinatura publica do store IDENTICA (mesmas actions, mesmos selectors)
- Adicionar estado interno:
  - `_mode: 'guest' | 'cloud'` — modo atual
  - `_syncStatus: 'idle' | 'syncing' | 'offline' | 'error'` — status de sync
  - `_syncQueue: SyncOperation[]` — fila de operacoes pendentes (offline)
  - `_isOnline: boolean` — status de conexao
- **Guest mode** (default, usuario nao logado):
  - Comportamento IDENTICO ao atual
  - Zustand persist com localStorage via `safeStorage` (ja implementado)
  - Nenhuma chamada API
  - Zero regressao nas funcionalidades existentes
- **Cloud mode** (usuario logado):
  - Zustand como cache local (estado em memoria)
  - Todas as actions disparam chamada API em background
  - Persist middleware desabilitado para dados principais (logs, settings)
  - `syncQueue` persiste em localStorage com key `hydra-sync-queue`
- Transicao de modo:
  - `_setCloudMode(session)`: ativado quando `useSession` retorna sessao valida
  - `_setGuestMode()`: ativado quando sessao nao existe ou apos sign-out

**Cenario C — Transicao sign-in (guest -> cloud)**
- Quando `useSession` retorna sessao autenticada:
  1. Setar `_mode = 'cloud'`
  2. Setar `_syncStatus = 'syncing'`
  3. Fazer `GET /api/logs` + `GET /api/settings` em paralelo
  4. Popular store com dados do servidor (substituir dados locais)
  5. Setar `_syncStatus = 'idle'` (synced)
  6. Se falhar: setar `_syncStatus = 'error'`, manter dados locais como fallback

**Cenario D — Transicao sign-out (cloud -> guest)**
- Quando sessao termina:
  1. Setar `_mode = 'guest'`
  2. Limpar store: `logs = []`, `dailyGoal = DEFAULT_GOAL`, `presets = DEFAULT_PRESETS`
  3. Limpar `_syncQueue`
  4. Setar `_syncStatus = 'idle'`
  5. Re-habilitar persist middleware (localStorage)
  6. Dados cloud NAO ficam no device apos sign-out

**Cenario E — Optimistic updates (cloud mode)**
- **addLog(amount):**
  1. Gerar id local (mesmo padrao atual: `log-${Date.now()}-...`)
  2. Adicionar log ao store imediatamente (otimista)
  3. Disparar `POST /api/logs` em background
  4. Se sucesso: atualizar id local com id do servidor (se diferente)
  5. Se falha: remover log do store (rollback), emitir notificacao de erro

- **deleteLog(id):**
  1. Guardar snapshot do log antes de remover
  2. Remover do store imediatamente
  3. Disparar `DELETE /api/logs/[id]` em background
  4. Se falha: re-inserir log no store (rollback), emitir notificacao de erro

- **editLog(id, newAmount):**
  1. Guardar snapshot do log antes de editar
  2. Atualizar no store imediatamente
  3. Disparar `PUT /api/logs/[id]` em background
  4. Se falha: restaurar snapshot (rollback), emitir notificacao de erro

- **setDailyGoal(goal):**
  1. Guardar valor anterior
  2. Atualizar store imediatamente
  3. Disparar `PUT /api/settings` com debounce (300ms)
  4. Se falha: restaurar valor anterior (rollback)

- **setPresets(presets):**
  1. Guardar valor anterior
  2. Atualizar store imediatamente
  3. Disparar `PUT /api/settings` com debounce (300ms)
  4. Se falha: restaurar valor anterior (rollback)

- Em guest mode: actions continuam funcionando exatamente como hoje (sem API calls)

**Cenario F — Offline queue**
- Detectar status de conexao:
  - `navigator.onLine` para estado inicial
  - Event listeners `online`/`offline` para mudancas em tempo real
  - Atualizar `_isOnline` no store
- Quando offline em cloud mode:
  - Actions atualizam store normalmente (otimista)
  - Operacao adicionada a `_syncQueue` em vez de fazer chamada API
  - Formato da fila: `{ type: 'CREATE'|'UPDATE'|'DELETE', entity: 'log'|'settings', payload: any, timestamp: string, localId?: string }`
  - Fila persiste em localStorage com key `hydra-sync-queue` (sobrevive a reload)
- Quando conexao volta (evento `online`):
  1. Setar `_syncStatus = 'syncing'`
  2. Processar fila em ordem cronologica (FIFO)
  3. Para cada operacao: fazer chamada API correspondente
  4. Se operacao falha com 404 (ex: deletar log ja deletado): ignorar silenciosamente
  5. Apos processar toda a fila: fazer `GET /api/logs` + `GET /api/settings` para refresh completo
  6. Limpar fila
  7. Setar `_syncStatus = 'idle'`
  8. Se alguma operacao falha com erro nao-recuperavel: setar `_syncStatus = 'error'`

**Cenario G — Sync status indicator component**
- Criar componente `components/layout/sync-status.tsx`
- Estados visuais:
  - `idle` (synced): badge verde com icone de nuvem + "Synced" — discreto
  - `syncing`: badge com spinner + "Syncing..." — informativo
  - `offline`: badge amarelo/amber + "Offline" — alerta
  - `error`: badge vermelho + "Sync error" — com acao de retry
- Visibilidade:
  - Apenas para usuarios logados (cloud mode)
  - Guest mode: componente nao renderiza nada
- Posicao: integrado no layout (header ou profile), seguindo o padrao do prototipo em `app/lab/phase2-accounts/components/account-profile.tsx`
- Usar componentes shadcn/ui existentes: `Badge` de `@/components/ui/badge`
- Usar icones Remix: `RiCloudLine`, `RiWifiOffLine`, `RiErrorWarningLine`, `RiLoader4Line`

**Cenario H — Hook de integracao (session -> store)**
- Criar hook `hooks/use-cloud-sync.ts` que:
  1. Usa `useSession` do NextAuth para detectar estado de autenticacao
  2. Quando sessao ativa: chama `_setCloudMode()` no store e dispara carga inicial de dados
  3. Quando sessao termina: chama `_setGuestMode()`
  4. Gerencia event listeners `online`/`offline`
  5. Processa sync queue quando conexao volta
- Este hook deve ser montado uma unica vez no layout principal (provider pattern)
- Nao deve causar re-renders desnecessarios em componentes filhos

### 3. Criterios de Aceite por Cenario

| Cenario | Criterio | Resultado Esperado |
|---------|----------|--------------------|
| A | API client funcional | Todas as 6 funcoes comunicam com API routes, tratam erros |
| B | Guest mode inalterado | Usuario nao logado usa app exatamente como antes (localStorage) |
| B | Cloud mode ativo para logados | Store usa API para persistencia quando sessao ativa |
| B | Assinatura publica identica | `addLog`, `deleteLog`, `editLog`, `setDailyGoal`, `setPresets` mantidas |
| C | Sign-in carrega dados cloud | Dados do servidor substituem dados locais apos login |
| C | Falha no load usa fallback | Se API falha no login, dados locais permanecem com status error |
| D | Sign-out limpa dados cloud | Store reseta para defaults, nao mantem dados cloud |
| D | Sign-out volta guest mode | localStorage persist reativado |
| E | addLog otimista | Log aparece na UI imediatamente, API dispara em background |
| E | Rollback em falha | Se API falha, log otimista e removido da UI |
| E | editLog otimista | Edicao aparece imediatamente, rollback se API falha |
| E | deleteLog otimista | Log some imediatamente, reaparece se API falha |
| E | Settings debounce | Mudancas rapidas de dailyGoal agrupam em unica chamada API (300ms) |
| F | Deteccao offline | `_isOnline` reflete estado real de conexao |
| F | Queue persiste | Operacoes offline ficam em localStorage (`hydra-sync-queue`) |
| F | Queue sobrevive reload | Apos reload offline, fila permanece intacta |
| F | Processamento FIFO | Ao reconectar, operacoes processam em ordem cronologica |
| F | Refresh apos sync | Apos processar fila, dados completos carregam do servidor |
| F | Conflito idempotente | Delete de log ja deletado no servidor: ignora silenciosamente |
| G | Badge synced (verde) | Aparece quando tudo sincronizado, somente para logados |
| G | Badge syncing (spinner) | Aparece durante sync em progresso |
| G | Badge offline (amarelo) | Aparece quando sem conexao |
| G | Badge error (vermelho) | Aparece quando sync falhou, com opcao de retry |
| G | Invisivel para guest | Componente nao renderiza quando usuario nao esta logado |
| H | Hook de integracao | Conecta session a store automaticamente |
| H | Montagem unica | Hook no layout, sem re-renders em filhos |

## Bloco 2: Como? (Implementacao)

### 4. Codigo de Referencia

**Referencia: Store atual (hooks/use-hydration-store.ts) — ARQUIVO A REFATORAR**

Path: `hooks/use-hydration-store.ts`

```typescript
// Estado e actions atuais (MANTER assinatura publica identica)
type HydrationState = {
  // Persisted
  logs: HydrationLog[];
  dailyGoal: number;
  presets: number[];

  // Internal (not persisted)
  _hydrated: boolean;
  _dataWasReset: boolean;

  // Actions
  addLog: (amount: number) => void;
  deleteLog: (id: string) => void;
  editLog: (id: string, newAmount: number) => void;
  setDailyGoal: (goal: number) => void;
  setPresets: (presets: number[]) => void;
  clearAllData: () => void;
  _clearResetFlag: () => void;
};
```

A refatoracao deve adicionar campos internos sem alterar a interface publica:

```typescript
type SyncOperation = {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'log' | 'settings';
  payload: unknown;
  timestamp: string;
  localId?: string;
};

type HydrationState = {
  // === PUBLICA (manter identica) ===
  logs: HydrationLog[];
  dailyGoal: number;
  presets: number[];
  _hydrated: boolean;
  _dataWasReset: boolean;
  addLog: (amount: number) => void;
  deleteLog: (id: string) => void;
  editLog: (id: string, newAmount: number) => void;
  setDailyGoal: (goal: number) => void;
  setPresets: (presets: number[]) => void;
  clearAllData: () => void;
  _clearResetFlag: () => void;

  // === NOVO: cloud sync internals ===
  _mode: 'guest' | 'cloud';
  _syncStatus: 'idle' | 'syncing' | 'offline' | 'error';
  _syncQueue: SyncOperation[];
  _isOnline: boolean;

  // === NOVO: cloud actions (internas) ===
  _setCloudMode: () => Promise<void>;
  _setGuestMode: () => void;
  _loadFromServer: () => Promise<void>;
  _processSyncQueue: () => Promise<void>;
  _setOnlineStatus: (isOnline: boolean) => void;
};
```

**Referencia: Safe storage wrapper (manter intacto para guest mode)**

Path: `hooks/use-hydration-store.ts` (linhas 40-88)

O `createSafeStorage()` e o wrapper de localStorage existente que DEVE ser mantido intacto para guest mode. Em cloud mode, o persist middleware continua ativo mas apenas para `_syncQueue` e metadados de modo.

**Referencia: Padrao de ID local (manter para compatibilidade)**

```typescript
// Padrao existente para geracao de ID local
id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
```

Em cloud mode, este ID e usado como placeholder otimista. Quando a API responde com o ID do servidor (UUID), o store deve atualizar o ID local.

**Referencia: Prototipo de sync status (app/lab/phase2-accounts/components/account-profile.tsx)**

Path: `app/lab/phase2-accounts/components/account-profile.tsx` (linhas 70-79)

```tsx
{/* Sync status — padrao visual a seguir */}
<div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5">
  <RiCloudLine className="size-4 text-emerald-600" />
  <span className="text-sm font-medium text-emerald-600">
    Synced across devices
  </span>
  <Badge variant="secondary" className="ml-auto text-[10px]">
    Just now
  </Badge>
</div>
```

Este e o padrao visual para o estado "synced". Os outros estados (syncing, offline, error) devem seguir o mesmo layout mas com cores e icones diferentes.

**Referencia: Layout principal (app/layout.tsx) — onde montar o hook de integracao**

Path: `app/layout.tsx`

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      {/* ... */}
      <body className="bg-background font-sans text-foreground antialiased">
        <div className="mx-auto flex h-dvh max-w-md flex-col bg-background">
          <StorageBanner />
          <StoreNotifications />
          {/* NOVO: <CloudSyncProvider /> ou hook equivalente */}
          <main className="flex-1 overflow-y-auto pb-20">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
```

**Referencia: Componentes UI disponiveis (components/ui/)**

Componentes shadcn/ui ja instalados e prontos para uso:
- `Badge` (components/ui/badge.tsx) — para sync status indicator
- `Button` (components/ui/button.tsx) — para retry action
- Icones Remix disponveis: `RiCloudLine`, `RiWifiOffLine`, `RiErrorWarningLine`, `RiLoader4Line`

### 5. Contratos e Estruturas de Dados

**SyncOperation (fila offline):**
```typescript
type SyncOperation = {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'log' | 'settings';
  payload: {
    // Para CREATE log:
    amount: number;
    timestamp: string;
    localId: string;  // ID local para reconciliacao
    // Para UPDATE log:
    id?: string;
    amount?: number;
    timestamp?: string;
    // Para DELETE log:
    id?: string;
    // Para UPDATE settings:
    dailyGoal?: number;
    presets?: number[];
  };
  timestamp: string;  // ISO datetime de quando a operacao foi enfileirada
};
```

**API Client types:**
```typescript
type ApiError = {
  status: number;
  error: string;
  details?: unknown;
};

// Resposta de logs da API (T001-BE)
type ApiLog = {
  id: string;
  amount: number;
  timestamp: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

// Resposta de settings da API (T001-BE)
type ApiSettings = {
  id: string;
  userId: string;
  dailyGoal: number;
  presets: number[];
  updatedAt: string;
};
```

**Mapeamento API -> Store:**
```typescript
// ApiLog -> HydrationLog (tipo existente no store)
function apiLogToStoreLog(apiLog: ApiLog): HydrationLog {
  return {
    id: apiLog.id,
    amount: apiLog.amount,
    timestamp: apiLog.timestamp,
  };
}
```

**localStorage keys:**
| Key | Uso | Modo |
|-----|-----|------|
| `hydra-store` | Store completo (guest mode) | Guest |
| `hydra-sync-queue` | Fila de operacoes pendentes | Cloud |

### 6. Dependencias e Interacoes

**Dependencias existentes utilizadas:**
- `zustand` 5.0.11 — store com persist middleware (ja instalado)
- `react` 19.2.3 — hooks, useMemo, useEffect
- `next` 16.1.6 — App Router, layouts

**Dependencias de runtime (ja no projeto):**
- `@remixicon/react` 4.9.0 — icones para sync status component
- shadcn/ui `Badge` — para sync status indicator

**Dependencia de sessao (assume NextAuth configurado — US-010/011):**
- `useSession` do `next-auth/react` — para detectar estado de autenticacao
- `SessionProvider` — assume ja montado no layout (US-010/011)

### Integracoes com Backend

| Endpoint/Service | Task BE Relacionada | Contrato |
|------------------|---------------------|----------|
| GET /api/logs | T001-BE_prisma-schema-api-routes | Retorna array de logs do usuario, ordenados por timestamp DESC |
| POST /api/logs | T001-BE_prisma-schema-api-routes | Cria log com { amount, timestamp, id? }, retorna 201 |
| PUT /api/logs/[id] | T001-BE_prisma-schema-api-routes | Atualiza log por id, retorna 200 |
| DELETE /api/logs/[id] | T001-BE_prisma-schema-api-routes | Remove log por id, retorna 204 |
| GET /api/settings | T001-BE_prisma-schema-api-routes | Retorna settings (upsert com defaults na primeira leitura) |
| PUT /api/settings | T001-BE_prisma-schema-api-routes | Atualiza settings (upsert), retorna 200 |

**Arquivos a criar:**
| Arquivo | Descricao |
|---------|-----------|
| `lib/api-client.ts` | Funcoes tipadas para comunicacao com API routes |
| `hooks/use-cloud-sync.ts` | Hook de integracao session -> store + event listeners |
| `components/layout/sync-status.tsx` | Componente indicador de status de sync |

**Arquivos a modificar:**
| Arquivo | Modificacao |
|---------|-------------|
| `hooks/use-hydration-store.ts` | Adicionar dual-mode, cloud actions, sync queue, optimistic updates |
| `lib/types.ts` | Adicionar tipos SyncOperation, ApiLog, ApiSettings, SyncStatus |
| `app/layout.tsx` | Montar CloudSyncProvider ou hook de integracao |

**Componentes existentes que DEVEM ser reutilizados:**
- `components/ui/badge.tsx` — Badge para sync status
- `lib/utils.ts` — `cn()` para composicao de classes
- `lib/constants.ts` — `DEFAULT_GOAL`, `DEFAULT_PRESETS`, `STORAGE_KEY`

### 7. Requisitos Nao-Funcionais

**Performance:**
- Store update nao deve causar re-render cascading — usar selectors granulares (padrao ja existente)
- Debounce de 300ms para settings impede spam de chamadas API
- Sync queue processing nao deve bloquear a UI (usar microtasks/async)
- Carga inicial no sign-in: GET logs + GET settings em paralelo (`Promise.all`)

**UI Framework:**
- Tailwind CSS 4 (CSS-first config, sem tailwind.config.js) — OBRIGATORIO
- shadcn/ui com Radix Maia style, Cyan theme — usar componentes existentes
- @remixicon/react para icones — OBRIGATORIO

**Formatadores:**
- ESLint 9 flat config com `next/core-web-vitals` + `next/typescript` — codigo deve passar no lint
- TypeScript strict mode — sem `any`, sem `@ts-ignore`
- Named exports apenas (sem default exports, exceto pages Next.js)
- `"use client"` directive explicita em componentes que usam hooks/state/events

**Estrutura de arquivos:**
- Hooks em `hooks/` (padrao existente)
- Componentes de layout em `components/layout/` (padrao existente)
- Libs utilitarias em `lib/` (padrao existente)
- Props interfaces nomeadas como `[Component]Props`
- Um componente por arquivo

**Acessibilidade:**
- Sync status component deve ter `aria-live="polite"` para anunciar mudancas de estado
- Touch targets minimo 44x44px para botao de retry
- Contraste adequado para todos os estados do badge (verde, amarelo, vermelho)

**Seguranca:**
- Nunca armazenar tokens ou dados sensiveis em localStorage
- Sync queue armazena apenas payloads de operacao (sem tokens)
- Dados cloud sao limpos do store apos sign-out

## Bloco 3: Como Validar? (Validacao)

### 8. Cenarios de Teste (BDD)

**Cenario 1: Guest mode — comportamento inalterado**
```
Dado que o usuario nao esta logado
Quando adiciona um log de 300ml
Entao o log aparece na UI imediatamente
E o log e persistido no localStorage com key "hydra-store"
E nenhuma chamada HTTP e feita
E o sync status indicator nao e visivel
```

**Cenario 2: Guest mode — persistencia local intacta**
```
Dado que o usuario nao esta logado
E possui 3 logs no localStorage
Quando recarrega a pagina
Entao os 3 logs aparecem na UI
E o dailyGoal e presets sao restaurados do localStorage
```

**Cenario 3: Sign-in — transicao para cloud mode**
```
Dado que o usuario esta em guest mode
Quando faz sign-in com conta Google
Entao o store transiciona para cloud mode
E GET /api/logs e GET /api/settings sao chamados em paralelo
E os dados do servidor substituem os dados locais no store
E o sync status mostra "Synced"
```

**Cenario 4: Sign-out — transicao para guest mode**
```
Dado que o usuario esta em cloud mode com 10 logs
Quando faz sign-out
Entao o store reseta para defaults (logs vazio, dailyGoal 2000, presets [200,300,500])
E o sync queue e limpo
E o sync status indicator desaparece
E o modo volta para guest (localStorage persist ativo)
```

**Cenario 5: Cloud mode — addLog otimista com sucesso**
```
Dado que o usuario esta logado e em cloud mode
Quando adiciona um log de 500ml
Entao o log aparece na UI imediatamente (otimista)
E POST /api/logs e disparado em background
E quando a API responde 201, o ID local e atualizado para o UUID do servidor
E o sync status mostra "Synced" apos completar
```

**Cenario 6: Cloud mode — addLog otimista com falha (rollback)**
```
Dado que o usuario esta logado e em cloud mode
Quando adiciona um log de 500ml
E o POST /api/logs retorna erro 500
Entao o log otimista e removido da UI (rollback)
E uma notificacao de erro aparece para o usuario
E o sync status mostra "Sync error"
```

**Cenario 7: Cloud mode — deleteLog otimista com sucesso**
```
Dado que o usuario esta logado e possui um log com id "abc-123"
Quando deleta o log "abc-123"
Entao o log desaparece da UI imediatamente
E DELETE /api/logs/abc-123 e disparado em background
E quando a API responde 204, nenhuma acao adicional
```

**Cenario 8: Cloud mode — deleteLog otimista com falha (rollback)**
```
Dado que o usuario esta logado e possui um log com id "abc-123" de 300ml
Quando deleta o log "abc-123"
E o DELETE /api/logs/abc-123 retorna erro 500
Entao o log reaparece na UI com 300ml (rollback)
E uma notificacao de erro aparece
```

**Cenario 9: Cloud mode — editLog otimista com rollback**
```
Dado que o usuario esta logado e possui um log "abc-123" com 300ml
Quando edita o log para 500ml
Entao a UI mostra 500ml imediatamente
E PUT /api/logs/abc-123 e disparado em background
E se a API falha, a UI volta para 300ml (rollback)
```

**Cenario 10: Cloud mode — settings com debounce**
```
Dado que o usuario esta logado
Quando altera dailyGoal de 2000 para 2500, depois para 3000 em menos de 300ms
Entao apenas UMA chamada PUT /api/settings e feita
E o body da chamada contem dailyGoal: 3000 (ultimo valor)
E a UI mostra 3000 desde a segunda alteracao
```

**Cenario 11: Offline — operacoes enfileiradas**
```
Dado que o usuario esta logado e em cloud mode
E perde a conexao de internet
Quando adiciona 3 logs (200ml, 300ml, 500ml)
Entao os 3 logs aparecem na UI imediatamente
E 3 operacoes CREATE sao adicionadas ao sync queue
E o sync queue e persistido em localStorage com key "hydra-sync-queue"
E o sync status mostra "Offline"
```

**Cenario 12: Offline — reconexao e processamento da fila**
```
Dado que o usuario esta offline com 3 operacoes no sync queue
Quando a conexao de internet volta
Entao o sync status muda para "Syncing..."
E as 3 operacoes sao processadas em ordem cronologica (FIFO)
E apos processar, GET /api/logs e GET /api/settings sao chamados (refresh completo)
E o sync queue e limpo
E o sync status mostra "Synced"
```

**Cenario 13: Offline — fila sobrevive a reload**
```
Dado que o usuario esta offline com 2 operacoes no sync queue
Quando recarrega a pagina (ainda offline)
Entao os dados locais (cache) sao restaurados
E o sync queue permanece intacto em localStorage
E o sync status mostra "Offline"
```

**Cenario 14: Offline — conflito idempotente**
```
Dado que o usuario deletou log "xyz" offline (operacao no sync queue)
E outro dispositivo ja deletou "xyz" no servidor
Quando a conexao volta e a fila e processada
Entao DELETE /api/logs/xyz retorna 404
E a operacao e ignorada silenciosamente (sem erro)
E o processamento continua com as proximas operacoes
```

**Cenario 15: Sync status — estados visuais**
```
Dado que o usuario esta logado
Quando o estado de sync e "idle"
Entao badge verde com icone nuvem e texto "Synced" e visivel
Quando o estado muda para "syncing"
Entao badge com spinner e texto "Syncing..." e visivel
Quando o estado muda para "offline"
Entao badge amarelo com texto "Offline" e visivel
Quando o estado muda para "error"
Entao badge vermelho com texto "Sync error" e visivel
```

**Cenario 16: Sync status — invisivel para guest**
```
Dado que o usuario nao esta logado (guest mode)
Entao o componente de sync status nao renderiza nada
E nenhum espaco e ocupado na UI
```

**Cenario 17: Operacoes com muitos itens na fila**
```
Dado que o usuario esta offline
E acumula 20 operacoes no sync queue
Quando a conexao volta
Entao todas as 20 operacoes sao processadas em ordem
E a UI nao trava durante o processamento
E apos completar, os dados estao consistentes com o servidor
```

**Cenario 18: Sign-in com falha na carga de dados**
```
Dado que o usuario faz sign-in
E GET /api/logs retorna erro 500
Entao o sync status mostra "Sync error"
E o store mantem dados locais como fallback
E o usuario pode tentar novamente (retry)
```
