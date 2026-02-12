---
name: SWE Workflow - Multi-Task US Support (TDAID)
description: Executa User Stories completas com TDAID (Test-Driven AI Development) - Planning→Red→Green→Validate. Suporta microserviços e estruturas monorepo/multi-repo.
version: "2.1"
command: /implement
capability: swe
start_step: S_INPUT
---

# /implement

Executa User Stories completas com TDAID (Test-Driven AI Development): Planning→Red→Green→Validate, análise de dependências e execução otimizada para LLMs. Suporta microserviços (N backends + M frontends) e estruturas monorepo/multi-repo.

## Agents

| ID | Capability | Path |
|----|------------|------|
| us_planner_agent | swe | .claude/agents/us-planner-agent.md |
| planner_agent | swe | .claude/agents/planner-agent.md |
| uiux_agent | swe | .claude/agents/uiux-agent.md |
| coder_be_agent | swe | .claude/agents/coder-be-agent.md |
| coder_fe_agent | swe | .claude/agents/coder-fe-agent.md |
| code_review_agent | swe | .claude/agents/code-review-agent.md |
| code_quality_gate_agent | swe | .claude/agents/code-quality-gate-agent.md |
| qa_integration_agent | swe | .claude/agents/qa-integration-agent.md |
| feedback_agent | feedback | .claude/agents/feedback-agent.md |
| doc_sync_agent | swe | .claude/agents/doc-sync-agent.md |
| environment_validator_agent | swe | .claude/agents/environment-validator-agent.md |

## Execution Modes

- **main_context**: Executa na mesma janela de contexto, sem criar subprocess

## Steps

### S_INPUT: Classificação do Input

**Execution**: main_context

**Descrição**: Classificar input como US ID ou descrição livre

---

### S0: Warmup Validation

**Execution**: main_context

**Descrição**: Validar status dos warmups necessários e extrair configurações de repositório

---

### S_ENV: Environment Validation

**Execution**: main_context

**Descrição**: Inicializar ambiente local para uso na implementação

**Agent**: environment_validator_agent (task: validate_environment)

---

### S1: US Planning

**Execution**: main_context

**Descrição**: Planejar execução da User Story completa e classificar tipo

**Agent**: us_planner_agent (task: plan_us_execution)

---

### S_ADHOC_PLAN: Plano Ad-hoc

**Execution**: main_context

**Descrição**: Criar plano resumido e solicitar revisão humana (modo ad-hoc)

**Agent**: planner_agent (task: generate_adhoc_plan)

---

### S2: Task Dispatcher

**Execution**: main_context

**Descrição**: Selecionar próxima(s) task(s) para executar

---

### S3: Planning

**Execution**: main_context

**Descrição**: Gerar plano de implementação detalhado

**Agent**: planner_agent (task: generate_implementation_plan)

---

### S4: UI/UX

**Execution**: main_context

**Descrição**: Validar ou planejar UI/UX para Frontend

**Agent**: uiux_agent (task: validate_or_plan_uiux)

---

### S5: Backend Implementation

**Execution**: main_context

**Descrição**: Implementar backend com TDAID (4 fases: Planning, Red, Green, Validate)

**Agent**: coder_be_agent (task: implement_backend)

---

### S5_5: Blocker Check (BE)

**Execution**: main_context

**Descrição**: Verificar blockers do backend antes de prosseguir

---

### S6: Frontend Implementation

**Execution**: main_context

**Descrição**: Implementar frontend com TDAID (4 fases: Planning, Red, Green, Validate)

**Agent**: coder_fe_agent (task: implement_frontend)

---

### S6_5: Blocker Check (FE)

**Execution**: main_context

**Descrição**: Verificar blockers do frontend antes de prosseguir

---

### S7: Technical Validation

**Execution**: main_context

**Descrição**: Validar acessibilidade WCAG AA, performance e responsividade usando MCP DevTools

---

### S8: Code Quality Gate

**Execution**: main_context

**Descrição**: FASE 3 VALIDATE: Validações automáticas de qualidade (lint, SAST, testes, build, performance)

**Agent**: code_quality_gate_agent (task: validate_code)

