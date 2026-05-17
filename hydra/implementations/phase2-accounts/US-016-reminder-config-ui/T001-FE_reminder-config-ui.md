## 🧑‍💼 Spec para Humanos

> ⚠️ **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes. Caso voce decida fazer alteracao, faca atraves do agente para que ela seja refletida em todas as secoes.**

- **Tarefa:** Reminder Config Page + Store Extension + Permission Handling (FE)
- **Objetivo:** Implementar UI de configuracao de lembretes de hidratacao com toggle master (Notification.requestPermission real), seletor de dias, time pickers, frequencia, resumo diario, preview e metricas, persistindo no Zustand store
- **Topicos:**
  - Master toggle: solicita Notification.requestPermission() na primeira ativacao
  - Tratamento de 3 estados de permissao (granted, denied, default) com feedback UI
  - Seletor de dias ativos: grid 7 botoes Mon-Sun, default Mon-Fri, min 1 dia
  - Time pickers nativos: start (08:00) e end (22:00), validacao end > start
  - Grid de frequencia: 30min/1h/1.5h/2h, selecao unica, checkmark no ativo
  - Toggle de resumo diario (independente, visivel quando master ativo)
  - Preview de notificacoes (reminder + daily summary)
  - Metricas: reminders/day e reminders/week, atualizam em tempo real
  - Extensao do Zustand store com ReminderConfig, persist via middleware
  - Auto-save, sem botao "Save"
- **Dependencias:** Zustand store (useHydrationStore), Notification API (browser), shadcn/ui (Card, Button), @remixicon/react, prototipos lab
- **Validacao:** Toggle solicita permissao real, Permissao negada desativa toggle com mensagem, Config persiste entre sessoes, Metricas calculam corretamente, Preview atualiza, Validacoes de time e dias funcionam

---

## 🤖 Contexto Detalhado para Agentes

## Bloco 1: O Que? (Descricao)

### 1. Objetivo Tecnico Explicito

Implementar a UI de configuracao de lembretes de hidratacao como nova rota `/settings/reminders` ou secao dedicada dentro de Settings. A UI deve incluir toggle master que aciona `Notification.requestPermission()` real do browser, seletor de dias ativos, time pickers, seletor de frequencia, toggle de resumo diario, preview de notificacoes e metricas calculadas. Todas as configuracoes devem ser persistidas no Zustand store estendido com novo tipo `ReminderConfig`, usando o persist middleware existente.

### 2. Decomposicao em Cenarios

**Cenario A — Primeira ativacao de reminders (permissao granted):**
- Usuario abre config de reminders, toggle master esta OFF
- Usuario ativa toggle
- Browser exibe prompt de permissao nativo
- Usuario permite -> `Notification.permission === "granted"`
- Toggle ativa, configuracoes aparecem com defaults
- Todos os controles visiveis: active days, time pickers, frequency, daily summary, preview, metricas

**Cenario B — Permissao negada pelo usuario:**
- Usuario ativa toggle, browser exibe prompt
- Usuario nega -> `Notification.permission === "denied"`
- Toggle desativa automaticamente
- Mensagem exibida: "Notifications blocked. Please enable them in your browser settings."
- Instrucoes contextuais de como resolver

**Cenario C — Permissao dismissada (default):**
- Usuario ativa toggle, browser exibe prompt
- Usuario fecha/ignora prompt -> `Notification.permission === "default"`
- Toggle permanece desativado
- Mensagem: "Permission required to send reminders. Tap to try again."

**Cenario D — Configuracao de dias ativos:**
- Grid de 7 botoes (Mon-Sun)
- Default: Mon-Fri ativos
- Toggle cada dia individualmente
- Se nenhum dia selecionado: mensagem "Select at least one day to receive reminders"
- Metricas semanais atualizam em tempo real

**Cenario E — Configuracao de janela de horario:**
- Dois inputs nativos type="time"
- Start default: 08:00, End default: 22:00
- Validacao: end deve ser posterior a start
- Se end <= start: mensagem inline de erro
- Metricas diarias recalculam

**Cenario F — Selecao de frequencia:**
- Grid 2x2 com opcoes: 30 min, 1 hour, 1.5 hours, 2 hours
- Selecao unica (radio-like)
- Default: 1 hour
- Opcao ativa exibe checkmark (RiCheckLine)
- Metricas recalculam ao mudar

