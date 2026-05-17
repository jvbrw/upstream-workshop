# reminders-schedule-active

## Classificacao
- **Tipo**: FOCUSED
- **Confianca**: HIGH

## Analise de Impacto

### Personas Impactadas

| Persona | Impacto | Detalhe |
|---------|---------|---------|
| **Ana (Profissional de Mesa)** | ALTO | Principal beneficiada. Lembretes gentis durante o expediente resolvem diretamente o problema de esquecimento. Preset "Work day" (Mon-Fri, 8am-6pm) desenhado para ela. |
| **Lucas (Construtor de Habitos)** | MEDIO | Reminders reforcam consistencia. Smart reminders ("skip if recently logged") respeitam seu padrao de auto-monitoramento. Stats de acted/skipped alimentam mentalidade de tracking. |

### Fluxos Afetados

| Fluxo / Tela | Tipo de Impacto |
|---------------|-----------------|
| **Schedule Config (nova)** | Criacao — Configuracao de agenda com presets (Work day, Full day, Evening), custom config (dias, horarios, frequencia), smart toggles, summary |
| **Active Reminders (nova)** | Criacao — Dashboard de reminders ativos com countdown circular, snooze, stats (sent/acted/skipped), timeline do dia |
| **Settings (existente)** | Integracao — Entry point para configuracao de reminders. Data model ja existe em UserSettings |
| **Today / Home (existente)** | Indireto minimo — Indicador de proximo reminder poderia aparecer, mas fora do escopo explicito |

### Escopo Explicito
- **Incluido**: Schedule Config + Active Reminders (2 telas)
- **Excluido**: PermissionPrompt (onboarding) e RemindersHub (dashboard)

## Prototipos de Referencia
- `app/lab/reminders-ux/components/schedule-config.tsx` — Schedule Config
- `app/lab/reminders-ux/components/active-reminders.tsx` — Active Reminders
- Acessiveis em `/lab/reminders-ux` (tabs Schedule e Active)

## Data Model Existente
```
UserSettings:
  reminderEnabled: boolean
  reminderIntervalMin: number
  reminderStartHour: number
  reminderEndHour: number
```

## Justificativa
Feature delimitada de "agendamento e acompanhamento de lembretes" — coesa o suficiente para ser entregue como uma unidade, mas rica em interacoes (presets, custom config, countdown, snooze, timeline, stats) para nao ser tratada como ajuste atomico. O recorte de escopo (excluindo PermissionPrompt e RemindersHub) reforca a classificacao FOCUSED: entrega de valor completa dentro de um sprint, sem dependencias transversais.

## Proximos Passos Sugeridos
1. **Criar User Stories** com `/create-us` — escopo pede 1-2 USs:
   - US de Schedule Config (configuracao de agenda com presets e custom)
   - US de Active Reminders (monitoramento ativo com countdown, snooze, timeline)
2. **Refinar tasks** com `/refinement <US-CODE>` para cada US
3. **Implementar** com `/implement` seguindo TDAID
