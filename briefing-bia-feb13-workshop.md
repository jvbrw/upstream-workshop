# Briefing para Landing Page - Workshop 13/02/2026

```yaml
---
title: "Briefing - Workshop 13/02/2026"
event_type: "Workshop (hands-on)"
date: "2026-02-13"
time: "11:00"
timezone: "BRT"
target_audience: "Heads, leads e gestores (Tech & Product)"
from: "JV"
to: "Marketing"
created: "2026-02-03"
event_name: "Leading Tech Session - Workshop Prático"
---
```

---

## Informações do Evento

| Campo       | Valor                                    |
| ----------- | ---------------------------------------- |
| **Data**    | 13 de fevereiro de 2026                  |
| **Horário** | 11h (BRT)                                |
| **Formato** | Workshop (hands-on), não palestra        |
| **Público** | Heads, leads e gestores (Tech & Product) |

---

## Contexto Narrativo

Este workshop é a **continuação prática** da LTS de 30 de janeiro, onde mostramos que "a matemática não fecha" quando empresas usam ferramentas de IA sem estrutura.

**O que a sessão anterior mostrou:**
- 88.3% de adoção de IA vs apenas 32.7% de aceitação de PRs gerados por IA
- O problema não é a ferramenta, é como a empresa se organiza para usá-la
- Context Engineering é a skill crítica que separa sucesso de fracasso

**O que esta sessão ensina:**
- Como prototipar com guardrails — experimentos rápidos que dev consegue aproveitar
- Como conectar o experimento a um backlog estruturado com User Stories e tasks técnicas
- O conceito de "Context Engineering" — estruturar contexto para que IA entregue com qualidade
- Como fechar o loop: do experimento à implementação real com IA

---

## Estrutura do Workshop

### Bloco 1: Definindo conceitos — O upstream como a próxima fronteira

**Abertura: O sinal que o mercado está dando**

A YC publicou recentemente um RFS (Request for Startups) pedindo um "Cursor for Product Managers" — a tese do Andrew Miklas é direta: temos uma explosão de ferramentas de IA para escrever código (Cursor, Claude Code), mas escrever código é só uma parte. A parte mais importante é **descobrir o que construir**. E para isso, não existe ainda um sistema que suporte o loop completo de product discovery.

> "As agents increasingly take the first pass at implementation, the way we define and communicate 'what to build' needs to change." — Andrew Miklas, YC

Tem alguma coisa aqui. Depois de lidarmos com o delivery, agora **o upstream é a próxima fronteira**.

**O dilema do PM: técnico ou não-técnico?**

Existe uma conversa recorrente na comunidade de produto: o PM precisa ser técnico? Precisa saber codar? A resposta está mudando — e talvez a pergunta já não faça sentido.

O manifesto o16g (Outcome Engineering) propõe uma provocação: "It was never about the code." Se agentes fazem o código, o que sobra para o time humano? **Orquestrar outcomes.** O papel do PM não é ser técnico ou não-técnico — é ser o **engenheiro de contexto** que garante que a intenção se traduz em resultado verificável. Pode (e IMHO, deve) ser um esforço compartilhado de pessoas técnicas + de negócio, mas em um cenário em que as fronteiras são arranhadas e mais permeáveis, o nosso papel generalista precisa aflorar mais. E no fim do dia, não é o PM que garante que a iniciativa está entregando o resultado correto? 

- Não é sobre escrever PRDs perfeitos → é sobre estruturar contexto que agentes e humanos conseguem consumir
- Não é sobre saber codar → é sobre entender o suficiente para orquestrar o fluxo (e entender como as coisas funcionam)
- Não é sobre controlar o backlog → é sobre garantir que o outcome certo recebe investimento que garanta ROI (tempo, tokens, atenção)

O o16g resume: "Manage to cost, not capacity." Quando agentes eliminam a restrição de bandwidth, o backlog como conhecemos morre. O que importa é: **esse outcome justifica o investimento?**

**O que é upstream e por que importa agora**

