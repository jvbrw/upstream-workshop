## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario que ativou lembretes eu quero receber push notifications no horario configurado para que eu lembre de beber agua durante minhas horas ativas.

### Funcionalidades Principais
- Service worker registrado para enviar push notifications em background
- Agendamento de notificacoes baseado na configuracao do usuario (horarios, intervalo, dias ativos)
- Conteudo contextual: mensagens com progresso atual (ex: "You're at 1.2L -- 800ml to go")
- Notificacao de resumo diario no fim da janela ativa (se habilitado)
- Funcionamento mesmo com aba do app fechada (via service worker)
- Re-agendamento automatico quando configuracao muda

### Criterios de Aceite Chave
- Notificacoes disparam no intervalo correto dentro da janela configurada, apenas nos dias ativos
- Notificacoes funcionam em background (app tab fechada) via service worker
- Conteudo da notificacao inclui progresso atual de hidratacao do dia
- Daily summary dispara ao final da janela ativa com resumo do dia
- Mudanca na configuracao (US-016) re-registra o schedule imediatamente
- Notificacoes nao disparam se reminders estao desativados ou permissao foi revogada

---

## Contexto Detalhado para Agentes

# User Story: Push Notification Service

## Declaracao da historia

Como um usuario que ativou lembretes eu quero receber push notifications no horario configurado para que eu lembre de beber agua durante minhas horas ativas.

## Criterios funcionais

**Registro do service worker:**
- Registrar service worker dedicado para push notifications (`/sw-notifications.js` ou similar).
- Registro ocorre quando usuario ativa reminders pela primeira vez (apos permissao granted na US-016).
- Service worker deve ser capaz de receber mensagens do app e disparar notificacoes independentemente.
- Unregister/desativar quando usuario desativa reminders.

**Agendamento de notificacoes:**
- Ler `ReminderConfig` do store (definido na US-016):
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
- Calcular proximas notificacoes baseado em: dia atual esta em `activeDays`, hora atual esta entre `startTime` e `endTime`, intervalo de `intervalMinutes`.
- Abordagem de scheduling: usar `setTimeout`/`setInterval` dentro do service worker, ou usar a Periodic Background Sync API onde disponivel, com fallback para alarms via `setTimeout` chain.
- Nota: Web Push API puro (server-push) requer backend. Para esta US, usar abordagem client-side com service worker timers. Se o browser matar o service worker, as notificacoes retomam quando o app e reaberto.

**Conteudo das notificacoes — reminder:**
- Titulo: "Time to hydrate!" (ou variacao aleatoria de um set de mensagens motivacionais).
- Sugestoes de variacao: "Water break!", "Stay hydrated!", "Drink up!", "Hydration check!"
- Body: contextual com progresso atual — "You're at {consumed}L -- {remaining}ml to go" ou "You're at {percentage}% of your daily goal".
- Para obter progresso atual: service worker comunica com app via `postMessage` ou le diretamente do localStorage (chave `hydra-store`).
- Icone: favicon/logo do app (192x192 para notificacoes).
- Badge: icone menor para status bar (72x72).
- Tag: `hydra-reminder` para agrupar/substituir notificacoes anteriores (evitar acumulo).
- Actions (se suportado): botao "Log 250ml" na notificacao para quick-log direto.

**Conteudo das notificacoes — daily summary:**
- Disparar ao final da janela ativa (`endTime`) se `dailySummary` esta habilitado.
- Titulo: "Hydra -- Daily Summary"
- Body: "You drank {consumed}L today -- {percentage}% of your goal. {motivationalMessage}".
- Mensagem motivacional condicional: >= 100% "Great job!", 75-99% "Almost there! Keep it up!", < 75% "Tomorrow is a new chance!".
- Tag: `hydra-daily-summary` (separado dos reminders regulares).

**Comunicacao service worker <-> app:**
- Service worker precisa acessar dados de hidratacao para compor mensagens contextuais.
- Estrategia 1 (preferida): Service worker le localStorage diretamente (parse da chave `hydra-store`, extrair logs do dia e dailyGoal).
- Estrategia 2 (fallback): App envia dados atualizados via `navigator.serviceWorker.controller.postMessage()` a cada log adicionado.
- Service worker listener: `self.addEventListener('message', ...)` para receber config updates e dados de progresso.

**Re-agendamento ao mudar config:**
- Quando `ReminderConfig` muda no store (US-016), enviar mensagem ao service worker com nova config.
- Service worker cancela timers existentes e recalcula schedule com novos parametros.
- Se `enabled` muda para `false`: cancelar todos os timers pendentes.
- Se `activeDays` muda: recalcular se dia atual ainda e ativo.

**Tratamento de permissao e estados:**
- Antes de registrar service worker, verificar `Notification.permission === "granted"`.
- Se permissao revogada (usuario mudou nas settings do browser): detectar na proxima tentativa de notificacao, atualizar estado no store para `enabled: false`.
- Mostrar explicacao contextual antes de solicitar permissao (tratado na US-016, mas service encapsula verificacao).

**Lifecycle do service worker:**
- `install`: cache de assets necessarios (icones de notificacao).
- `activate`: limpar caches antigos, claim clients.
- `message`: receber config updates e dados de progresso do app.
- `notificationclick`: abrir app na rota principal ou navegar para log (se action "Log 250ml").
- `notificationclose`: tracking opcional (nao essencial para MVP).