**Cenario G — Toggle de resumo diario:**
- Switch independente, visivel apenas quando master esta ativo
- Default: ativado
- Label "Daily summary", descricao "End-of-day progress notification"
- Afeta metricas ("+ summary" no per day)

**Cenario H — Preview de notificacoes:**
- Card de reminder: icone Hydra, "Time to hydrate!", corpo com progresso mock
- Card de daily summary (se ativado): icone emerald, "Hydra -- Daily Summary", corpo com stats mock
- Timestamp do summary reflete endTime configurado

**Cenario I — Metricas calculadas:**
- Per day: `floor((endTime - startTime) / intervalMinutes)` reminders [+ summary]
- Per week: `remindersPerDay * activeDays.length` reminders across N days
- Atualizam em tempo real ao mudar qualquer parametro

**Cenario J — Persistencia no store:**
- ReminderConfig salvo no Zustand store com persist middleware
- Auto-save: cada alteracao persiste imediatamente
- Refresh da pagina: config carrega do store
- Backward compatibility: dados antigos sem reminderConfig nao quebram

**Cenario K — Browser sem suporte a Notification API:**
- `typeof Notification === "undefined"` ou `!("Notification" in window)`
- Secao de reminders oculta ou desativada com aviso de incompatibilidade

### 3. Criterios de Aceite por Cenario

**Cenario A:**
- Ao ativar toggle: `await Notification.requestPermission()` e chamado
- Se resultado "granted": toggle fica ON, config sections renderizam
- Defaults: activeDays [1,2,3,4,5], startTime "08:00", endTime "22:00", intervalMinutes 60, dailySummary true

**Cenario B:**
- Se resultado "denied": toggle volta para OFF automaticamente
- Mensagem com tom amigavel, instrucoes para browser settings
- Toggle nao pode ser reativado sem mudar permissao no browser

**Cenario C:**
- Se resultado "default": toggle permanece OFF
- Mensagem convida a tentar novamente
- Proximo tap no toggle re-solicita permissao (se browser permitir)

**Cenario D:**
- Botoes usam `aria-pressed`, `aria-label` com nome do dia
- Ativo: `bg-primary text-primary-foreground`; Inativo: `bg-muted text-muted-foreground`
- Validacao de minimo 1 dia com mensagem `text-destructive`

**Cenario E:**
- Inputs nativos `type="time"`, estilo: `h-11 rounded-xl border border-input text-lg font-semibold`
- Mensagem de erro inline quando end <= start

**Cenario F:**
- Botao ativo: variante `default` com RiCheckLine prefix; Inativo: variante `outline`
- Grid 2x2 com gap-2

**Cenario G:**
- Switch custom (mesmo padrao dos toggles existentes no app)
- `role="switch"`, `aria-checked`, `aria-label="Toggle daily summary"`

**Cenario J:**
- `ReminderConfig` adicionado ao `partialize` do Zustand persist
- Schema validation atualizada para aceitar estado com ou sem `reminderConfig`
- Defaults aplicados se campo ausente no localStorage

## Bloco 2: Como? (Implementacao)

### 4. Codigo de Referencia

**Prototipo principal (adaptar para real):**
Arquivo: `app/lab/reminders/components/reminders-config.tsx`

Este prototipo ja implementa:
- Master toggle com switch custom
- Active days selector (grid 7 botoes com activeDays: number[])
- Time pickers nativos
- Frequency grid 2x2 com checkmark
- Daily summary toggle
- Preview de notificacoes (reminder + daily summary)
- Metricas per day e per week
- Funcao `parseTime()` para calculos

Diferencas para versao real:
1. Trocar `useState<ReminderState>` por leitura/escrita do Zustand store
2. Trocar `setPermissionState("granted")` por `Notification.requestPermission()` real
3. Adicionar validacao de end > start
4. Adicionar tratamento de browser sem suporte
5. Adicionar mensagens de erro para permissao denied/default