- O Modelo T chega ao vale do silício: Craft de processos x Craft de produtos (não necessariamente precisamos escolher um lado)
- O que é upstream: tudo que acontece antes do desenvolvimento (podemos chamar de discovery, de pré-discovery) mas é aquela fase de ideação-conceituação (o primeiro diamante do Design Thinking) — e é exatamente o espaço que a YC quer ver transformado
- Por que dá errado: sem padrão, conhecimento e processos em silos, vira ruído e retrabalho
- O cenário atual tem ferramentas muito específicas para isso, que ainda que excelentes e bem intencionadas, são focadas no processo operacional que existe hoje. Falta imaginarmos o futuro. Que tipo de ferramenta/fluxo precisamos para essa interação humano + AI? 
- As 3 camadas: Pré-demanda (estratégico) → Demanda definida (tático) → Demanda detalhada (operacional)

**Context Engineering como a skill crítica**

Se o PM do futuro é um engenheiro de contexto, o que isso significa na prática?

- **Context is the new code** — a qualidade do output (de um agente, de um protótipo, de um backlog) depende da qualidade do input estruturado
- Não basta ter a informação — precisa estar organizada de forma que humanos e agentes consumam
- O warmup (contexto de projeto + contexto técnico + contexto de produto) é o equivalente ao "environment setup" do agente
- É isso que vamos demonstrar nos cases a seguir: contexto estruturado alimentando experimentos, escopo e quem sabe, implementação

**Gancho para os cases:**
"Agora que entendemos o problema e o papel do contexto, vamos ver na prática."

---

### Apresentando o Case: Hydra — Daily Hydration Tracker

Para demonstrar o loop completo, vamos usar um produto propositalmente simples: **Hydra**, um app mobile-first de rastreamento de hidratação diária.

**Por que esse case?**
- Domínio que todo mundo entende: beber água, meta diária, streaks
- Simples o suficiente para rodar o fluxo inteiro em uma sessão
- Complexo o suficiente para demonstrar decisões reais de produto e técnicas
- Totalmente descartável — o ponto é o processo, não o produto

**O que é o Hydra:**
- App web mobile-first para registrar consumo de água ao longo do dia
- Features MVP: log rápido (tap para registrar), meta diária personalizável, ring de progresso visual, streaks de consistência, histórico semanal/mensal, lembretes opcionais
- Personas: Ana (desk worker que esquece de beber água) e Lucas (habit builder que quer adicionar hidratação à rotina)
- Stack: Next.js 15, TypeScript, Tailwind, shadcn/ui — local-first, sem backend no MVP

**O contexto estruturado que já preparamos:**
- `warmup-project.md` — visão, personas, features, métricas de sucesso, constraints
- `warmup-tech.md` — stack, arquitetura, data model, padrões de código, design system

É esse contexto que vai alimentar todos os cases. Vamos ver como o mesmo input estruturado gera diferentes outputs: protótipo, escopo e (se der tempo) implementação.

---

### Bloco 2: [Case 1] Design Experiments — Prototipação rápida com guardrails de produto

**Problema:**
Ferramentas como Lovable/V0 permitem prototipar em minutos, mas nem sempre o resultado é conectado ao produto real: sem padrões técnicos, sem design system (ainda que exista como importar), sem contexto robusto de negócio. O handoff para dev vira um problema — o protótipo gera uma fricção para ser aproveitado. Times de design e produto experimentam em silos, e desenvolvimento recebe artefatos que precisam ser refeitos ou reajustados para serem incorporados no fluxo de trabalho. 

**Input (o que vou mostrar na tela):**
- Um problema de UX ou feature a ser explorada
- Contexto estruturado do produto já definido:
  - **Product Spec**: o que o produto resolve, para quem, como mede sucesso
  - **Tech Patterns**: stack, arquitetura, padrões de código
  - **Design Patterns**: design system, componentes, paleta, acessibilidade
- Prompt de experimentação com guardrails

**Ferramentas:**
- Lovable / V0 / Claude Artifacts (para geração de protótipo)
- Contexto de produto estruturado (exportado do warmup ou PRD)
- Prompt template que injeta guardrails antes da geração

