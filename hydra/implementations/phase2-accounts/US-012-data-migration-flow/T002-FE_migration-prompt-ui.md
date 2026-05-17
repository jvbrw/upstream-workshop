## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes. Caso voce decida fazer alteracao, faca atraves do agente para que ela seja refletida em todas as secoes.**

- **Tarefa:** Migration prompt UI + deteccao + estados de progresso/erro (FE)
- **Objetivo:** Adaptar o prototipo MigrationPrompt do lab para componente real, com deteccao de dados locais, calculo de stats, chamada a API de migracao, confirmacao de "Start fresh", estados de loading/erro/sucesso e flag de prevencao de re-exibicao
- **Topicos:**
  - Adaptar MigrationPrompt de app/lab/phase2-accounts/components/migration-prompt.tsx
  - Deteccao de dados locais pos sign-in (logs.length > 0) + check de migrationCompleted
  - Calculo de stats: entries count, dias unicos, best streak
  - "Keep my data": POST /api/migration, spinner, transicao para modo cloud
  - "Start fresh": AlertDialog de confirmacao, limpar dados locais, marcar migracao completa
  - Estados de erro: preservar dados locais, retry
  - Feedback de sucesso antes de redirect
  - Flag migrationCompleted impede re-exibicao
- **Dependencias:** T001-BE (Migration API), Zustand store (use-hydration-store), NextAuth sessao, AlertDialog (shadcn/ui)
- **Validacao:** Prompt aparece com dados locais, "Keep my data" faz upload, "Start fresh" com confirmacao funciona, erro preserva dados, flag impede re-exibicao

---

## Contexto Detalhado para Agentes

## Bloco 1: O Que? (Descricao)

### 1. Objetivo Tecnico Explicito

Criar o componente real de migracao adaptado do prototipo `app/lab/phase2-accounts/components/migration-prompt.tsx`, integrando-o no fluxo pos-sign-in. O componente deve: detectar dados locais no Zustand store, calcular estatisticas (entries, dias, streak), oferecer opcoes "Keep my data" (upload via API) e "Start fresh" (com confirmacao), exibir estados de loading/erro/sucesso, e usar a flag `migrationCompleted` do servidor para prevenir re-exibicao.

### 2. Decomposicao em Cenarios

**Cenario A — Deteccao de dados locais e exibicao condicional:**
- Apos sign-in bem-sucedido (sessao NextAuth ativa), verificar:
  1. Store Zustand hydratado (`_hydrated === true`)
  2. Existem logs locais (`logs.length > 0`)
  3. Flag `migrationCompleted` no servidor e `false` (via GET /api/migration/status)
- Se TODAS as condicoes: exibir migration prompt fullscreen
- Se logs.length === 0 OU migrationCompleted === true: pular direto para dashboard
- Logica de roteamento: implementar em page-level (ex: `app/(app)/migration/page.tsx`) ou como guard/middleware no layout pos-auth

**Cenario B — Calculo de estatisticas locais:**
- A partir dos logs do Zustand store, calcular:
  - `localEntries`: `logs.length`
  - `localDays`: numero de dias unicos (extrair date de cada `log.timestamp`, contar unicos)
  - `localStreak`: calcular best streak (maior sequencia de dias consecutivos com pelo menos 1 log)
- Logica de best streak:
  ```typescript
  // Extrair dias unicos ordenados
  const uniqueDays = [...new Set(logs.map(log =>
    new Date(log.timestamp).toISOString().split("T")[0]
  ))].sort();

  // Calcular maior sequencia consecutiva
  let bestStreak = 0;
  let currentStreak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      currentStreak++;
    } else {
      bestStreak = Math.max(bestStreak, currentStreak);
      currentStreak = 1;
    }
  }
  bestStreak = Math.max(bestStreak, currentStreak);
  ```
- Nota: este calculo de "best streak" e diferente do `useStreak()` existente (que calcula streak ATUAL baseado em dailyGoal). Aqui queremos o maior periodo consecutivo com ao menos 1 log, independente de meta.