```tsx
// Padrao do prototipo (lab) — toggle master:
function handleToggle() {
  if (!reminder.enabled && permissionState === "prompt") {
    setPermissionState("granted"); // TROCAR POR REAL:
    // const result = await Notification.requestPermission();
    // setPermissionState(result);
  }
  setReminder((prev) => ({ ...prev, enabled: !prev.enabled }));
}

// Active days selector (padrao a manter):
<div className="flex gap-1.5">
  {DAYS.map((day) => {
    const active = reminder.activeDays.includes(day.value);
    return (
      <button
        key={day.value}
        onClick={() => toggleDay(day.value)}
        aria-label={`${active ? "Disable" : "Enable"} ${day.label}`}
        aria-pressed={active}
        className={cn(
          "flex h-10 flex-1 items-center justify-center rounded-xl text-xs font-semibold transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        {day.short}
      </button>
    );
  })}
</div>

// Metricas (padrao a manter):
const remindersPerDay = reminder.enabled && windowMinutes > 0
  ? Math.floor(windowMinutes / reminder.intervalMinutes)
  : 0;
const weeklyTotal = remindersPerDay * activeDayCount;
```

**Prototipo base (referencia secundaria):**
Arquivo: `app/lab/phase2-accounts/components/reminders-config.tsx`
- Versao sem active days e sem metricas semanais
- Util como referencia para switch custom e preview de notificacoes

**Store atual a estender:**
Arquivo: `hooks/use-hydration-store.ts`

```tsx
// Tipo HydrationState atual (linhas 94-112):
type HydrationState = {
  logs: HydrationLog[];
  dailyGoal: number;
  presets: number[];
  _hydrated: boolean;
  _dataWasReset: boolean;
  // actions...
};

// partialize atual (linhas 160-164):
partialize: (state) => ({
  logs: state.logs,
  dailyGoal: state.dailyGoal,
  presets: state.presets,
}),

// merge atual (linhas 165-179):
merge: (persistedState, currentState) => {
  if (isValidPersistedState(persistedState)) {
    return {
      ...currentState,
      logs: persistedState.logs,
      dailyGoal: persistedState.dailyGoal,
      presets: persistedState.presets,
    };
  }
  // ...
},
```

### 5. Contratos e Estruturas de Dados

**Tipo ReminderConfig (adicionar ao store):**
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

**Defaults:**
```typescript
const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  enabled: false,
  activeDays: [1, 2, 3, 4, 5],  // Mon-Fri
  startTime: "08:00",
  endTime: "22:00",
  intervalMinutes: 60,
  dailySummary: true,
};
```

**Extensao do HydrationState:**
```typescript
type HydrationState = {
  // ...campos existentes...
  reminderConfig: ReminderConfig;
  // ...actions existentes...
  setReminderConfig: (config: Partial<ReminderConfig>) => void;
};
```

**Constantes para UI:**
```typescript
const DAYS = [
  { value: 1, short: "Mon", label: "Monday" },
  { value: 2, short: "Tue", label: "Tuesday" },
  { value: 3, short: "Wed", label: "Wednesday" },
  { value: 4, short: "Thu", label: "Thursday" },
  { value: 5, short: "Fri", label: "Friday" },
  { value: 6, short: "Sat", label: "Saturday" },
  { value: 0, short: "Sun", label: "Sunday" },
];

const INTERVALS = [
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];
```

### 6. Dependencias e Interacoes

**Componentes shadcn/ui:**
- `@/components/ui/card` — Card, CardContent, CardHeader, CardTitle
- `@/components/ui/button` — Button

**Icones @remixicon/react:**
- RiNotification3Line, RiTimeLine, RiRepeatLine, RiCheckLine, RiCalendarLine

**Util do projeto:**
- `cn` de `@/lib/utils` (para classnames condicionais)

**Store:**
- `useHydrationStore` de `@/hooks/use-hydration-store` (estender)
- `useStoreHydrated` de `@/hooks/use-hydration-store`

**Browser API:**
- `Notification.requestPermission()` — API real do browser
- `Notification.permission` — verificar estado atual

**Navegacao:**
- Se implementado como rota: criar `app/settings/reminders/page.tsx`
- Se implementado como secao: adicionar dentro de `app/settings/page.tsx`
- Link de acesso a partir de Settings (card clicavel ou secao inline)

**Integracao com US-017:**
- A US-017 consumira `reminderConfig` do store para agendar notificacoes
- Esta US (016) cobre apenas UI e persistencia, NAO o envio efetivo

### 7. Requisitos Nao-Funcionais

