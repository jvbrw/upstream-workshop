## 🧑‍💼 Spec para Humanos

> ⚠️ **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes. Caso voce decida fazer alteracao, faca atraves do agente para que ela seja refletida em todas as secoes.**

- **Tarefa:** Service Worker + Scheduling + Notification Content + App Communication (FE)
- **Objetivo:** Implementar service worker dedicado para push notifications de hidratacao com agendamento baseado em ReminderConfig, conteudo contextual com progresso, resumo diario e comunicacao bidirecional com o app
- **Topicos:**
  - Registro de service worker (sw-notifications.js) quando reminders ativados
  - Agendamento baseado em ReminderConfig: active days, time window, interval
  - Timer-based approach (setTimeout chain) com fallback re-registration ao reabrir app
  - Reminder notifications: 5+ variantes de titulo, body com progresso (le localStorage hydra-store)
  - Daily summary notification no endTime: percentual da meta + mensagem motivacional
  - Comunicacao SW <-> app: postMessage para config updates, localStorage para dados
  - Re-schedule quando config muda, cancel all ao desabilitar
  - notificationclick: open/focus app na TodayView
  - Tag-based deduplication (hydra-reminder, hydra-daily-summary)
  - Unregister SW ao desabilitar reminders
  - Limitacoes documentadas: SW lifecycle, iOS Safari 16.4+, timer precision
- **Dependencias:** Service Worker API, Notification API, Zustand store (reminderConfig de US-016), localStorage (hydra-store)
- **Validacao:** Notificacoes disparam no intervalo correto, Funcionam em background, Conteudo inclui progresso, Daily summary no endTime, Config change re-agenda, Desativar cancela tudo, Click abre app

---

## 🤖 Contexto Detalhado para Agentes

## Bloco 1: O Que? (Descricao)

### 1. Objetivo Tecnico Explicito

Implementar um service worker dedicado (`public/sw-notifications.js`) que gerencia o envio de push notifications de hidratacao com base na configuracao `ReminderConfig` do Zustand store (definida pela US-016). O service worker deve agendar notificacoes usando setTimeout chain, compor mensagens contextuais com progresso de hidratacao lido do localStorage, enviar resumo diario no horario configurado, e responder a mudancas de configuracao via postMessage. Inclui tambem um modulo client-side (`lib/notification-service.ts` ou similar) para orquestrar registro/desregistro do SW e comunicacao.

### 2. Decomposicao em Cenarios

**Cenario A — Registro do service worker:**
- Quando usuario ativa reminders (US-016) e permissao e "granted"
- App registra SW em `/sw-notifications.js`
- SW entra em estado `install` -> `activate`
- App envia config inicial via postMessage
- SW inicia agendamento

**Cenario B — Agendamento de notificacoes (dia ativo, dentro da janela):**
- SW recebe ReminderConfig
- Verifica: dia atual em `activeDays`? Hora atual entre `startTime` e `endTime`?
- Se sim: calcula proximo slot de intervalo, agenda setTimeout
- Ao disparar: envia notificacao, agenda proximo slot (chain)
- Continua ate sair da janela de horario

**Cenario C — Conteudo de reminder notification:**
- Titulo: aleatorio de set de 5+ variantes ("Time to hydrate!", "Water break!", "Stay hydrated!", "Drink up!", "Hydration check!")
- Body: contextual com progresso — le localStorage `hydra-store`, extrai logs do dia e dailyGoal
- Calcula: consumed, remaining, percentage
- Exemplo: "You're at 1.2L -- 800ml to go" ou "You're at 60% of your daily goal"
- Se meta atingida: "Great job! You've hit your 2L goal today!"
- Tag: `hydra-reminder` (substitui anterior)
- Icone: favicon do app (192x192)

**Cenario D — Daily summary notification:**
- Dispara no `endTime` se `dailySummary === true`
- Titulo: "Hydra -- Daily Summary"
- Body: "You drank {consumed}L today -- {percentage}% of your goal. {motivationalMessage}"
- Mensagem condicional: >= 100% "Great job!", 75-99% "Almost there! Keep it up!", < 75% "Tomorrow is a new chance!"
- Tag: `hydra-daily-summary`
- Nao dispara se reminders desativados

