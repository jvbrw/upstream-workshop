## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes. Caso voce decida fazer alteracao, faca atraves do agente para que ela seja refletida em todas as secoes.**

- **Tarefa:** Verificar e ajustar Progress Ring (FE)
- **Objetivo:** Validar que o componente ProgressRing existente atende 100% dos criterios de aceite da US-004, corrigindo gaps pontuais se encontrados.
- **Topicos:**
  - Formatacao de volume em valores-limite (0ml, 999ml, 1000ml, 1050ml)
  - Tratamento de hydration mismatch SSR (transicao 0 para valor real)
  - Contraste WCAG AA do texto emerald-500 em light/dark mode
  - Validacao do header (data, streak badge) na page.tsx
- **Dependencias:** `components/dashboard/progress-ring.tsx`, `hooks/use-hydration-store.ts`, `app/page.tsx`
- **Validacao:** Formatacao correta em boundaries, sem flash de hydration, contraste AA verificado, anel reativo a logs

---

## Contexto Detalhado para Agentes

## Bloco 1: O Que? (Descricao)

### 1. Objetivo Tecnico Explicito

Verificar e, se necessario, ajustar o componente `ProgressRing` e a integracao na `TodayPage` para garantir conformidade total com os criterios de aceite da US-004 (Daily Progress Visualization). O componente ja esta ~98% implementado. Esta task foca em validacao de edge cases e correcoes pontuais.

### 2. Decomposicao em Cenarios

**Cenario A - Formatacao de volume em valores-limite**
O componente formata volumes usando logica condicional: `< 1000` exibe em ml, `>= 1000` exibe em L com 1 decimal. Verificar comportamento exato nos boundaries.

**Cenario B - Hydration mismatch SSR**
O Zustand com persist middleware rehydrata assincronamente do localStorage. O primeiro render server-side pode divergir do estado real, causando flash visual (0ml saltando para valor real). Verificar se o componente trata essa transicao de forma suave.

**Cenario C - Contraste WCAG AA do emerald-500**
Quando a meta e atingida, o texto central muda para `text-emerald-500`. Verificar se essa cor atende contraste AA (4.5:1 para texto normal) contra os backgrounds de light mode e dark mode definidos no theme.

**Cenario D - Validacao de integracao completa**
Confirmar que header (titulo "Today", data formatada, streak badge) e progress ring funcionam juntos conforme especificado na US-004.

### 3. Criterios de Aceite por Cenario

**Cenario A - Formatacao de volume:**
- `current = 0` -> exibe "0ml"
- `current = 500` -> exibe "500ml"
- `current = 999` -> exibe "999ml"
- `current = 1000` -> exibe "1L"
- `current = 1050` -> exibe "1.1L" (arredondamento: `Math.round(1050/100)/10 = 1.1`)
- `current = 2500` -> exibe "2.5L"
- No estado complete (>= goal), a formatacao usa `Math.round((current/1000)*10)/10` que produz resultado equivalente
- `aria-label` reflete os mesmos valores formatados

**Cenario B - Hydration mismatch:**
- O componente NAO deve causar hydration warning no console do Next.js
- Se o store inicia com 0 antes de rehydratar, a transicao visual de 0 para o valor real deve ser suave (via `motion-safe:transition-all duration-700`)
- Alternativa: verificar se o Zustand `onRehydrateStorage` callback pode ser usado para evitar render intermediario (escopo da US-002, mas verificar impacto aqui)

**Cenario C - Contraste WCAG AA:**
- `text-emerald-500` (oklch ~0.72 0.17 162) contra `bg-background` light mode: contraste >= 4.5:1
- `text-emerald-500` contra `bg-background` dark mode: contraste >= 4.5:1
- Se contraste insuficiente: ajustar para `emerald-600` (dark-on-light) ou `emerald-400` (light-on-dark) usando classe condicional `dark:`

**Cenario D - Integracao completa:**
- Header exibe "Today" como h1 (text-2xl, font-semibold) - JA IMPLEMENTADO
- Data formatada com weekday long, month short, day numeric - JA IMPLEMENTADO
- Streak badge com icone fogo laranja + "X day(s)" se streak > 0 - JA IMPLEMENTADO
- Progress ring recebe `todayTotal` e `dailyGoal` do Zustand store - JA IMPLEMENTADO
- Ring atualiza em tempo real ao adicionar log via quick log - JA IMPLEMENTADO

