---
name: Tech Debt Scan
description: Diagnóstico de débitos técnicos com análise paralela por codebases
version: "1.0"
command: /tech-debt-scan
capability: debt_analysis
start_step: S0
---

# /tech-debt-scan

Diagnóstico de débitos técnicos com análise paralela por codebases.

## Agents

| ID | Capability | Path |
|----|------------|------|
| tech_debt_scan_agent | debt_analysis | .claude/agents/tech-debt-scan-agent.md |

## Execution Modes

- **main_context**: Executa na mesma janela de contexto, sem criar subprocess

## Steps

### S0: Validar Entrada

**Execution**: main_context

**Descrição**: Validar argumento de entrada e descobrir codebases em ./codebases

**Instrução**:

ARGUMENTO OBRIGATÓRIO:
1. debt_list_file: Arquivo .md com débitos técnicos conhecidos

VALIDAÇÕES:
- Validar debt_list_file existe (Read). Se não: ABORTAR "❌ Arquivo não encontrado"
- Glob ./codebases/* para listar subdiretórios (codebases)
- Se ./codebases não existe ou está vazia: ABORTAR "❌ Nenhum codebase encontrado em ./codebases"
- memory.codebases = [{name: "backend", path: "./codebases/backend"}, ...]
- memory.debt_list_file = debt_list_file
- memory.output_dir = "./output/debt-analysis/"

**Prompts:**

| Nome | Ordem | Obrigatório | Validação | Texto |
|------|-------|-------------|-----------|-------|
| debt_list_file | 1 | Sim | file_exists | Arquivo .md com débitos técnicos conhecidos: |

**Outputs:**

| Nome | Target |
|------|--------|
| codebases | memory.codebases |
| debt_list_file | memory.debt_list_file |
| output_dir | memory.output_dir |
| input_validated | memory.input_validated |

---

### S1: Validar Warmup

**Execution**: main_context

**Descrição**: Validar que warmup-tech.md existe e está completo

**Instrução**:

1. Read ./warmup-tech.md, extrair status do front matter
2. Se status !== 'completed': ABORTAR "❌ Execute /create-warmup-tech primeiro"
3. memory.warmup_validated = true

**Outputs:**

| Nome | Target |
|------|--------|
| warmup_validated | memory.warmup_validated |

---

### S2: Carregar Contexto

**Execution**: main_context

**Descrição**: Carregar contexto técnico e preparar lista de codebases para análise paralela

**Instrução**:

1. Ler warmup-tech.md → memory.tech_context
2. Ler debt_list_file → memory.debt_list
3. memory.codebases_pending = memory.codebases.copy()
4. memory.codebases_in_progress = []
5. memory.codebases_completed = []
6. memory.max_parallel_agents = 5
7. memory.agent_results = []

**Outputs:**

| Nome | Target |
|------|--------|
| tech_context | memory.tech_context |
| debt_list | memory.debt_list |
| codebases_pending | memory.codebases_pending |
| context_loaded | memory.context_loaded |

---

### S3: Lançar Agentes Paralelos

**Execution**: main_context

**Descrição**: Lançar agentes paralelos para análise de cada codebase

**Instrução**:

1. slots = max_parallel_agents - codebases_in_progress.length
2. Para cada codebase em codebases_pending.slice(0, slots):
   - Mover para codebases_in_progress
   - Task(subagent_type="general-purpose", run_in_background=true):
     "Analisar codebase {codebase.path}:
      - Usar debt_list_file: {memory.debt_list_file}
      - Buscar débitos da lista via Grep/Glob
      - Discovery proativo: TODOs/FIXMEs, code smells, deps desatualizadas
      - Para CADA débito encontrado, preencher TODOS os campos do template
      Retornar JSON: {codebase: string, debts_listed: [...], debts_discovered: [...]}"
3. Armazenar agent_ids em parallel_agent_ids

**Outputs:**

| Nome | Target |
|------|--------|
| parallel_agent_ids | memory.parallel_agent_ids |
| parallel_launched | memory.parallel_launched |

---

### S4: Aguardar e Consolidar

**Execution**: main_context

**Descrição**: Aguardar agentes e consolidar resultados de todos os codebases

**Instrução**:

1. AgentOutputTool para cada agent_id. Se completed:
   - Mover codebase de codebases_in_progress para codebases_completed
   - Adicionar resultado a agent_results
2. Se codebases_pending.length > 0: has_pending_codebases = true (volta S3)
3. Se todos completed: consolidar resultados:
   - debts_listed: todos os débitos da lista fornecida (origin: "listed")
   - debts_discovered: todos os débitos encontrados via discovery (origin: "discovered")
   - Remover duplicatas (mesmo arquivo:linha)
   - Agrupar por codebase e por prioridade

**Outputs:**

| Nome | Target |
|------|--------|
| consolidated_debts | memory.consolidated_debts |
| has_pending_codebases | memory.has_pending_codebases |
| consolidation_completed | memory.consolidation_completed |

---

### S5: Gerar Relatórios

**Execution**: main_context

**Descrição**: Gerar relatórios individuais seguindo RIGOROSAMENTE o template e relatório consolidado

**Instrução**:

1. mkdir -p ${memory.output_dir}
2. Para cada débito (listed + discovered):
   - Ler template: .claude/templates/tech-debt-report.md
   - Write {codebase}-{slug}-{timestamp}.md seguindo RIGOROSAMENTE o template
3. Write consolidated-report-{timestamp}.md

**Outputs:**

| Nome | Target |
|------|--------|
| debt_files | memory.debt_files |
| consolidated_report | memory.consolidated_report |
| report_generated | memory.report_generated |

---

### S6: Resumo

**Execution**: main_context

**Descrição**: Exibir resumo final da análise multi-codebase

**Instrução**:

Exibir resumo formatado:

✅ ANÁLISE DE DÉBITOS TÉCNICOS CONCLUÍDA

📊 Estatísticas:
- Codebases analisados: X
- Total de débitos: Y
  - 📋 Da lista fornecida: N
  - 🔍 Descobertos: M
- Por prioridade: 🔴 Alta: N | 🟡 Média: N | 🟢 Baixa: N

📁 Relatório consolidado: {consolidated_report_path}
   Relatórios individuais: {count} arquivos em {output_dir}

## Rules

| Condição | Ação | Step/Mensagem |
|----------|------|---------------|
| S0.completed AND input_validated | execute | S1 |
| S0.completed AND !input_validated | error | ❌ Validação falhou |
| S1.completed AND warmup_validated | execute | S2 |
| S1.completed AND !warmup_validated | error | ❌ Execute /create-warmup-tech |
| S2.completed AND context_loaded | execute | S3 |
| S3.completed AND parallel_launched | execute | S4 |
| S4.completed AND has_pending_codebases | execute | S3 |
| S4.completed AND consolidation_completed | execute | S5 |
| S5.completed AND report_generated | execute | S6 |
| S6.completed | end | - |

## Final Outputs

| Nome | From | Type |
|------|------|------|
| debt_files | memory.debt_files | array |
| consolidated_report | memory.consolidated_report | file |
| report_stats | memory.report_stats | data |

## Output Config

- **Base Dir**: ./output/debt-analysis
