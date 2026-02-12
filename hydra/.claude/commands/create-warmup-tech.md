# /create-warmup-tech - Warmup Tech Workflow

Workflow para gerar, validar e aprovar especificações técnicas para projetos novos ou existentes.

## Metadata

- **Version**: 2.0
- **Capability**: technical_specification
- **Start Step**: S0

## Agents

| ID | Capability | Path |
|----|------------|------|
| codebase_explorer_agent | technical_specification | .claude/agents/codebase-explorer-agent.md |
| warmup_tech_discovery_agent | technical_specification | .claude/agents/warmup-tech-discovery-agent.md |
| warmup_tech_builder_agent | technical_specification | .claude/agents/warmup-tech-builder-agent.md |
| warmup_tech_validator_agent | technical_specification | .claude/agents/warmup-tech-validator-agent.md |
| design_system_generator_agent | technical_specification | .claude/agents/design-system-generator-agent.md |

## Execution Modes

- **main_context**: Executa na mesma janela de contexto (S0, S1, S2, S4, S9, S10)
- **subagent**: Invoca subagent em janela separada (S3, S3.5, S5, S6, S7, S8)

## Steps

### S0 - Ler configurações do warmup-project.md
**Execution**: main_context

**Instrução:**
Carregar Configurações do Projeto:

1. Verificar se ./warmup-project.md existe, caso contrário ABORTAR
2. Ler front matter (YAML entre --- e ---) e conteúdo markdown:
   - Verificar se status === 'completed' no front matter
   - Se status !== 'completed': ABORTAR com "⚠️ warmup-project.md não está preenchido. Execute o warmup do projeto primeiro."
3. Parsear seções markdown e extrair:
   - Seção "Setup" → "Nome do projeto" → project_name
   - Seção "Setup" → "Estrutura de Diretórios" → "Resources" → resources_directory
   - Seção "Setup" → "Estrutura de Diretórios" → "Codebase" → codebase_base_directories (array, pode ser vazio)
4. Validar: project_name e resources_directory não vazios (sem placeholders {{}})
5. Armazenar em memory: project_name, resources_directory, codebase_base_directories, codebase_count_from_config, config_loaded

Se falhar: ABORTAR com "⚠️ Arquivo warmup-project.md não encontrado ou inválido. Execute o warmup do projeto primeiro."

**Outputs:**

| Nome | Target | Type |
|------|--------|------|
| project_name | memory | string |
| resources_directory | memory | string |
| codebase_base_directories | memory | array |
| codebase_count_from_config | memory | number |
| config_loaded | memory | boolean |

---

### S1 - Verificar disponibilidade de recursos (opcional)
**Execution**: main_context

**Instrução:**
Verificar recursos do projeto (OPCIONAL):

1. Verificar se ${memory.resources_directory} existe e contém arquivos válidos (.md, .txt, .pdf)
   - Ignorar: .DS_Store, .git/, etc.
   - Se encontrar arquivos válidos (>100 caracteres): has_resources_files=true
   - Se vazio ou sem arquivos válidos: has_resources_files=false
   - SEMPRE marcar validation_passed=true (recursos são opcionais)

2. Buscar product_spec_*.md (OPCIONAL - se encontrado, usar como contexto de negócio primário)
   - Marcar has_product_spec conforme resultado

**Outputs:**

| Nome | Target | Type |
|------|--------|------|
| validation_passed | memory | boolean |
| has_resources_files | memory | boolean |
| has_product_spec | memory | boolean |

---

### S2 - Verificar presença de codebase e determinar modo
**Execution**: main_context

**Instrução:**
Determinar modo de análise (Automático vs Guiado):

1. Se ${memory.codebase_base_directories} vazio:
   - AskUserQuestion: "Nenhum codebase configurado. Projeto realmente sem código?"
     * "Sim (projeto novo)" → guided_mode=true, prosseguir S3
     * "Não (existe mas não configurado)" → ABORTAR "Configure codebases em warmup-project.md na seção Setup → Directory Structure → Codebase"

