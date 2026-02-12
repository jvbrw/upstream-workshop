## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

- **Tarefa:** Zustand hydration store with localStorage persistence (FE)
- **Objetivo:** Criar o store global de hidratacao com persistencia automatica no localStorage, incluindo tipos de dominio, CRUD de logs, schema validation e fallback gracioso
- **Topicos:**
  - Domain types: HydrationLog, HydrationState, store actions
  - Zustand store: persist middleware com localStorage, rehydration automatica
  - Store actions: addLog, editLog, deleteLog, setDailyGoal, setPresets
  - Schema validation: detectar dados corrompidos no localStorage, resetar com defaults
  - Fallback: detectar localStorage indisponivel, funcionar em modo ephemeral
  - Constants: defaults (goal 2000ml, presets [200, 300, 500])
- **Dependencias:** Zustand (a instalar), Next.js (SSR hydration handling)
- **Validacao:** CRUD persiste entre sessoes, dados corrompidos resetados, localStorage indisponivel nao causa crash

---

## Contexto Detalhado para Agentes

## Bloco 1: O Que? (Descricao)

### 1. Objetivo Tecnico Explicito

Instalar Zustand, criar domain types, implementar o Zustand store `useHydrationStore` com persist middleware salvando no localStorage, incluindo todas as actions CRUD, schema validation na rehydration, e deteccao de localStorage indisponivel com fallback gracioso.

### 2. Decomposicao em Cenarios

**Cenario A — Instalacao e Types:**
- Instalar Zustand: `npm install zustand`
- Criar `lib/types.ts` com domain types:
  ```typescript
  export type HydrationLog = {
    id: string;
    amount: number; // ml
    timestamp: string; // ISO 8601
  };
  ```
- Criar `lib/constants.ts` com defaults:
  ```typescript
  export const DEFAULT_DAILY_GOAL = 2000;
  export const DEFAULT_PRESETS = [200, 300, 500];
  export const STORAGE_KEY = "hydra-store";
  ```

**Cenario B — Zustand Store:**
- Criar `hooks/use-hydration-store.ts`
- Store state:
  ```typescript
  type HydrationState = {
    logs: HydrationLog[];
    dailyGoal: number;
    presets: number[];
  };
  ```
- Store actions:
  ```typescript
  type HydrationActions = {
    addLog: (amount: number) => void;
    editLog: (id: string, newAmount: number) => void;
    deleteLog: (id: string) => void;
    setDailyGoal: (goal: number) => void;
    setPresets: (presets: number[]) => void;
  };
  ```
- `addLog`: cria `{ id: \`log-\${Date.now()}\`, amount, timestamp: new Date().toISOString() }` e append ao array
- `editLog`: encontra log por id, atualiza amount
- `deleteLog`: filtra log por id
- `setDailyGoal`: valida range (500-5000), atualiza state
- `setPresets`: valida cada preset (50-2000), atualiza state
- Usar `create` com `persist` middleware:
  ```typescript
  import { create } from "zustand";
  import { persist } from "zustand/middleware";
  ```
- `persist` config: `{ name: STORAGE_KEY }`

**Cenario C — Schema Validation:**
- Ao rehydratar do localStorage, validar estrutura dos dados:
  - `logs` deve ser array; cada item deve ter id (string), amount (number > 0), timestamp (string)
  - `dailyGoal` deve ser number entre 500 e 5000
  - `presets` deve ser array de numbers entre 50 e 2000
- Se validacao falha: resetar para defaults (logs vazio, goal 2000, presets [200,300,500])
- Retornar flag `wasReset: true` para que UI possa exibir aviso
- Implementar via `onRehydrateStorage` callback do persist middleware

**Cenario D — localStorage Indisponivel e QuotaExceeded:**
- Detectar se localStorage esta acessivel: try/catch no setItem/getItem
- Se indisponivel: store funciona normalmente em memoria (session only)
- Se localStorage.setItem lanca QuotaExceededError: tratar como indisponivel, mudar para modo ephemeral
- Expor flag `isEphemeral: boolean` no store para que UI possa exibir banner
- Usar `storage` option customizada no persist middleware que faz try/catch em getItem e setItem
- Criar componente `components/layout/storage-banner.tsx`: banner persistente no topo quando `isEphemeral === true`, texto: "Your data won't be saved in this session. Use a regular browser to keep your history."
- Banner deve ser importado no `app/layout.tsx` dentro do shell wrapper, acima do `<main>`

