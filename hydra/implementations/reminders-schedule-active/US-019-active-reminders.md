## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario eu quero visualizar o countdown ate meu proximo lembrete, poder adia-lo temporariamente, e ver uma timeline do dia com o status de cada lembrete para que eu acompanhe meu engajamento e tenha controle sobre quando sou notificado.

### Funcionalidades Principais
- Countdown hero com progresso circular animado mostrando tempo restante (mm:ss) ate o proximo lembrete
- Snooze com 2 opcoes: "For 1 hour" e "Until tomorrow", com botao "Resume" para retomar
- Stats grid com 3 metricas: Sent (enviados hoje), Acted on (usuario registrou agua apos lembrete), Smart skip (pulados por registro recente)
- Timeline do dia com status visual por lembrete: Next (azul), Logged (verde), Sent (muted), Skipped (muted)

### Criterios de Aceite Chave
- Countdown decrementa em tempo real e reinicia ao proximo lembrete quando chega a zero
- Snooze pausa o countdown e altera estado visual (opacity reduzida, icone zzz)
- "Resume" retorna ao estado ativo e retoma countdown
- Stats derivam do cruzamento entre lembretes enviados e logs de hidratacao do dia
- Timeline ordena lembretes do mais recente (topo) ao mais antigo, com proximo lembrete destacado
- Estado de snooze persiste entre navegacoes (nao entre sessoes)

---

## Contexto Detalhado para Agentes

# User Story: Monitoramento Ativo de Lembretes

## Declaracao da historia

Como um usuario eu quero visualizar o countdown ate meu proximo lembrete, poder adia-lo temporariamente, e ver uma timeline do dia com o status de cada lembrete para que eu acompanhe meu engajamento e tenha controle sobre quando sou notificado.

## Criterios funcionais

**Contexto de navegacao:**
- Acessivel como sub-tela dentro de Settings: Settings > Reminders (link/botao na secao de reminder config de US-018)
- Rota: `/settings/reminders` ou section dentro de `/settings` com toggle para expandir a view ativa
- NAO adiciona nova tab na bottom nav (manter as 4 tabs existentes: Today, History, Manage, Settings)
- Entry point visual: botao ou card na secao de reminder schedule config que leva ao monitoramento ativo
- Mostra estado em tempo real dos lembretes do dia atual baseado na agenda configurada em US-018
- Header com titulo "Reminders" e subtitulo dinamico indicando estado atual (ex: "Active -- 8am to 10pm", "Snoozed for 1 hour", "Snoozed until tomorrow")
- Se nenhuma agenda configurada (reminderEnabled = false): exibir estado vazio com CTA para configurar em Settings

**1. Countdown hero:**

- Card principal contendo:
  **1a. Progresso circular animado:**
  - Circulo SVG com 2 layers: track (cor muted) e progresso (cor primary)
  - Exibe tempo restante em formato mm:ss no centro (font-bold tabular-nums)
  - Label "minutes" abaixo do numero
  - Progresso preenche conforme tempo avanca (0% no inicio do intervalo, 100% quando proximo lembrete esta prestes a disparar)
  - Animacao com `transition-all duration-700 ease-out`
  - Quando snoozed: circulo zerado, icone zzz no centro substituindo o timer

  **1b. Info panel (ao lado do circulo):**
  - Label "Next reminder" em uppercase tracking-wider muted
  - Horario do proximo lembrete em texto grande (text-lg font-semibold)
  - Contagem: "[N] sent today, [M] remaining" em texto pequeno muted
  - Quando snoozed: "Resumes at [hora]" ou "Resumes tomorrow" + "All upcoming reminders paused"

  **1c. Calculo do countdown:**
  - Baseado no proximo horario de lembrete derivado da agenda (US-018): startTime, endTime, intervalMinutes, activeDays
  - Se hoje nao e um dia ativo: exibir mensagem "No reminders scheduled for today"
  - Se hora atual esta fora da janela ativa: exibir proximo horario (pode ser amanha)
  - Timer usa setInterval de 1 segundo, com cleanup ao desmontar

  **1d. Respeito a prefers-reduced-motion:**
  - Se usuario prefere reduced motion: desabilitar animacao do progresso circular (transition: none)
  - Countdown numerico continua funcionando normalmente

**2. Snooze:**

  **2a. Botao e dropdown:**
  - Botao "Snooze" com icone zzz (variant outline) quando estado e "active"
  - Ao clicar: abre dropdown com 2 opcoes:
    - "For 1 hour" — com icone de relogio
    - "Until tomorrow" — com icone de notificacao off
  - Dropdown posicionado abaixo do botao, com borda e sombra

  **2b. Estado snoozed:**
  - Quando snoozed: botao muda para "Resume" com icone de notificacao (variant default)
  - Card de countdown com opacity reduzida (opacity-50)
  - Countdown pausa (clearInterval)
  - Header subtitulo atualiza para refletir estado

  **2c. Comportamento do snooze:**
  - "For 1 hour": define snoozeUntil como hora atual + 1h. Quando hora atual ultrapassa snoozeUntil, retorna automaticamente a "active"
  - "Until tomorrow": define snoozeUntil como inicio da janela do proximo dia ativo
  - "Resume": limpa snooze imediatamente, retoma countdown
  - Estado de snooze mantido em state local do componente (nao persiste entre sessoes)

  **2d. Data model para snooze:**
  - snoozeState: 'active' | 'snoozed-1h' | 'snoozed-today' (state local)
  - snoozeUntil: string | null (ISO timestamp ou null)

