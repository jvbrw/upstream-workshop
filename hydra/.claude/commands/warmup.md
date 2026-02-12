---
name: Warmup Unified Workflow
description: Workflow unificado para setup inicial do projeto, incluindo descoberta e geração de produto e projeto
version: "1.0"
command: /warmup
capability: project_setup
start_step: S0
---

# /warmup

Workflow unificado para setup inicial do projeto, incluindo descoberta e geração de produto e projeto.

## Agents

| ID | Capability | Path |
|----|------------|------|
| warmup_product_discovery_agent | product_discovery | .claude/agents/warmup-product-discovery-agent.md |
| warmup_product_generator_agent | product_generation | .claude/agents/warmup-product-generator-agent.md |
| warmup_project_discovery_agent | project_discovery | .claude/agents/warmup-project-discovery-agent.md |
| warmup_project_generator_agent | project_generation | .claude/agents/warmup-project-generator-agent.md |

## Execution Modes

- **main_context**: Executa na mesma janela de contexto, sem criar subprocess
- **subagent**: Executa como subagent em janela de contexto separada

## Steps

### S0: Verificar Resources

**Execution**: main_context

**Descrição**: Verificar se o diretório /resources existe na raiz do projeto

**Instrução:**

Verificar se o diretório ./resources/ existe. Se não existir, criar o diretório.
Confirmar que o diretório está pronto para receber os arquivos de warmup.

---

### S1: Product Discovery

**Execution**: subagent

**Descrição**: Descobrir informações sobre o produto lendo ./resources/

**Agent**: warmup_product_discovery_agent (task: discover_product_info)

---

### S2: Product Generation

**Execution**: subagent

**Descrição**: Gerar arquivo warmup-product.md com as informações coletadas

**Agent**: warmup_product_generator_agent (task: generate_warmup_product)

---

### S3: Project Discovery

**Execution**: subagent

**Descrição**: Descobrir configurações do projeto analisando codebase e ./resources/

**Agent**: warmup_project_discovery_agent (task: discover_project_config)

---

### S4: E2E Auto-Detection

**Execution**: main_context

**Descrição**: Detectar automaticamente configurações E2E do codebase

**Instrução:**

Este step só é executado se memory.project_data.testing.test_types incluir "e2e".

**1. Detectar URLs de ambiente:**
   - Buscar arquivos: .env.local, .env.test, .env.development, .env
   - Extrair variáveis de Frontend e API

**2. Detectar data_strategy:**
   - fixtures/, seeds/, mocks/

**3. Detectar rotas principais:**
   - React Router, Vue Router, Next.js

**4. Detectar timeouts de Playwright:**
   - timeout, actionTimeout, navigationTimeout

**5. Armazenar resultado em memory.e2e_detected**

---

### S5: E2E Preview & Approval

**Execution**: main_context

**Descrição**: Exibir preview das configurações E2E e solicitar aprovação do usuário

**Instrução:**

1. EXIBIR PREVIEW FORMATADO das configurações detectadas
2. SOLICITAR APROVAÇÃO via AskUserQuestion:
   - Aprovar configurações
   - Ajustar manualmente
   - Pular E2E
3. SE "Ajustar manualmente": fazer perguntas específicas
4. SEMPRE PERGUNTAR CREDENCIAIS (obrigatório por segurança)
5. ATUALIZAR project_data com e2e_config aprovado

---

### S6: Project Preview, Aprovação e Generation

**Execution**: main_context

**Descrição**: Validar dados coletados com usuário e gerar arquivo warmup-project.md

**Instrução:**

**PARTE 1: PREVIEW E APROVAÇÃO**

1. RECUPERAR dados de memory.project_data
2. EXIBIR PREVIEW COMPLETO
3. USAR AskUserQuestion para solicitar aprovação
4. SE usuário selecionar "Não, preciso ajustar": permitir correções e REPETIR

⛔ NÃO prosseguir para PARTE 2 sem aprovação explícita

**PARTE 2: GERAÇÃO DO ARQUIVO (somente após aprovação)**

5. APÓS APROVAÇÃO, gerar o arquivo warmup-project.md na raiz
6. Confirmar criação: "✅ Arquivo warmup-project.md gerado com sucesso!"

---

### S7: Chamar Tech Spec Workflow

**Execution**: main_context

**Descrição**: Chamar o workflow de criação de especificação técnica

**Instrução:**

Executar o comando /create-warmup-tech para gerar a especificação técnica do projeto.

---

### S8: Resumo Final

**Execution**: main_context

**Descrição**: Exibir resumo final do processo de warmup

**Instrução:**

Exibir um resumo completo do processo de warmup:

- warmup-product.md - Informações do produto
- warmup-project.md - Configurações do projeto
- warmup-tech.md - Especificação técnica

Informar ao usuário que o projeto está pronto para iniciar o desenvolvimento.

## Rules

| Condição | Ação | Step |
|----------|------|------|
| S0.completed | execute | S1 |
| S1.completed | execute | S2 |
| S2.completed | execute | S3 |
| S3.completed AND test_types contains 'e2e' | execute | S4 |
| S3.completed AND NOT test_types contains 'e2e' | execute | S6 |
| S4.completed | execute | S5 |
| S5.completed | execute | S6 |
| S6.completed | execute | S7 |
| S7.completed | execute | S8 |
| S8.completed | end | - |

## Final Outputs

| Nome | From | Type |
|------|------|------|
| warmup_product_path | memory.warmup_product_path | file |
| warmup_project_path | memory.warmup_project_path | file |
| warmup_tech_path | memory.warmup_tech_path | file |
| e2e_config_approved | memory.e2e_config_approved | data |
| summary | memory.summary | data |

## Output Config

- **Base Dir**: ./
