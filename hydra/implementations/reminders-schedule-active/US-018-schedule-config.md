## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario eu quero configurar minha agenda de lembretes de hidratacao escolhendo um preset rapido ou montando um horario personalizado para que os lembretes se encaixem na minha rotina sem esforco.

### Funcionalidades Principais
- 3 presets de agenda (Work day, Full day, Evening) com selecao visual e descricao
- Configuracao custom: dias da semana, janela de horario (from/until), frequencia (30m a 2h)
- Mini timeline preview mostrando dots representando cada lembrete no dia
- Smart toggles: "Smart reminders" (pula se registrou agua recentemente) e "Daily summary" (relatorio de fim de dia)
- Summary footer com calculo automatico de ~X lembretes/dia e ~Y por semana

### Criterios de Aceite Chave
- Selecionar um preset preenche automaticamente dias, horarios e frequencia
- Alterar qualquer campo custom limpa a selecao de preset (modo custom implicito)
- Todas as configuracoes persistem entre sessoes via Zustand store
- Mini timeline atualiza em tempo real conforme parametros mudam
- Summary footer recalcula ao mudar qualquer parametro (dias, horarios, frequencia)
- Tela acessivel via pagina Settings

---

## Contexto Detalhado para Agentes

# User Story: Configuracao de Agenda de Lembretes

## Declaracao da historia

Como um usuario eu quero configurar minha agenda de lembretes de hidratacao escolhendo um preset rapido ou montando um horario personalizado para que os lembretes se encaixem na minha rotina sem esforco.

## Criterios funcionais

**Contexto de navegacao:**
- Acessivel a partir da pagina Settings (rota `/settings`) como nova secao ou link dedicado
- Deve coexistir com as secoes existentes (Daily Goal, Quick Log Presets, Appearance, Data)

**1. Presets de agenda (3 opcoes pre-definidas):**

- "Work day" — icone de maleta, descricao "Mon-Fri, 8am-6pm", configura:
  - activeDays: [1, 2, 3, 4, 5] (segunda a sexta)
  - startTime: "08:00", endTime: "18:00"
  - intervalMinutes: 60
- "Full day" — icone de sol, descricao "Every day, 7am-10pm", configura:
  - activeDays: [0, 1, 2, 3, 4, 5, 6] (todos os dias)
  - startTime: "07:00", endTime: "22:00"
  - intervalMinutes: 90
- "Evening" — icone de lua, descricao "Every day, 5pm-11pm", configura:
  - activeDays: [0, 1, 2, 3, 4, 5, 6] (todos os dias)
  - startTime: "17:00", endTime: "23:00"
  - intervalMinutes: 60
- Cada preset e um botao de largura completa com: icone em container arredondado, label em texto medium, descricao em texto muted, check mark circular quando selecionado
- Selecionar um preset preenche automaticamente todos os campos de configuracao

**2. Opcao "Custom" e configuracao personalizada:**

- Botao "Custom" no mesmo estilo dos presets, com icone de varinha magica
- Ao selecionar Custom (ou ao modificar qualquer campo manualmente), o preset ativo e limpo (preset = null)
- Painel de configuracao custom exibe 3 cards:

  **2a. Days (seletor de dias da semana):**
  - 7 botoes em row horizontal: M T W T F S S (Monday a Sunday)
  - Cada botao e toggle independente (aria-pressed)
  - Visualmente: botao ativo com fundo primary, inativo com fundo muted
  - Validacao: pelo menos 1 dia deve estar selecionado

  **2b. Hours (janela de horario):**
  - Dois inputs `type="time"`: "From" (horario inicio) e "Until" (horario fim)
  - Inputs lado a lado com separador visual (dash)
  - Labels em uppercase tracking-wider (padrao do prototipo)
  - Validacao: "Until" deve ser posterior a "From"

  **2c. Every (frequencia):**
  - 5 botoes em row: 30m, 45m, 1h, 1.5h, 2h
  - Selecao unica (botao ativo com variant "default", inativos com variant "outline")

