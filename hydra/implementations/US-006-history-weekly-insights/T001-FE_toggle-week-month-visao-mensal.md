# T001-FE: Adicionar toggle Week/Month e visao mensal

- **Task ID:** T001-FE
- **Tipo:** Frontend
- **User Story:** US-006 - History & Weekly Insights
- **Prioridade:** Alta
- **Dependencias:** Nenhuma (pagina History ja existe parcialmente implementada)

---

## 🧑‍💼 Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes. Caso voce decida fazer alteracao, faca atraves do agente para que ela seja refletida em todas as secoes.**

- **Tarefa:** T001-FE - Adicionar toggle Week/Month e visao mensal (Frontend)
- **Objetivo:** Completar a pagina History com toggle de periodo e heat map mensal de 30 dias, removendo elementos fora de escopo MVP
- **Topicos:**
  - Toggle segmented control Week/Month com estado local
  - Heat map mensal (grid 7 colunas x 5 linhas) com intensidade proporcional
  - Subtitulo dinamico conforme periodo selecionado
  - Remocao do card share CTA (escopo Phase 3)
  - Adaptacao do overview 14 dias para coexistir com visao mensal
- **Dependencias:** `useHydrationStore` (logs, dailyGoal), componentes shadcn/ui (Card, Button)
- **Validacao:**
  - Toggle alterna entre Week e Month corretamente
  - Heat map mensal renderiza 30 dias com cores proporcionais
  - Subtitulo muda dinamicamente
  - Card share CTA removido
  - Empty state funciona para ambas as visoes

---

## 🤖 Contexto Detalhado para Agentes

---

## 1. O Que? (Descricao)

### 1.1 Objetivo Tecnico Explicito

Evoluir a pagina History (`app/history/page.tsx`) adicionando:
1. Um toggle Week/Month como segmented control no topo da pagina
2. Uma visao mensal com heat map de 30 dias (calendario grid)
3. Subtitulo dinamico que reflete o periodo selecionado
4. Remocao do card "Weekly Recap" share CTA (Phase 3)
5. Condicionar a exibicao da secao "Last 14 days" apenas na visao Week (ou remove-la se Month estiver ativo, pois o heat map mensal a substitui)

### 1.2 Decomposicao em Cenarios

**Cenario A: Toggle Week/Month**
- Renderizar um segmented control (dois botoes estilizados) logo abaixo do titulo "History"
- Estado local via `useState<"week" | "month">("week")`
- Default: "Week"
- Ao clicar em "Month", a visao muda para heat map mensal
- Ao clicar em "Week", volta para chart semanal
- Subtitulo muda: "Last 7 days" / "Last 30 days"

**Cenario B: Visao Mensal - Heat Map 30 dias**
- Grid de 30 celulas representando os ultimos 30 dias
- Layout: 7 colunas (S, M, T, W, T, F, S) com padding de celulas vazias no inicio para alinhar com dia da semana correto
- Cada celula mostra o numero do dia do mes
- Cores/opacidade:
  - Sem dados: `bg-muted text-muted-foreground` com `opacity: 0.5`
  - Parcial: `bg-primary/10 text-primary` com `opacity: 0.4 + intensity * 0.6`
  - Meta atingida: `bg-emerald-500/20 text-emerald-600` com `opacity: 0.4 + intensity * 0.6`
- Labels de dia da semana (S, M, T, W, T, F, S) no topo do grid
- Tooltip (`title` attribute) com data completa e total em ml

**Cenario C: Adaptacao do layout existente**
- Secao "Last 14 days" (linhas 230-276): ocultar quando Month esta ativo (redundante com heat map mensal)
- Remover completamente o card "Weekly Recap" share CTA (linhas 278-296) - escopo Phase 3
- Remover import do `RiShareLine` e `Link` (se nao usados em mais nada)
- Stats cards permanecem sempre visiveis (calculados sobre historico total, independente do toggle)

**Cenario D: Empty state**
- O empty state existente (linhas 100-108) ja cobre ambas as visoes - manter como esta

### 1.3 Criterios de Aceite por Cenario

**Cenario A:**
- [ ] Toggle renderiza com visual de segmented control (dois botoes lado a lado, ativo destacado)
- [ ] Estado default e "Week"
- [ ] Clicar em "Month" alterna a visao
- [ ] Subtitulo muda para "Last 30 days" no modo Month

**Cenario B:**
- [ ] Grid renderiza exatamente os ultimos 30 dias
- [ ] Celulas vazias (padding) no inicio alinham com dia da semana correto
- [ ] Labels S, M, T, W, T, F, S no topo do grid
- [ ] Cores seguem a escala definida (muted / primary / emerald)
- [ ] Intensidade visual proporcional a `total / dailyGoal`
- [ ] Tooltip com data e total ao hover/touch

**Cenario C:**
- [ ] Secao "Last 14 days" oculta quando Month ativo
- [ ] Card share CTA completamente removido do codigo
- [ ] Import `RiShareLine` removido
- [ ] Import `Link` de `next/link` removido (se nao usado em mais nada)
- [ ] Stats cards visiveis em ambos os modos

