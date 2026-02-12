---
name: Story Context Preparation Workflow
description: Prepara contexto de iniciativa classificando complexidade e gerando estrutura inicial
version: "1.0"
command: /initiative-start
capability: story
start_step: S0
---

# /initiative-start

Prepara contexto de iniciativa classificando complexidade e gerando estrutura inicial.

## Agents

| ID | Capability | Path |
|----|------------|------|
| context_analyzer_agent | story | .claude/agents/context-analyzer-agent.md |

## Execution Modes

- **main_context**: Executa na mesma janela de contexto, sem criar subprocess

## Steps

### S0: Input Collection

**Execution**: main_context

**Descrição**: Coletar input da iniciativa

**Prompts:**

| Nome | Ordem | Obrigatório | Validação | Texto |
|------|-------|-------------|-----------|-------|
| initiative_file | 1 | Sim | file_exists | Caminho do arquivo da iniciativa (.md ou .txt) |
| initiative_name | 2 | Sim | - | Nome curto da iniciativa (para identificação) |

---

### S1: Context Analysis

**Execution**: main_context

**Descrição**: Analisar contexto e classificar iniciativa

**Agent**: context_analyzer_agent (task: classify_initiative)

---

### S2: Structure Generation

**Execution**: main_context

**Descrição**: Gerar estrutura inicial baseada na classificação

**Instrução:**

GERAR ESTRUTURA BASEADA NA CLASSIFICAÇÃO:

1. Criar diretório da iniciativa:
   - ./implementations/{initiative_name}/

2. Criar arquivo de contexto:
   - ./implementations/{initiative_name}/CONTEXT.md

   Conteúdo:
   ```markdown
   # {initiative_name}

   ## Classificação
   - **Tipo**: {classification}
   - **Confiança**: {confidence}

   ## Análise de Impacto

   ### Personas Impactadas
   {lista de personas}

   ### Fluxos Afetados
   {lista de fluxos}

   ## Justificativa
   {reasoning}

   ## Próximos Passos Sugeridos
   {baseado na classificação}
   ```

3. Se ATOMIC:
   - Sugerir criação direta de task
   - Não precisa de User Stories

4. Se FOCUSED:
   - Sugerir criação de 1-2 User Stories
   - Recomendar /create-us

5. Se WIDE:
   - Sugerir breakdown em épicos
   - Recomendar análise de PRD primeiro
   - Alertar sobre necessidade de planejamento

---

### S3: Summary

**Execution**: main_context

**Descrição**: Apresentar resumo e próximos passos

**Instrução:**

APRESENTAR RESUMO:

1. Exibir classificação e justificativa
2. Mostrar estrutura criada
3. Sugerir próximo comando baseado na classificação:
   - ATOMIC: "Próximo: Crie uma task diretamente ou use /implement"
   - FOCUSED: "Próximo: Use /create-us para criar User Stories"
   - WIDE: "Próximo: Analise o PRD com /create-us ou quebre em iniciativas menores"

## Rules

| Condição | Ação | Step |
|----------|------|------|
| S0.completed | execute_step | S1 |
| S1.completed | execute_step | S2 |
| S2.completed | execute_step | S3 |
| S3.completed | end | - |

## Final Outputs

| Nome | From | Type |
|------|------|------|
| classification | memory.classification | string |
| reasoning | memory.reasoning | string |
| impacted_personas | memory.impacted_personas | array |
| impacted_flows | memory.impacted_flows | array |
| context_file | memory.context_file | file |

## Output Config

- **Base Dir**: ./implementations