**3. Stats grid (3 metricas):**

  **3a. "Sent":**
  - Quantidade total de lembretes enviados hoje
  - Derivado: contagem de horarios de lembrete ja ultrapassados no dia (baseado na agenda)
  - Visual: numero grande (text-lg font-bold) em cor primary, label "Sent" em texto pequeno
  - Container com fundo primary semitransparente

  **3b. "Acted on":**
  - Quantidade de lembretes apos os quais o usuario registrou agua dentro de ACTED_ON_WINDOW_MINUTES = 15 minutos apos o horario do lembrete
  - Derivado: cruzamento entre horarios de lembrete enviados e timestamps dos logs de hidratacao do dia (useTodayLogs)
  - Visual: numero em cor emerald, label "Acted on"
  - Container com fundo emerald semitransparente

  **3c. "Smart skip":**
  - Quantidade de lembretes pulados porque usuario registrou agua recentemente (smart reminders feature)
  - Derivado: horarios de lembrete onde existe um log de hidratacao dentro de SMART_SKIP_WINDOW_MINUTES = 10 minutos antes do horario do lembrete
  - Nota: um log pode satisfazer TANTO "acted on" (do lembrete anterior) quanto "smart skip" (do proximo). Cada lembrete e avaliado independentemente
  - Somente contabilizado se smartReminders esta ativado na configuracao (US-018)
  - Visual: numero em cor muted-foreground, label "Smart skip"
  - Container com fundo muted

  **3d. Layout:**
  - Grid de 3 colunas com gap entre cards
  - Cada card: flex column centralizado com numero + label

**4. Timeline do dia:**

  **4a. Geracao da timeline:**
  - Gerar lista de horarios baseada na agenda configurada: do startTime ao endTime, a cada intervalMinutes
  - Filtrar apenas o dia atual (se hoje e dia ativo)
  - Ordenar do mais recente (topo) ao mais antigo (fundo)

  **4b. Status de cada item:**
  - **Upcoming** (proximo lembrete): fundo primary semitransparente, icone de relogio em primary, badge "Next" em primary
  - **Sent + Acted** (lembrete enviado e usuario registrou agua): icone de gota em emerald, badge "Logged" em emerald
  - **Sent + Not Acted** (lembrete enviado mas sem registro): icone de notificacao em muted, badge "Sent" em muted
  - **Skipped** (smart skip): icone de check em muted, badge "Skipped" em muted, texto explicativo (ex: "Skipped -- you logged 300ml 5 min ago")

  **4c. Formato de cada item na timeline:**
  - Row com: icone em container arredondado (size-7), horario (text-xs font-medium), badge de status, texto descritivo (text-xs muted)
  - Item "upcoming" com fundo destacado (bg-primary/5)
  - Items passados sem fundo especial

  **4d. Derivacao de status:**
  - Hora atual > horario do lembrete: "sent"
  - Hora atual <= horario do lembrete e e o proximo: "upcoming"
  - "sent" + existe log de hidratacao dentro de 15min apos horario: "acted" (mostrar como "Logged")
  - "sent" + existe log de hidratacao dentro de 10min antes do horario + smartReminders ativo: "skipped"

  **4e. Label de secao:**
  - Label "Today" em uppercase tracking-wider muted acima da lista

**5. Dados derivados (sem novo estado persistido):**
- Toda a informacao da timeline e stats e derivada em tempo real a partir de:
  - Configuracao de agenda (activeDays, startTime, endTime, intervalMinutes, smartReminders) do Zustand store (US-018)
  - Logs de hidratacao do dia (useTodayLogs do store existente)
  - Hora atual (atualizada a cada segundo pelo timer do countdown)
- Nao e necessario persistir timeline items ou stats — sao computados (derived state)

**6. Snooze state (nao persistido):**
- snoozeState e snoozeUntil vivem em useState local do componente
- Nao persistem entre sessoes (ao reabrir app, volta para "active")
- Persistem durante navegacao dentro do app se o componente nao desmontar

## Criterios de experiencia do usuario

- Layout mobile-first com padding horizontal (px-4) e gap vertical entre secoes
- Countdown hero como elemento visual dominante no topo (card com destaque)
- Progresso circular compacto (100px) ao lado do info panel (layout horizontal flex)
- Numeros do countdown com tabular-nums para evitar "jumping" de digitos
- Transicao suave entre estado ativo e snoozed (opacity, troca de icones)
- Dropdown de snooze compacto e bem posicionado (nao sobrepondo timeline)
- Stats grid equilibrado (3 colunas iguais) com cores semanticas (primary, emerald, muted)
- Timeline com densidade de informacao adequada: cada item compact (py-2.5) mas legivel
- Icones pequenos (size-7 container, size-3.5 icone) para nao competir com countdown hero
- Badges de status ("Next", "Logged", "Sent", "Skipped") como texto pequeno alinhado a direita
- Se nao ha lembretes para hoje: mensagem amigavel centralizada ("No reminders for today. Enjoy your day off!")
- Acessibilidade: circulo SVG com aria-label descritivo ("X minutes until next reminder"), botao de snooze com aria-label, dropdown com focus management
- Prototipo de referencia canonica: `app/lab/reminders-ux/components/active-reminders.tsx`

