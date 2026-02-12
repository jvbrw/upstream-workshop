---
name: PR Workflow - Abertura de Pull Request via GitHub MCP
description: Abre Pull Request(s) no GitHub a partir do arquivo PR-{us_slug}.md gerado pelo /implementation. Usa GitHub MCP ou gh CLI como fallback.
version: "1.0"
command: /pr
capability: swe
start_step: S0_INPUT
---

# /pr

Abre Pull Request(s) no GitHub a partir do arquivo PR-{us_slug}.md gerado pelo /implementation. Usa GitHub MCP para criar PR, fazer upload de evidências (screenshots/videos) e adicionar body formatado. Fallback para gh CLI se MCP não disponível.

## Execution Modes

- **main_context**: Executa na mesma janela de contexto, sem criar subprocess

## Steps

### S0_INPUT: Capturar US Slug

**Execution**: main_context

**Descrição**: Capturar US Slug do argumento ou solicitar ao usuário

---

### S1_VALIDATE: Validar Arquivo PR

**Execution**: main_context

**Descrição**: Buscar e validar arquivo PR usando padrões flexíveis

---

### S2_PARSE: Parsear Arquivo PR

**Execution**: main_context

**Descrição**: Ler e parsear o arquivo PR-{us_slug}.md

---

### S3_CHECK_MCP: Verificar GitHub MCP

**Execution**: main_context

**Descrição**: Verificar se GitHub MCP está disponível

---

### S3_5_CHECK_GH_CLI: Verificar gh CLI

**Execution**: main_context

**Descrição**: Verificar disponibilidade do gh CLI como fallback

---

### S4_UPLOAD_EVIDENCE: Upload de Evidências

**Execution**: main_context

**Descrição**: Fazer upload de screenshots e videos para o repositório

---

### S5_CREATE_PR: Criar PR via MCP

**Execution**: main_context

**Descrição**: Criar ou atualizar Pull Requests via GitHub MCP

---

### S5_CREATE_PR_GH_CLI: Criar PR via gh CLI

**Execution**: main_context

**Descrição**: Criar Pull Request usando gh CLI (sem upload de evidências)

---

### S5_MANUAL: Modo Manual

**Execution**: main_context

**Descrição**: Gerar instruções para criação manual de PR

---

### S6_REPORT: Relatório Final

**Execution**: main_context

**Descrição**: Exibir relatório de PRs criados

## Rules

| Condição | Ação | Step |
|----------|------|------|
| S0_INPUT.completed | execute_step | S1_VALIDATE |
| S1_VALIDATE.completed AND validation_passed | execute_step | S2_PARSE |
| S1_VALIDATE.completed AND validation_failed | end | - |
| S2_PARSE.completed | execute_step | S3_CHECK_MCP |
| S3_CHECK_MCP.completed AND github_mcp_available | execute_step | S4_UPLOAD_EVIDENCE |
| S3_CHECK_MCP.completed AND NOT github_mcp_available | execute_step | S3_5_CHECK_GH_CLI |
| S3_5_CHECK_GH_CLI.completed AND gh_cli_available | execute_step | S5_CREATE_PR_GH_CLI |
| S3_5_CHECK_GH_CLI.completed AND NOT gh_cli_available | execute_step | S5_MANUAL |
| S4_UPLOAD_EVIDENCE.completed | execute_step | S5_CREATE_PR |
| S5_CREATE_PR.completed | execute_step | S6_REPORT |
| S5_CREATE_PR_GH_CLI.completed | execute_step | S6_REPORT |
| S5_MANUAL.completed | execute_step | S6_REPORT |
| S6_REPORT.completed | end | - |

## Final Outputs

| Nome | From | Type |
|------|------|------|
| all_pr_urls | memory.all_pr_urls | array |
| final_report | memory.final_report | string |
| github_mcp_available | memory.github_mcp_available | boolean |

## Output Config

- **Base Dir**: ./output