**Cenario D:**
- [ ] Empty state exibido quando `logs.length === 0` em qualquer modo

---

## 2. Como? (Implementacao)

### 2.1 Codigo de Referencia

**Arquivo principal a modificar:**
`app/history/page.tsx`

**Referencia para o heat map - grid existente de 14 dias (linhas 236-273):**

```tsx
// Referencia: app/history/page.tsx linhas 236-273
// Este pattern sera estendido para 30 dias com labels de semana
<div className="grid grid-cols-7 gap-2">
  {Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const dayTotal = logs
      .filter((log) => {
        const t = new Date(log.timestamp);
        return t >= date && t < nextDay;
      })
      .reduce((sum, log) => sum + log.amount, 0);

    const intensity = Math.min(dayTotal / dailyGoal, 1);
    const hitGoal = dayTotal >= dailyGoal;

    return (
      <div
        key={i}
        className={`flex aspect-square items-center justify-center rounded-lg text-[10px] font-medium ${
          hitGoal
            ? "bg-emerald-500/20 text-emerald-600"
            : intensity > 0
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
        }`}
        style={{
          opacity: intensity > 0 ? 0.4 + intensity * 0.6 : 0.5,
        }}
        title={`${date.toLocaleDateString()}: ${dayTotal}ml`}
      >
        {date.getDate()}
      </div>
    );
  })}
</div>
```

**Referencia para segmented control - pattern com Button existente:**

```tsx
// Referencia: components/ui/button.tsx
// Usar variant "ghost" + "default" para toggle ativo/inativo
// Ou construir segmented control customizado com Tailwind
import { Button } from "@/components/ui/button";

// Pattern sugerido para o toggle:
<div className="flex rounded-full bg-muted p-1">
  <button
    className={cn(
      "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
      period === "week"
        ? "bg-background text-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground"
    )}
    onClick={() => setPeriod("week")}
  >
    Week
  </button>
  <button
    className={cn(
      "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
      period === "month"
        ? "bg-background text-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground"
    )}
    onClick={() => setPeriod("month")}
  >
    Month
  </button>
</div>
```

### 2.2 Contratos e Estruturas de Dados

**Estado local do toggle:**

```typescript
type Period = "week" | "month";
const [period, setPeriod] = useState<Period>("week");
```

**Tipo DaySummary existente (reutilizar):**

```typescript
type DaySummary = {
  date: Date;
  label: string;
  shortLabel: string;
  total: number;
  hitGoal: boolean;
};
```

**Nova funcao helper `getLast30Days`:**

```typescript
type MonthDaySummary = {
  date: Date;
  dayOfMonth: number;
  total: number;
  hitGoal: boolean;
  intensity: number; // 0-1, clamped
  isPadding: boolean; // true para celulas de padding (dias anteriores ao range)
};

function getLast30Days(
  logs: { timestamp: string; amount: number }[],
  dailyGoal: number
): { days: MonthDaySummary[]; paddingBefore: number } {
  // Retorna os ultimos 30 dias + padding para alinhar grid com dia da semana
  // paddingBefore: numero de celulas vazias antes do primeiro dia
}
```

**Store (somente leitura - sem alteracoes):**

```typescript
// hooks/use-hydration-store.ts - tipos relevantes
type HydrationLog = { id: string; amount: number; timestamp: string };
// Seletores usados:
const logs = useHydrationStore((s) => s.logs);
const dailyGoal = useHydrationStore((s) => s.dailyGoal);
```

### 2.3 Dependencias e Interacoes

**Componentes existentes que DEVEM ser reutilizados:**
- `@/components/ui/card` (Card, CardContent, CardHeader, CardTitle) - `components/ui/card.tsx`
- `@/hooks/use-hydration-store` (useHydrationStore) - `hooks/use-hydration-store.ts`
- `@/lib/utils` (cn) - `lib/utils.ts`

**Imports a REMOVER:**
- `Link` de `next/link` (apenas usado no CTA share que sera removido)
- `Button` de `@/components/ui/button` (apenas usado no CTA share)
- `RiShareLine` de `@remixicon/react` (apenas usado no CTA share)

**Patterns de codigo que DEVEM ser seguidos:**
- Componente "use client" (ja esta)
- Helper functions no topo do arquivo (pattern existente: `getLast7Days`, `getStats`)
- Tailwind classes inline com template literals para condicionais
- `motion-safe:` prefix para animacoes (pattern existente nas barras)
- `cn()` para composicao de classes quando necessario
- Opacidade via `style` prop (pattern existente no grid de 14 dias)

**Componentes NAO existentes (nao ha tabs/toggle no shadcn/ui deste projeto):**
- Nao existe `components/ui/tabs.tsx` - construir segmented control inline com Tailwind
- Nao existe `components/ui/toggle.tsx` - idem

### 2.4 Requisitos Nao-Funcionais