**Cenario C — "Keep my data" (onMigrate):**
- Ao clicar "Keep my data":
  1. Setar estado `isMigrating = true`
  2. Desabilitar ambos botoes
  3. Mostrar spinner e texto "Migrating your data..."
  4. Chamar `POST /api/migration` com:
     ```json
     {
       "logs": [...store.logs],
       "dailyGoal": store.dailyGoal,
       "presets": store.presets
     }
     ```
  5. Em caso de sucesso (200):
     - Mostrar feedback de sucesso (texto "Data migrated successfully" + icone de check) por 1.5 segundos
     - Transicionar store para modo cloud (limpar dados locais do store, o store passara a ler da API — conforme US-013)
     - Redirecionar ao dashboard (`router.push("/")`)
  6. Em caso de erro:
     - Setar `isMigrating = false`
     - NAO apagar dados locais
     - Mostrar mensagem de erro: "Something went wrong. Your data is safe -- try again."
     - Exibir botao "Try again" que repete a chamada

**Cenario D — "Start fresh" (onStartFresh):**
- Ao clicar "Start fresh":
  1. Abrir AlertDialog de confirmacao:
     - Titulo: "Discard local data?"
     - Descricao: "This will permanently discard {localEntries} entries. This action cannot be undone."
     - Acao primaria: "Discard data" (variant destructive)
     - Acao cancelar: "Cancel"
  2. Se confirmado:
     - Chamar `POST /api/migration` com `{ logs: [], dailyGoal: DEFAULT_GOAL, presets: DEFAULT_PRESETS }` OU chamar endpoint separado para apenas marcar migrationCompleted
     - Limpar dados locais do store (`clearAllData()`)
     - Redirecionar ao dashboard
  3. Se cancelado:
     - Fechar dialog, voltar ao migration prompt

**Cenario E — Estado de erro com retry:**
- Apos falha na chamada API:
  - Dados locais preservados intactos no store
  - UI muda para estado de erro:
    - Mensagem nao-tecnica: "Something went wrong. Your data is safe -- try again."
    - Botao "Try again" (mesmo visual que "Keep my data")
    - Botao "Start fresh" continua disponivel
  - Re-tentativa repete o fluxo do Cenario C

**Cenario F — Feedback de sucesso antes de redirect:**
- Apos migracao bem-sucedida (cenarios C e D):
  - Mostrar estado de sucesso por ~1.5 segundos:
    - Icone de check (ex: RiCheckLine ou RiCheckboxCircleLine)
    - Texto: "Data migrated successfully" (Keep my data) ou "Starting fresh" (Start fresh)
  - Apos delay, redirecionar ao dashboard

**Cenario G — Flag migrationCompleted impede re-exibicao:**
- Ao acessar a pagina/rota de migracao:
  - Verificar GET /api/migration/status
  - Se `migrationCompleted === true`: redirect imediato ao dashboard
  - Se usuario nao esta autenticado: redirect ao sign-in ou dashboard
- Esta verificacao deve ocorrer server-side (em server component ou middleware) para evitar flash

### 3. Criterios de Aceite por Cenario

**Cenario A:**
- Migration prompt aparece APENAS quando: sessao ativa + logs locais > 0 + migrationCompleted === false
- Sem dados locais: dashboard direto
- migrationCompleted === true: dashboard direto
- Sem sessao: nao exibir migration prompt

**Cenario B:**
- Entries count exato (igual a logs.length)
- Dias unicos calculados corretamente (ex: 87 logs em 14 dias distintos = 14)
- Best streak calculado corretamente (maior sequencia de dias consecutivos com log)

**Cenario C:**
- Spinner visivel durante upload
- Botoes desabilitados durante upload
- Sucesso: feedback visual + redirect ao dashboard
- Dados no servidor identicos aos locais apos migracao

**Cenario D:**
- AlertDialog aparece ao clicar "Start fresh"
- Mostra contagem de entries que serao descartados
- Cancelar volta ao prompt sem alteracoes
- Confirmar limpa dados e redireciona

**Cenario E:**
- Dados locais intactos apos erro
- Mensagem de erro visivel e nao-tecnica
- "Try again" funcional
- Nenhum dado apagado em cenario de erro