**Cenario E — Comunicacao app -> service worker:**
- Config update: app envia `{ type: "CONFIG_UPDATE", config: ReminderConfig }` via postMessage
- SW cancela timers existentes e recalcula schedule
- Dados de progresso: SW le localStorage diretamente (estrategia primaria) OU app envia via postMessage (fallback)

**Cenario F — Re-agendamento ao mudar config:**
- Quando ReminderConfig muda no store (US-016)
- App detecta mudanca e envia postMessage ao SW
- SW: clearTimeout de todos os timers pendentes
- SW: recalcula schedule com novos parametros
- Transicao imediata, sem perder notificacao do proximo slot

**Cenario G — Desativacao de reminders:**
- `reminderConfig.enabled` muda para false
- App envia `{ type: "DISABLE" }` ao SW
- SW cancela todos os timers
- App desregistra SW: `registration.unregister()`
- Nenhuma notificacao futura sera enviada

**Cenario H — Notification click:**
- Usuario clica na notificacao
- SW listener `notificationclick`: abre/foca o app na rota `/` (TodayView)
- Se app ja esta aberto: `clients.openWindow("/")` ou `client.focus()`
- Notificacao fecha automaticamente

**Cenario I — App reaberto apos periodo fechado:**
- SW pode ter sido encerrado pelo browser (lifecycle)
- Ao reabrir app: verificar se reminders ativos e SW registrado
- Se SW nao esta ativo: re-registrar e enviar config
- Calcular proximo slot correto (nao disparar atrasadas)

**Cenario J — Transicao de dia (meia-noite):**
- Schedule reseta para novo dia
- Verifica se novo dia esta em activeDays
- Se nao: pula ate proximo dia ativo
- Se sim: agenda primeiro slot no startTime

**Cenario K — Fora da janela de horario:**
- Hora atual antes de startTime ou apos endTime
- SW nao dispara notificacoes
- Agenda proximo slot para startTime do proximo dia ativo

### 3. Criterios de Aceite por Cenario

**Cenario A:**
- SW registrado com `navigator.serviceWorker.register("/sw-notifications.js")`
- `install` event: cache de icones necessarios (opcional)
- `activate` event: `self.clients.claim()`
- Config inicial enviada via `navigator.serviceWorker.controller.postMessage()`

**Cenario B:**
- Verificacao de dia: `new Date().getDay()` deve estar em `config.activeDays`
- Verificacao de horario: hora atual entre `startTime` e `endTime` (comparacao em minutos)
- Proximo slot: arredondar hora atual para cima ao proximo multiplo de `intervalMinutes` apos `startTime`
- setTimeout com delay em ms ate proximo slot

**Cenario C:**
- Leitura do localStorage: `JSON.parse(localStorage.getItem("hydra-store"))`
- Extrair `state.logs` do dia atual e `state.dailyGoal`
- `self.registration.showNotification(title, { body, icon, tag: "hydra-reminder" })`
- Minimo 5 variantes de titulo, selecionadas aleatoriamente

**Cenario D:**
- Timer separado para daily summary no `endTime`
- Mesmo mecanismo de leitura de progresso do localStorage
- Mensagem motivacional condicional baseada em percentual

**Cenario E:**
- `self.addEventListener("message", (event) => { ... })` no SW
- Event data: `{ type: "CONFIG_UPDATE", config }` ou `{ type: "DISABLE" }`

**Cenario G:**
- `registration.unregister()` chamado do client-side
- Confirmar que SW e removido e nenhum timer permanece

**Cenario H:**
- `self.addEventListener("notificationclick", ...)` no SW
- `event.notification.close()` + `clients.openWindow("/")` ou foco em client existente

### Arquivos a criar/modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `public/sw-notifications.js` | CRIAR | Service worker dedicado para notifications |
| `lib/notification-service.ts` | CRIAR | Modulo client-side para registro/comunicacao com SW |
| `hooks/use-hydration-store.ts` | MODIFICAR | Adicionar watch/subscribe para notificar SW de mudancas em reminderConfig |
| Componente de reminders (US-016) | MODIFICAR | Integrar chamadas ao notification-service ao ativar/desativar/mudar config |

