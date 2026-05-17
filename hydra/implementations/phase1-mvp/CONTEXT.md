# Phase 1 MVP: Build the Habit

## Classificacao
- **Tipo**: WIDE
- **Confianca**: HIGH

## Objetivo
Validar o core loop: registrar agua, ver progresso, voltar amanha.

## Analise de Impacto

### Personas Impactadas
- **Ana (Profissional de Mesa)** — Persona primaria. Precisa de registro sem friccao (< 3s), feedback visual, zero configuracao inicial. Abordagem local-first (sem conta) atende diretamente seu padrao de tentar e abandonar apps.
- **Lucas (Construtor de Habitos)** — Persona secundaria. Motivado por streaks, metas e historico para identificar padroes. Configuracao de meta e visualizacao de tendencias sao essenciais.

### Fluxos Afetados
1. Navegacao do app (bottom nav, 3-4 tabs, rotas)
2. Registro diario (quick log com presets + custom)
3. Visualizacao de progresso (progress ring em tempo real)
4. Rastreamento de streak (dias consecutivos)
5. Analise historica (grafico semanal, stats, heatmap 14 dias)
6. Gestao de dados (editar/deletar entradas)
7. Configuracao (meta diaria, presets)
8. Persistencia (localStorage via Zustand)

---

## User Stories Necessarias

### Fundacao (deve existir primeiro)
| US | Nome | Razao |
|----|------|-------|
| US-001 | App Shell & Navigation | Container do produto. Sem navegacao, nao ha app. |
| US-002 | Hydration Data Persistence | Sem persistencia, dados se perdem ao recarregar. |

### Core Loop (razao do produto existir)
| US | Nome | Razao |
|----|------|-------|
| US-003 | Quick Log Water Intake | Acao primaria. Se levar > 3s, a proposta falha. |
| US-004 | Daily Progress Visualization | Feedback primario. Sem ver progresso, nao ha motivacao. |

### Mecanismos de Retencao
| US | Nome | Razao |
|----|------|-------|
| US-005 | Streak Tracking | Reforco de habito. Ligado diretamente a retencao 7d > 40%. |
| US-006 | History Weekly Insights | Atende Lucas. Sem padroes visiveis, usuarios analiticos abandonam. |

### Controle do Usuario (completude e confianca)
| US | Nome | Razao |
|----|------|-------|
| US-007 | Manage Log Entries | Correcao de erros = confianca nos dados. Sem isso, abandono. |
| US-008 | Goal Presets Configuration | 2L nao serve pra todos. Sem ajuste, progresso e' impreciso. |

### Excluida do MVP
| US | Nome | Razao |
|----|------|-------|
| US-009 | Hydration Reminders | Phase 2. Requer Web Push API e service workers. MVP valida o loop sem push. |

---

## Decisoes de Produto (definidas em 2026-02-12)

| # | Questao | Decisao |
|---|---------|---------|
| 1 | Timing do core loop | Validar em dispositivo real (< 3s) |
| 2 | Default da meta | **Manter 2L.** Sem onboarding de peso/atividade. |
| 3 | Streak + mudanca de meta | **So pra frente.** Historico nao e' re-avaliado contra nova meta. |
| 4 | Navegacao | **4 tabs. Settings merece aba propria.** |
| 5 | Empty states | **Com sugestoes.** Guiar usuario para primeira acao. |
| 6 | Testes | **Basico e barato.** Sem suite completa no MVP. |

---

## Estado Atual da Implementacao

| Feature | Status | Observacao |
|---------|--------|------------|
| App Shell + Nav | Implementado | Bottom nav funcional, rotas existem |
| Zustand + localStorage | Implementado | Store com persist middleware |
| Quick Log | Implementado | Presets + custom, feedback visual |
| Progress Ring | Implementado | Componente funcional |
| Streak | Implementado | Calculo correto |
| Today's Entries | Implementado | Lista ordenada |
| History View | Parcial | Pagina existe, verificar completude dos charts |
| Manage View | Parcial | Pagina existe, verificar edit/delete |
| Settings/Config | Parcial | Pagina existe, verificar goal/presets config |
| Testes | Nao existe | Zero testes unitarios, componente ou E2E |
| Acessibilidade | Nao verificado | WCAG AA e' requisito |
| Performance | Nao verificado | Lighthouse > 95 e' requisito |

---

## Criterios de Sucesso (Phase 1)
- Tempo de registro: < 3 segundos
- Meta diaria: 60% dos usuarios ativos 4x/semana
- Retencao 7 dias: > 40%
- Streak mediana: > 5 dias

---

## Proximos Passos

**Esta e' uma iniciativa WIDE.** Recomendacao:

1. **Validar decisoes de produto** listadas acima (streak reset, nav structure, empty states)
2. **Avaliar gap de implementacao** — o app ja tem a maioria das features scaffolded, mas precisa verificar completude e qualidade de cada tela
3. **Usar `/create-us`** para revisar/refinar as User Stories existentes (US-001 a US-008) se necessario, ou seguir direto para `/refinement` nas que ja estao prontas
4. **Priorizar por dependencia**: US-001/002 (fundacao) -> US-003/004 (core loop) -> US-005/006 (retencao) -> US-007/008 (controle)