**Cenario F:**
- Feedback de sucesso visivel por ~1.5 segundos antes de redirect
- Transicao suave

**Cenario G:**
- Nenhum flash do migration prompt quando migrationCompleted === true
- Redirect funciona server-side ou com loading state

## Bloco 2: Como? (Implementacao)

### 4. Codigo de Referencia

**Prototipo do lab — MigrationPrompt** (`app/lab/phase2-accounts/components/migration-prompt.tsx`):
```typescript
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RiCloudLine,
  RiSmartphoneLine,
  RiArrowRightLine,
  RiDeleteBinLine,
} from "@remixicon/react";

export type MigrationPromptProps = {
  localEntries: number;
  localDays: number;
  localStreak: number;
  onMigrate: () => void;
  onStartFresh: () => void;
};

export function MigrationPrompt({
  localEntries,
  localDays,
  localStreak,
  onMigrate,
  onStartFresh,
}: MigrationPromptProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-foreground">
          We found your data
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;ve been tracking as a guest. Want to keep it?
        </p>
      </div>

      {/* Data summary card */}
      <Card className="mb-6 w-full max-w-sm">
        <CardContent className="space-y-4">
          {/* ... stats grid + migration visual ... */}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-2">
        <Button className="w-full gap-2" size="lg" onClick={onMigrate}>
          <RiCloudLine className="size-5" />
          Keep my data
        </Button>
        <Button
          variant="ghost"
          className="w-full gap-2 text-muted-foreground"
          size="sm"
          onClick={onStartFresh}
        >
          <RiDeleteBinLine className="size-4" />
          Start fresh
        </Button>
      </div>
    </div>
  );
}
```

**Componentes shadcn/ui existentes que DEVEM ser reutilizados:**
- `Button` — `@/components/ui/button` (variantes: default, ghost, size lg/sm)
- `Card`, `CardContent` — `@/components/ui/card`
- `Badge` — `@/components/ui/badge`
- `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogAction`, `AlertDialogCancel` — `@/components/ui/alert-dialog`

**Zustand store** (`hooks/use-hydration-store.ts`):
```typescript
// State
type HydrationState = {
  logs: HydrationLog[];
  dailyGoal: number;
  presets: number[];
  _hydrated: boolean;
  // Actions
  clearAllData: () => void;
  // ...
};

// Hooks utilitarios
export function useStoreHydrated(): boolean;
```

**Icones @remixicon/react usados no prototipo:**
- `RiCloudLine`, `RiSmartphoneLine`, `RiArrowRightLine`, `RiDeleteBinLine`
- Adicionar para estados: `RiLoader4Line` (spinner), `RiCheckboxCircleLine` (sucesso), `RiErrorWarningLine` (erro)

**SignInPrompt (referencia de layout fullscreen)** (`app/lab/phase2-accounts/components/sign-in-prompt.tsx`):
- Usa mesmo pattern: `min-h-dvh flex flex-col items-center justify-center px-6 py-12`
- Consistencia visual entre sign-in e migration prompt

### 5. Contratos e Estruturas de Dados

**Chamada API — POST /api/migration:**
```typescript
const response = await fetch("/api/migration", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    logs: store.logs,       // HydrationLog[] do Zustand
    dailyGoal: store.dailyGoal,
    presets: store.presets,
  }),
});

// Sucesso
{ success: true, migratedLogs: number }

// Erro 400/401/409/500
{ error: string, details?: unknown[] }
```

**Chamada API — GET /api/migration/status:**
```typescript
const response = await fetch("/api/migration/status");
const data = await response.json();
// { migrationCompleted: boolean }
```

**Props do componente MigrationPrompt adaptado:**
```typescript
export type MigrationPromptProps = {
  localEntries: number;
  localDays: number;
  localStreak: number;
  onMigrate: () => Promise<void>;  // agora async
  onStartFresh: () => Promise<void>; // agora async
};
```

**Estados internos do componente/page:**
```typescript
type MigrationState =
  | "idle"          // Prompt exibido, aguardando acao
  | "migrating"     // Upload em progresso
  | "success"       // Migracao completa, mostrando feedback
  | "error"         // Erro na chamada, mostrando retry
  | "confirming";   // AlertDialog de "Start fresh" aberto
```

