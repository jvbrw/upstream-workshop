---
name: Refinement Workflow - DoR Generation
description: Gera tasks DoR com granularidade inteligente a partir de uma User Story específica. Uso: /refinement <US-CODE>
version: "1.0"
command: /refinement
capability: refinement
start_step: S0
---

# /refinement

Gera tasks DoR com granularidade inteligente a partir de uma User Story específica.

## Agents

| ID | Capability | Path |
|----|------------|------|
| refinement_config_loader_agent | refinement | .claude/agents/refinement-config-loader-agent.md |
| refinement_us_scanner_agent | refinement | .claude/agents/refinement-us-scanner-agent.md |
| uiux_agent | swe | .claude/agents/uiux-agent.md |
| refinement_task_generator_agent | refinement | .claude/agents/refinement-task-generator-agent.md |
| refinement_coverage_checker_agent | refinement | .claude/agents/refinement-coverage-checker-agent.md |
| feedback_agent | feedback | .claude/agents/feedback-agent.md |

## Execution Modes

- **main_context**: Executa na mesma janela de contexto, sem criar subprocess
- **parallel**: Executa em modo paralelo
- **subagent**: Executa como subagent em janela de contexto separada

## Steps

### S0: Validar Warmups

**Execution**: main_context

**Descrição**: Validar status dos warmups necessários

**Instrução:**

VALIDAÇÃO DE WARMUPS OBRIGATÓRIA:

1. Validar ./warmup-tech.md:
   - Verificar se o arquivo existe
   - Ler front matter (entre --- e ---)
   - Extrair campo "status"
   - Se status !== 'completed':
     BLOQUEAR execução e retornar mensagem:
     "❌ BLOQUEADO: ./warmup-tech.md não está preenchido (status: {status}).
      Execute o workflow /create-warmup-tech primeiro."
   - Se status === 'completed': prosseguir para validação 2

2. Validar ./warmup-project.md:
   - Verificar se o arquivo existe
   - Ler front matter (entre --- e ---)
   - Extrair campo "status"
   - Se status !== 'completed':
     BLOQUEAR execução e retornar mensagem:
     "❌ BLOQUEADO: ./warmup-project.md não está preenchido (status: {status}).
      Execute o workflow de setup de projeto primeiro."
   - Se status === 'completed': prosseguir para S1

3. Se ambos validados com sucesso:
   - Registrar validação bem-sucedida
   - Prosseguir para step S1

---

### S1: Coletar US Code

**Execution**: main_context

**Descrição**: Coletar código da User Story

**Prompts:**

| Nome | Ordem | Obrigatório | Validação | Texto |
|------|-------|-------------|-----------|-------|
| us_code | 1 | Sim | ^[A-Z]+-[\d.]+$ | Código da User Story (ex: US-001, PLD-2) |

---

### S2: Carregar Configuração

**Execution**: main_context

**Descrição**: Carregar configuração do warmup-project.md e warmup-tech.md

**Agent**: refinement_config_loader_agent (task: load_project_config)

---

### S3: Localizar User Story

**Execution**: main_context

**Descrição**: Localizar User Story específica em implementations/

**Agent**: refinement_us_scanner_agent (task: scan_user_stories)

---

### S4: Analisar Contexto UI/UX

**Execution**: main_context

**Descrição**: Analisar codebase para extrair contexto UI/UX

**Agent**: uiux_agent (task: analyze_uiux_context)

---

### S5: Aprovação de Tasks

**Execution**: main_context

**Descrição**: Apresentar proposta de quebra de tasks para aprovação humana

**Instrução:**

**PROPOSTA DE TASKS TÉCNICAS PARA APROVAÇÃO**

ANTES DE GERAR TASKS, ANALISAR E APRESENTAR PROPOSTA:

1. ANALISAR USER STORY:
   - Ler arquivo da US (us_file)
   - Extrair critérios funcionais (seção 2)
   - Extrair critérios UX (seção 3)
   - Extrair critérios QA (seção 4)
   - Estimar complexidade

