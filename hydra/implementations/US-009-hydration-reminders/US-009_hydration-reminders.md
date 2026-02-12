## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario eu quero configurar lembretes periodicos para beber agua para que eu nao esqueca de me hidratar durante dias ocupados.

### Funcionalidades Principais
- Toggle para ativar/desativar lembretes na pagina Settings
- Configuracao de horario de inicio, fim e intervalo entre lembretes
- Notificacoes via Web Notification API do browser
- Solicitacao de permissao do browser na ativacao

### Criterios de Aceite Chave
- Lembretes disparam no intervalo configurado, dentro da janela de horario
- Browser solicita permissao de notificacao ao ativar pela primeira vez
- Se permissao negada, toggle desativa com mensagem explicativa
- Configuracoes de reminder persistem entre sessoes

---

## Contexto Detalhado para Agentes

# User Story: Hydration Reminders

## Declaracao da historia

Como um usuario eu quero configurar lembretes periodicos para beber agua para que eu nao esqueca de me hidratar durante dias ocupados.

## Criterios funcionais

- Secao "Reminders" na pagina Settings (rota `/settings`, abaixo de Goal & Presets):

**Toggle de ativacao:**
- Switch on/off para habilitar/desabilitar lembretes
- Ao ativar pela primeira vez: solicitar permissao de notificacao do browser (Notification.requestPermission)
- Se permissao "granted": ativar lembretes
- Se permissao "denied": desativar toggle automaticamente + mensagem "Notifications blocked. Enable in browser settings."
- Se permissao "default" (user dismissou prompt): manter desativado + mensagem "Permission required to send reminders."

**Configuracao (visivel apenas quando ativo):**
- Start time: horario de inicio dos lembretes (default: 08:00)
- End time: horario de fim dos lembretes (default: 20:00)
- Interval: frequencia entre lembretes (opcoes: 30min, 1h, 1.5h, 2h, 3h — default: 1h)
- Inputs de tempo via select ou time picker
- Validacao: end time deve ser posterior a start time

**Notificacao:**
- Usar Notification API (`new Notification(...)`)
- Titulo: "Time to hydrate!"
- Body: "Drink some water to stay on track." (ou variacao aleatoria de um set de 5 mensagens)
- Icone: favicon do app
- Timer gerenciado via setInterval no client (ativo enquanto tab esta aberta)

**Estado persistido:**
- ReminderConfig: { enabled: boolean, startTime: string, endTime: string, intervalMinutes: number }
- Salvo no Zustand store com persist

## Criterios de experiencia do usuario

- Toggle com label claro "Reminders" e subtitulo "Get notified to drink water"
- Configuracoes em cards/secoes colapsadas quando desativado
- Time pickers nativos ou selects com opcoes claras
- Feedback imediato ao mudar qualquer configuracao (auto-save)
- Mensagem amigavel quando permissao negada (sem culpar o usuario)
- Notificacoes nao devem disparar se usuario ja atingiu a meta do dia (consultar store)

## Testes regressivos

- US-001: Secao Reminders deve aparecer na pagina Settings
- US-002: ReminderConfig deve persistir entre sessoes
- US-008: Secao Reminders deve coexistir com Goal & Presets na mesma pagina

## Criterios para QA

- Padroes de qualidade: Permissoes tratadas corretamente, timer preciso, config persistente
- Cenarios de teste:
  - Caminho feliz: Usuario ativa reminders, permite notificacoes, configura 9:00-18:00 a cada 1h — recebe notificacao apos 1h
  - Caminho feliz: Usuario desativa reminders — notificacoes param imediatamente
  - Caminho de insucesso: Usuario nega permissao — toggle desativa, mensagem explicativa aparece
  - Caminho de insucesso: Start time > end time — validacao impede configuracao
  - Caminho alternativo: Usuario ja atingiu meta diaria — notificacao nao dispara
  - Caminho alternativo: Tab em background — timer pode nao ser preciso (limitacao do browser, documentar)
  - Caminho alternativo: Browser sem suporte a Notification API — secao oculta ou desativada com aviso
  - Testes nao-funcionais: Timer nao deve causar memory leak; cleanup ao desmontar componente
- Homologacao: Testar em Safari iOS (Notification API limitada), Chrome Android, Chrome Desktop

## Criterios de aceitacao

- Validacao completa do fluxo: ativar, configurar, receber notificacao, desativar
- Permissao do browser solicitada corretamente e tratada em todos os estados
- Configuracao persiste entre sessoes
- Notificacoes disparam no intervalo correto dentro da janela configurada
- Notificacoes nao disparam quando meta ja atingida
- Cleanup de timers ao desativar ou desmontar componente (sem memory leaks)
- Prototipo de referencia: nao ha prototipo para Reminders — seguir design language do app
- Nota: Esta US usa Notification API (browser tab ativa) como abordagem simplificada para Phase 1. Push API com Service Worker (notificacoes em background) fica para Phase 2 junto com accounts e cloud sync.