### 6. Dependencias e Interacoes

| Dependencia | Status | Uso |
|-------------|--------|-----|
| `@/components/ui/button` | Existente | Botoes de acao |
| `@/components/ui/card` | Existente | Card de resumo de dados |
| `@/components/ui/badge` | Existente | Badge de stats (opcional) |
| `@/components/ui/alert-dialog` | Existente | Confirmacao de "Start fresh" |
| `@remixicon/react` | Existente | Icones |
| `hooks/use-hydration-store` | Existente | Leitura de logs, dailyGoal, presets, clearAllData |
| `next-auth` (useSession) | De US-010 | Verificar sessao autenticada |
| `next/navigation` (useRouter) | Existente | Redirect apos migracao |
| T001-BE (Migration API) | Esta US | POST /api/migration, GET /api/migration/status |

**Arquivos a criar:**
- `app/(app)/migration/page.tsx` — Pagina de migracao (server component wrapper + client component)
- `components/migration/migration-prompt.tsx` — Componente adaptado do lab (client component)
- `lib/migration-utils.ts` — Funcoes utilitarias (calculo de stats: uniqueDays, bestStreak)

**Arquivos existentes que NAO devem ser alterados:**
- `app/lab/phase2-accounts/components/migration-prompt.tsx` — Prototipo preservado
- `components/ui/*` — Componentes shadcn (usar, nao modificar)
- `hooks/use-hydration-store.ts` — Store existente (apenas consumir, nao alterar nesta task)

### Integracoes com Backend

| Endpoint/Service | Task BE Relacionada | Contrato |
|------------------|---------------------|----------|
| POST /api/migration | T001-BE_migration-api | `{ logs, dailyGoal, presets }` -> `{ success, migratedLogs }` |
| GET /api/migration/status | T001-BE_migration-api | `{}` -> `{ migrationCompleted: boolean }` |

### 7. Requisitos Nao-Funcionais

- **UI Framework:** shadcn/ui (Radix Maia, Cyan theme) — OBRIGATORIO usar componentes existentes
- **Icons:** @remixicon/react — OBRIGATORIO (nao usar Lucide ou outros)
- **Formatadores:** ESLint 9 flat config com next/core-web-vitals — OBRIGATORIO seguir
- **Estrutura de arquivos:** Seguir pattern do warmup-tech:
  - Componentes em `components/migration/`
  - Paginas em `app/(app)/migration/`
  - Utils em `lib/`
- **Mobile-first:** Layout responsivo, touch targets minimo 44x44px
- **Animacoes:** Usar tw-animate-css para transicoes sutis (fade-in do prompt, transicao de estados)
- **Acessibilidade:**
  - Semantic HTML
  - AlertDialog ja e acessivel via Radix
  - Focus management: apos erro, foco no botao "Try again"
  - aria-live para anuncios de estado (migrating, success, error)
  - prefers-reduced-motion: desabilitar animacoes se preferido
- **Performance:**
  - Calculo de stats (uniqueDays, bestStreak) via useMemo para nao recalcular em cada render
  - Fetch de migration/status deve ter loading state (nao bloquear render)
- **Dark mode:** Componentes shadcn ja suportam via CSS custom properties (oklch)
- **Named exports:** Sem default exports (exceto page.tsx do Next.js)
- **Props interfaces:** `MigrationPromptProps`, `MigrationStatsProps` etc.

## Bloco 3: Como Validar? (Validacao)

### 8. Cenarios de Teste (BDD)

**Cenario 1: Migration prompt aparece apos sign-in com dados locais**
```
Given o usuario acabou de fazer sign-in (sessao ativa)
And o Zustand store tem 87 logs locais
And GET /api/migration/status retorna { migrationCompleted: false }
When a pagina de migracao carrega
Then o migration prompt e exibido fullscreen
And mostra 87 entries, N dias, M best streak calculados dos logs
```

