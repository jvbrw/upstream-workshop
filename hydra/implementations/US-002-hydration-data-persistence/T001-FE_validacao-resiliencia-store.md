## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes. Caso voce decida fazer alteracao, faca atraves do agente para que ela seja refletida em todas as secoes.**

- **Tarefa:** Adicionar validacao e resiliencia ao store (FE)
- **Objetivo:** Incrementar o Zustand store existente com schema validation na rehydration, deteccao de localStorage indisponivel, tratamento de QuotaExceededError, notificacoes ao usuario e hydration guard
- **Topicos:**
  - Schema validation: funcao `merge` ou `deserialize` customizada no persist que valida dados do localStorage na rehydration
  - localStorage indisponivel: deteccao e modo ephemeral com banner persistente
  - Toast de reset: notificacao quando dados corrompidos sao detectados e resetados
  - QuotaExceededError: captura de erro de escrita e aviso ao usuario
  - Hydration guard: prevenir flash de conteudo vazio durante rehydration do store
- **Dependencias:** Zustand persist (ja instalado), shadcn/ui (toast via radix-ui/react-toast ja em node_modules), componentes UI existentes
- **Validacao:** Dados corrompidos resetam com toast, localStorage indisponivel mostra banner, QuotaExceeded tratado, sem flash de conteudo vazio

---

## Contexto Detalhado para Agentes

## Bloco 1: O Que? (Descricao)

### 1. Objetivo Tecnico Explicito

Adicionar camadas de validacao e resiliencia ao Zustand store `useHydrationStore` que ja existe e funciona em `hooks/use-hydration-store.ts`. O store atual tem CRUD completo e persist basico. Faltam: validacao de schema na rehydration, deteccao de localStorage indisponivel, tratamento de QuotaExceededError, notificacoes visuais ao usuario (toast e banner), e um hydration guard para evitar flash de conteudo vazio.

### 2. Decomposicao em Cenarios

**Cenario A -- Schema Validation na Rehydration:**
- Adicionar funcao `merge` customizada (ou `deserialize`) na configuracao do persist middleware em `hooks/use-hydration-store.ts`
- A funcao deve validar a estrutura dos dados vindos do localStorage antes de aceita-los:
  - `logs` deve ser um array; cada item deve ter `id` (string nao vazia), `amount` (number > 0), `timestamp` (string ISO valida)
  - `dailyGoal` deve ser number > 0
  - `presets` deve ser array de numbers > 0
- Se a validacao falhar em qualquer campo:
  - Resetar TODO o state para defaults (`logs: []`, `dailyGoal: DEFAULT_GOAL`, `presets: DEFAULT_PRESETS`)
  - Setar uma flag interna `_dataWasReset: true` no store (campo interno, nao persistido)
- Se JSON no localStorage for malformado (parse error), o persist middleware ja trata isso, mas o `merge` deve garantir que o fallback para defaults funcione

**Cenario B -- Deteccao de localStorage Indisponivel:**
- Criar storage adapter customizado para o persist middleware que faz try/catch em `getItem`, `setItem`, `removeItem`
- Se `localStorage` nao estiver disponivel (ex: modo incognito com restricao, iframe sandboxed, storage desabilitado):
  - Store funciona normalmente em memoria (session only)
  - Setar flag `isEphemeral: boolean` no store (nao persistida)
  - `isEphemeral` deve ser acessivel via selector: `useHydrationStore((s) => s.isEphemeral)`
- Criar componente `StorageBanner` que renderiza um banner fixo no topo quando `isEphemeral === true`
  - Texto: "Seus dados nao serao salvos nesta sessao."
  - Usar estilo de alerta/warning com Tailwind (bg-amber-50/amber-900, border, icone de warning)
  - Importar e renderizar no `app/layout.tsx` dentro do container, acima do `<main>`

