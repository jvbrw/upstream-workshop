---
name: QA Testing Workflow - Test Cases E2E e Automação
description: Gera test cases E2E e automação Playwright para User Stories
version: "1.0"
command: qa-test
capability: qa_testing
start_step: S_WARMUP_VALIDATION
---

# /qa-test

Gera test cases E2E e automação Playwright para User Stories.

## Agents

| ID | Capability | Path |
|----|------------|------|
| test_case_agent | qa_testing | .claude/agents/test-case-agent.md |
| e2e_automation_agent | qa_testing | .claude/agents/e2e-automation-agent.md |

## Execution Modes

- **main_context**: Executa na mesma janela de contexto, sem criar subprocess

## Steps

### S_WARMUP_VALIDATION: Validar Warmups

**Execution**: main_context

**Descrição**: Validar status dos warmups necessários

---

### S0: Input Collection

**Execution**: main_context

**Descrição**: Coletar inputs da User Story

**Prompts:**

| Nome | Ordem | Obrigatório | Validação | Texto |
|------|-------|-------------|-----------|-------|
| user_story | 1 | Sim | file_exists | Caminho do arquivo da User Story (.md) |
| us_id | 2 | Sim | - | ID da User Story (ex: US-1.1) |
| generate_automation | 3 | Não | sim,não | Gerar automação Playwright? (sim/não) |

---

### S1: Test Case Generation

**Execution**: main_context

**Descrição**: Gerar test cases E2E Given-When-Then

**Agent**: test_case_agent (task: generate_test_cases)

---

### S2: E2E Automation (conditional)

**Execution**: main_context

**Descrição**: Gerar automação Playwright se solicitado

**Agent**: e2e_automation_agent (task: automate_e2e_tests)

---

### S3: E2E Validation

**Execution**: main_context

**Descrição**: Validar conformidade dos testes E2E com rotas, helpers e navegação

**5 VERIFICAÇÕES OBRIGATÓRIAS**:
1. Existência de Helpers
2. Uso de Helpers nos Testes
3. Navegação Direta Proibida
4. Page Objects Existem
5. Compilar Relatório e Decidir

---

### S4: Final Summary

**Execution**: main_context

**Descrição**: Apresentar resumo final com status de validação

## Rules

| Condição | Ação | Step |
|----------|------|------|
| S_WARMUP_VALIDATION.completed AND warmups_validated | execute_step | S0 |
| S0.completed | execute_step | S1 |
| S1.completed AND generate_automation == true | execute_step | S2 |
| S1.completed AND generate_automation == false | execute_step | S4 |
| S2.completed | execute_step | S3 |
| S3.completed AND e2e_validation_status == 'passed' | execute_step | S4 |
| S3.completed AND e2e_validation_status == 'passed_with_warnings' | execute_step | S4 |
| S3.completed AND e2e_validation_status == 'retry_needed' | execute_step | S2 |
| S3.completed AND e2e_validation_status == 'passed_with_critical_warnings' | execute_step | S4 |
| S3.completed AND e2e_validation_status == 'failed_with_warnings' | execute_step | S4 |
| S3.completed AND e2e_validation_status == 'aborted_by_user' | end | - |
| S3.completed AND e2e_validation_status == 'aborted_max_retries' | end | - |
| S4.completed | end | - |

## Final Outputs

| Nome | From | Type |
|------|------|------|
| test_cases | memory.test_cases_content | memory |
| scenarios_summary | memory.scenarios_summary | memory |
| automation_report | memory.test_execution_report | memory |
| e2e_validation_report | memory.e2e_validation_report | memory |
| e2e_conformance_status | memory.e2e_validation_status | memory |

## Output Config

- **Base Dir**: ../../output/qa
