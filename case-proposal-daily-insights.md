# Case Proposal: Daily Insights Card

## The Feature

Uma card de insights diários que sintetiza os dados de hidratação do dia em uma análise contextual e acionável. Não é só um resumo — é uma leitura inteligente do comportamento do usuário.

**Exemplos de insights que a card geraria:**
- "Você bebeu 1.6L hoje (80% da meta). A maior parte foi antes do meio-dia — considere hidratar mais à tarde."
- "Streak de 7 dias! Sua média subiu 15% em relação à semana passada."
- "Hoje foi seu melhor dia da semana — 2.3L. Padrão: você hidrata mais às segundas."
- "Você não registrou nada depois das 15h. Nos dias em que hidrata à tarde, sua meta é atingida 90% das vezes."

## Por Que Esse Case

- **Completamente novo** — não existe em nenhum lab, prototype ou implementação
- **Product thinking visível** — a audiência (heads e leads) vê decisões de produto acontecendo ao vivo: que dados mostrar? Que tom usar? Como evitar ser invasivo?
- **Tecnicamente interessante** — lógica de análise de dados, pattern matching no histórico, UX copy dinâmica
- **Visualmente rico** — a card em si é um componente bonito com dados, ícones, cores contextuais
- **Relatable** — todo mundo já viu "daily summaries" em apps (Spotify Wrapped, Apple Health, etc.)

## Thread Across Cases

### Case 1: Design Experiment (Prototipação com Guardrails)

**O que mostrar:**
- Prototipar a Daily Insights Card usando as ferramentas de prototipação (Claude Artifacts / Lovable / V0)
- Input: contexto do produto (warmup-project + warmup-tech) + descrição da feature
- Explorar variações:
  - Card minimalista vs. card com gráfico inline
  - Tom motivacional vs. tom analítico
  - Posicionamento: no topo do dashboard? abaixo do progress ring? como notificação?
- O protótipo já nasce com design system (shadcn/ui, Tailwind, cores do Hydra)

**Output visível:** 2-3 variações da card prototipadas em minutos, com discussão sobre trade-offs de UX

### Case 2: Scope Planning (Do experimento ao backlog)

**O que mostrar:**
- Usar o protótipo do Case 1 como referência visual
- Rodar `/initiative-start` para a feature "Daily Insights Card"
- Classificação provável: **Focused** (escopo claro, toca UI + lógica de dados + copy)
- Gerar user stories cobrindo:
  - Cálculo dos insights a partir dos dados existentes (DayRecord, history)
  - Renderização da card com dados dinâmicos
  - Definição do tom e das regras de copy
  - Posicionamento no dashboard
  - Fallback para dias sem dados suficientes
- Quebrar em tasks técnicas com DoR

**Output visível:** Iniciativa classificada, user stories com critérios de aceite, tasks com DoR

### Case 3 (Bonus): Feature Implementation

**O que mostrar:**
- Pegar uma task do Case 2 (ex: "implementar lógica de geração de insights a partir do HydrationState")
- Implementar no codebase do Hydra usando Claude Code
- A lógica consome dados já existentes no Zustand store (today, history, streak)
- Exemplo de implementação:

```typescript
// Insight generation from existing data
function generateInsights(state: HydrationState): Insight[] {
  const { today, history, currentStreak } = state
  const percentage = (today.totalMl / today.goalMl) * 100
  const morningIntakes = today.intakes.filter(i => getHour(i.timestamp) < 12)
  const afternoonIntakes = today.intakes.filter(i => getHour(i.timestamp) >= 12)
  // ... pattern detection, comparison with history
}
```

**Output visível:** Feature funcionando — a card aparece no dashboard com insights reais baseados nos dados do dia

## Dados Disponíveis para Insights

O Zustand store já tem tudo que precisamos:

| Dado | Onde | O que permite |
|---|---|---|
| `today.totalMl` | DayRecord | % da meta, comparação com dias anteriores |
| `today.intakes[]` | DayRecord | Distribuição ao longo do dia (manhã vs. tarde) |
| `today.goalMl` | DayRecord | Meta personalizada |
| `history[]` | HydrationState | Média semanal, tendências, melhor/pior dia |
| `currentStreak` | HydrationState | Mensagens de motivação por streak |
| `longestStreak` | HydrationState | Milestone detection |
| `settings.presets` | UserSettings | Volume preferido do usuário |

## Complexidade Estimada

- **Design Experiment:** ~10min (prototipar 2-3 variações)
- **Scope Planning:** ~15min (initiative → classification → user stories → tasks)
- **Implementation:** ~10min (insight logic + card component)
- **Total estimado para os 3 cases:** ~35min

## Riscos para o Demo

- A lógica de insights precisa de dados históricos — o lab MVP tem 14 dias de mock data, o que é suficiente
- Se a implementação travar, o output do Case 2 (user stories + tasks) já é valioso por si só
- O Case 3 é bonus — se não der tempo, os dois primeiros já contam a história completa

## Comparação com Reminders

| Critério | Reminders | Daily Insights |
|---|---|---|
| Visual impact | Médio (toggles, time pickers) | Alto (card com dados, cores, ícones) |
| Product thinking | Baixo (UX padrão) | Alto (que dados? que tom? que regras?) |
| Técnico | Médio-alto (Web Push API) | Médio (data analysis, pattern matching) |
| Implementação ao vivo | Mais complexo (permissions, service worker) | Mais viável (lógica pura + componente) |
| Relatable para audiência | Alto | Alto |
| Originalidade | Comum | Diferenciado |
| Risco no demo | Médio (APIs de permissão podem falhar) | Baixo (dados locais, sem dependência externa) |