**Cenario C -- Toast de Reset de Dados Corrompidos:**
- Quando `_dataWasReset` for `true` apos rehydration, exibir toast/notificacao:
  - Texto: "Seus dados foram resetados devido a um problema. Desculpe pelo inconveniente."
  - Usar shadcn/ui toast (radix-ui/react-toast ja esta em node_modules) OU uma solucao mais simples com um componente de notificacao temporaria
  - O toast deve aparecer uma unica vez apos a deteccao, e a flag `_dataWasReset` deve voltar para `false`
- Abordagem recomendada: criar um componente `StoreNotifications` que escuta `_dataWasReset` e exibe a notificacao

**Cenario D -- Tratamento de QuotaExceededError:**
- No storage adapter customizado (Cenario B), o `setItem` deve fazer try/catch
- Se `setItem` lancar `QuotaExceededError` (ou `DOMException` com name `QuotaExceededError`):
  - Setar `isEphemeral: true` (mudar para modo ephemeral)
  - Setar uma flag `_quotaExceeded: true`
  - Componente `StoreNotifications` deve exibir aviso: "Armazenamento cheio. Seus novos dados nao serao salvos."
- Nota: QuotaExceededError e raro em uso normal (localStorage tem ~5MB), mas deve ser tratado

**Cenario E -- Hydration Guard (Prevencao de Flash):**
- Zustand persist rehydrata assincronamente no client. Antes da rehydration, o store tem o state default (vazio)
- Isso pode causar um flash: usuario ve "No entries yet" por um instante, depois os dados aparecem
- Solucao: usar `onRehydrateStorage` callback do persist para setar flag `_hydrated: boolean`
- Exportar hook `useStoreHydrated()` que retorna o valor de `_hydrated`
- Componentes que dependem do store devem usar este hook para decidir se renderizam conteudo ou um placeholder minimalista
- O placeholder NAO deve ser um loading spinner visivel — deve ser o shell vazio da pagina (mesmo layout, sem dados), para que nao haja layout shift
- Alternativa mais simples: se o store rehydrata rapido o suficiente (sincrono via localStorage), o flash pode nao ocorrer. Testar primeiro se o flash acontece antes de implementar guard complexo. Se nao houver flash, apenas exportar o hook `useStoreHydrated` como safety net

### 3. Criterios de Aceite por Cenario

**Cenario A:**
- Dados validos no localStorage sao rehydratados corretamente (comportamento atual preservado)
- Dados com campo faltando (ex: log sem `id`) causam reset para defaults
- Dados com tipo errado (ex: `amount` como string) causam reset para defaults
- JSON malformado no localStorage causa reset para defaults
- Flag `_dataWasReset` e setada como `true` quando reset ocorre

**Cenario B:**
- localStorage indisponivel: store funciona em memoria sem crash
- `isEphemeral` retorna `true` quando localStorage nao esta acessivel
- `StorageBanner` renderiza no topo da tela com a mensagem de aviso
- Nenhum erro no console quando localStorage esta bloqueado

**Cenario C:**
- Apos reset por dados corrompidos, toast aparece com a mensagem correta
- Toast aparece apenas uma vez (flag resetada apos exibicao)
- Toast nao aparece em uso normal (dados validos)

**Cenario D:**
- QuotaExceededError em `setItem` nao causa crash
- Store muda para modo ephemeral e exibe aviso

**Cenario E:**
- Hook `useStoreHydrated()` disponivel para consumo
- Nenhum flash de conteudo vazio visivel durante rehydration
- Nenhum hydration mismatch warning no console do Next.js

## Bloco 2: Como? (Implementacao)

### 4. Codigo de Referencia