## Bloco 2: Como? (Implementacao)

### 4. Codigo de Referencia

**Arquivo principal: `components/dashboard/progress-ring.tsx`**

```tsx
// Logica de formatacao atual (estado normal):
{current >= 1000
  ? `${Math.round(current / 100) / 10}L`
  : `${current}ml`}

// Logica de formatacao atual (estado complete):
<span className="text-3xl font-bold text-emerald-500">
  {Math.round((current / 1000) * 10) / 10}L
</span>

// Animacao e transicao de cor:
className={`motion-safe:transition-all motion-safe:duration-700 ease-out ${
  isComplete ? "text-emerald-500" : "text-primary"
}`}
```

**Nota sobre formatacao no estado complete:** A logica do estado complete usa `Math.round((current/1000)*10)/10` enquanto o estado normal usa `Math.round(current/100)/10`. Ambas produzem resultados identicos matematicamente (`Math.round(x/100)/10 === Math.round(x*10/1000)/10`). Nao ha bug aqui.

**Integracao em `app/page.tsx`:**

```tsx
// Store selectors (linhas 26-31):
const todayTotal = useTodayTotal();
const dailyGoal = useHydrationStore((s) => s.dailyGoal);

// Ring render (linha 102):
<ProgressRing current={todayTotal} goal={dailyGoal} size={200} />
```

**Store com persist (`hooks/use-hydration-store.ts`):**

```tsx
export const useHydrationStore = create<HydrationState>()(
  persist(
    (set) => ({
      logs: [],
      dailyGoal: DEFAULT_GOAL,  // 2000
      // ...
    }),
    { name: STORAGE_KEY }  // "hydra-store"
  )
);
```

O estado inicial do store antes da rehydratacao e `logs: [], dailyGoal: 2000`. Isso significa que no primeiro render, `todayTotal = 0` e `dailyGoal = 2000`, resultando em ring vazio com "0ml of 2L". Apos rehydratacao do localStorage, o store atualiza e o ring re-renderiza com os valores reais.

### 5. Contratos e Estruturas de Dados

**Props do ProgressRing:**

```typescript
export type ProgressRingProps = {
  current: number;   // Volume consumido hoje em ml (0+)
  goal: number;      // Meta diaria em ml (ex: 2000)
  size?: number;     // Tamanho do SVG em px (default: 200)
  strokeWidth?: number; // Largura do stroke em px (default: 14)
};
```

**Dados derivados do store:**

```typescript
// useTodayTotal() -> number (soma de logs do dia atual em ml)
// useTodayLogs() -> HydrationLog[] (logs filtrados e ordenados)
// useStreak() -> number (dias consecutivos com meta atingida)

type HydrationLog = {
  id: string;
  amount: number;     // em ml
  timestamp: string;  // ISO 8601
};
```

### 6. Dependencias e Interacoes

**Componentes existentes que DEVEM ser mantidos (nao reescrever):**
- `components/dashboard/progress-ring.tsx` - Componente principal (verificar, ajustar se necessario)
- `components/dashboard/goal-celebration.tsx` - Overlay de celebracao (ja implementado, fora de escopo de ajuste)
- `app/page.tsx` - Pagina Today com header + ring + quick log (verificar integracao)

**Hooks/stores que DEVEM ser usados:**
- `hooks/use-hydration-store.ts` - Store Zustand com `useTodayTotal()`, `useStreak()`, `useHydrationStore()`

**Componentes UI (shadcn) em uso:**
- `Badge` - Para streak badge no header
- `Button` - Para quick log (fora de escopo direto desta task)

**Icons:**
- `RiFireLine` do `@remixicon/react` - Icone de fogo no streak badge

### 7. Requisitos Nao-Funcionais

**Performance:**
- SVG nao deve causar reflow/repaint excessivo. O `strokeDashoffset` via CSS transition e performatico (GPU-accelerated)
- Testar com 50 logs no dia: ring deve continuar responsivo

**Acessibilidade:**
- SVG com `aria-hidden="true"` - JA IMPLEMENTADO
- Container com `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label` - JA IMPLEMENTADO
- Verificar que `aria-label` formata corretamente os mesmos valores que o texto visual

**Animacao:**
- `motion-safe:transition-all motion-safe:duration-700 ease-out` - Respeita `prefers-reduced-motion`
- Sem animacao = atualizacao instantanea (conforme spec)