- **Performance:** Heat map de 30 dias filtra logs por dia. Com 200+ logs, o filtro deve ser eficiente. Considerar pre-computar um `Map<string, number>` (dayKey -> total) similar ao `getStats` existente, em vez de filtrar logs 30 vezes.
- **Responsividade:** Grid de 7 colunas deve funcionar em viewports de 320px a 448px. Celulas aspect-square com gap-1.5 ou gap-2. Testar que nao transborda.
- **Acessibilidade:** Toggle deve ter `aria-pressed` ou similar para screen readers. Celulas do heat map devem ter `title` descritivo.
- **Animacoes:** Transicao suave ao alternar entre Week e Month. Usar `motion-safe:transition-all` para respeitar `prefers-reduced-motion`.
- **UI Framework:** Tailwind CSS 4 + shadcn/ui - OBRIGATORIO usar
- **Sem bibliotecas de graficos:** CSS/HTML puro (requisito da US)
- **Estrutura de arquivos:** Manter tudo em `app/history/page.tsx` (single file, pattern atual do projeto)

---

## 3. Como Validar? (Validacao)

### 3.1 Cenarios de Teste (BDD)

**Cenario 1: Toggle renderiza e alterna entre Week e Month**

```gherkin
Given o usuario esta na pagina History com dados de hidratacao
When a pagina carrega
Then o toggle Week/Month e exibido
And "Week" esta selecionado por default
And o subtitulo mostra "Last 7 days"
And o chart semanal de barras e exibido

When o usuario clica em "Month"
Then "Month" fica visualmente selecionado
And o subtitulo muda para "Last 30 days"
And o heat map mensal de 30 dias e exibido
And o chart semanal e ocultado
And a secao "Last 14 days" e ocultada

When o usuario clica em "Week"
Then "Week" fica visualmente selecionado
And o subtitulo volta para "Last 7 days"
And o chart semanal e exibido novamente
```

**Cenario 2: Heat map mensal renderiza corretamente com dados**

```gherkin
Given o usuario esta na pagina History no modo "Month"
And existem logs de hidratacao nos ultimos 30 dias
When o heat map e renderizado
Then exibe labels de semana (S, M, T, W, T, F, S) no topo
And exibe grid com celulas para os ultimos 30 dias
And celulas de padding (para alinhar dia da semana) ficam invisiveis ou vazias
And dias com meta atingida tem fundo emerald com alta opacidade
And dias com consumo parcial tem fundo primary com opacidade proporcional
And dias sem dados tem fundo muted com opacidade reduzida
And cada celula mostra o numero do dia do mes
And ao passar mouse em uma celula, o tooltip mostra data e total em ml
```

**Cenario 3: Heat map com usuario novo (sem dados)**

```gherkin
Given o usuario esta na pagina History
And nao existem logs de hidratacao
When a pagina carrega
Then o empty state e exibido ("No history yet")
And o toggle nao e exibido (empty state substitui tudo)
```

**Cenario 4: Stats cards permanecem independentes do toggle**

```gherkin
Given o usuario esta na pagina History com dados
When o usuario esta no modo "Week"
Then os stats cards (Avg daily, Best streak, Goal rate) sao exibidos

When o usuario troca para "Month"
Then os mesmos stats cards continuam exibidos
And os valores nao mudam (calculados sobre historico total)
```

**Cenario 5: Card share CTA removido**

```gherkin
Given o usuario esta na pagina History
When a pagina carrega
Then nao existe card "Weekly Recap" com botao "Share"
And nao existe link para /social na pagina
```

**Cenario 6: Dia com consumo acima da meta (150%)**

```gherkin
Given o usuario tem um dia com consumo de 3000ml
And a meta diaria e 2000ml
When o heat map mensal e exibido
Then a celula desse dia aparece com cor emerald (meta atingida)
And a intensidade e clamped em 1.0 (nao ultrapassa 100% de opacidade)
```

**Cenario 7: Primeiro uso com poucos dias de dados**

```gherkin
Given o usuario tem apenas 3 dias de logs (dias recentes)
When o heat map mensal e exibido
Then os 3 dias recentes tem cor/opacidade proporcionais
And os demais 27 dias aparecem com fundo muted
And os stats sao calculados sobre os 3 dias com dados
```

**Cenario 8: Responsividade em viewport estreito**

```gherkin
Given o usuario esta em um dispositivo com largura 320px
When o heat map mensal e exibido
Then as celulas do grid nao transbordam o container
And o toggle permanece legivel e clicavel
And as barras do chart semanal nao transbordam
```

### 3.2 Testes Regressivos (da US)

- US-001: Aba History no bottom-nav (`components/layout/bottom-nav.tsx`) continua levando a `/history`
- US-002: Dados vem do store Zustand persistido (`useHydrationStore`), nao de mock data
- US-003: Logs adicionados na pagina Today devem refletir ao navegar para History (reatividade do store)
- US-005: "Best streak" nos stats deve ser consistente com streak calculado no store

### 3.3 Criterios de Qualidade

- Calculos de intensidade e totais corretos
- Renderizacao fluida sem jank (< 16ms frame time com 200+ logs)
- Layout responsivo em 320px-448px
- Cores e opacidades consistentes com o chart semanal existente
- Toggle funcional em touch devices