**Cenario E — SSR Hydration Safety e Primeiro Uso:**
- O store rehydrata no client-side (localStorage so existe no browser)
- Usar `skipHydration: true` no persist config OU lazy initialization pattern
- Componentes que consomem o store devem lidar com o estado inicial (pre-hydration) sem flash
- Exportar `useHydrationStoreHydrated` hook que retorna true quando store esta pronto (usa `onRehydrateStorage` callback)
- Componentes consumidores DEVEM verificar `useHydrationStoreHydrated()` antes de renderizar conteudo dependente do store
- No primeiro uso (localStorage vazio): store inicializa com defaults (logs vazio, goal 2000, presets [200,300,500]) — sem mock data

### 3. Criterios de Aceite por Cenario

**Cenario A:**
- Zustand instalado e listado em dependencies do package.json
- Types exportados de `lib/types.ts`
- Constants exportados de `lib/constants.ts`

**Cenario B:**
- Store funcional com todas as 5 actions
- addLog cria log com id unico e timestamp atual
- editLog atualiza amount do log correto
- deleteLog remove log por id
- setDailyGoal aceita apenas 500-5000
- setPresets aceita apenas arrays com valores 50-2000
- Dados persistidos automaticamente no localStorage apos cada action

**Cenario C:**
- Dados validos no localStorage: rehydratados corretamente
- Dados invalidos (campo faltando, tipo errado, array corrompido): resetados para defaults
- JSON malformado no localStorage: resetado para defaults
- Flag de reset acessivel para UI

**Cenario D:**
- localStorage indisponivel: store funciona em memoria, sem crash
- QuotaExceededError: tratado como indisponivel, switch para ephemeral
- Flag `isEphemeral` acessivel para UI exibir banner
- StorageBanner componente renderiza quando isEphemeral === true
- Nenhum erro no console quando localStorage esta bloqueado

**Cenario E:**
- Sem hydration mismatch warnings no console do Next.js
- Store pre-hydration tem estado default (nao undefined)
- Componentes renderizam corretamente no primeiro paint (SSR shell)

## Bloco 2: Como? (Implementacao)

### 4. Codigo de Referencia

**Prototipo de referencia** (`app/lab/hydra-mvp/types.ts`):
```typescript
export type HydrationLog = {
  id: string;
  amount: number;
  timestamp: string;
};
```

**Prototipo — store actions** (`app/lab/hydra-mvp/page.tsx`):
```typescript
const handleLog = useCallback((amount: number) => {
  const newLog: HydrationLog = {
    id: `log-${Date.now()}`,
    amount,
    timestamp: new Date().toISOString(),
  };
  setLogs((prev) => [...prev, newLog]);
}, []);

const handleDelete = useCallback((id: string) => {
  setLogs((prev) => prev.filter((log) => log.id !== id));
}, []);

const handleEdit = useCallback((id: string, newAmount: number) => {
  setLogs((prev) =>
    prev.map((log) => (log.id === id ? { ...log, amount: newAmount } : log))
  );
}, []);
```

**Prototipo — defaults** (`app/lab/hydra-mvp/mock-data.ts`):
```typescript
export const DEFAULT_GOAL = 2000;
export const PRESETS = [200, 300, 500];
```

### 5. Contratos e Estruturas de Dados

**Store shape (localStorage JSON):**
```json
{
  "state": {
    "logs": [
      { "id": "log-1707580800000", "amount": 300, "timestamp": "2026-02-10T14:00:00.000Z" }
    ],
    "dailyGoal": 2000,
    "presets": [200, 300, 500]
  },
  "version": 0
}
```

**localStorage key:** `"hydra-store"`

### 6. Dependencias e Interacoes

