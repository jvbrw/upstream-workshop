## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario que acabou de fazer sign-in e tem dados locais eu quero migrar meus dados de hidratacao para minha conta na nuvem para que eu nao perca meu historico de rastreamento.

### Funcionalidades Principais
- Detectar automaticamente dados locais existentes apos sign-in (verificar localStorage key `hydra-store` com logs)
- Exibir tela de migracao com resumo dos dados locais: total de entries, dias rastreados, best streak
- Opcao "Keep my data" — faz upload dos logs e settings locais para a conta cloud
- Opcao "Start fresh" — descarta dados locais, inicia com defaults da nuvem
- Migracao e one-time: flag impede que o prompt seja exibido novamente
- Feedback visual de progresso e confirmacao de sucesso/erro

### Criterios de Aceite Chave
- Apos sign-in com dados locais, o migration prompt aparece automaticamente (uma unica vez)
- "Keep my data" faz upload de todos os logs[], dailyGoal e presets[] para a API cloud
- "Start fresh" limpa dados locais e carrega defaults do servidor
- Flag `migrationCompleted` persiste no store/servidor para nunca re-exibir o prompt
- Apos migracao bem-sucedida, usuario e redirecionado ao dashboard com dados sincronizados
- Se nao houver dados locais (logs vazio), o prompt nao aparece

---

## Contexto Detalhado para Agentes

# User Story: Data Migration Flow

## Declaracao da historia

Como um usuario que acabou de fazer sign-in e tem dados locais eu quero migrar meus dados de hidratacao para minha conta na nuvem para que eu nao perca meu historico de rastreamento.

## Criterios funcionais

- **Deteccao de dados locais:**
  - Apos sign-in bem-sucedido (sessao autenticada via NextAuth), verificar se existe dados em `localStorage` sob a key `hydra-store`
  - Dados locais existem se `state.logs` e um array com length > 0
  - Se nao existem dados locais, pular o fluxo de migracao inteiramente e ir direto ao dashboard
  - Se o usuario ja completou a migracao anteriormente (flag `migrationCompleted` true no servidor ou no store), pular o fluxo

- **Tela de migracao (Migration Prompt):**
  - Adaptar o componente prototipo de `app/lab/phase2-accounts/components/migration-prompt.tsx`
  - Mover de lab para componente real (ex: `app/(app)/migration/page.tsx` ou modal/overlay)
  - Props calculadas a partir dos dados locais:
    - `localEntries`: `logs.length`
    - `localDays`: numero de dias unicos com pelo menos 1 log (extrair datas de `log.timestamp`)
    - `localStreak`: calcular best streak a partir dos logs (reutilizar logica existente de streak do app)
  - Exibir visual de device-to-cloud com estatisticas (conforme prototipo)

- **Acao "Keep my data" (onMigrate):**
  - Fazer upload dos dados locais para o backend via API:
    - `POST /api/migration` com payload `{ logs: HydrationLog[], dailyGoal: number, presets: number[] }`
    - Backend recebe, valida, e persiste no banco associado ao userId da sessao
  - Mostrar indicador de progresso durante o upload (spinner ou progress bar)
  - Em caso de sucesso:
    - Marcar `migrationCompleted = true` no servidor (campo no modelo User ou tabela separada)
    - Limpar flag de local-only no store (transicionar para modo cloud)
    - Redirecionar ao dashboard
    - Toast ou feedback de sucesso: "Data migrated successfully"
  - Em caso de erro:
    - Manter dados locais intactos (nao apagar)
    - Exibir mensagem de erro com opcao de retry
    - Log do erro para debugging

- **Acao "Start fresh" (onStartFresh):**
  - Confirmar a intencao do usuario (dialog de confirmacao: "This will discard X entries. Are you sure?")
  - Se confirmado:
    - Limpar dados locais do store (resetar logs, manter dailyGoal e presets como defaults)
    - Marcar `migrationCompleted = true` no servidor
    - Redirecionar ao dashboard com store em modo cloud (dados do servidor, inicialmente vazio)
  - Se cancelado: voltar ao migration prompt

- **Flag de migracao:**
  - `migrationCompleted` deve ser persistido no lado do servidor (campo booleano no modelo User)
  - Verificar este campo no fluxo pos-sign-in para decidir se mostra migration prompt
  - Nao depender apenas de localStorage para esta flag (usuario pode limpar browser data)

## Criterios de experiencia do usuario

