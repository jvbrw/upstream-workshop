## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario eu quero configurar lembretes de hidratacao com horarios, frequencia e dias ativos personalizados para que eu receba nudges para beber agua ao longo do dia.

### Funcionalidades Principais
- Toggle master para ativar/desativar push notifications (solicita permissao do browser)
- Seletor de dias ativos (Seg-Dom) para receber lembretes
- Time pickers para janela de horario ativo (inicio e fim)
- Seletor de frequencia: 30min, 1h, 1.5h, 2h
- Toggle de resumo diario (notificacao de fim de dia com progresso)
- Preview visual de como a notificacao vai aparecer
- Metricas calculadas: lembretes por dia e por semana
- Tratamento de estados de permissao (prompt, granted, denied) com feedback apropriado

### Criterios de Aceite Chave
- UI de configuracao de reminders acessivel via rota ou secao dentro de Settings
- Toggle master aciona `Notification.requestPermission()` na primeira ativacao
- Se permissao negada, toggle desativa com mensagem explicativa e link para configuracoes do browser
- Todas as configuracoes persistem no Zustand store (localStorage para guests, cloud para logados via US-013)
- Preview de notificacao atualiza dinamicamente baseado na configuracao atual
- Metricas (reminders/day, reminders/week) recalculam ao mudar qualquer parametro
- Validacao: end time deve ser posterior a start time; pelo menos 1 dia ativo selecionado

---

## Contexto Detalhado para Agentes

# User Story: Reminder Configuration UI

## Declaracao da historia

Como um usuario eu quero configurar lembretes de hidratacao com horarios, frequencia e dias ativos personalizados para que eu receba nudges para beber agua ao longo do dia.

## Criterios funcionais

- Nova rota `/settings/reminders` ou secao dedicada dentro da pagina Settings existente para configuracao de lembretes.

**Toggle master de push notifications:**
- Switch on/off como controle principal. Quando desativado, todas as opcoes de configuracao ficam ocultas.
- Ao ativar pela primeira vez: chamar `Notification.requestPermission()` do browser.
- Se permissao `"granted"`: ativar toggle, exibir configuracoes.
- Se permissao `"denied"`: desativar toggle automaticamente, exibir mensagem: "Notifications blocked. Please enable them in your browser settings." com instrucoes contextuais.
- Se permissao `"default"` (usuario dismissou prompt): manter desativado, exibir mensagem: "Permission required to send reminders. Tap to try again."
- Se browser nao suporta Notification API: ocultar secao de reminders ou exibir mensagem de incompatibilidade.

**Seletor de dias ativos:**
- Grid horizontal com 7 botoes (Mon, Tue, Wed, Thu, Fri, Sat, Sun).
- Cada botao e um toggle independente (pressed/not pressed).
- Default: dias de semana ativos (Mon-Fri).
- Validacao: se nenhum dia selecionado, exibir aviso "Select at least one day to receive reminders".
- Layout baseado no prototipo `app/lab/reminders/components/reminders-config.tsx` que ja implementa este seletor com `activeDays: number[]` (0=Dom, 1=Seg, ..., 6=Sab).

**Janela de horario ativo:**
- Dois inputs de time: Start time (default: 08:00) e End time (default: 22:00).
- Inputs nativos `type="time"` com estilo consistente com design system.
- Validacao: end time deve ser posterior a start time. Se invalido, exibir mensagem inline.

**Seletor de frequencia:**
- Grid 2x2 com opcoes: 30 min, 1 hour, 1.5 hours, 2 hours.
- Selecao unica (radio-like). Default: 1 hour.
- Opcao ativa exibe checkmark visual.

**Toggle de resumo diario:**
- Switch on/off independente do master toggle (mas so visivel quando master esta ativo).
- Label: "Daily summary" com descricao "End-of-day progress notification".
- Default: ativado.

**Preview de notificacao:**
- Card visual simulando notificacao mobile com icone Hydra, titulo, corpo e timestamp.
- Reminder preview: "Time to hydrate! You're at 1.2L -- 800ml to go." (dados mock para preview).
- Daily summary preview (se ativado): "You drank 1.8L today -- 90% of your goal. Keep it up!" com timestamp do end time.

**Metricas calculadas:**
- "Per day: ~X reminders [+ summary]" — calculado como `floor((endTime - startTime) / interval)`.
- "Per week: ~Y reminders across Z days" — `remindersPerDay * activeDays.length`.
- Atualizam em tempo real ao mudar qualquer configuracao.

**Estado persistido (ReminderConfig):**
- Extender `HydrationState` no Zustand store com campo `reminderConfig`:
```typescript
type ReminderConfig = {
  enabled: boolean;
  activeDays: number[];     // 0=Dom, 1=Seg, ..., 6=Sab
  startTime: string;        // "HH:mm"
  endTime: string;          // "HH:mm"
  intervalMinutes: number;  // 30 | 60 | 90 | 120
  dailySummary: boolean;
};
```
- Defaults: `{ enabled: false, activeDays: [1,2,3,4,5], startTime: "08:00", endTime: "22:00", intervalMinutes: 60, dailySummary: true }`.
- Persistido via Zustand persist middleware (adicionar ao `partialize`).
- Para usuarios logados (US-013): config sincroniza com cloud.