---

### S9: QA Integration

**Execution**: main_context

**Descrição**: Executar integração QA completa (test cases + E2E automation) para toda a User Story

**Agent**: qa_integration_agent (task: integrate_qa_testing)

---

### S10: Code Review

**Execution**: main_context

**Descrição**: Revisar qualidade e padrões do código implementado (inclui testes E2E)

**Agent**: code_review_agent (task: review_code)

---

### S11: User Decision

**Execution**: main_context

**Descrição**: Capturar decisão do usuário sobre sugestões do code review

---

### S12: Consolidação Final

**Execution**: main_context

**Descrição**: Consolidar resultados de todas as tasks

---

### S13: Doc Sync

**Execution**: main_context

**Descrição**: Analisar mudanças e propor atualizações de documentação com aprovação humana

**Agent**: doc_sync_agent (task: analyze_and_sync_docs)

---

### S14: Feedback

**Execution**: main_context

**Descrição**: Coletar feedback do usuário

**Agent**: feedback_agent (task: collect_feedback)

## Rules

| Condição | Ação | Step |
|----------|------|------|
| S_INPUT.completed | execute_step | S0 |
| S0.completed AND warmups_validated | execute_step | S_ENV |
| S_ENV.completed AND environment_status == 'READY' AND input_type == 'us_id' | execute_step | S1 |
| S_ENV.completed AND environment_status == 'READY' AND input_type == 'description' | execute_step | S_ADHOC_PLAN |
| S_ENV.completed AND environment_status == 'NOT_READY' | end | - |
| S_ADHOC_PLAN.completed AND proceed_with_implementation AND implementation_type == 'BE' | execute_step | S5 |
| S_ADHOC_PLAN.completed AND proceed_with_implementation AND implementation_type == 'FE' | execute_step | S4 |
| S_ADHOC_PLAN.completed AND proceed_with_implementation AND implementation_type == 'BOTH' | execute_step | S5 |
| S_ADHOC_PLAN.completed AND NOT proceed_with_implementation | end | - |
| S1.completed | execute_step | S2 |
| S2.completed AND has_tasks_to_process | execute_step | S3 |
| S2.completed AND all_tasks_completed | execute_step | S9 |
| S3.completed AND current_task.type == 'FE' | execute_step | S4 |
| S3.completed AND current_task.type == 'BE' | execute_step | S5 |
| S4.completed AND uiux_status == 'adjustments' | execute_step | S3 |
| S4.completed AND uiux_status != 'adjustments' | execute_step | S6 |
| S5.completed | execute_step | S5_5 |
| S5_5.completed AND can_proceed_be | execute_step | S8 |
| S6.completed | execute_step | S6_5 |
| S6_5.completed AND can_proceed_fe | execute_step | S7 |
| S7.completed AND technical_validation_status IN ['passed', 'skipped'] | execute_step | S8 |
| S7.completed AND technical_validation_status == 'failed' | execute_step | S6 |
| S8.completed AND quality_status == 'passed' | execute_step | S2 |
| S9.completed | execute_step | S10 |
| S10.completed AND review_status == 'approved' | execute_step | S12 |
| S10.completed AND review_status IN ['approved_with_suggestions', 'changes_required'] | execute_step | S11 |
| S11.completed AND user_review_choice == 'continue' | execute_step | S12 |
| S11.completed AND user_review_choice == 'fix_now' | execute_step | S2 |
| S12.completed | execute_step | S13 |
| S13.completed | execute_step | S14 |
| S14.completed | end | - |

## Final Outputs

| Nome | From | Type |
|------|------|------|
| execution_plan | memory.execution_plan | string |
| all_prs | memory.all_prs | array |
| success_rate | memory.success_rate | number |
| us_type | memory.us_type | string |
| qa_automation_results | memory.qa_automation_results | object |
| feedback_collected | memory.feedback_collected | boolean |
| feedback_file | memory.feedback_file | file |
| feedback_summary | memory.feedback_summary | string |
| doc_sync_log_file | memory.doc_sync_log_file | file |

## Output Config

- **Base Dir**: ./output