**Cenario 2: Migration prompt NAO aparece sem dados locais**
```
Given o usuario acabou de fazer sign-in
And o Zustand store tem 0 logs
When a logica de roteamento pos-sign-in executa
Then o migration prompt NAO e exibido
And o usuario e redirecionado ao dashboard
```

**Cenario 3: Migration prompt NAO aparece se ja migrou**
```
Given o usuario esta autenticado
And GET /api/migration/status retorna { migrationCompleted: true }
When a pagina de migracao carrega
Then redirect imediato ao dashboard
And nenhum flash do prompt
```

**Cenario 4: "Keep my data" — caminho feliz**
```
Given o migration prompt esta exibido com 87 entries
When o usuario clica "Keep my data"
Then um spinner aparece no botao
And o texto muda para "Migrating your data..."
And ambos botoes ficam desabilitados
When POST /api/migration retorna 200 com { success: true, migratedLogs: 87 }
Then o estado muda para sucesso
And o texto mostra "Data migrated successfully" com icone de check
And apos ~1.5 segundos, o usuario e redirecionado ao dashboard
```

**Cenario 5: "Keep my data" — erro de rede**
```
Given o migration prompt esta exibido
When o usuario clica "Keep my data"
And POST /api/migration retorna erro 500
Then o estado muda para erro
And a mensagem "Something went wrong. Your data is safe -- try again." e exibida
And um botao "Try again" aparece
And os dados locais no Zustand store estao intactos (nao foram apagados)
```

**Cenario 6: Retry apos erro**
```
Given o estado atual e erro (apos falha anterior)
When o usuario clica "Try again"
Then o fluxo de upload reinicia (spinner, chamada API)
And em caso de sucesso, segue o fluxo normal
```

**Cenario 7: "Start fresh" — com confirmacao**
```
Given o migration prompt esta exibido com 87 entries
When o usuario clica "Start fresh"
Then um AlertDialog abre com titulo "Discard local data?"
And a descricao menciona "87 entries"
And ha botao "Discard data" (destructive) e "Cancel"
```

**Cenario 8: "Start fresh" — confirmar descarte**
```
Given o AlertDialog de confirmacao esta aberto
When o usuario clica "Discard data"
Then os dados locais sao limpos (clearAllData no store)
And migrationCompleted e marcado como true no servidor
And o usuario e redirecionado ao dashboard
```

**Cenario 9: "Start fresh" — cancelar**
```
Given o AlertDialog de confirmacao esta aberto
When o usuario clica "Cancel"
Then o dialog fecha
And o migration prompt permanece exibido
And nenhum dado foi alterado
```

**Cenario 10: Calculo correto de estatisticas**
```
Given o store tem logs em 3 dias consecutivos (10, 11, 12 fev) e 1 dia isolado (15 fev)
When o migration prompt calcula stats
Then localDays e 4
And localStreak (best) e 3
And localEntries e o total de logs
```

**Cenario 11: Edge case — 1 unico log**
```
Given o store tem apenas 1 log
When o migration prompt exibe
Then localEntries e 1
And localDays e 1
And localStreak e 1
```

**Cenario 12: Responsividade mobile**
```
Given o usuario esta em viewport mobile (375px)
When o migration prompt e exibido
Then o layout e fullscreen sem scroll horizontal
And os botoes tem touch target >= 44px
And o card de stats nao transborda
```

**Cenario 13: Acessibilidade — AlertDialog**
```
Given o AlertDialog de "Start fresh" esta aberto
When o usuario pressiona Escape
Then o dialog fecha (comportamento Radix padrao)
And foco retorna ao botao "Start fresh"
```

**Cenario 14: Prevencao de duplo-click**
```
Given o usuario clicou "Keep my data" e o upload esta em progresso
When o usuario tenta clicar novamente
Then nada acontece (botao desabilitado)
And apenas uma chamada API foi feita
```

**Cenario 15: Regressao — store local intacto para guest**
```
Given o usuario nao esta autenticado (guest mode)
When o usuario usa o app normalmente (adicionar logs, ver historico)
Then o Zustand store funciona identicamente ao comportamento pre-migracao
And nenhum componente de migracao e carregado ou exibido
```
