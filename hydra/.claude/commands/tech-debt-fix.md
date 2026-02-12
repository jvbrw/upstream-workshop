---
name: Tech Debt Fix
description: Corrige débitos técnicos com refinamento em memória, aprovação humana e implementação TDD completa
version: "1.0"
command: /tech-debt-fix
capability: debt_analysis
start_step: S0
---

# /tech-debt-fix

Corrige débitos técnicos com refinamento em memória, aprovação humana e implementação TDD completa.

## Agents

| ID | Capability | Path |
|----|------------|------|
| tech_debt_refinement_agent | debt_analysis | .claude/agents/tech-debt-refinement-agent.md |
| planner_agent | swe | .claude/agents/planner-agent.md |
| coder_be_agent | swe | .claude/agents/coder-be-agent.md |
| coder_fe_agent | swe | .claude/agents/coder-fe-agent.md |
| code_quality_gate_agent | swe | .claude/agents/code-quality-gate-agent.md |
| qa_integration_agent | swe | .claude/agents/qa-integration-agent.md |
| code_review_agent | swe | .claude/agents/code-review-agent.md |
| feedback_agent | feedback | .claude/agents/feedback-agent.md |

## Execution Modes

- **main_context**: Executa na mesma janela de contexto, sem criar subprocess

## Steps

### S0: Validar Entrada

**Execution**: main_context

**Descrição**: Validar arquivo de débito técnico de entrada

**Instrução**:

ARGUMENTO OBRIGATÓRIO:
1. debt_report_file: Arquivo .md gerado pelo /tech-debt-scan

VALIDAÇÕES:

1. Validar que debt_report_file existe:
   - Usar Read tool para ler o arquivo
   - Se não existir: ABORTAR "❌ Arquivo não encontrado: {debt_report_file}"

2. Validar estrutura do arquivo:
   - Verificar front matter (entre --- e ---)
   - Extrair campo "type" - deve ser "tech-debt-report"
   - Se type !== "tech-debt-report": ABORTAR "❌ Arquivo inválido. Esperado type: tech-debt-report"

3. Extrair metadata do front matter:
   - title: título do débito
   - priority: Alta | Média | Baixa
   - module: módulo afetado
   - origin: listed | discovered
   - memory.debt_metadata = {title, priority, module, origin}

4. Armazenar conteúdo completo:
   - memory.debt_report = conteúdo completo do arquivo
   - memory.debt_report_file = path do arquivo

