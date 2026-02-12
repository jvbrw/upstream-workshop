---
name: Replan Workflow - US and Tasks Cascade Replanning
description: Replanejar User Stories e tasks com detecção automática de impactos em cascata
version: "1.0"
command: /replan
capability: product_management
start_step: S0
---

# /replan

Replanejar User Stories e tasks com detecção automática de impactos em cascata.

## Agents

| ID | Capability | Path |
|----|------------|------|
| replan_cascade_agent | product_management | .claude/agents/replan-cascade-agent.md |
| us_generator_agent | product_management | .claude/agents/us-generator-agent.md |
| us_validator_agent | product_management | .claude/agents/us-validator-agent.md |
| us_review_agent | product_management | .claude/agents/us-review-agent.md |

## Execution Modes

- **main_context**: Executa na mesma janela de contexto, sem criar subprocess

## Steps

### S0: Validação e Inputs

**Execution**: main_context

**Descrição**: Validar warmups e coletar inputs do replanejamento

**ESCOPO DO /replan**:
- Altera arquivos de US (.md)
- Altera arquivos de tasks (tasks.md)
- Cria summaries de replanejamento
- NÃO executa código

**Prompts:**

| Nome | Ordem | Obrigatório | Validação | Texto |
|------|-------|-------------|-----------|-------|
| us_code | 1 | Sim | ^US-\d{3}$ | Código da US a replanejar (ex: US-001) |
| orientacoes | 2 | Sim | - | Orientações de alteração (o que deve ser mudado) |

---

### S1: Análise da US Principal

**Execution**: main_context

**Descrição**: Analisar US principal e ler contexto completo

---

### S2: Detecção de Cascata

**Execution**: main_context

**Descrição**: Detectar USs e tasks em cascata

**Agent**: replan_cascade_agent (task: detect_cascade)

---

### S3: Gerar Plano de Alterações

**Execution**: main_context

**Descrição**: Gerar plano detalhado de alterações

---

### S4: Apresentar e Aprovar

**Execution**: main_context

**Descrição**: Apresentar plano e aguardar aprovação do usuário

---

### S5: Executar Alterações

**Execution**: main_context

**Descrição**: Alterar USs e tasks conforme plano aprovado

**MODO DE OPERAÇÃO**: Usa Edit tool (NUNCA Write para arquivos existentes)

---

### S6: Criar Summaries e Finalizar

**Execution**: main_context

**Descrição**: Criar summaries de replanejamento e atualizar status

## Rules

| Condição | Ação | Step |
|----------|------|------|
| S0.completed | execute | S1 |
| S1.completed | execute | S2 |
| S2.completed | execute | S3 |
| S3.completed | execute | S4 |
| S4.completed AND user_decision=='approved' | execute | S5 |
| S4.completed AND user_decision=='adjust' | execute | S3 |
| S4.completed AND user_decision=='cancelled' | end | - |
| S5.completed AND has_pending_items==true | execute | S5 |
| S5.completed AND has_pending_items==false | execute | S6 |
| S6.completed | end | - |

## Final Outputs

| Nome | From | Type |
|------|------|------|
| replan_plan | memory.replan_plan | memory |
| modified_files | memory.modified_files | memory |
| summary_file_path | memory.summary_file_path | file |
| replan_completed | memory.replan_completed | boolean |
| final_report | memory.final_report | string |

## Output Config

- **Base Dir**: ./implementations