| Dependencia | Status | Uso |
|-------------|--------|-----|
| `zustand` | A INSTALAR | State management com persist middleware |
| `zustand/middleware` (persist) | Vem com zustand | localStorage persistence |
| `lib/types.ts` | A CRIAR | Domain types |
| `lib/constants.ts` | A CRIAR | Default values e storage key |

**Arquivos a criar:**
- `lib/types.ts` — Domain types (HydrationLog)
- `lib/constants.ts` — Defaults e storage key
- `hooks/use-hydration-store.ts` — Zustand store
- `components/layout/storage-banner.tsx` — Banner para modo ephemeral

**Arquivos existentes que NAO devem ser alterados:**
- `app/layout.tsx` — Nao precisa de provider (Zustand nao usa Context)
- `components/layout/bottom-nav.tsx` — Sem alteracoes
- `app/lab/*` — Prototipo preservado

### 7. Requisitos Nao-Funcionais

- **Performance:** Store rehydration nao deve bloquear render; localStorage I/O e sincrono mas rapido para dados pequenos
- **Data safety:** Zero data loss em uso normal; graceful degradation quando localStorage indisponivel
- **Bundle:** Zustand e ~2KB gzipped — dentro do budget de 100KB
- **SSR:** Sem hydration mismatch; store deve funcionar com SSR do Next.js

## Bloco 3: Como Validar? (Validacao)

### 8. Cenarios de Teste (BDD)

**Cenario 1: Adicionar log persiste no localStorage**
```
Given o store esta vazio (primeiro uso)
When o usuario chama addLog(300)
Then logs contem 1 entrada com amount 300
And localStorage["hydra-store"] contem o log
```

**Cenario 2: CRUD completo persiste entre sessoes**
```
Given o store tem 3 logs
When o usuario fecha o browser e reabre
Then o store rehydrata com os mesmos 3 logs
And dailyGoal e presets tambem persistem
```

**Cenario 3: Editar log persiste**
```
Given existe um log com id "log-123" e amount 200
When o usuario chama editLog("log-123", 500)
Then o log tem amount 500
And localStorage reflete a alteracao
```

**Cenario 4: Deletar log persiste**
```
Given existem 3 logs no store
When o usuario chama deleteLog("log-123")
Then o store tem 2 logs
And localStorage reflete a remocao
```

**Cenario 5: Dados corrompidos sao resetados**
```
Given localStorage["hydra-store"] contem JSON invalido
When o app carrega e o store tenta rehydratar
Then o store reseta para defaults (logs vazio, goal 2000, presets [200,300,500])
And uma flag indica que houve reset
```

**Cenario 6: localStorage indisponivel**
```
Given localStorage nao esta acessivel (throw em setItem)
When o app carrega
Then o store funciona em memoria (ephemeral)
And isEphemeral retorna true
And nenhum erro aparece no console
```

**Cenario 7: Validacao de limites**
```
Given o store esta em defaults
When o usuario chama setDailyGoal(400)
Then dailyGoal permanece 2000 (rejeita valor fora do range)
When o usuario chama setDailyGoal(3000)
Then dailyGoal muda para 3000
```

**Cenario 8: SSR hydration safety**
```
Given o app renderiza no servidor (SSR)
When o client hydrata o componente
Then nenhum warning de hydration mismatch aparece no console
And o store mostra dados do localStorage apos hydration
```

**Cenario 9: localStorage QuotaExceeded**
```
Given localStorage esta cheio (QuotaExceededError em setItem)
When o store tenta persistir dados
Then o store muda para modo ephemeral
And isEphemeral retorna true
And StorageBanner e exibido ao usuario
```

**Cenario 10: Regressao US-001 — navegacao entre abas**
```
Given o Zustand store esta integrado no app
When o usuario navega entre Today, History, Manage, Settings
Then a navegacao funciona identicamente ao comportamento pre-store
And a aba ativa e destacada corretamente em cada rota
And nenhum erro aparece no console
```

**Cenario 11: Primeiro uso — estado limpo**
```
Given o usuario abre o app pela primeira vez (localStorage vazio)
When o app carrega
Then logs esta vazio (nenhuma entrada)
And dailyGoal e 2000
And presets sao [200, 300, 500]
And nenhum mock data e exibido
```