**Output (o que o público vê pronto):**
- Protótipo funcional gerado em minutos
- Utilização de uma skill (dando a dica do skills.sh) para esse tipo de trabalho
- MAS: usando os componentes do design system real
- MAS: respeitando padrões técnicos do projeto
- MAS: conectado à visão de produto documentada
- Protótipo que dev pode aproveitar como ponto de partida na especificação da funcionalidade, não como descarte

**Highlights (o que vale a pena enfatizar):**
- "Experimente rápido, mas com contexto" — criatividade não precisa ignorar constraints
- Resolve o problema de handoff design → dev: protótipo já nasce alinhado
- Product teams podem iterar visualmente antes de escrever User Stories
- Guardrails não limitam — aceleram a convergência para solução viável
- Demonstração de como injetar contexto de produto em ferramentas de prototipação

**Transição para o próximo case:**
"Agora que temos um protótipo validado visualmente, como transformamos isso em escopo estruturado para o time executar?"

---

### Bloco 3: [Case 2] Scope Planning — Do experimento às especificações estruturadas

**Problema:**
Líderes têm clareza do que querem construir — às vezes até um protótipo validado — mas a transição para "backlog executável" é caótica. Sem contexto estruturado, cada prompt para IA vira um tiro no escuro. O resultado: retrabalho, desalinhamento e User Stories que não refletem a intenção original.

**Input (o que vou mostrar na tela):**
- O protótipo gerado no Case 1 como referência visual
- Um documento de iniciativa real (briefing, PRD rascunho, ou descrição em alto nível)
- Três cenários de Scope Planning:
  1. **Novo Produto**: "Sei o que quero construir, preciso transformar em backlog sólido"
  2. **Evolução de Produto**: "Sei o que precisa mudar, mas falta clareza para executar bem"
  3. **Reconstrução Técnica**: "Meu produto está limitado por decisões passadas, preciso planejar a reestruturação"
- Demonstração do fluxo: Iniciativa → Classificação → User Stories → Tasks técnicas (DoR)

**Ferramentas:**
- Claude Code (terminal interativo)
- Arquivos de contexto estruturado (warmup-tech, warmup-project)
- Comandos do AI Framework: `/initiative-start`, `/create-us` e `/refinement`
- Templates de classificação de iniciativa (Atomic / Focused / Wide)

**Output (o que o público vê pronto):**
- Iniciativa classificada (tipo, complexidade, estimativa)
- User Stories geradas automaticamente com critérios de aceite
- Tasks técnicas (DoR) com granularidade FE/BE, estimativas e grupos de execução
- Matriz de rastreabilidade (requisito → US → task)

**Highlights (o que vale a pena enfatizar):**
- "Context is the new code" — qualidade do output depende da estrutura do input
- IA não substitui o PM, acelera a estruturação
- O processo expõe lacunas de informação antes de chegar no time
- Funciona para qualquer cenário: greenfield, evolução ou rebuild
- Validação humana em cada etapa: IA propõe, PM aprova

**Transição para o bonus:**
"Temos o protótipo, temos o backlog estruturado. E se a gente pegasse uma dessas tasks e implementasse agora?"

---

### Bloco 4 (Bonus): [Case 3] Feature Implementation — Do backlog ao código com IA

**Problema:**
O backlog está estruturado, as tasks estão com DoR completo, mas o handoff para o time de desenvolvimento ainda depende de interpretação. E se a IA que ajudou a estruturar o escopo também pudesse acelerar a implementação — usando o mesmo contexto?

**Input (o que vou mostrar na tela):**
- Uma task técnica gerada no Case 2 (com DoR completo)
- O codebase do protótipo gerado no Case 1
- Contexto técnico estruturado (warmup-tech, padrões, stack)

**Ferramentas:**
- Claude Code (terminal interativo)
- AI Framework — comandos de implementação
- Codebase do Hydra (protótipo)

**Output (o que o público vê pronto):**
- Feature implementada a partir da task estruturada
- Código que segue os padrões técnicos definidos no warmup
- Loop completo visível: experimento → escopo → implementação