## Bloco 2: Como? (Implementacao)

### 4. Codigo de Referencia

**Service worker skeleton:**
Arquivo a criar: `public/sw-notifications.js`

```javascript
// sw-notifications.js — Service Worker para hydration reminders
const REMINDER_TITLES = [
  "Time to hydrate!",
  "Water break!",
  "Stay hydrated!",
  "Drink up!",
  "Hydration check!",
];

let timers = [];
let currentConfig = null;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  const { type, config } = event.data;
  if (type === "CONFIG_UPDATE") {
    currentConfig = config;
    clearAllTimers();
    scheduleNotifications();
  }
  if (type === "DISABLE") {
    currentConfig = null;
    clearAllTimers();
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes("/") && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow("/");
    })
  );
});

function clearAllTimers() {
  timers.forEach((id) => clearTimeout(id));
  timers = [];
}

function getHydrationProgress() {
  // SW pode acessar localStorage em alguns browsers via self ou indexedDB
  // Fallback: dados enviados via postMessage
  // Implementar leitura robusta
}

function scheduleNotifications() {
  if (!currentConfig || !currentConfig.enabled) return;
  // ... calcular proximos slots e agendar ...
}
```

**Client-side notification service:**
Arquivo a criar: `lib/notification-service.ts`

```typescript
// Padrao para registro e comunicacao com SW
export async function registerNotificationSW(config: ReminderConfig) {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.register("/sw-notifications.js");
  await navigator.serviceWorker.ready;
  registration.active?.postMessage({ type: "CONFIG_UPDATE", config });
}

export async function unregisterNotificationSW() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const reg of registrations) {
    if (reg.active?.scriptURL.includes("sw-notifications")) {
      await reg.unregister();
    }
  }
}

export function updateNotificationConfig(config: ReminderConfig) {
  navigator.serviceWorker?.controller?.postMessage({
    type: "CONFIG_UPDATE",
    config,
  });
}
```

**Referencia: store Zustand com subscribe para notificar SW:**
Arquivo: `hooks/use-hydration-store.ts`

```typescript
// Adicionar subscriber para detectar mudancas em reminderConfig:
// useHydrationStore.subscribe(
//   (state) => state.reminderConfig,
//   (config) => {
//     if (config.enabled) updateNotificationConfig(config);
//     else unregisterNotificationSW();
//   }
// );
```

**Referencia: constantes de storage:**
Arquivo: `lib/constants.ts`
```typescript
export const STORAGE_KEY = "hydra-store";  // Chave usada no localStorage
```

### 5. Contratos e Estruturas de Dados

**ReminderConfig (definido pela US-016):**
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

**postMessage contracts:**
```typescript
// App -> SW
{ type: "CONFIG_UPDATE", config: ReminderConfig }
{ type: "DISABLE" }

// (Opcional) App -> SW para dados de progresso
{ type: "PROGRESS_UPDATE", consumed: number, dailyGoal: number }
```

**localStorage hydra-store structure:**
```json
{
  "state": {
    "logs": [
      { "id": "log-xxx", "amount": 500, "timestamp": "2026-02-12T10:30:00.000Z" }
    ],
    "dailyGoal": 2000,
    "presets": [200, 300, 500],
    "reminderConfig": { "enabled": true, "activeDays": [1,2,3,4,5], "startTime": "08:00", "endTime": "22:00", "intervalMinutes": 60, "dailySummary": true }
  },
  "version": 0
}
```

**Notification options:**
```typescript
// Reminder
{
  body: "You're at 1.2L -- 800ml to go",
  icon: "/icon-192x192.png",
  badge: "/icon-72x72.png",
  tag: "hydra-reminder",
  renotify: true,
}

// Daily summary
{
  body: "You drank 1.8L today -- 90% of your goal. Keep it up!",
  icon: "/icon-192x192.png",
  badge: "/icon-72x72.png",
  tag: "hydra-daily-summary",
  renotify: true,
}
```

### 6. Dependencias e Interacoes