## Testes regressivos

- US-001 (App Shell): Tela de Active Reminders integrada na navegacao do app
- US-002 (Data Persistence): Leitura de logs de hidratacao (useTodayLogs) funciona corretamente para derivar stats
- US-003 (Quick Log): Registrar agua via quick log deve atualizar stats ("Acted on") em tempo real
- US-009 (Hydration Reminders): Se US-009 implementou timer de notificacoes, os timers nao devem conflitar com o countdown desta US
- US-018 (Schedule Config): Agenda configurada e lida corretamente. Se nenhuma agenda existe, tela mostra estado vazio com orientacao para configurar

## Criterios para QA

- Padroes de qualidade: Countdown preciso, derivacao de stats correta, cleanup de timers, acessibilidade
- Cenarios de teste:
  - Caminho feliz: Usuario com agenda "Work day" (Mon-Fri, 8am-6pm, 1h) abre tela numa segunda as 14:30 — countdown mostra ~30min ate 15:00, stats mostram lembretes enviados desde 8am, timeline com items passados e proximo
  - Caminho feliz: Usuario registra agua via quick log — stat "Acted on" incrementa, timeline item mais recente muda para "Logged"
  - Caminho feliz: Usuario clica Snooze > "For 1 hour" — countdown pausa, card com opacity-50, icone zzz, header mostra "Snoozed for 1 hour"
  - Caminho feliz: Usuario clica "Resume" — countdown retoma do ponto correto, UI volta ao estado ativo
  - Caminho feliz: Smart reminders ativo e usuario logou agua 5min atras — proximo lembrete na timeline mostra "Skipped"
  - Caminho de insucesso: Hoje nao e dia ativo (sabado com agenda Work day) — mensagem "No reminders for today"
  - Caminho de insucesso: Hora atual fora da janela (22:00 com janela 8am-6pm) — countdown mostra proximo dia util
  - Caminho alternativo: Usuario com snooze "Until tomorrow" reabre app no dia seguinte — snooze limpo (state local), volta a active
  - Caminho alternativo: Snooze "For 1 hour" expira naturalmente — estado retorna a active automaticamente
  - Caminho alternativo: Nenhuma agenda configurada (campos default ou zerados) — tela com estado vazio orientando usuario a configurar agenda
  - Testes nao-funcionais: Timer de countdown nao causa memory leak ao navegar entre telas. Derivacao de stats nao causa rerender excessivo (useMemo). Progresso circular funciona sem animacao quando prefers-reduced-motion ativo
- Homologacao: Testar countdown em tab ativa e em tab background (timer pode desacelerar). Verificar que progresso circular renderiza corretamente em telas pequenas (320px). Testar dropdown de snooze com touch e keyboard

## Criterios de aceitacao

- Validacao completa do fluxo: visualizar countdown, snooze, resume, verificar stats e timeline
- Countdown decrementa em tempo real (a cada segundo) e mostra tempo correto ate proximo lembrete
- Progresso circular preenche proporcionalmente ao tempo decorrido no intervalo
- Snooze "For 1 hour" pausa countdown e altera UI. Resume retorna ao normal
- Snooze "Until tomorrow" pausa ate proximo dia ativo. Resume retorna ao normal
- Stats (Sent, Acted on, Smart skip) calculam corretamente a partir dos logs de hidratacao e horarios de lembrete
- Timeline mostra todos os lembretes do dia com status correto (upcoming, logged, sent, skipped)
- Registrar agua (addLog) atualiza stats e timeline em tempo real
- Estado de snooze nao persiste entre sessoes (comportamento esperado)
- Dia nao-ativo e hora fora da janela tratados com mensagens informativas
- prefers-reduced-motion respeitado (animacoes desabilitadas)
- Cleanup de timers (setInterval) ao desmontar componente
- Acessibilidade: aria-labels no SVG, botoes, dropdown. Keyboard navigation funcional
- Prototipo de referencia canonica: `app/lab/reminders-ux/components/active-reminders.tsx`
- Nenhuma agenda configurada: exibir estado vazio com CTA para configurar em Settings
- Countdown format: mm:ss para intervalos ate 59:59. Para intervalos > 1h, exibir como "1h 23m" (sem segundos)
- Timer implementation: calcular delta com Date.now() em vez de incremento puro (resiliente a background tab throttling)
- Acessibilidade do countdown: NAO usar aria-live a cada segundo. Usar aria-label estatico no SVG ("X minutes until next reminder") atualizado a cada minuto
- Dependencias: US-018 (Schedule Config -- agenda precisa existir para derivar timeline e stats)
