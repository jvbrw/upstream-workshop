---
title: {{titulo}}
type: tech-debt-report
date: {{date}}
priority: {{prioridade}}
module: {{module}}
origin: {{origem}}  # "listed" (da lista fornecida) ou "discovered" (encontrado via discovery)
---

# {{titulo}}

> **Origem**: {{#if (eq origem "listed")}}📋 Da lista fornecida{{else}}🔍 Descoberto via análise{{/if}}

## Descrição

{{descricao}}

## Riscos Gerados

{{#each riscos}}
### {{id}} - {{titulo}}

- **Descrição**: {{descricao}}
- **Probabilidade de Ocorrer**: {{probabilidade}}
- **Severidade se Ocorrer**: {{severidade}}

{{/each}}

## Estimativa de Esforço para Solução

- **Estimativa Tradicional**: {{esforco_tradicional}}
  _Tempo estimado para um Dev Fullstack Senior resolver manualmente_

- **Estimativa via AI Framework**: {{esforco_ai_framework}}
  _Tempo com agentes AI: iniciativa → geração US → refinamento → implementação_

## Solução Recomendada

{{solucao_recomendada}}

## Prioridade

**{{prioridade}}**