**Browser APIs:**
- `navigator.serviceWorker.register()` / `.ready` / `.controller`
- `self.registration.showNotification()` (dentro do SW)
- `self.clients.matchAll()` / `client.focus()` / `clients.openWindow()`
- `self.addEventListener("message" | "notificationclick" | "install" | "activate")`
- `setTimeout` / `clearTimeout` (dentro do SW para scheduling)

**Integracao com US-016 (Reminder Config UI):**

### Integracoes com US-016
| Funcionalidade | Task Relacionada | Contrato |
|----------------|------------------|----------|
| ReminderConfig no store | T001-FE US-016 | reminderConfig: ReminderConfig no Zustand |
| Toggle master ativa/desativa | T001-FE US-016 | Chamar registerNotificationSW/unregisterNotificationSW |
| Mudanca de config | T001-FE US-016 | Chamar updateNotificationConfig ao salvar |

**Dependencias de arquivo:**
- `lib/constants.ts` — STORAGE_KEY ("hydra-store") para leitura do localStorage no SW
- `hooks/use-hydration-store.ts` — subscribe a mudancas em reminderConfig
- Icones do app em `public/` (192x192 e 72x72) para notificacoes

**Importante:** O service worker (`sw-notifications.js`) deve ficar em `public/` para ser servido na raiz do dominio. Deve ser JavaScript puro (nao TypeScript), pois nao passa pelo bundler.

### 7. Requisitos Nao-Funcionais

- **Service Worker:** Arquivo JavaScript puro em `public/sw-notifications.js` (nao TypeScript)
- **Bundle size:** SW < 10KB
- **Tagging:** OBRIGATORIO usar `tag` em notificacoes para evitar acumulo
- **Deduplicacao:** Nunca mais de 1 notificacao por intervalo
- **Cleanup:** clearTimeout de todos os timers ao desativar ou re-agendar
- **Lifecycle:** SW deve fazer `skipWaiting()` no install e `clients.claim()` no activate
- **LocalStorage:** Leitura do `hydra-store` no SW deve ser defensiva (try/catch, fallback para valores default)
- **Precisao de timer:** Aceitavel atraso de ate 1-2 minutos em background (limitacao do browser)
- **iOS Safari:** Documentar que suporte a push via SW requer iOS 16.4+ e tem restricoes (app deve estar como PWA adicionado a home screen)
- **Bateria:** SW nao deve manter long-running processes; usar setTimeout chain, nao setInterval infinito
- **Fallback:** Se SW encerrado pelo browser, re-registrar schedule quando app reabre
- **Sem notificacoes atrasadas:** Ao reabrir app, calcular proximo slot futuro (nao disparar atrasadas)

## Bloco 3: Como Validar? (Validacao)

### 8. Cenarios de Teste (BDD)

**Cenario: Registro do service worker ao ativar reminders**
```
Given que o usuario ativou reminders na US-016 com permissao "granted"
When o reminderConfig.enabled muda para true no store
Then o service worker sw-notifications.js e registrado
  And o SW recebe a config inicial via postMessage
  And o SW inicia agendamento de notificacoes
```

**Cenario: Notificacao de reminder no intervalo correto**
```
Given que reminders estao ativos (Mon-Fri, 09:00-18:00, intervalo 1h)
  And hoje e uma segunda-feira e sao 10:30
When o proximo slot e calculado (11:00)
Then uma notificacao e disparada as 11:00
  And o titulo e uma variante aleatoria ("Time to hydrate!", "Water break!", etc.)
  And o body inclui progresso atual (ex: "You're at 1.2L -- 800ml to go")
  And a tag e "hydra-reminder"
  And o proximo slot e agendado para 12:00
```

**Cenario: Notificacao com conteudo contextual de progresso**
```
Given que o store contem logs do dia totalizando 1500ml
  And o dailyGoal e 2000ml
When uma notificacao de reminder e disparada
Then o body mostra "You're at 1.5L -- 500ml to go"
```

**Cenario: Notificacao quando meta atingida**
```
Given que o usuario ja consumiu 2000ml (meta 2000ml)
When uma notificacao de reminder e disparada
Then o body mostra "Great job! You've hit your 2L goal today!"
```