2. Se codebases disponíveis:
   - Validar cada diretório: existência + arquivos de código (.js, .ts, .py, .rb, .go)
   - Ignorar: node_modules/, .git/, dist/, build/, coverage/
   - Mínimo: 1 arquivo de código por diretório
   - Se inválido: ABORTAR "⚠️ Diretórios de codebase inválidos: [lista]. Verifique caminhos no warmup-project.md"
   - Armazenar: all_codebases, guided_mode=false, codebase_count

**Outputs:**

| Nome | Target | Type |
|------|--------|------|
| guided_mode | memory | boolean |
| codebase_validation_passed | memory | boolean |
| codebase_count | memory | number |
| codebase_error_message | memory | string |

---

### S3 - Coletar dados técnicos
**Execution**: subagent
**Agent**: codebase_explorer_agent (automático) ou warmup_tech_discovery_agent (guiado)

Coletar dados técnicos via Codebase Explorer (automático) ou Warmup Tech Discovery (guiado), dependendo do valor de guided_mode.

**Outputs:**

| Nome | Target | Type |
|------|--------|------|
| collected_tech_data | memory | object |
| confidence_map | memory | object |
| sources_metadata | memory | object |
| template_coverage | memory | object |
| analysis_metadata | memory | object |
| thinking_transparency_metrics | memory | object |
| has_design_system | memory | boolean |
| ds_source | memory | string |
| ds_location | memory | string |

---

### S3.5 - Coletar conhecimento humano (OBRIGATÓRIO)
**Execution**: subagent
**Agent**: warmup_tech_discovery_agent
**Task**: collect_human_knowledge

Coletar conhecimento humano através de perguntas dinâmicas.

**Outputs:**

| Nome | Target | Type |
|------|--------|------|
| human_knowledge_data | memory | string |

---

### S4 - Detectar frontend e verificar necessidade de Design System
**Execution**: main_context

**Instrução:**
Detectar presença de frontend e necessidade de Design System:

1. DETECTAR FRONTEND (econômico):
   - Se guided_mode=true: Verificar se collected_tech_data indica frontend/fullstack
   - Se tem codebase: Glob **/*.{tsx,jsx,vue,svelte} (limit 5)
   - Se 0 arquivos frontend: has_frontend=false → SKIP S5/S6

2. VERIFICAR DESIGN SYSTEM:
   - Se has_frontend=false: SKIP para S7
   - Se has_design_system=true E ds_source != 'auto': SKIP para S7
   - Se has_design_system=false OU ds_source='auto': Prosseguir S5

3. Armazenar: has_frontend, needs_ds_generation

**Outputs:**

| Nome | Target | Type |
|------|--------|------|
| has_frontend | memory | boolean |
| needs_ds_generation | memory | boolean |

---

### S5 - Extrair design tokens do codebase
**Execution**: subagent
**Agent**: codebase_explorer_agent
**Task**: extract_design_tokens

Extrair design tokens do codebase frontend.

**Outputs:**

| Nome | Target | Type |
|------|--------|------|
| extracted_design_tokens | memory | object |

---

### S6 - Gerar design-system.md
**Execution**: subagent
**Agent**: design_system_generator_agent
**Task**: generate_design_system

Gerar design-system.md e validar com usuário.

**Outputs:**

| Nome | Target | Type |
|------|--------|------|
| design_system_file | memory | file |
| extraction_log | memory | object |

---

### S7 - Construir documento warmup_tech.md
**Execution**: subagent
**Agent**: warmup_tech_builder_agent
**Task**: build_warmup_tech_document

Construir documento warmup_tech.md estruturado a partir de dados coletados.

**Outputs:**

| Nome | Target | Type |
|------|--------|------|
| warmup_tech_file | memory | file |
| generated_warmup_tech_content | memory | string |

---

### S8 - Validar qualidade e completude
**Execution**: subagent
**Agent**: warmup_tech_validator_agent
**Task**: validate_warmup_tech

Validar qualidade e completude da especificação técnica gerada.

**Outputs:**

| Nome | Target | Type |
|------|--------|------|
| validation_report | memory | object |
| gap_analysis | memory | object |
| improvement_suggestions | memory | object |
| readiness_score | memory | object |

---

### S9 - Revisão humana e aprovação do Tech Lead
**Execution**: main_context

**Instrução:**
Revisão humana do Tech Lead:

1. Exibir Executive Summary:
   ```
   # 📊 REVISÃO TÉCNICA - APROVAÇÃO NECESSÁRIA

   Arquivo: ${memory.warmup_tech_file}
   Score: ${memory.readiness_score.final}% (${memory.readiness_score.recommendation})

   Breakdown: Completude, Qualidade, Red Team, Template

   Issues Críticos (HIGH): ${gap_analysis HIGH severity}

   ## 🔍 Thinking Transparency

   ### Red Team Thinking Process Applied
   - Total assertions validated
   - Grep searches executed
   - Source citations provided
   - Confidence classification breakdown (🟢🟡🔴)

   ### Thinking Levels Used
   - think (basic analysis)
   - think hard (gap analysis iteration)
   - think harder (limitation evaluation)
   - ultrathink (critical maximum evaluation)

   ### Validation Summary
   - Zero inventions policy compliance
   - Source citations status
   - Conflicts resolved
   ```

2. AskUserQuestion "Aprovar especificação técnica para uso?":
   - "Aprovar e finalizar" → tech_lead_decision="approved"
   - "Solicitar ajustes" → tech_lead_decision="needs_revision", coletar revision_feedback
   - "Rejeitar especificação" → tech_lead_decision="rejected", coletar rejection_reason

**Outputs:**

| Nome | Target | Type |
|------|--------|------|
| tech_lead_decision | memory | string |
| revision_feedback | memory | string |
| rejection_reason | memory | string |

---

### S10 - Apresentar resumo final
**Execution**: main_context

**Instrução:**
Exibir resumo final:

```
✅ Especificação Técnica Concluída

Projeto: ${memory.project_name}
Recursos: ${memory.resources_directory}
Modo: Guiado ou Automático
Codebases: ${memory.codebase_count}
Product Spec: Encontrado/Não encontrado

Arquivo: 📄 ${memory.warmup_tech_file}

Validação: Red Team (7 etapas), níveis estratégicos de pensamento, classificação tripla (🟢🟡🔴), validação sistemática com Grep

Score: ${memory.readiness_score.final}%
Decisão: ${memory.tech_lead_decision}
```

**Outputs:**

| Nome | Target | Type |
|------|--------|------|
| summary_message | memory | string |

## Rules

| Condição | Ação | Step |
|----------|------|------|
| S0 completed AND config_loaded=false | error | - |
| S0 completed AND config_loaded=true | execute_step | S1 |
| S1 completed | execute_step | S2 |
| S2 completed AND codebase_error_message != '' | error | - |
| S2 completed | execute_step | S3 |
| S3 completed | execute_step | S3.5 |
| S3.5 completed | execute_step | S4 |
| S4 completed AND has_frontend=false | execute_step | S7 |
| S4 completed AND needs_ds_generation=false | execute_step | S7 |
| S4 completed AND needs_ds_generation=true | execute_step | S5 |
| S5 completed | execute_step | S6 |
| S6 completed | execute_step | S7 |
| S7 completed | execute_step | S8 |
| S8 completed | execute_step | S9 |
| S9 completed AND tech_lead_decision='approved' | execute_step | S10 |
| S9 completed AND tech_lead_decision='needs_revision' | execute_step | S3 |
| S9 completed AND tech_lead_decision='rejected' | execute_step | S10 |
| S10 completed | end | - |

## Final Outputs

| Nome | From | Type |
|------|------|------|
| warmup_tech | memory.warmup_tech_file | file |
| design_system | memory.design_system_file | file |
| validation_report | memory.validation_report | data |
| tech_lead_decision | memory.tech_lead_decision | data |
| summary | memory.summary_message | data |

## Output Config

- **Base Dir**: ./
- **Debug**: false

**IMPORTANTE**: O arquivo warmup-tech.md DEVE ser escrito na RAIZ do projeto (./)
NÃO usar ./output/ ou ./resources/ - warmup-tech.md sempre na raiz
