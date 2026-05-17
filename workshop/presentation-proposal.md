# Presentation Proposal — LTS Workshop 13/02/2026

```yaml
---
title: "Upstream: A Próxima Fronteira"
subtitle: "Context Engineering na prática — do experimento ao código"
event: "Leading Tech Session - Workshop Prático"
date: "2026-02-13"
presenter: "JV"
audience: "Heads, leads e gestores (Tech & Product)"
format: "Slides + Live Demo (screen sharing no VSCode)"
estimated_slides: 25-30
estimated_duration: "~15-20min slides + ~40min live demos"
language: "Portuguese (BR)"
---
```

---

## Design Direction

**Visual language:** Clean, dark background, minimal text per slide. Pipeline/flow visuals with arrows. High contrast for key phrases.

**Typography:** Sans-serif, large headlines. One idea per slide. Quotes in large italic.

**Color palette suggestion:** Dark base (#0f0f0f), accent cyan/teal (matches Hydra's design system), white text, muted gray for secondary.

**Recurring visual motif:** The loop — Experiment → Structure → Implement — represented as a connected flow that appears progressively.

---

## Slide Deck

---

### SECTION 1: Opening (3 slides)

---

#### Slide 1 — Title

**Content:**
> **Upstream: A Próxima Fronteira**
>
> Context Engineering na prática — do experimento ao código

**Visual:** Title centered. Subtle flow graphic (3 connected nodes: Experiment → Structure → Implement) in the background, muted.

**Footer:** Leading Tech Session | 13 Fev 2026

---

#### Slide 2 — Recap: Where We Left Off

**Content:**
> Na última sessão, mostramos que **a matemática não fecha**.

| Dado | Valor |
|------|-------|
| Adoção de ferramentas IA | **88.3%** |
| Aceitação de PRs gerados por IA | **32.7%** |

> O problema não é a ferramenta. É como a empresa se organiza para usá-la.

**Visual:** Two large numbers side by side with strong visual contrast (88.3% in green, 32.7% in red/orange). Gap between them highlighted.

**Speaker notes:** "Na LTS de janeiro, mostramos os dados. A adoção é alta, mas a efetividade é baixa. Hoje vamos mostrar como fechar esse gap — começando pelo upstream."

---

#### Slide 3 — Today's Promise

**Content:**
> Hoje, vocês vão ver o loop completo acontecendo — ao vivo.

**Three columns:**
| Case 1 | Case 2 | Case 3 |
|--------|--------|--------|
| Design Experiment | Scope Planning | Implementation |
| Prototipar com guardrails | Do experimento ao backlog | Do backlog ao código |

> Tela compartilhada. Sem slides. Ao vivo.

**Visual:** Three connected cards/boxes with arrow flow between them. Highlight that this is hands-on.

**Speaker notes:** "Este não é um workshop de conceitos. Vocês vão ver cada etapa acontecendo na minha tela. Os slides que vocês vão ver agora são o contexto conceitual — depois disso, é tudo ao vivo."

---

### SECTION 2: The Market Signal (3 slides)

---

#### Slide 4 — The Signal

**Content:**
> A YC está procurando um **"Cursor for Product Managers"**.

**Visual:** YC logo or RFS reference. Clean, one statement.

**Speaker notes:** "A YC publicou recentemente um RFS — Request for Startups — pedindo explicitamente um Cursor for Product Managers. A tese do Andrew Miklas é simples: temos uma explosão de ferramentas de IA para escrever código. Cursor, Claude Code, Copilot. Mas escrever código é só uma parte."

---

#### Slide 5 — The Missing Piece

**Content:**
> "As agents increasingly take the first pass at implementation, the way we define and communicate **'what to build'** needs to change."
>
> — Andrew Miklas, YC

**Visual:** Quote slide. Large text. Emphasis on "what to build".

**Speaker notes:** "A parte mais importante é descobrir o que construir. E para isso, não existe ainda um sistema que suporte o loop completo de product discovery com IA. Depois de lidarmos com o delivery, o upstream é a próxima fronteira."

---

#### Slide 6 — After Delivery, What's Next?

**Content:**
> Resolvemos o delivery. Agora, **o upstream é a próxima fronteira**.

**Visual:** Simple timeline or arrow. "Delivery (solved)" on the left fading out, "Upstream (?)" on the right, highlighted and in focus.

**Speaker notes:** "Ferramentas de código com IA estão maduras. O gap real está no que acontece antes do código — na definição, na estruturação, na comunicação do que construir."

---

### SECTION 3: The PM Dilemma (3 slides)

---

#### Slide 7 — The Recurring Question

**Content:**
> O PM precisa ser técnico?

**Visual:** Large question, centered. No answer yet — let it breathe.

**Speaker notes:** "Existe uma conversa recorrente na comunidade de produto. O PM precisa ser técnico? Precisa saber codar? A resposta está mudando. E talvez a pergunta já não faça sentido."

---

#### Slide 8 — The Reframe

**Content:**
> "It was never about the code."
>
> — o16g, Outcome Engineering Manifesto

Se agentes fazem o código, o que sobra para o time humano?

> **Orquestrar outcomes.**

**Visual:** Quote at top, then the punchline below. Strong visual hierarchy.

**Speaker notes:** "O manifesto o16g propõe uma provocação direta. Se agentes fazem o código, o que sobra? Orquestrar outcomes. O papel do PM não é ser técnico ou não-técnico — é ser o engenheiro de contexto que garante que a intenção se traduz em resultado verificável."

---

#### Slide 9 — The New Role

**Content:**
Three reframes, stacked:

| Não é sobre... | É sobre... |
|---|---|
| Escrever PRDs perfeitos | Estruturar contexto que agentes e humanos consumam |
| Saber codar | Entender o suficiente para orquestrar o fluxo |
| Controlar o backlog | Garantir que o outcome certo recebe investimento |

> "Manage to cost, not capacity." — o16g

**Visual:** Two-column layout. Left column muted/crossed out, right column highlighted.

**Speaker notes:** "Quando agentes eliminam a restrição de bandwidth, o backlog como conhecemos morre. O que importa é: esse outcome justifica o investimento? Tempo, tokens, atenção — são os novos custos."

---

### SECTION 4: What is Upstream (4 slides)

---

#### Slide 10 — Defining Upstream

**Content:**
> **Upstream**: tudo que acontece antes do desenvolvimento.

Discovery. Pré-discovery. Ideação. Conceituação. O primeiro diamante.

> É exatamente o espaço que a YC quer ver transformado.

**Visual:** Double diamond diagram (Design Thinking). First diamond highlighted, second diamond faded. Arrow pointing to the first diamond: "Upstream".

**Speaker notes:** "Podemos chamar de discovery, de pré-discovery, mas é aquela fase de ideação-conceituação — o primeiro diamante do Design Thinking. E é exatamente aí que as coisas dão errado."

---

#### Slide 11 — Why It Breaks

**Content:**
> Por que o upstream trava:

- Sem padrão — cada time faz diferente
- Conhecimento em silos — produto, design, tech desconectados
- Ruído vira retrabalho
- Ferramentas atuais focam no processo operacional de hoje, não no futuro

**Visual:** Broken pipeline graphic. Disconnected nodes representing silos.

**Speaker notes:** "O cenário atual tem ferramentas muito específicas, que ainda que excelentes, são focadas no processo operacional que existe hoje. Falta imaginarmos o futuro. Que tipo de ferramenta e fluxo precisamos para essa interação humano + AI?"

---

#### Slide 12 — The Three Layers

**Content:**
Three stacked layers:

```
┌─────────────────────────────────────────────┐
│  Pré-demanda (estratégico)                  │
│  "O que queremos alcançar?"                 │
├─────────────────────────────────────────────┤
│  Demanda definida (tático)                  │
│  "O que vamos construir?"                   │
├─────────────────────────────────────────────┤
│  Demanda detalhada (operacional)            │
│  "Como vamos construir?"                    │
└─────────────────────────────────────────────┘
```

**Visual:** Three horizontal layers, stacked. Each with label and question. Arrow flowing top to bottom.

**Speaker notes:** "Pré-demanda é estratégico — o que queremos alcançar. Demanda definida é tático — o que vamos construir. Demanda detalhada é operacional — como vamos construir. Os 3 cases que vamos demonstrar tocam nessas 3 camadas."

---

#### Slide 13 — The Craft Tension

**Content:**
> O Modelo T chega ao Vale do Silício

| Craft de Processos | Craft de Produtos |
|---|---|
| Eficiência, escala, padronização | Criatividade, experimentação, discovery |

> Não precisamos escolher um lado.

**Visual:** Two circles overlapping (Venn diagram style). Intersection highlighted.

**Speaker notes:** "Existe uma tensão real entre eficiência operacional e criatividade de produto. A boa notícia é que não precisamos escolher. O upstream bem estruturado permite os dois."

---

### SECTION 5: Context Engineering (3 slides)

---

#### Slide 14 — The Critical Skill

**Content:**
> **Context Engineering**
>
> A skill crítica para usar IA com qualidade.

**Visual:** Large title, centered. Let it land.

**Speaker notes:** "Se o PM do futuro é um engenheiro de contexto, o que isso significa na prática?"

---

#### Slide 15 — Context is the New Code

**Content:**
> **Context is the new code.**

- A qualidade do output depende da qualidade do input estruturado
- Não basta ter a informação — precisa estar organizada
- O "warmup" é o environment setup do agente

```
Contexto Estruturado → [ Protótipo | Backlog | Código ]
```

> Mesmo input, diferentes outputs.

**Visual:** One input (structured context) branching into three outputs. Flow diagram.

**Speaker notes:** "Context is the new code. A qualidade do output — de um agente, de um protótipo, de um backlog — depende da qualidade do input estruturado. O warmup que preparamos é o equivalente ao environment setup de um agente de IA. É isso que vamos demonstrar: contexto estruturado alimentando experimentos, escopo, e implementação."

---

#### Slide 16 — Transition to Practice

**Content:**
> Agora que entendemos o problema e o papel do contexto, **vamos ver na prática**.

**Visual:** Clean transition slide. Arrow pointing forward. Maybe a terminal/code icon hinting at what's coming.

**Speaker notes:** "Chega de conceito. Vamos ver isso funcionando."

---

### SECTION 6: Introducing the Case (2 slides)

---

#### Slide 17 — Meet Hydra

**Content:**
> **Hydra** — Daily Hydration Tracker

App mobile-first para rastreamento de hidratação diária.

| | |
|---|---|
| Domínio | Beber água. Meta diária. Streaks. |
| Stack | Next.js, TypeScript, Tailwind, shadcn/ui |
| Abordagem | Local-first, sem backend no MVP |

> Propositalmente simples. O ponto é o processo, não o produto.

**Visual:** Screenshot or mockup of the Hydra app (progress ring, today view). Clean, showing the product is real.

**Speaker notes:** "Para demonstrar o loop completo, vamos usar um produto propositalmente simples: Hydra. Todo mundo entende o domínio — beber água, meta diária, streaks. Simples o suficiente para rodar o fluxo inteiro em uma sessão. Complexo o suficiente para decisões reais."

---

#### Slide 18 — The Structured Context

**Content:**
> O contexto que preparamos:

| Arquivo | O que contém |
|---|---|
| `warmup-project.md` | Visão, personas, features, métricas, constraints |
| `warmup-tech.md` | Stack, arquitetura, data model, padrões, design system |

> Esse contexto alimenta **todos** os cases.

```
warmup-project.md ─┐
                    ├─→ Case 1 (Prototype)
                    ├─→ Case 2 (Scope)
warmup-tech.md ────┘    └─→ Case 3 (Code)
```

**Visual:** Two documents flowing into the three cases. Tree diagram.

**Speaker notes:** "Antes de começar, preparamos dois arquivos de contexto estruturado. O warmup-project com visão de produto, e o warmup-tech com contexto técnico. Esse mesmo input vai gerar três outputs diferentes. Vamos ver."

---

### SECTION 7: Case Overviews (3 slides — brief, before going live)

---

#### Slide 19 — Case 1: Design Experiments

**Content:**
> **Case 1: Design Experiments**
> Prototipação rápida com guardrails de produto

**O problema:** Ferramentas de prototipação geram output bonito, mas desconectado do produto real. Handoff para dev vira fricção.

**O que vamos fazer:** Prototipar uma feature nova (Daily Insights Card) com contexto estruturado — design system real, padrões técnicos, visão de produto.

> Experimente rápido, mas com contexto.

**Visual:** Before/after. Left: "Protótipo solto" (disconnected). Right: "Protótipo com guardrails" (connected to product context).

**Speaker notes:** "Primeiro case. Vamos prototipar a Daily Insights Card — uma feature que não existe ainda no Hydra. Mas ao invés de prototipar no vácuo, vamos injetar contexto estruturado. O protótipo já nasce alinhado com o design system e padrões do projeto."

---

#### Slide 20 — Case 2: Scope Planning

**Content:**
> **Case 2: Scope Planning**
> Do experimento ao backlog estruturado

**O problema:** A transição de "ideia aprovada" para "time pronto para executar" é caótica. Sem contexto, cada prompt vira tiro no escuro.

**O que vamos fazer:** Transformar o protótipo do Case 1 em User Stories com critérios de aceite e tasks técnicas com DoR.

> IA propõe, PM aprova.

**Visual:** Pipeline: Prototype → Initiative → Classification → User Stories → Tasks (DoR)

**Speaker notes:** "Segundo case. Pegamos o protótipo e transformamos em escopo executável. Iniciativa classificada, user stories geradas, tasks técnicas com DoR. O contexto estruturado garante que a IA gera com qualidade. Cada etapa tem validação humana."

---

#### Slide 21 — Case 3: Implementation (Bonus)

**Content:**
> **Case 3 (Bonus): Feature Implementation**
> Do backlog ao código com IA

**O que vamos fazer:** Pegar uma task do Case 2 e implementar ao vivo no codebase do Hydra.

> O mesmo contexto que nasceu no upstream chega no código.

**Visual:** The full loop completed: Experiment → Structure → Implement → (arrow back to experiment). Loop closes.

**Speaker notes:** "Se der tempo, o bonus. Pegamos uma task gerada no Case 2 e implementamos ao vivo. O ponto aqui é: o mesmo contexto estruturado alimenta todo o ciclo. Da ideia ao código, com rastreabilidade."

---

#### Slide 22 — Let's Go

**Content:**
> Vamos para a tela.

**Visual:** Minimal. Terminal cursor blinking. Or VSCode icon. Signals transition to live demo.

**Speaker notes:** "A partir de agora, tudo ao vivo." [Switch to screen share]

---

### SECTION 8: Closing (after demos — 3-4 slides)

---

#### Slide 23 — The Complete Loop

**Content:**
> O loop completo:

```
Experimentar com contexto
        ↓
Estruturar com consistência
        ↓
Implementar com rastreabilidade
        ↓
Mapear onde trava e ajustar antes de escalar
```

**Visual:** Vertical flow with checkmarks on each step. Clean, conclusive.

**Speaker notes:** "O que vocês viram hoje é o loop completo. Não é teoria — vocês viram acontecendo. Experimentar com contexto, estruturar com consistência, implementar com rastreabilidade. E o passo mais importante: mapear onde trava e ajustar antes de tentar escalar."

---

#### Slide 24 — Key Takeaways

**Content:**
> O que levar daqui:

1. **Context is the new code** — invista em estruturar antes de escalar
2. **Guardrails aceleram** — constraints não limitam, convergem
3. **IA como copiloto consistente** — do upstream ao código, não ferramenta pontual
4. **O upstream é a próxima fronteira** — e já dá para começar

**Visual:** Four numbered items, clean layout. Each with an icon or accent color.

**Speaker notes:** "Quatro coisas para levar. Primeiro: contexto é o novo código. Segundo: guardrails não limitam, aceleram. Terceiro: IA funciona melhor como copiloto consistente do que como ferramenta pontual. Quarto: o upstream é a próxima fronteira — e como vocês viram, já dá para começar."

---

#### Slide 25 — The Comparison

**Content:**
| LTS Anterior (30/01) | Este Workshop (13/02) |
|---|---|
| Mostrou **O QUÊ** aprendemos | Ensinou **COMO** estruturar |
| Formato: palestra | Formato: hands-on |
| Conceitos e dados | Ferramentas e fluxos ao vivo |
| "A matemática não fecha" | "Como fazer a matemática fechar no upstream" |

**Visual:** Two-column comparison table. Left muted, right highlighted.

**Speaker notes:** "Na última sessão, mostramos o quê. Hoje, mostramos como. Da próxima vez, vamos falar sobre escalar isso."

---

#### Slide 26 — Close

**Content:**
> **"Context is the new code — estruture antes de escalar."**

**Visual:** Central quote. Large. Brand colors. Clean exit.

**Speaker notes:** "Obrigado. Perguntas?"

---

## Appendix: Backup Slides (if needed during Q&A)

---

#### Backup A — Three Scope Planning Scenarios

| Cenário | Descrição |
|---|---|
| **Novo Produto** | "Sei o que quero construir, preciso transformar em backlog sólido" |
| **Evolução** | "Sei o que precisa mudar, mas falta clareza para executar bem" |
| **Rebuild** | "Meu produto está limitado por decisões passadas, preciso planejar a reestruturação" |

---

#### Backup B — Hydra Data Model

| Dado | Onde | O que permite |
|---|---|---|
| `today.totalMl` | DayRecord | % da meta, comparação com dias anteriores |
| `today.intakes[]` | DayRecord | Distribuição ao longo do dia |
| `history[]` | HydrationState | Média semanal, tendências |
| `currentStreak` | HydrationState | Mensagens de motivação |
| `settings.presets` | UserSettings | Volume preferido |

---

#### Backup C — What the Framework Does

| Comando | Resultado |
|---|---|
| `/warmup` | Gera contexto estruturado (produto + técnico + projeto) |
| `/initiative-start` | Classifica iniciativa, gera user stories |
| `/refinement` | Quebra US em tasks técnicas com DoR |
| `/implement` | Implementa task no codebase |
| `/prototype` | Gera protótipo experimental no /lab |

---

## Production Notes

- **Total slides:** ~26 (+ 3 backup)
- **Slides portion:** ~15-20min (keep tight, the demos are the star)
- **Transition to demos:** Slide 22 is the handoff — switch to VSCode screen share
- **Return to slides:** After demos, come back for slides 23-26 (closing)
- **Backup slides:** Available if Q&A goes into specifics about the framework, data model, or scenarios

---