**3. Mini timeline preview:**
- Barra horizontal arredondada representando as 24h do dia
- Area ativa (janela de horario) destacada com fundo primary semitransparente
- Dots (circulos) posicionados na timeline representando cada lembrete agendado
- Atualiza em tempo real ao alterar horarios ou frequencia
- Posicionada abaixo dos time pickers dentro do card "Hours"

**4. Smart toggles:**
- Card separado com 2 toggles:

  **4a. "Smart reminders":**
  - Icone em container com fundo chart-1 semitransparente
  - Label: "Smart reminders", sublabel: "Skip if you recently logged"
  - Toggle switch com role="switch" e aria-checked
  - Default: desativado

  **4b. "Daily summary":**
  - Icone de check em container com fundo emerald semitransparente
  - Label: "Daily summary", sublabel: "End-of-day progress report"
  - Toggle switch com role="switch" e aria-checked
  - Default: ativado

**5. Summary footer:**
- Container arredondado com fundo muted
- Duas linhas de metricas:
  - "Per day": ~X reminders [+ summary se ativado]
  - "Per week": ~Y across Z days
- Calculo: remindersPerDay = floor((endMinutes - startMinutes) / intervalMinutes)
- weeklyTotal = remindersPerDay * activeDays.length
- Recalcula em tempo real ao mudar qualquer parametro

**6. Expansao do data model no Zustand store:**
- O store atual (`hooks/use-hydration-store.ts`) NAO possui campos de reminders. Todos os 8 campos abaixo devem ser CRIADOS nesta US:
  - reminderEnabled: boolean (default: false)
  - reminderIntervalMin: number (default: 60)
  - reminderStartHour: number (default: 8) — mapeado de/para startTime string "HH:MM" na UI
  - reminderEndHour: number (default: 22) — mapeado de/para endTime string "HH:MM" na UI
  - activeDays: number[] (default: [1, 2, 3, 4, 5])
  - reminderPreset: string | null (default: "workday")
  - smartReminders: boolean (default: false)
  - dailySummary: boolean (default: true)
- Formato no store: hours como numbers (8, 22), interval como minutes number (60). Conversao para strings de time ("08:00") acontece apenas na UI
- Todos os campos devem ser incluidos no `partialize` para persistencia
- Schema validation (`isValidPersistedState`) deve ser expandida para aceitar dados antigos sem os campos de reminder (backward compatibility — aplicar defaults se ausentes)
- Actions necessarias: `setReminderConfig(config: Partial<ReminderConfig>)` para update atomico

**Nota sobre relacao com US-016 (phase2-accounts):**
- US-016 era um prototipo lab de reminder config com funcionalidades similares (dias, horarios, frequencia)
- US-018 SUBSTITUI o escopo de US-016 com design evoluido (presets, smart reminders, mini timeline)
- Os prototipos lab de phase2-accounts permanecem como referencia historica, mas US-018 e a especificacao canonica para implementacao

**7. Salvamento automatico:**
- Toda alteracao persiste imediatamente no store (sem botao "Save")
- Consistente com padrao do app (auto-save em Settings)

## Criterios de experiencia do usuario

- Layout mobile-first seguindo design language do Hydra (cards com rounded-2xl, paddings consistentes, cores primary/muted)
- Presets como botoes de largura completa empilhados, com feedback visual claro (borda primary, ring, fundo tinted)
- Transicao suave ao alternar entre preset e custom (mostrar/ocultar painel custom)
- Day picker com botoes de tamanho minimo 40x40 (proximo ao 44px touch target)
- Time pickers com fonte grande e legivel (text-lg font-semibold)
- Frequency buttons equidistantes com selecao visual clara
- Mini timeline como visualizacao compacta e informativa (nao interativa, apenas display)
- Toggles switch com animacao de slide (translate-x)
- Summary footer em posicao fixa visual no final da secao
- Auto-save sem feedback explicito de "Saved" (a propria UI reflete as mudancas em tempo real)
- Contraste e legibilidade: labels muted-foreground, valores foreground, secoes bem separadas
- `prefers-reduced-motion`: desabilitar animacao do toggle switch (transition: none), transicao preset/custom sem animacao
- Prototipo de referencia canonica: `app/lab/reminders-ux/components/schedule-config.tsx`