**Referencia de prototipos:**
- Prototipo base: `app/lab/phase2-accounts/components/reminders-config.tsx` — versao original com toggle, time pickers, frequency, daily summary, preview.
- Prototipo enhanced: `app/lab/reminders/components/reminders-config.tsx` — adiciona seletor de active days e metricas semanais. Este e o prototipo de referencia principal.
- Adaptar de `useState` local para Zustand store real. Adaptar de permissao simulada para `Notification.requestPermission()` real.

## Criterios de experiencia do usuario

- Layout mobile-first seguindo design language existente do Hydra (cards com rounded-xl, cores primary/muted, tipografia consistente).
- Transicoes suaves ao mostrar/ocultar configuracoes quando toggle muda.
- Auto-save: cada alteracao persiste imediatamente no store (sem botao "Save").
- Feedback visual claro nos toggles (switch role com aria-checked).
- Time pickers com estilo grande e legivel (font-semibold, text-lg conforme prototipo).
- Botoes de frequencia com checkmark visual na opcao ativa.
- Secao de preview claramente separada visualmente (label "Notification preview" + cards).
- Mensagens de erro/aviso em texto pequeno com cor `destructive` ou `muted-foreground`.
- Acessibilidade: todos os controles interativos com `role`, `aria-label`, `aria-checked`, `aria-pressed` conforme prototipo.
- Quando permissao negada: tom amigavel, sem culpar o usuario. Instruir como resolver.
- Loading state sutil enquanto aguarda resposta de permissao do browser.

## Testes regressivos

- US-001 (App Shell): Navegacao para settings/reminders integrada corretamente na hierarquia existente.
- US-002 (Data Persistence): `ReminderConfig` adicionado ao store sem quebrar schema validation ou migracao de dados existentes. Dados de logs, dailyGoal e presets continuam intactos.
- US-008 (Goal/Presets): Secao de reminders coexiste com Goal & Presets se na mesma pagina Settings.
- US-009 (Phase 1 Reminders): Se US-009 foi implementada, a nova config substitui a versao simplificada mantendo compatibilidade de dados (migrar `ReminderConfig` anterior para novo formato com `activeDays`).

## Criterios para QA

- Padroes de qualidade: Permissoes tratadas corretamente em todos os estados, config persistente entre sessoes, UI responsiva e acessivel.
- Cenarios de teste:
  - Caminho feliz: Usuario abre reminders, ativa toggle, browser solicita permissao, usuario permite, configura Mon-Fri 09:00-18:00 a cada 1h, ve preview e metricas (~9 reminders/day, ~45/week).
  - Caminho feliz: Usuario desativa toggle — configuracoes ocultam, preview some. Reativa — configuracoes anteriores reaparecem.
  - Caminho feliz: Usuario altera active days para todos os 7 dias — metricas semanais atualizam.
  - Caminho feliz: Usuario muda frequencia para 30min — metricas recalculam (~28 reminders/day).
  - Caminho de insucesso: Usuario nega permissao do browser — toggle desativa, mensagem explicativa aparece.
  - Caminho de insucesso: Start time (20:00) > end time (08:00) — validacao impede, mensagem inline.
  - Caminho de insucesso: Nenhum dia selecionado — mensagem "Select at least one day" aparece, weekly total mostra 0.
  - Caminho alternativo: Browser sem suporte a Notification API — secao oculta ou desativada com aviso de incompatibilidade.
  - Caminho alternativo: Refresh da pagina — configuracao carrega do store persistido com todos os valores intactos.
  - Caminho alternativo: Private/incognito mode — funciona com store efemero (configuracao nao persiste entre sessoes).
  - Testes nao-funcionais: Nenhum memory leak ao montar/desmontar componente repetidamente. Store schema validation aceita novo campo sem rejeitar dados antigos.
- Homologacao: Testar em Chrome Desktop, Chrome Android, Safari iOS (Notification API com limitacoes), Firefox.

## Criterios de aceitacao

- UI de configuracao de reminders implementada e acessivel via navegacao do app.
- Toggle master aciona `Notification.requestPermission()` real na primeira ativacao.
- Todos os 3 estados de permissao (prompt, granted, denied) tratados com UI feedback apropriado.
- Seletor de active days funcional com validacao de minimo 1 dia.
- Time pickers com validacao de janela valida (end > start).
- Seletor de frequencia com 4 opcoes, selecao unica.
- Daily summary toggle funcional e independente.
- Notification preview renderiza corretamente (reminder + daily summary condicional).
- Metricas per-day e per-week calculam corretamente e atualizam em tempo real.
- `ReminderConfig` persistido no Zustand store com compatibilidade backward (dados antigos nao quebram).
- Prototipos de referencia: `app/lab/reminders/components/reminders-config.tsx` (principal) e `app/lab/phase2-accounts/components/reminders-config.tsx` (base).
- Nota: Esta US cobre apenas a UI de configuracao e persistencia no store. O envio efetivo de push notifications via service worker e coberto pela US-017.