**UI Framework:** Tailwind CSS 4, shadcn/ui (Radix Maia, Cyan theme) - manter consistencia
**Formatadores:** ESLint 9 flat config com next/core-web-vitals + next/typescript

**Estrutura de arquivos:**
- Componentes dashboard em `components/dashboard/`
- Hooks em `hooks/`
- Nao mover nem renomear arquivos existentes

## Bloco 3: Como Validar? (Validacao)

### 8. Cenarios de Teste (BDD)

**Cenario: Formatacao de volume em ml para valores abaixo de 1000**

```gherkin
Dado que o usuario tem 500ml consumidos hoje
  E a meta diaria e 2000ml
Quando o progress ring e renderizado
Entao o texto central exibe "500ml"
  E abaixo exibe "of 2L"
  E o aria-label contem "500ml of 2L"
```

**Cenario: Formatacao de volume em L para valores a partir de 1000**

```gherkin
Dado que o usuario tem 1050ml consumidos hoje
  E a meta diaria e 2000ml
Quando o progress ring e renderizado
Entao o texto central exibe "1.1L"
  E abaixo exibe "of 2L"
```

**Cenario: Formatacao de volume zero**

```gherkin
Dado que o usuario nao tem logs hoje (0ml)
  E a meta diaria e 2000ml
Quando o progress ring e renderizado
Entao o texto central exibe "0ml"
  E abaixo exibe "of 2L"
  E o anel de progresso esta vazio (offset = circumference)
```

**Cenario: Formatacao no limite exato de 1000ml**

```gherkin
Dado que o usuario tem exatamente 1000ml consumidos
Quando o progress ring e renderizado
Entao o texto central exibe "1L"
  E nao exibe "1.0L" (arredondamento correto)
```

**Cenario: Meta atingida com transicao de cor**

```gherkin
Dado que o usuario tem 2000ml consumidos
  E a meta diaria e 2000ml
Quando o progress ring e renderizado
Entao o anel de progresso usa a classe "text-emerald-500"
  E o texto central exibe o volume em verde (text-emerald-500)
  E abaixo exibe "Goal reached!"
  E o aria-label contem "Goal reached"
```

**Cenario: Meta ultrapassada**

```gherkin
Dado que o usuario tem 2500ml consumidos
  E a meta diaria e 2000ml
Quando o progress ring e renderizado
Entao o anel fica 100% preenchido (progress clamped a 1)
  E o texto central exibe "2.5L" em verde
  E abaixo exibe "Goal reached!"
```

**Cenario: Anel atualiza em tempo real ao adicionar log**

```gherkin
Dado que o usuario tem 500ml consumidos
  E o progress ring exibe "500ml"
Quando o usuario adiciona um log de 300ml via quick log
Entao o progress ring atualiza para "800ml"
  E a animacao do anel ocorre em 700ms com ease-out
  E a transicao respeita prefers-reduced-motion
```

**Cenario: Hydration sem flash visual**

```gherkin
Dado que o usuario tem dados persistidos no localStorage (ex: 1200ml)
Quando a pagina e carregada pela primeira vez
Entao o progress ring nao deve exibir flash visivel de "0ml" para "1.2L"
  E nao deve haver warning de hydration mismatch no console
```

**Cenario: Contraste acessivel do texto emerald**

```gherkin
Dado que a meta foi atingida e o texto esta em emerald-500
Quando verificado em light mode
Entao o contraste texto-fundo e >= 4.5:1 (WCAG AA)
Quando verificado em dark mode
Entao o contraste texto-fundo e >= 4.5:1 (WCAG AA)
```

---

### Notas de Implementacao

**Esta e uma task de verificacao leve.** O componente ProgressRing ja esta bem implementado. As acoes esperadas sao:

1. **Verificar** formatacao nos boundaries listados - provavelmente tudo correto
2. **Verificar** se ha hydration warning no console ao carregar pagina com dados no localStorage
3. **Verificar** contraste do emerald-500 usando ferramenta de contraste (ex: WebAIM contrast checker com as cores oklch do theme)
4. **Corrigir** apenas se alguma verificacao falhar - ajustes pontuais, nao reescrita

Se todas as verificacoes passarem sem problemas, a task se resume a documentar que o componente esta conforme e fechar.
