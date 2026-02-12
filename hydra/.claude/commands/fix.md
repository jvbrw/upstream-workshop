---
name: Fix Workflow - Bug Resolution (TDAID)
description: Corrige bugs e issues seguindo TDAID (Test-Driven AI Development) com foco em testes de regressão, análise de root cause e validação rigorosa.
version: "1.0"
command: /fix
capability: swe
start_step: S_INPUT_VALIDATION
---

# /fix

Corrige bugs e issues seguindo TDAID (Test-Driven AI Development) com foco em testes de regressão, análise de root cause e validação rigorosa. Suporta bugs de backend, frontend ou full-stack.

## Agents

| ID | Capability | Path |
|----|------------|------|
| bug_analyzer_agent | swe | .claude/agents/bug-analyzer-agent.md |
| planner_agent | swe | .claude/agents/planner-agent.md |
| plan_review_agent | swe | .claude/agents/plan-review-agent.md |
| coder_be_agent | swe | .claude/agents/coder-be-agent.md |
| coder_fe_agent | swe | .claude/agents/coder-fe-agent.md |
| code_quality_gate_agent | swe | .claude/agents/code-quality-gate-agent.md |
| code_review_agent | swe | .claude/agents/code-review-agent.md |
| qa_integration_agent | swe | .claude/agents/qa-integration-agent.md |
| feedback_agent | feedback | .claude/agents/feedback-agent.md |
| doc_sync_agent | swe | .claude/agents/doc-sync-agent.md |

## Execution Modes

- **main_context**: Executa na mesma janela de contexto, sem criar subprocess

## Steps

### S_INPUT_VALIDATION: Input Validation

**Execution**: main_context

**Descrição**: Validar entrada do bug e status dos warmups necessários

---

### S0: Bug Analysis

**Execution**: main_context

**Descrição**: Analisar bug para identificar root cause, tipo, severidade e escopo

**Agent**: bug_analyzer_agent (task: analyze_bug)

---

### S1: Fix Planning

**Execution**: main_context

**Descrição**: Gerar plano de correção focado em regressão e root cause

**Agent**: planner_agent (task: generate_implementation_plan)

---

### S_FIX_REVIEW: Fix Review

**Execution**: main_context

**Descrição**: Salvar plano de correção e solicitar revisão humana

---

### S2: Plan Review

**Execution**: main_context

**Descrição**: Validar plano e facilitar aprovação humana (bugs críticos)

**Agent**: plan_review_agent (task: review_plan)

---

### S3: Backend Implementation

**Execution**: main_context

**Descrição**: Implementar fix backend com TDAID (teste de regressão primeiro)

**Agent**: coder_be_agent (task: implement_backend)

---

### S4: Frontend Implementation

**Execution**: main_context

**Descrição**: Implementar fix frontend com TDAID (teste de regressão primeiro)

**Agent**: coder_fe_agent (task: implement_frontend)

---

### S5: Quality Gate

**Execution**: main_context

**Descrição**: Validações automáticas de qualidade (lint, SAST, testes, build)

**Agent**: code_quality_gate_agent (task: validate_code)

---

### S6: Code Review

**Execution**: main_context

**Descrição**: Review focado em regressões, side effects e root cause resolvido

**Agent**: code_review_agent (task: review_code)

---

### S7: QA Regression

**Execution**: main_context

**Descrição**: Testes de regressão E2E e validação do fix

**Agent**: qa_integration_agent (task: integrate_qa_testing)

---

### S8: Consolidation

**Execution**: main_context

**Descrição**: Consolidar resultados do fix

---

### S_DOC_SYNC: Doc Sync

**Execution**: main_context

**Descrição**: Analisar mudanças do fix e propor atualizações de documentação

**Agent**: doc_sync_agent (task: analyze_and_sync_docs)

---

### S9: Feedback

**Execution**: main_context

**Descrição**: Coletar feedback do usuário

**Agent**: feedback_agent (task: collect_feedback)

## Rules

| Condição | Ação | Step |
|----------|------|------|
| S_INPUT_VALIDATION.completed AND warmups_validated | execute_step | S0 |
| S0.completed | execute_step | S1 |
| S1.completed | execute_step | S_FIX_REVIEW |
| S_FIX_REVIEW.completed AND proceed_with_fix AND severity == 'critical' | execute_step | S2 |
| S_FIX_REVIEW.completed AND proceed_with_fix AND severity != 'critical' AND bug_type IN ['backend_only', 'full_stack'] | execute_step | S3 |
| S_FIX_REVIEW.completed AND proceed_with_fix AND severity != 'critical' AND bug_type == 'frontend_only' | execute_step | S4 |
| S_FIX_REVIEW.completed AND NOT proceed_with_fix | end | - |
| S2.completed AND review_decision == 'adjustments' | execute_step | S1 |
| S2.completed AND review_decision == 'approved' AND bug_type IN ['backend_only', 'full_stack'] | execute_step | S3 |
| S2.completed AND review_decision == 'approved' AND bug_type == 'frontend_only' | execute_step | S4 |
| S3.completed AND bug_type == 'full_stack' | execute_step | S4 |
| S3.completed AND bug_type == 'backend_only' | execute_step | S5 |
| S4.completed | execute_step | S5 |
| S5.completed AND quality_status == 'passed' | execute_step | S6 |
| S5.completed AND user_choice == 'continue' | execute_step | S6 |
| S5.completed AND user_choice == 'replan' | execute_step | S1 |
| S5.completed AND user_choice == 'reimplement_be' | execute_step | S3 |
| S5.completed AND user_choice == 'reimplement_fe' | execute_step | S4 |
| S6.completed AND review_status IN ['approved', 'approved_with_suggestions'] | execute_step | S7 |
| S6.completed AND review_status == 'changes_required' AND bug_type == 'backend_only' | execute_step | S3 |
| S6.completed AND review_status == 'changes_required' AND bug_type == 'frontend_only' | execute_step | S4 |
| S6.completed AND review_status == 'changes_required' AND bug_type == 'full_stack' | execute_step | S3 |
| S7.completed | execute_step | S8 |
| S8.completed | execute_step | S_DOC_SYNC |
| S_DOC_SYNC.completed | execute_step | S9 |
| S9.completed | end | - |

## Final Outputs

| Nome | From | Type |
|------|------|------|
| bug_id | memory.bug_id | string |
| bug_type | memory.bug_type | string |
| severity | memory.severity | string |
| root_cause_hypothesis | memory.root_cause_hypothesis | string |
| all_prs | memory.all_prs | array |
| success_rate | memory.success_rate | number |
| fix_summary | memory.fix_summary | string |
| qa_automation_results | memory.qa_automation_results | object |
| feedback_collected | memory.feedback_collected | boolean |
| feedback_file | memory.feedback_file | file |
| feedback_summary | memory.feedback_summary | string |

## Output Config

- **Base Dir**: ./output