**Highlights (o que vale a pena enfatizar):**
- O contexto estruturado no upstream alimenta todo o ciclo — inclusive o código
- Mesmo contexto, diferentes outputs: protótipo, backlog, implementação
- IA como copiloto consistente do início ao fim, não ferramenta pontual
- O loop fecha: da ideia ao código, com rastreabilidade

---

### Fechamento
O loop completo: Experimentar com contexto → Estruturar com consistência → Implementar com rastreabilidade → Mapear onde trava e ajustar antes de escalar IA

---

## Cases

### Case 1: Design Experiments — Prototipação rápida com guardrails de produto

**O que é exatamente:**
Abordagem para usar ferramentas de prototipação rápida (Lovable, V0, Claude Artifacts) SEM perder conexão com o produto real. Traz contexto estruturado (product spec, tech patterns, design patterns) antes da geração, para que o protótipo já nasça alinhado — aproveitável pelo dev como handoff.

**O que pretendo falar/mostrar:**
- O problema do handoff design → dev: protótipos bonitos que geram fricção
- Como estruturar contexto de produto para serem aproveitados em experimentos de prototipação
- Demonstração ao vivo: gerar protótipo com guardrails (design system real, padrões técnicos, visão de produto)
- O conceito de "experimente rápido, mas com contexto"

**Ferramentas usadas:**
- Lovable / V0 / Claude Artifacts (geração de protótipo)
- Contexto exportado do warmup ou PRD
- Prompt template com guardrails de produto

**Onde isso aparece no upstream:**
- Na camada de **Demanda definida (tático)**: quando precisa explorar soluções antes de especificar
- Bridge entre Discovery e Scope Planning: experimentar visualmente antes de escrever User Stories

**Esse case ajuda a liderança a:**
- Entender como times de produto podem experimentar sem criar dívida de handoff
- Ver que guardrails não limitam criatividade — aceleram convergência
- Reduzir o gap entre "o que design imaginou" e "o que dev consegue implementar"
- Preparar times para usar ferramentas de prototipação de forma produtiva (não recreativa)

**No final, o público vê pronto:**
Um protótipo funcional gerado em minutos, usando componentes do design system real, respeitando padrões técnicos, conectado à visão de produto — pronto para ser ponto de partida do dev, não material de descarte.

---

### Case 2: Scope Planning — Do experimento ao backlog estruturado

**O que é exatamente:**
Processo assistido por IA para transformar uma intenção de produto (nova funcionalidade, evolução ou reconstrução técnica) em escopo estruturado: User Stories com critérios de aceite e tasks técnicas prontas para execução. Usa contexto estruturado (warmup) para garantir consistência e qualidade. Conecta-se ao protótipo do Case 1 como referência visual.

**O que pretendo falar/mostrar:**
- Como estruturar contexto de projeto para que IA gere com qualidade (warmup-tech, warmup-project)
- Três cenários práticos de Scope Planning:
  - **Novo Produto**: transformar visão em backlog executável
  - **Evolução**: estruturar mudanças com clareza para o time
  - **Rebuild**: diagnosticar limitações técnicas e planejar reestruturação
- Fluxo ao vivo: Iniciativa → Classificação → User Stories → Tasks técnicas (DoR)
- Validação humana em cada etapa: IA propõe, PM aprova

**Ferramentas usadas:**
- Claude Code (terminal interativo)
- AI Framework (interno BossaBox)
- Arquivos de contexto: `warmup-tech.md`, `warmup-project.md`
- Comandos: `/initiative-start`, `/refinement`

**Onde isso aparece no upstream:**
- Na camada de **Pré-demanda (estratégico)**: classificação e análise da iniciativa
- Na camada de **Demanda definida (tático)**: geração de User Stories
- Na camada de **Demanda detalhada (operacional)**: quebra em tasks com DoR