**Store atual** (`hooks/use-hydration-store.ts`) -- este e o arquivo principal a modificar:
```typescript
import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HydrationLog } from "@/lib/types";
import { DEFAULT_GOAL, DEFAULT_PRESETS, STORAGE_KEY } from "@/lib/constants";

type HydrationState = {
  logs: HydrationLog[];
  dailyGoal: number;
  presets: number[];
  addLog: (amount: number) => void;
  deleteLog: (id: string) => void;
  editLog: (id: string, newAmount: number) => void;
  setDailyGoal: (goal: number) => void;
  setPresets: (presets: number[]) => void;
  clearAllData: () => void;
};

export const useHydrationStore = create<HydrationState>()(
  persist(
    (set) => ({
      logs: [],
      dailyGoal: DEFAULT_GOAL,
      presets: DEFAULT_PRESETS,
      // ... actions ...
    }),
    { name: STORAGE_KEY }
  )
);
```

**Pattern de storage customizado no Zustand persist:**
```typescript
import { createJSONStorage, type StateStorage } from "zustand/middleware";

function createSafeStorage(): StateStorage {
  const isAvailable = (() => {
    try {
      const key = "__storage_test__";
      localStorage.setItem(key, "1");
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  })();

  return {
    getItem: (name) => {
      if (!isAvailable) return null;
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      if (!isAvailable) return;
      try {
        localStorage.setItem(name, value);
      } catch (e) {
        if (e instanceof DOMException && e.name === "QuotaExceededError") {
          // sinalizar quota exceeded
        }
      }
    },
    removeItem: (name) => {
      if (!isAvailable) return;
      try {
        localStorage.removeItem(name);
      } catch {
        // silently fail
      }
    },
  };
}
```

**Pattern de merge/validation no persist:**
```typescript
persist(
  (set) => ({ /* ... */ }),
  {
    name: STORAGE_KEY,
    storage: createJSONStorage(() => safeStorage),
    merge: (persistedState, currentState) => {
      // validar persistedState aqui
      // se invalido, retornar currentState (defaults)
      // se valido, fazer merge normal
      return { ...currentState, ...validatedState };
    },
    onRehydrateStorage: () => {
      return (state, error) => {
        // setar _hydrated = true
      };
    },
  }
)
```

**Types existentes** (`lib/types.ts`):
```typescript
export type HydrationLog = {
  id: string;
  amount: number;
  timestamp: string;
};
```

**Constants existentes** (`lib/constants.ts`):
```typescript
export const DEFAULT_GOAL = 2000;
export const DEFAULT_PRESETS = [200, 300, 500];
export const STORAGE_KEY = "hydra-store";
```

**Layout atual** (`app/layout.tsx`) -- onde o StorageBanner deve ser adicionado:
```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="bg-background font-sans text-foreground antialiased">
        <div className="mx-auto flex h-dvh max-w-md flex-col bg-background">
          {/* StorageBanner deve ser adicionado AQUI, acima do main */}
          <main className="flex-1 overflow-y-auto pb-20">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
```

### 5. Contratos e Estruturas de Dados

**State shape atualizado do store (campos internos adicionados):**
```typescript
type HydrationState = {
  // Persistidos (ja existem)
  logs: HydrationLog[];
  dailyGoal: number;
  presets: number[];

  // Internos - NAO persistidos (novos)
  isEphemeral: boolean;      // true quando localStorage indisponivel
  _hydrated: boolean;        // true apos rehydration completa
  _dataWasReset: boolean;    // true quando dados corrompidos foram resetados
  _quotaExceeded: boolean;   // true quando QuotaExceededError detectado

  // Actions (ja existem)
  addLog: (amount: number) => void;
  deleteLog: (id: string) => void;
  editLog: (id: string, newAmount: number) => void;
  setDailyGoal: (goal: number) => void;
  setPresets: (presets: number[]) => void;
  clearAllData: () => void;

  // Actions internas (novas)
  _clearResetFlag: () => void;
  _clearQuotaFlag: () => void;
};
```

**Campos que NAO devem ser persistidos** (usar `partialize` no persist config):
```typescript
partialize: (state) => ({
  logs: state.logs,
  dailyGoal: state.dailyGoal,
  presets: state.presets,
}),
```