## Testes regressivos

- US-001 (App Shell): Navegacao para configuracao de schedule integrada corretamente
- US-002 (Data Persistence): Novos campos adicionados ao store sem quebrar schema validation. Dados existentes (logs, dailyGoal, presets) continuam intactos apos adicao dos novos campos
- US-008 (Settings): Secao de schedule config coexiste com secoes existentes de Goal, Presets, Appearance e Data
- US-009 (Hydration Reminders): Se US-009 foi implementada, os novos campos complementam os existentes (reminderEnabled, reminderIntervalMin, reminderStartHour, reminderEndHour). Compatibilidade backward: store com dados antigos deve funcionar sem erro

## Criterios para QA

- Padroes de qualidade: Persistencia correta, validacao de inputs, calculo de metricas preciso, backward compatibility do store
- Cenarios de teste:
  - Caminho feliz: Usuario seleciona preset "Work day" — campos preenchem com Mon-Fri, 8am-6pm, 1h. Summary mostra ~10 reminders/day, ~50/week across 5 days
  - Caminho feliz: Usuario seleciona preset "Full day" — campos preenchem com todos os dias, 7am-10pm, 1.5h. Summary mostra ~10 reminders/day, ~70/week across 7 days
  - Caminho feliz: Usuario abre Custom, seleciona Mon-Wed-Fri, 9am-5pm, 45min — Summary mostra ~10 reminders/day, ~30/week across 3 days
  - Caminho feliz: Usuario ativa "Smart reminders" e "Daily summary" — toggles persistem entre sessoes
  - Caminho feliz: Usuario fecha app, reabre — todas as configuracoes carregam do store
  - Caminho de insucesso: "Until" anterior a "From" (ex: From 20:00, Until 08:00) — validacao impede, mensagem inline
  - Caminho de insucesso: Nenhum dia selecionado — aviso visual, summary mostra 0 reminders
  - Caminho alternativo: Usuario seleciona preset, depois altera um campo — preset limpa para null (modo custom)
  - Caminho alternativo: Usuario com store antigo (sem novos campos) abre a tela — defaults aplicados, dados antigos preservados
  - Testes nao-funcionais: Mini timeline renderiza corretamente com extremos (30min interval em janela 7am-11pm = muitos dots). Nenhum rerender excessivo ao arrastar time pickers
- Homologacao: Testar inputs type="time" em Safari iOS, Chrome Android, Chrome Desktop. Verificar que day picker funciona corretamente com touch e keyboard

## Criterios de aceitacao

- Validacao completa do fluxo: selecionar preset, customizar, verificar summary, persistir e recarregar
- 3 presets funcionais que preenchem automaticamente todos os campos ao selecionar
- Modo custom com day picker, time pickers e frequency buttons interativos
- Selecionar um preset e depois alterar um campo limpa o preset ativo
- Mini timeline preview renderiza dots proporcionais a configuracao
- Smart toggles (Smart reminders e Daily summary) funcionam e persistem
- Summary footer calcula corretamente reminders/day e reminders/week
- Novos campos persistem no Zustand store via persist middleware
- Backward compatibility: store com dados antigos nao quebra
- Acessibilidade: todos os botoes com aria-label ou aria-pressed, toggles com role="switch" e aria-checked, inputs de time com labels
- Prototipo de referencia canonica: `app/lab/reminders-ux/components/schedule-config.tsx`
- Validacao: se nenhum dia estiver selecionado, exibir aviso visual e summary com 0 reminders
- Validacao: se "Until" for anterior a "From", exibir mensagem de erro inline
- `prefers-reduced-motion` respeitado (animacoes de toggle e transicoes desabilitadas)
- Dependencias: US-008 (Settings page existente). US-009 NAO e dependencia — esta US cria todos os campos de reminder no store