**Cenario: Daily summary ao final da janela ativa**
```
Given que reminders estao ativos com endTime "22:00" e dailySummary true
  And o usuario consumiu 1800ml de meta 2000ml (90%)
When o horario atinge 22:00
Then uma notificacao e disparada com titulo "Hydra -- Daily Summary"
  And body "You drank 1.8L today -- 90% of your goal. Almost there! Keep it up!"
  And tag "hydra-daily-summary"
```

**Cenario: Notificacoes em background (app fechado)**
```
Given que reminders estao ativos e o SW esta registrado
When o usuario fecha a aba do app
Then o SW continua ativo (enquanto o browser nao o encerrar)
  And notificacoes continuam disparando no intervalo configurado
```

**Cenario: Dia nao-ativo nao recebe notificacoes**
```
Given que activeDays e [1,2,3,4,5] (Mon-Fri)
  And hoje e sabado (dia 6)
When o SW verifica o agendamento
Then nenhuma notificacao e agendada para hoje
  And o proximo slot e calculado para segunda-feira no startTime
```

**Cenario: Re-agendamento ao mudar config**
```
Given que reminders estao ativos com intervalo 1h
When o usuario muda intervalo para 30min na US-016
Then app envia CONFIG_UPDATE ao SW via postMessage
  And o SW cancela todos os timers existentes
  And o SW recalcula schedule com intervalo de 30min
  And proxima notificacao vem em ~30min
```

**Cenario: Desativacao cancela tudo**
```
Given que reminders estao ativos com notificacoes agendadas
When o usuario desativa reminders (enabled = false)
Then app envia DISABLE ao SW
  And todos os timers sao cancelados
  And o SW e desregistrado
  And nenhuma notificacao futura e enviada
```

**Cenario: Click na notificacao abre app**
```
Given que uma notificacao de reminder esta visivel
When o usuario clica na notificacao
Then a notificacao fecha
  And o app abre/foca na rota / (TodayView)
```

**Cenario: App reaberto re-registra schedule**
```
Given que o app estava fechado e o SW foi encerrado pelo browser
  And reminders estao ativados no store
When o usuario reabre o app
Then o app verifica que reminders estao ativos
  And re-registra o SW se necessario
  And envia config atual via postMessage
  And SW calcula proximo slot futuro (nao dispara atrasadas)
```

**Cenario: Tag previne acumulo de notificacoes**
```
Given que uma notificacao de reminder esta pendente (nao clicada)
When o proximo intervalo dispara nova notificacao
Then a notificacao anterior e substituida (mesmo tag "hydra-reminder")
  And apenas 1 notificacao de reminder e visivel por vez
```

**Cenario: Permissao revogada pelo browser**
```
Given que reminders estao ativos
  And o usuario revoga permissao de notificacoes nas configuracoes do browser
When o SW tenta disparar uma notificacao
Then a tentativa falha silenciosamente
  And o store e atualizado com enabled: false (na proxima abertura do app)
```

**Cenario: Transicao de meia-noite**
```
Given que sao 23:59 e o SW esta ativo
When o relogio passa para 00:00 de um novo dia
Then o SW verifica se o novo dia esta em activeDays
  And se sim: agenda primeiro slot no startTime do novo dia
  And se nao: pula ate o proximo dia ativo
```

### Limitacoes Documentadas

| Limitacao | Impacto | Mitigacao |
|-----------|---------|-----------|
| SW pode ser encerrado pelo browser apos inatividade | Notificacoes param em background prolongado | Re-registrar schedule quando app reabre |
| Periodic Background Sync API: Chrome only | Nao usar como dependencia | Timer chain como abordagem principal |
| iOS Safari 16.4+: push via SW requer PWA na home screen | Usuarios iOS sem PWA nao recebem | Documentar na UI da US-016 |
| Precisao de setTimeout em background | Atraso de 1-2 minutos possivel | Aceitavel para hydration reminders |
| SW nao tem acesso direto a Zustand store | Dados de progresso podem estar desatualizados | Ler localStorage (synced pelo persist middleware) |