**Schema de validacao (logica, nao lib externa):**
```typescript
function isValidLog(log: unknown): log is HydrationLog {
  return (
    typeof log === "object" && log !== null &&
    typeof (log as HydrationLog).id === "string" && (log as HydrationLog).id.length > 0 &&
    typeof (log as HydrationLog).amount === "number" && (log as HydrationLog).amount > 0 &&
    typeof (log as HydrationLog).timestamp === "string" && !isNaN(Date.parse((log as HydrationLog).timestamp))
  );
}

function isValidState(state: unknown): boolean {
  if (typeof state !== "object" || state === null) return false;
  const s = state as Record<string, unknown>;
  if (!Array.isArray(s.logs) || !s.logs.every(isValidLog)) return false;
  if (typeof s.dailyGoal !== "number" || s.dailyGoal <= 0) return false;
  if (!Array.isArray(s.presets) || !s.presets.every((p) => typeof p === "number" && p > 0)) return false;
  return true;
}
```

### 6. Dependencias e Interacoes

| Dependencia | Status | Uso |
|-------------|--------|-----|
| `zustand` (5.x) | Instalado | Store + persist middleware |
| `zustand/middleware` (persist, createJSONStorage) | Instalado | Storage customizado, merge, onRehydrateStorage |
| `@radix-ui/react-toast` | Em node_modules (via radix-ui) | Toast de notificacao (opcional, pode usar componente simples) |
| `lib/types.ts` | Existente | HydrationLog type |
| `lib/constants.ts` | Existente | DEFAULT_GOAL, DEFAULT_PRESETS, STORAGE_KEY |
| Tailwind CSS 4 | Existente | Estilizacao do banner e toast |

**Arquivos a MODIFICAR:**
- `hooks/use-hydration-store.ts` -- Adicionar: storage customizado, merge validation, flags internas, partialize, onRehydrateStorage, hook useStoreHydrated
- `app/layout.tsx` -- Adicionar: import e render do StorageBanner e StoreNotifications

**Arquivos a CRIAR:**
- `components/layout/storage-banner.tsx` -- Banner persistente para modo ephemeral
- `components/layout/store-notifications.tsx` -- Componente que escuta flags do store e exibe toasts

**Arquivos que NAO devem ser alterados:**
- `lib/types.ts` -- Manter como esta
- `lib/constants.ts` -- Manter como esta
- `app/lab/*` -- Prototipo preservado
- `components/layout/bottom-nav.tsx` -- Sem alteracoes

**Decisao sobre toast:** O projeto tem `@radix-ui/react-toast` em node_modules (via `radix-ui`). Opcoes:
1. Instalar `sonner` (mais simples, popular com Next.js) -- preferivel por simplicidade
2. Usar shadcn toast component (baseado em radix) -- requer setup de Toaster provider
3. Criar componente simples customizado com auto-dismiss

Recomendacao: usar a abordagem mais simples possivel. Um componente `StoreNotifications` "use client" que renderiza um div com auto-dismiss via setTimeout e adequado. Nao e necessario um sistema de toast completo para 2 mensagens.

### 7. Requisitos Nao-Funcionais

- **Performance:** Validacao de schema deve ser rapida (operacao sincrona sobre dados pequenos). Nao usar libs externas de validacao (zod, yup) -- validacao manual inline e suficiente para este escopo
- **Bundle size:** Nenhuma dependencia nova deve ser adicionada. Toda a implementacao usa Zustand persist APIs ja disponiveis
- **SSR:** O `StorageBanner` e `StoreNotifications` devem ser "use client" components. O layout.tsx e server component, entao os client components devem ser importados como componentes filhos
- **UI Framework:** Tailwind CSS 4 para estilizacao. Usar classes utilitarias. Seguir o pattern visual existente no app (cores: `bg-background`, `text-foreground`, `text-muted-foreground`, etc.)
- **Convencoes:**
  - Named exports (nao default exports)
  - "use client" directive em componentes client
  - Path alias `@/*` para imports
  - Arquivos em kebab-case