**Limitacoes conhecidas e mitigacoes:**
- Service workers podem ser encerrados pelo browser apos inatividade. Mitigacao: re-registrar schedule quando app e reaberto.
- Periodic Background Sync API tem suporte limitado (Chrome only). Mitigacao: nao depender exclusivamente dela, usar timer chain como principal.
- iOS Safari: suporte a push notifications via service worker adicionado no iOS 16.4+, mas com restricoes. Documentar limitacoes.
- Precisao de timers em background: browser pode atrasar notificacoes. Aceitavel para caso de uso de hydration reminders.

## Criterios de experiencia do usuario

- Notificacoes devem parecer nativas e profissionais (icone, titulo, body bem formatados).
- Ao clicar na notificacao: abrir/focar o app na tela principal (TodayView).
- Se action "Log 250ml" disponivel e clicada: logar 250ml e abrir app com feedback visual.
- Nao acumular multiplas notificacoes — usar `tag` para substituir a anterior.
- Respeitar configuracoes do sistema (Do Not Disturb, Focus modes). O browser ja gerencia isso nativamente.
- Conteudo contextual faz a notificacao sentir-se pessoal e util (nao generica).
- Primeira notificacao apos ativacao pode ter delay (ate o proximo slot de intervalo) — comportamento esperado.
- Se usuario ja atingiu meta do dia: adaptar mensagem ("Great job! You've hit your 2L goal today!") em vez de pedir para beber mais.

## Testes regressivos

- US-001 (App Shell): Registro de service worker nao interfere com navegacao ou performance do app.
- US-002 (Data Persistence): Leitura do store pelo service worker nao corrompe dados. Escrita via notification action (quick-log) usa mesma logica do `addLog`.
- US-003 (Quick Log): Se notification action "Log 250ml" implementada, deve usar mesma pipeline de `addLog` do store.
- US-016 (Reminder Config UI): Mudancas na config propagam corretamente para o service worker. Desativar toggle cancela notificacoes pendentes.

## Criterios para QA

- Padroes de qualidade: Notificacoes precisas no timing, conteudo contextual correto, cleanup adequado, sem memory leaks no service worker.
- Cenarios de teste:
  - Caminho feliz: Usuario ativa reminders (Mon-Fri, 09:00-18:00, 1h), app esta aberto — recebe notificacao a cada 1h com progresso atual.
  - Caminho feliz: Usuario fecha aba do app — continua recebendo notificacoes via service worker.
  - Caminho feliz: Sabado (dia nao-ativo) — nenhuma notificacao dispara.
  - Caminho feliz: 18:00 (end time) com daily summary ativo — recebe notificacao de resumo com stats do dia.
  - Caminho feliz: Usuario clica na notificacao — app abre/foca na TodayView.
  - Caminho feliz: Usuario muda intervalo de 1h para 30min — proxima notificacao vem em 30min (schedule re-registrado).
  - Caminho feliz: Usuario ja atingiu meta — notificacao congratula em vez de pedir para beber mais.
  - Caminho de insucesso: Permissao revogada pelo browser — proxima tentativa de notificacao falha silenciosamente, store atualiza `enabled: false`.
  - Caminho de insucesso: Service worker encerrado pelo browser — quando app reabre, schedule e re-registrado.
  - Caminho alternativo: App reaberto apos horas — calcula proximo slot correto ao inves de disparar notificacoes atrasadas.
  - Caminho alternativo: Horario fora da janela ativa — nenhuma notificacao disparada.
  - Caminho alternativo: Meia-noite (transicao de dia) — schedule reseta para novo dia, verifica se novo dia esta em activeDays.
  - Testes nao-funcionais: Service worker nao consome bateria excessiva. Tamanho do service worker bundle < 10KB. Notificacoes nao excedem 1 por intervalo (sem duplicatas).
- Homologacao: Chrome Desktop, Chrome Android (priority), Safari iOS 16.4+ (com limitacoes documentadas), Firefox Desktop.

## Criterios de aceitacao

- Service worker registrado e funcional para push notifications quando reminders estao ativos.
- Notificacoes disparam no intervalo configurado, dentro da janela de horario, apenas nos dias ativos.
- Conteudo das notificacoes inclui progresso de hidratacao atual (consumed/remaining/percentage).
- Variacao de mensagens motivacionais (minimo 5 variantes para reminders regulares).
- Daily summary dispara no `endTime` com resumo contextual do dia (se habilitado).
- Notificacoes funcionam com app tab fechada (service worker em background).
- Click na notificacao abre/foca o app.
- Mudanca de config (US-016) re-registra schedule sem necessidade de refresh.
- Desativar reminders cancela todos os timers/notificacoes pendentes imediatamente.
- Service worker faz cleanup adequado (sem timers orfaos, sem memory leaks).
- Tag de notificacao previne acumulo (substitui anterior do mesmo tipo).
- Compatibilidade documentada: Chrome (full support), Safari iOS 16.4+ (limitacoes), Firefox (full support).
- Dependencia: US-016 deve estar implementada (fornece ReminderConfig no store e UI de permissao).
