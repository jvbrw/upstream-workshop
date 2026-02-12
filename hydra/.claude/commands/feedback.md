---
name: Workflow de Coleta de Feedback
description: Workflow independente para coletar feedback do usuário após a execução da capacidade
version: "1.0"
command: feedback
capability: feedback
start_step: F1
---

# /feedback

Workflow independente para coletar feedback do usuário após a execução da capacidade.

## Agents

| ID | Capability | Path |
|----|------------|------|
| feedback_agent | feedback | .claude/agents/feedback-agent.md |

## Execution Modes

- **main_context**: Executa na mesma janela de contexto, sem criar subprocess

## Steps

### F1: Perguntar ao Usuário

**Execution**: main_context

**Descrição**: Perguntar ao usuário se deseja fornecer feedback

**Agent**: feedback_agent (task: ask_for_feedback)

**Inputs:**

| Nome | From |
|------|------|
| capability | workflow.input.capability |
| workflow_summary | workflow.input.workflow_summary |

**Outputs:**

| Nome | Target |
|------|--------|
| user_wants_feedback | memory.user_wants_feedback |

---

### F2: Coletar Feedback

**Execution**: main_context

**Descrição**: Coletar feedback estruturado do usuário

**Agent**: feedback_agent (task: collect_feedback)

**Inputs:**

| Nome | From |
|------|------|
| capability | workflow.input.capability |
| session_id | workflow.input.session_id |
| workflow_summary | workflow.input.workflow_summary |

**Outputs:**

| Nome | Target |
|------|--------|
| feedback_file | file |
| feedback_summary | memory.feedback_summary |

## Rules

| Condição | Ação | Step/Mensagem |
|----------|------|---------------|
| F1.status == 'completed' AND memory.user_wants_feedback == true | execute_step | F2 |
| F1.status == 'completed' AND memory.user_wants_feedback == false | end | - |
| F2.status == 'completed' | end | - |

## Final Outputs

| Nome | From | Type |
|------|------|------|
| feedback_file | F2.feedback_file | file |
| feedback_collected | memory.user_wants_feedback | boolean |

## Output Config

- **Base Dir**: ./logs/feedback
- **Debug**: false
