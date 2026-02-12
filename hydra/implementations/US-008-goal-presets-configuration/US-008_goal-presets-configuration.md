## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario eu quero configurar minha meta diaria de hidratacao e os valores de preset do quick log para que o app se adapte as minhas necessidades pessoais.

### Funcionalidades Principais
- Pagina Settings com configuracao de meta diaria (slider ou input, 500ml-5000ml)
- Configuracao de presets do quick log (3 valores customizaveis)
- Valores padrao: meta 2000ml, presets 200/300/500ml
- Alteracoes salvas automaticamente no store

### Criterios de Aceite Chave
- Meta diaria alterada reflete imediatamente no progress ring e calculo de streak
- Presets alterados refletem imediatamente nos botoes de Quick Log
- Valores persistem entre sessoes
- Validacao: meta entre 500-5000ml, presets entre 50-2000ml

---

## Contexto Detalhado para Agentes

# User Story: Goal & Presets Configuration

## Declaracao da historia

Como um usuario eu quero configurar minha meta diaria de hidratacao e os valores de preset do quick log para que o app se adapte as minhas necessidades pessoais.

## Criterios funcionais

- Pagina Settings (rota `/settings`) com 2 secoes:

**1. Daily Goal:**
- Label "Daily goal" com valor atual exibido (ex: "2L" ou "2500ml")
- Input de ajuste: slider (range 500-5000, step 100) OU input numerico
- Valor default: 2000ml
- Ao alterar, store.setDailyGoal(value) e chamado imediatamente
- Validacao: minimo 500ml, maximo 5000ml

**2. Quick Log Presets:**
- Label "Quick log presets" com 3 campos editaveis
- Cada campo: input numerico com valor atual, label "ml"
- Valores default: 200, 300, 500
- Ao alterar, store.setPresets([v1, v2, v3])
- Validacao: cada preset entre 50-2000ml
- Ordenacao: presets exibidos em ordem crescente

**Comportamento geral:**
- Alteracoes salvas automaticamente (sem botao "Save" — consistente com padrao local-first)
- Feedback sutil ao salvar (ex: checkmark temporario ou texto "Saved")

## Criterios de experiencia do usuario

- Layout simples e limpo com secoes bem separadas (Separator ou espaco)
- Headers de secao em texto semibold com descricao breve
- Slider com track visivel e thumb arrastavel (se usado)
- Inputs numericos com step buttons ou gestures de incremento/decremento
- Campos de preset em row horizontal (3 campos lado a lado)
- Feedback de salvamento discreto e nao-intrusivo
- Erro de validacao inline (borda vermelha + mensagem) sem bloquear outras interacoes

## Testes regressivos

- US-001: Aba Settings no navigation deve levar a esta pagina
- US-002: Alteracoes de goal e presets devem persistir entre sessoes
- US-003: Presets alterados devem refletir nos botoes de Quick Log
- US-004: Goal alterado deve mudar a meta no progress ring e o calculo de porcentagem
- US-005: Goal alterado deve recalcular streak (meta mais alta pode reduzir streak)
- US-006: Goal alterado deve mudar a linha de meta no chart e recalcular stats

## Criterios para QA

- Padroes de qualidade: Persistencia, validacao, impacto cross-feature correto
- Cenarios de teste:
  - Caminho feliz: Usuario altera meta para 3000ml — progress ring reflete nova meta
  - Caminho feliz: Usuario altera preset de 200 para 250 — botao no Quick Log mostra 250
  - Caminho feliz: Usuario altera configuracoes, fecha app, reabre — valores preservados
  - Caminho de insucesso: Usuario tenta meta de 400ml — nao deve aceitar (minimo 500)
  - Caminho de insucesso: Usuario tenta preset de 30ml — nao deve aceitar (minimo 50)
  - Caminho alternativo: Usuario volta meta para 2000ml — padrao restaurado
  - Testes nao-funcionais: Alterar meta rapidamente (slider drag) nao deve causar renders excessivos (debounce)
- Homologacao: Testar interacao de slider em touch devices; input numerico com teclado mobile

## Criterios de aceitacao

- Validacao completa do fluxo: alterar meta e presets, verificar impacto em todas as telas
- Meta alterada reflete em: progress ring, streak, history chart, stats
- Presets alterados refletem nos botoes de Quick Log
- Validacao de ranges funcional (500-5000 para meta, 50-2000 para presets)
- Salvamento automatico sem botao explicito
- Prototipo de referencia: nao ha prototipo para Settings — seguir design language do app (Cards, inputs shadcn/ui)
