---
name: Prototype Lab
description: Cria experimentos front-end rápidos a partir de ideações, operando na fase pré-upstream sem cerimônia de user stories.
version: "1.0"
command: /prototype
capability: lab
start_step: S0
---

# /prototype

Transforma ideias em experimentos front-end funcionais no lab (`/lab/[slug]`). Fase pré-upstream — sem user stories, sem refinement, sem cerimônia. Foco em validação visual e de interação.

**Uso:**
- `/prototype` — modo interativo, pergunta a ideia
- `/prototype [descrição da ideia]` — modo direto
- `/prototype iterate [slug]` — iterar sobre protótipo existente
- `/prototype evaluate [slug]` — avaliar protótipo para upstream

## Agents

| ID | Capability | Path |
|----|------------|------|
| prototype_agent | lab | .claude/agents/prototype-agent.md |

## Execution Modes

- **main_context**: Executa na mesma janela de contexto

## Steps

### S0: Parse Input

**Execution**: main_context

**Descrição**: Classificar modo de operação a partir do input

Analisar o argumento passado:
- Sem argumento → perguntar ao usuário o que quer prototipar (modo interativo)
- `iterate [slug]` → modo iteração, ir para S_ITERATE
- `evaluate [slug]` → modo avaliação, ir para S_EVALUATE
- Qualquer outro texto → usar como experiment_description, ir para S1

---

### S1: Warmup Check

**Execution**: main_context

**Descrição**: Validar que warmups existem e carregar contexto

- Verificar que `warmup-product.md` existe e tem status: completed
- Verificar que `warmup-project.md` existe e tem status: completed
- Verificar que `warmup-tech.md` existe e tem status: completed
- Se algum estiver pendente: avisar e sugerir completar antes
- Carregar contexto de stack, componentes disponíveis e design tokens

---

### S2: Build Prototype

**Execution**: main_context

**Descrição**: Construir o experimento

**Agent**: prototype_agent (task: build_prototype)

O agente vai:
1. Analisar a ideia contra o contexto do produto
2. Propor o que será construído (resumo para aprovação)
3. Codificar o protótipo em `app/lab/[slug]/`
4. Validar build
5. Registrar no log

---

### S3: Present Result

**Execution**: main_context

**Descrição**: Mostrar resultado ao usuário

Exibir:
- Rota do protótipo (`/lab/[slug]`)
- Resumo do que foi construído
- Sugestão: "Rode `npm run dev` e acesse a rota para validar"
- Próximos passos disponíveis:
  * `/prototype iterate [slug]` para ajustar
  * `/prototype evaluate [slug]` quando estiver satisfeito
  * Descartar: deletar `app/lab/[slug]/` manualmente

---

### S_ITERATE: Iterate Prototype

**Execution**: main_context

**Descrição**: Iterar sobre protótipo existente

**Agent**: prototype_agent (task: iterate_prototype)

- Verificar que `app/lab/[slug]/` existe
- Perguntar o que o usuário quer mudar (se não especificado)
- Aplicar mudanças, validar build

---

### S_EVALUATE: Evaluate Prototype

**Execution**: main_context

**Descrição**: Avaliar protótipo para decisão de upstream

**Agent**: prototype_agent (task: evaluate_prototype)

- Analisar código e UX do protótipo
- Gerar avaliação: viabilidade, gaps, esforço estimado
- Atualizar log com outcome
- Se `validated`: gerar briefing pronto para `/initiative-start`

---

## Rules

| Condição | Ação | Step |
|----------|------|------|
| S0.completed AND mode == 'build' | execute_step | S1 |
| S0.completed AND mode == 'iterate' | execute_step | S_ITERATE |
| S0.completed AND mode == 'evaluate' | execute_step | S_EVALUATE |
| S1.completed AND warmups_valid | execute_step | S2 |
| S1.completed AND NOT warmups_valid | end | - |
| S2.completed | execute_step | S3 |
| S3.completed | end | - |
| S_ITERATE.completed | end | - |
| S_EVALUATE.completed | end | - |

## Final Outputs

| Nome | From | Type |
|------|------|------|
| prototype_slug | memory.prototype_slug | string |
| prototype_route | memory.prototype_route | string |
| prototype_files | memory.prototype_files | array |
| evaluation_status | memory.evaluation_status | string |
| production_briefing | memory.production_briefing | string |