- Tela de migracao deve ser fullscreen (consistente com sign-in prompt) — nao um modal pequeno
- Visual limpo seguindo o prototipo do lab: header, card com stats, visual device-to-cloud, botoes de acao
- Botao "Keep my data" deve ser o CTA primario (destaque visual, tamanho `lg`)
- Botao "Start fresh" deve ser secundario/ghost (menor, cor muted) para desencorajar descarte acidental
- Durante upload: botoes desabilitados, spinner visivel, texto como "Migrating your data..."
- Apos sucesso: feedback positivo antes de redirecionar (1-2 segundos para usuario ver confirmacao)
- Em caso de erro: mensagem clara, nao-tecnica ("Something went wrong. Your data is safe — try again.")
- Tela deve ser responsiva (mobile-first, mas funcional em desktop)
- Animacoes sutis de entrada (consistente com o restante do app)
- "Start fresh" deve ter confirmacao para prevenir perda acidental de dados

## Testes regressivos

- US-002: Dados locais existentes (logs, dailyGoal, presets) devem continuar funcionando normalmente se usuario nao fizer sign-in
- US-003: Quick Log deve funcionar normalmente antes, durante e apos migracao
- US-004: Progress ring deve refletir dados corretos apos migracao (seja cloud ou local)
- US-005: Streak deve ser calculado corretamente com dados migrados para cloud
- US-008: Settings (dailyGoal, presets) devem estar corretos apos migracao
- US-010/011: Fluxo de auth/sign-in deve continuar funcional — migracao e um step adicional pos-sign-in, nao substitui auth
- Guest mode: Usuarios que nao fazem sign-in nao devem ser impactados de nenhuma forma

## Criterios para QA

- **Cenarios de teste:**
  - Caminho feliz — "Keep my data": Usuario com 50 logs locais faz sign-in, ve migration prompt com stats corretos, clica "Keep my data", ve progresso, dados aparecem no dashboard via cloud
  - Caminho feliz — "Start fresh": Usuario com dados locais faz sign-in, clica "Start fresh", confirma no dialog, dashboard mostra zero dados
  - Caminho feliz — Sem dados locais: Usuario novo (sem logs) faz sign-in, migration prompt NAO aparece, vai direto ao dashboard
  - Caminho feliz — Migracao ja feita: Usuario que ja migrou faz sign-out e sign-in novamente, migration prompt NAO aparece
  - Caminho de erro — Falha de rede: Durante upload, API retorna erro 500, usuario ve mensagem de erro, dados locais preservados, botao retry funcional
  - Caminho de erro — Timeout: Upload demora mais de 30s, usuario ve feedback adequado
  - Caminho alternativo — Cancelar "Start fresh": Usuario clica "Start fresh", dialog de confirmacao aparece, usuario cancela, volta ao prompt
  - Edge case: Usuario com 1 log apenas — stats devem mostrar 1 entry, 1 day, 0 ou 1 streak
  - Edge case: Usuario com logs de muitos meses — upload deve funcionar sem timeout
- **Padroes de qualidade:**
  - Stats exibidos no prompt devem bater exatamente com os dados locais
  - Apos "Keep my data", dados no servidor devem ser identicos aos dados locais (comparar logs count, dailyGoal, presets)
  - Flag `migrationCompleted` deve impedir re-exibicao mesmo apos limpar localStorage
  - Zero perda de dados em qualquer cenario de erro (dados locais so sao limpos apos confirmacao de sucesso do servidor)

## Criterios de aceitacao

- Apos sign-in com dados locais (logs.length > 0), migration prompt e exibido automaticamente
- Migration prompt mostra entries, days e best streak calculados corretamente dos dados locais
- "Keep my data" faz upload completo (logs + dailyGoal + presets) e transiciona store para modo cloud
- "Start fresh" com confirmacao limpa dados locais e inicia com defaults do servidor
- Flag `migrationCompleted` no servidor impede re-exibicao do prompt em sign-ins futuros
- Sem dados locais ou com migracao ja completada, prompt nao aparece
- Feedback visual adequado em todos os estados: carregando, sucesso, erro
- Dados locais nunca sao apagados antes de confirmacao de sucesso do servidor
- Componente adaptado do prototipo `app/lab/phase2-accounts/components/migration-prompt.tsx`
- Prototipo de referencia: `app/lab/phase2-accounts/components/migration-prompt.tsx`