## Bloco 3: Como Validar? (Validacao)

### 8. Cenarios de Teste (BDD)

**Cenario 1: Dados validos no localStorage sao rehydratados normalmente**
```
Dado que localStorage["hydra-store"] contem dados validos (3 logs, goal 2500, presets [200, 500])
Quando o app carrega e o store rehydrata
Entao o store contem os 3 logs com dados corretos
E dailyGoal e 2500
E presets sao [200, 500]
E _dataWasReset e false
E nenhum toast de reset e exibido
```

**Cenario 2: Dados com campo faltando causam reset**
```
Dado que localStorage["hydra-store"] contem um log sem campo "id"
Quando o app carrega e o store tenta rehydratar
Entao o store reseta para defaults (logs vazio, goal 2000, presets [200, 300, 500])
E _dataWasReset e true
E toast exibe "Seus dados foram resetados devido a um problema. Desculpe pelo inconveniente."
```

**Cenario 3: Dados com tipo errado causam reset**
```
Dado que localStorage["hydra-store"] contem logs onde amount e uma string "300" ao inves de number
Quando o app carrega e o store tenta rehydratar
Entao o store reseta para defaults
E _dataWasReset e true
```

**Cenario 4: JSON malformado no localStorage causa reset**
```
Dado que localStorage["hydra-store"] contem texto que nao e JSON valido
Quando o app carrega
Entao o store inicializa com defaults
E nenhum erro aparece no console (tratado graciosamente)
```

**Cenario 5: localStorage indisponivel -- modo ephemeral**
```
Dado que localStorage nao esta acessivel (throw em qualquer operacao)
Quando o app carrega
Entao o store funciona em memoria com state default
E isEphemeral e true
E StorageBanner e visivel com texto "Seus dados nao serao salvos nesta sessao."
E o usuario pode usar o app normalmente (addLog, editLog, etc.)
E nenhum erro aparece no console
```

**Cenario 6: QuotaExceededError na escrita**
```
Dado que localStorage esta cheio (setItem lanca QuotaExceededError)
Quando o store tenta persistir dados apos uma action
Entao o store muda para modo ephemeral (isEphemeral = true)
E _quotaExceeded e true
E uma notificacao exibe "Armazenamento cheio. Seus novos dados nao serao salvos."
E o app continua funcionando sem crash
```

**Cenario 7: Hydration guard previne flash de conteudo vazio**
```
Dado que o store tem dados salvos no localStorage
Quando o app carrega (client-side hydration)
Entao useStoreHydrated() retorna false inicialmente
E apos rehydration, useStoreHydrated() retorna true
E nenhum flash de "No entries yet" e visivel quando existem logs salvos
```

**Cenario 8: Toast de reset aparece apenas uma vez**
```
Dado que dados corrompidos foram detectados e resetados
Quando o toast de reset e exibido
E o usuario navega para outra aba e volta
Entao o toast NAO aparece novamente
E _dataWasReset e false apos a primeira exibicao
```

**Cenario 9: Regressao -- CRUD continua funcionando apos mudancas**
```
Dado que as mudancas de validacao e resiliencia foram aplicadas
Quando o usuario executa addLog, editLog, deleteLog, setDailyGoal, setPresets
Entao todas as actions funcionam identicamente ao comportamento anterior
E os dados persistem normalmente no localStorage
E os derived hooks (useTodayLogs, useTodayTotal, useStreak) continuam funcionando
```

**Cenario 10: Primeiro uso -- estado limpo sem validacao desnecessaria**
```
Dado que o usuario abre o app pela primeira vez (localStorage vazio para "hydra-store")
Quando o store inicializa
Entao logs e um array vazio
E dailyGoal e 2000
E presets sao [200, 300, 500]
E _dataWasReset e false (nao houve reset, e apenas primeiro uso)
E isEphemeral e false
E nenhum toast ou banner e exibido
```