**Esse case ajuda a liderança a:**
- Reduzir tempo entre "ideia aprovada" e "time pronto para executar"
- Expor lacunas de informação antes de chegar no desenvolvimento
- Estruturar qualquer tipo de iniciativa (greenfield, evolução, rebuild)
- Ver como IA pode cobrir ≥90% dos requisitos automaticamente
- Garantir consistência: mesma iniciativa sempre gera estrutura comparável

**No final, o público vê pronto:**
Uma iniciativa transformada em User Stories com critérios de aceite, tasks técnicas (DoR) com estimativas, e matriz de rastreabilidade mostrando cobertura de requisitos.

---

### Case 3 (Bonus): Feature Implementation — Do backlog ao código com IA

**O que é exatamente:**
Fechamento do loop completo. Pega uma task técnica gerada no Case 2 (com DoR) e implementa usando o mesmo contexto estruturado e o codebase do protótipo do Case 1. Demonstra que o contexto alimenta todo o ciclo — do experimento ao código.

**O que pretendo falar/mostrar:**
- Como o mesmo contexto estruturado (warmup) alimenta a implementação
- Task com DoR como input direto para IA gerar código
- O protótipo do Case 1 como codebase base
- O loop fecha: experimento → escopo → código, com rastreabilidade

**Ferramentas usadas:**
- Claude Code (terminal interativo)
- AI Framework — comandos de implementação
- Codebase do Hydra (protótipo gerado no Case 1)

**Onde isso aparece no upstream:**
- Na camada de **Demanda detalhada (operacional)**: execução a partir de tasks estruturadas
- Bridge upstream → downstream: o contexto que nasceu no planejamento chega no código

**Esse case ajuda a liderança a:**
- Ver o ciclo completo fechando em uma sessão
- Entender que IA como copiloto consistente > ferramenta pontual
- Perceber que investir em contexto no upstream paga dividendos no downstream
- Avaliar viabilidade de adotar o modelo no dia a dia dos times

**No final, o público vê pronto:**
Uma feature implementada a partir de uma task gerada por IA, no codebase de um protótipo gerado por IA, tudo conectado pelo mesmo contexto estruturado. O loop completo, visível.

---

## Mensagem Central para Copy

> **"Context is the new code — estruture antes de escalar."**

**Subtítulo sugerido:**
Workshop prático para líderes que querem usar IA no upstream: da ideia ao backlog estruturado, com clareza e consistência.

---

## Diferencial deste Workshop

| LTS Anterior (30/01)     | Este Workshop (13/02)                       |
| ------------------------ | ------------------------------------------- |
| Mostrou O QUÊ aprendemos | Ensina COMO estruturar                      |
| Formato: palestra        | Formato: hands-on (tela compartilhada)      |
| Conceitos e dados        | Ferramentas e fluxos ao vivo                |
| "A matemática não fecha" | "Como fazer a matemática fechar no upstream"|

---

## Bullets para Landing Page

**O que você vai aprender:**
- O que é upstream e por que 80% dos problemas com IA começam ali
- Como transformar uma intenção de produto em User Stories e tasks técnicas com IA
- Como prototipar com ferramentas como Lovable/V0 SEM criar dívida de handoff
- O que é "Context Engineering" e por que é a skill crítica para usar IA
- Como resolver o gap entre design/produto e desenvolvimento

**Para quem é:**
- Heads de Produto e Tecnologia
- GPMs e Tech Managers
- Líderes que querem acelerar o upstream sem perder qualidade
- Times que usam ferramentas de prototipação e sofrem com handoff para dev

**O que você leva:**
- Entendimento prático de como usar IA no upstream (não só no código)
- Visão de como estruturar contexto para prototipar com guardrails
- Clareza sobre o fluxo: experimento → escopo → implementação (o loop completo)

---

## Notas 

1. **Tom:** Prático, direto, sem jargão excessivo. A promessa é "você vê ao vivo, não só ouve conceitos".

2. **Visual:** Sugiro usar elementos de fluxo/pipeline — setas, etapas, transformação (ideia → estrutura → execução).

3. **CTA:** Focado em quem quer usar IA além do código — no upstream, no planejamento, na estruturação.

---