2. APLICAR REGRAS DE GRANULARIDADE:
   - Backend: 1 task (quebrar se > 500 linhas OU domínios distintos)
   - Frontend: 1 task (quebrar se > 500 linhas OU fluxos independentes)
   - Máximo: 2 BE + 2 FE por US

3. DETERMINAR TASKS NECESSÁRIAS:
   - Identificar se precisa BE, FE ou ambos
   - Definir nome descritivo para cada task
   - Justificar cada task proposta

4. APRESENTAR PROPOSTA (formato markdown):

   ## 🔧 Proposta de Tasks Técnicas

   ### User Story: {us_id} - {título}

   ### Análise de Complexidade
   - Critérios funcionais: {count}
   - Endpoints necessários: {count}
   - Telas/componentes: {count}
   - Estimativa de linhas: ~{estimate}

   ### Tasks Propostas
   | # | ID | Tipo | Nome da Task | Justificativa |
   |---|-----|------|--------------|---------------|
   | 1 | T001-BE | Backend | {nome descritivo} | {justificativa} |
   | 2 | T002-FE | Frontend | {nome descritivo} | {justificativa} |

   **Total: {task_count} tasks** ({be_count} BE + {fe_count} FE)

5. USAR AskUserQuestion PARA COLETAR DECISÃO:
   - Se aprovar: Salvar em memory.approved_task_breakdown e prosseguir para S6
   - Se ajustar: Coletar ajustes e re-apresentar (loop em S5)
   - Se rejeitar: Pular para S9 (Feedback) e encerrar

---

### S6: Gerar Tasks DoR

**Execution**: parallel

**Descrição**: Gerar tasks DoR com contexto completo (warmups + codebase + UI/UX)

**Agent**: refinement_task_generator_agent (task: generate_dor_tasks)

---

### S7: JIRA Sync

**Execution**: main_context

**Descrição**: Verificar e sincronizar tasks DoR com Jira (se necessário)

**Instrução:**

**JIRA MCP SYNC DOUBLE-CHECK - Safety Net para garantir sincronização de Subtasks**

Este step garante que todas as tasks DoR foram criadas no Jira como subtasks.

1. Verificar configuração Jira no ./warmup-project.md front matter
2. Verificar disponibilidade de MCPs Atlassian
3. Double-check e sync para cada Task DoR
4. Gerar relatório de sincronização

---

### S8: Validar Cobertura

**Execution**: parallel

**Descrição**: Validar cobertura de requirements

**Agent**: refinement_coverage_checker_agent (task: validate_coverage)

---

### S9: Feedback

**Execution**: main_context

**Descrição**: Coletar feedback do usuário

**Agent**: feedback_agent (task: collect_feedback)

## Rules

| Condição | Ação | Step |
|----------|------|------|
| S0.completed AND warmups_validated == true | execute_step | S1 |
| S1.completed | execute_step | S2 |
| S2.completed AND config_loaded == 'success' | execute_step | S3 |
| S2.completed AND config_loaded == 'failed' | end | - |
| S3.completed AND total_us_count > 0 | execute_step | S4 |
| S3.completed AND total_us_count == 0 | end | - |
| S4.completed | execute_step | S5 |
| S5.completed AND task_proposal_decision == 'adjust' | execute_step | S5 |
| S5.completed AND task_proposal_decision == 'approve' | execute_step | S6 |
| S5.completed AND task_proposal_decision == 'reject' | execute_step | S9 |
| S6.completed | execute_step | S7 |
| S7.completed | execute_step | S8 |
| S8.completed | execute_step | S9 |
| S9.completed | end | - |

## Final Outputs

| Nome | From | Type |
|------|------|------|
| us_results | memory.us_results | object |
| total_us_count | memory.total_us_count | number |
| task_proposal_decision | memory.task_proposal_decision | string |
| approved_task_breakdown | memory.approved_task_breakdown | array |
| feedback_collected | memory.feedback_collected | boolean |
| feedback_file | memory.feedback_file | file |
| feedback_summary | memory.feedback_summary | string |

## Output Config

- **Base Dir**: ./implementations