5. Descobrir codebases disponíveis:
   - Glob ./codebases/* para listar subdiretórios
   - memory.codebases = [{name: "backend", path: "./codebases/backend"}, ...]
   - Se ./codebases não existe ou está vazia: ABORTAR "❌ Nenhum codebase encontrado em ./codebases"

6. Gerar debt_slug para output:
   - Converter title para slug: lowercase, replace espaços por hífens, remover caracteres especiais
   - memory.debt_slug = slug gerado

7. memory.input_validated = true

**Prompts:**

| Nome | Ordem | Obrigatório | Validação | Texto |
|------|-------|-------------|-----------|-------|
| debt_report_file | 1 | Sim | file_exists | Arquivo .md do débito técnico (gerado pelo /tech-debt-scan): |

**Outputs:**

| Nome | Target | Type |
|------|--------|------|
| debt_report | memory.debt_report | - |
| debt_report_file | memory.debt_report_file | - |
| debt_metadata | memory.debt_metadata | - |
| debt_slug | memory.debt_slug | - |
| codebases | memory.codebases | - |
| input_validated | memory.input_validated | - |

---

### S1: Validar Warmups

**Execution**: main_context

**Descrição**: Validar warmups obrigatórios

**Instrução**:

VALIDAÇÃO DE WARMUPS OBRIGATÓRIA:

1. Validar ./warmup-tech.md:
   - Verificar se o arquivo existe
   - Ler front matter (entre --- e ---)
   - Extrair campo "status"
   - Se status !== 'completed': BLOQUEAR execução

2. Validar ./warmup-project.md:
   - Verificar se o arquivo existe
   - Ler front matter (entre --- e ---)
   - Extrair campo "status"
   - Se status !== 'completed': BLOQUEAR execução

3. Extrair configurações de repositório do warmup-project.md:
   - Ler seção "## Repository"
   - Extrair "Estrutura" (monorepo | multi-repo) → memory.repo_structure
   - Extrair "Default Branch" → memory.default_branch
   - Extrair tabela "### Backends" → memory.backends
   - Extrair tabela "### Frontends" → memory.frontends

4. Inicializar acumuladores de artefatos:
   - memory.backend_artifacts = []
   - memory.frontend_artifacts = []
   - memory.all_prs = []

5. Se tudo validado com sucesso:
   - memory.warmups_validated = true

**Outputs:**

| Nome | Target |
|------|--------|
| warmups_validated | memory.warmups_validated |
| repo_structure | memory.repo_structure |
| default_branch | memory.default_branch |
| backends | memory.backends |
| frontends | memory.frontends |
| backend_artifacts | memory.backend_artifacts |
| frontend_artifacts | memory.frontend_artifacts |
| all_prs | memory.all_prs |

---

### S2: Carregar Contexto

**Execution**: main_context

**Descrição**: Carregar contexto técnico completo

**Instrução**:

CARREGAR CONTEXTO TÉCNICO:

1. Ler ./warmup-tech.md completo → memory.tech_context
2. Ler ./warmup-project.md completo → memory.project_context
3. Identificar codebase afetado pelo débito
4. memory.context_loaded = true

**Outputs:**

| Nome | Target |
|------|--------|
| tech_context | memory.tech_context |
| project_context | memory.project_context |
| target_codebase | memory.target_codebase |
| context_loaded | memory.context_loaded |

---

### S3: Refinar Débito

**Execution**: main_context

**Descrição**: Refinar tecnicamente o débito (em memória)

**Agent**: tech_debt_refinement_agent (task: refine_debt)

**Inputs:**

| Nome | From |
|------|------|
| debt_report | memory.debt_report |
| debt_metadata | memory.debt_metadata |
| tech_context | memory.tech_context |
| target_codebase | memory.target_codebase |

**Outputs:**

| Nome | Target |
|------|--------|
| refined_debt | memory.refined_debt |
| debt_type | memory.debt_type |
| affected_files | memory.affected_files |
| has_backend | memory.has_backend |
| has_frontend | memory.has_frontend |
| refinement_completed | memory.refinement_completed |

---

### S4: Gerar Plano de Correção

**Execution**: main_context

**Descrição**: Gerar plano de correção detalhado

**Agent**: planner_agent (task: generate_implementation_plan)

**Inputs:**

| Nome | From | Default |
|------|------|---------|
| warmuptech | workflow.input.warmuptech | ./warmup-tech.md |
| project_warmup | workflow.input.project_warmup | ./warmup-project.md |
| task | memory.refined_debt | - |
| user_story | memory.debt_report | - |

**Outputs:**

| Nome | Target |
|------|--------|
| plan | memory.plan |
| plan_summary | memory.plan_summary |

---

### S5: Aprovação Humana do Plano

**Execution**: main_context

**Descrição**: Apresentar plano para aprovação humana

**Instrução**:

Exibir resumo formatado do plano e perguntar ao usuário.

Opções:
1. "approve" - ✅ Aprovar e prosseguir para implementação
2. "adjust" - 🔄 Solicitar ajustes no plano (volta S4)
3. "cancel" - ❌ Cancelar correção

**Outputs:**

| Nome | Target |
|------|--------|
| plan_decision | memory.plan_decision |

---

### S6: Implementação TDD

**Execution**: main_context

**Descrição**: Implementar correção via TDD (Backend ou Frontend)

**Instrução**:

IMPLEMENTAÇÃO TDD:

1. SE debt_type == "backend_only" OU debt_type == "full_stack":
   - Invocar coder_be_agent com task implement_backend

2. SE debt_type == "frontend_only" OU debt_type == "full_stack":
   - Invocar coder_fe_agent com task implement_frontend

ESTRATÉGIA DE BRANCHING:
- Padrão: fix/debt-{debt_slug}

**Outputs:**

| Nome | Target |
|------|--------|
| pr_url | memory.pr_url |
| task_artifacts | memory.task_artifacts |
| backend_artifacts | memory.backend_artifacts |
| frontend_artifacts | memory.frontend_artifacts |
| all_prs | memory.all_prs |
| implementation_completed | memory.implementation_completed |

---

### S7: Quality Gate

**Execution**: main_context

**Descrição**: Executar Quality Gate (lint, SAST, testes, build)

**Agent**: code_quality_gate_agent (task: validate_code)

---

### S8: QA Integration

**Execution**: main_context

**Descrição**: Executar QA Integration (test cases + E2E)

**Agent**: qa_integration_agent (task: integrate_qa_testing)

---

### S9: Code Review

**Execution**: main_context

**Descrição**: Revisar qualidade e padrões do código

**Agent**: code_review_agent (task: review_code)

---

### S10: Decisão Code Review

**Execution**: main_context

**Descrição**: Capturar decisão sobre code review

---

### S11: Consolidação

**Execution**: main_context

**Descrição**: Consolidar resultados da correção

---

### S12: Gerar Arquivo PR

**Execution**: main_context

**Descrição**: Gerar arquivo PR para revisão humana

---

### S13: Feedback

**Execution**: main_context

**Descrição**: Coletar feedback do usuário

**Agent**: feedback_agent (task: collect_feedback)

## Rules

| Condição | Ação | Step/Mensagem |
|----------|------|---------------|
| S0.status == 'completed' AND memory.input_validated == true | execute_step | S1 |
| S0.status == 'completed' AND memory.input_validated != true | error | ❌ Validação de entrada falhou |
| S1.status == 'completed' AND memory.warmups_validated == true | execute_step | S2 |
| S1.status == 'completed' AND memory.warmups_validated != true | error | ❌ Execute os warmups primeiro |
| S2.status == 'completed' AND memory.context_loaded == true | execute_step | S3 |
| S3.status == 'completed' AND memory.refinement_completed == true | execute_step | S4 |
| S4.status == 'completed' | execute_step | S5 |
| S5.status == 'completed' AND memory.plan_decision == 'approve' | execute_step | S6 |
| S5.status == 'completed' AND memory.plan_decision == 'adjust' | execute_step | S4 |
| S5.status == 'completed' AND memory.plan_decision == 'cancel' | end | - |
| S6.status == 'completed' AND memory.implementation_completed == true | execute_step | S7 |
| S7.status == 'completed' AND memory.quality_status == 'passed' | execute_step | S8 |
| S7.status == 'completed' AND memory.user_choice == 'continue' | execute_step | S8 |
| S7.status == 'completed' AND memory.user_choice == 'reimplement' | execute_step | S6 |
| S7.status == 'completed' AND memory.user_choice == 'replan' | execute_step | S4 |
| S8.status == 'completed' | execute_step | S9 |
| S9.status == 'completed' AND memory.review_status == 'approved' | execute_step | S11 |
| S9.status == 'completed' AND memory.review_status != 'approved' | execute_step | S10 |
| S10.status == 'completed' AND memory.user_review_choice == 'continue' | execute_step | S11 |
| S10.status == 'completed' AND memory.user_review_choice == 'fix_now' | execute_step | S6 |
| S11.status == 'completed' | execute_step | S12 |
| S12.status == 'completed' | execute_step | S13 |
| S13.status == 'completed' | end | - |

## Final Outputs

| Nome | From | Type |
|------|------|------|
| refined_debt | memory.refined_debt | object |
| all_prs | memory.all_prs | array |
| qa_automation_results | memory.qa_automation_results | object |
| review_status | memory.review_status | string |
| pr_file_path | memory.pr_file_path | string |
| feedback_collected | memory.feedback_collected | boolean |

## Output Config

- **Base Dir**: ./output/debt-fix