- **UI Framework:** Tailwind CSS 4 + shadcn/ui — OBRIGATORIO
- **Formatadores:** Seguir Prettier/ESLint existentes
- **Auto-save:** Cada alteracao persiste imediatamente no store, sem botao "Save"
- **Backward compatibility:** Adicionar `reminderConfig` ao store sem quebrar dados existentes (merge defensivo)
- **Schema validation:** Atualizar `isValidPersistedState` para aceitar estado com ou sem `reminderConfig`
- **Acessibilidade:** Todos os controles com `role`, `aria-label`, `aria-checked`, `aria-pressed`
- **Mobile-first:** Layout otimizado para viewport mobile (max-w-md)
- **Performance:** Sem re-renders desnecessarios ao mudar config; metricas calculadas inline ou com useMemo
- **Permissao real:** OBRIGATORIO usar `Notification.requestPermission()` — nao simular

## Bloco 3: Como Validar? (Validacao)

### 8. Cenarios de Teste (BDD)

**Cenario: Primeira ativacao com permissao concedida**
```
Given que o usuario esta na pagina de configuracao de reminders
  And o toggle master esta OFF
  And Notification.permission e "default" (nunca solicitado)
When o usuario ativa o toggle master
Then o browser exibe o prompt nativo de permissao
When o usuario clica "Allow"
Then o toggle fica ON
  And as secoes de configuracao aparecem (days, time, frequency, summary)
  And os defaults sao aplicados: Mon-Fri, 08:00-22:00, 1h, daily summary ON
  And a config e salva no store
```

**Cenario: Permissao negada pelo usuario**
```
Given que o usuario esta na pagina de configuracao de reminders
  And o toggle master esta OFF
When o usuario ativa o toggle
  And o browser exibe o prompt de permissao
  And o usuario clica "Block"
Then o toggle volta para OFF automaticamente
  And uma mensagem "Notifications blocked..." e exibida
  And instrucoes para habilitar nas configuracoes do browser sao exibidas
```

**Cenario: Configuracao de dias ativos**
```
Given que reminders estao ativados com days Mon-Fri
When o usuario desativa "Wednesday" e ativa "Saturday"
Then activeDays e [1,2,4,5,6]
  And metricas semanais recalculam para 5 dias
  And config e salva automaticamente no store
```

**Cenario: Nenhum dia selecionado**
```
Given que reminders estao ativados
When o usuario desativa todos os dias
Then a mensagem "Select at least one day to receive reminders" aparece
  And metricas mostram 0 reminders/week
```

**Cenario: Validacao de janela de horario**
```
Given que reminders estao ativados
When o usuario define startTime "20:00" e endTime "08:00"
Then uma mensagem de erro inline e exibida
  And metricas mostram 0 reminders/day
```

**Cenario: Mudanca de frequencia**
```
Given que reminders estao ativados com janela 08:00-22:00 (14h)
When o usuario seleciona frequencia "30 min"
Then checkmark move para opcao "30 min"
  And metricas mostram ~28 reminders/day
  And config e salva automaticamente
```

**Cenario: Toggle de resumo diario**
```
Given que reminders estao ativados com daily summary ON
When o usuario desativa daily summary
Then preview de daily summary desaparece
  And metricas per day removem "+ summary"
  And config e salva automaticamente
```

**Cenario: Persistencia entre sessoes**
```
Given que o usuario configurou reminders (Mon-Sat, 09:00-18:00, 30min, summary OFF)
When o usuario faz refresh da pagina
Then todas as configuracoes sao restauradas do store
  And toggle esta ON, days Mon-Sat, time 09:00-18:00, frequency 30min, summary OFF
```

**Cenario: Backward compatibility do store**
```
Given que o localStorage contem dados do store sem campo reminderConfig
When o app carrega e hidrata o store
Then os dados existentes (logs, dailyGoal, presets) permanecem intactos
  And reminderConfig recebe valores default
  And nenhum erro de parsing/validacao ocorre
```

**Cenario: Browser sem suporte a Notification API**
```
Given que o browser nao suporta Notification API
When o usuario acessa a configuracao de reminders
Then a secao de reminders e oculta ou desativada
  And uma mensagem de incompatibilidade e exibida
```

**Cenario: Desativar reminders**
```
Given que reminders estao ativados com configuracao personalizada
When o usuario desativa o toggle master
Then as secoes de configuracao ocultam
  And reminderConfig.enabled e salvo como false no store
When o usuario reativa o toggle
Then as configuracoes anteriores reaparecem (nao reseta para defaults)
```
