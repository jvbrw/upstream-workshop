---
name: US Generation Workflow
description: Gerar, validar e aprovar User Stories a partir de PRDs ou Story Context
version: "1.0"
command: /create-us
capability: product_management
start_step: S0
---

# /create-us

Gerar, validar e aprovar User Stories a partir de PRDs ou Story Context.

## Agents

| ID | Capability | Path |
|----|------------|------|
| prd_analyzer_agent | product_management | .claude/agents/prd-analyzer-agent.md |
| us_generator_agent | product_management | .claude/agents/us-generator-agent.md |
| us_validator_agent | product_management | .claude/agents/us-validator-agent.md |
| us_review_agent | product_management | .claude/agents/us-review-agent.md |
| feedback_agent | feedback | .claude/agents/feedback-agent.md |

## Execution Modes

- **main_context**: Executa na mesma janela de contexto, sem criar subprocess

## Steps

### S0: Input Configuration

**Execution**: main_context

**Descrição**: Configurar inputs e detectar modo de execução

**Instrução**:

0. VALIDAÇÃO OBRIGATÓRIA - Warmup Tech Status
1. VALIDAÇÃO OPCIONAL - Product Warmup Status
2. Configurar modo de execução (Story Memory ou Manual)

**Prompts:**

| Nome | Ordem | Obrigatório | Texto |
|------|-------|-------------|-------|
| prd_path | 1 | Não | Caminho do arquivo PRD (opcional) |
| product_spec_path | 2 | Não | Caminho do Product Spec (opcional) |
| product_warmup_path | 3 | Não | Caminho do Product Warmup (default: ./warmup-product.md) |
| warmup_tech_path | 4 | Não | Caminho do Warmup Tech (default: ./warmup-tech.md) |

---

### S1: Context Analysis

**Execution**: main_context

**Descrição**: Analisar contexto e identificar épicos e stories candidatas

**Agent**: prd_analyzer_agent (task: analyze_and_identify_epics)

---

### S2: US Generation

**Execution**: main_context

**Descrição**: Gerar User Stories detalhadas seguindo template

**Agent**: us_generator_agent (task: generate_user_stories)

---

### S2_SYNC: Jira Sync Double-Check

**Execution**: main_context

**Descrição**: Verificar e sincronizar User Stories com Jira (se necessário)

---

### S3: Validation

**Execution**: main_context

**Descrição**: Validar qualidade e completude das User Stories

**Agent**: us_validator_agent (task: validate_user_stories)

---

### S4: PM Review

**Execution**: main_context

**Descrição**: Revisão humana e aprovação do Product Manager

**Agent**: us_review_agent (task: request_pm_approval)

---

### S5: Collect Feedback

**Execution**: main_context

**Descrição**: Coletar feedback do usuário

**Agent**: feedback_agent (task: collect_feedback)

## Rules

| Condição | Ação | Step |
|----------|------|------|
| S0.completed | execute | S1 |
| S1.completed | execute | S2 |
| S2.completed | execute | S2_SYNC |
| S2_SYNC.completed | execute | S3 |
| S3.completed | execute | S4 |
| S4.completed AND pm_decision.decision=='needs_revision' | execute | S2 |
| S4.completed AND pm_decision.decision=='approved' | execute | S5 |
| S4.completed AND pm_decision.decision=='rejected' | execute | S5 |
| S5.completed | end | - |

## Final Outputs

| Nome | From | Type |
|------|------|------|
| generated_stories | memory.generated_stories | memory |
| validation_results | memory.validation_results | memory |
| pm_decision | memory.pm_decision | memory |
| feedback_collected | memory.feedback_collected | boolean |
| feedback_file | memory.feedback_file | file |
| feedback_summary | memory.feedback_summary | string |

## Output Config

- **Base Dir**: ./implementations
