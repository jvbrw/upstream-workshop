## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario logado eu quero que meus dados de hidratacao sejam automaticamente sincronizados na nuvem para que eu possa acessar de qualquer dispositivo.

### Funcionalidades Principais
- Banco de dados (Prisma + PostgreSQL) com modelos para User, HydrationLog e Settings
- API routes completas: CRUD para logs (`/api/logs`) e settings (`/api/settings`)
- Store dual-mode (Zustand): logado usa API cloud, guest usa localStorage
- Updates otimistas: UI atualiza imediatamente, sync em background
- Fallback offline: mudancas enfileiradas e sincronizadas quando conexao voltar
- Indicador de sync status na UI (badge "Synced across devices" ou similar)

### Criterios de Aceite Chave
- Usuario logado: todas as operacoes de log/settings leem e escrevem via API
- Usuario guest: comportamento identico ao atual (localStorage only, zero mudanca)
- Criar/editar/deletar log reflete imediatamente na UI (otimista) e sincroniza em background
- Sem conexao, mudancas sao enfileiradas e aplicadas automaticamente ao reconectar
- Sync status visivel indica estado atual (synced, syncing, offline, error)

---

## Contexto Detalhado para Agentes

# User Story: Cloud Sync & Dual-Mode Store

## Declaracao da historia

Como um usuario logado eu quero que meus dados de hidratacao sejam automaticamente sincronizados na nuvem para que eu possa acessar de qualquer dispositivo.

## Criterios funcionais

- **Database setup (Prisma + PostgreSQL):**
  - Instalar e configurar Prisma ORM com provider PostgreSQL
  - Modelos do schema:
    - `User`: id, email, name, image, migrationCompleted (Boolean), createdAt, updatedAt — vinculado ao NextAuth
    - `HydrationLog`: id (String/UUID), amount (Int), timestamp (DateTime), userId (String), createdAt, updatedAt
    - `Settings`: id, userId (String, unique), dailyGoal (Int, default 2000), presets (Json, default [200, 300, 500]), updatedAt
  - Relacoes: User hasMany HydrationLog, User hasOne Settings
  - Indices: HydrationLog(userId, timestamp) para queries por data; Settings(userId) unique
  - Seed script opcional para desenvolvimento

- **API Routes:**

  **Logs:**
  - `GET /api/logs` — Retorna logs do usuario autenticado
    - Query params opcionais: `from` (ISO date), `to` (ISO date) para filtrar por periodo
    - Ordenados por timestamp DESC
    - Requer sessao autenticada (401 se nao autenticado)
  - `POST /api/logs` — Cria novo log
    - Body: `{ amount: number, timestamp: string (ISO), id?: string }`
    - Se `id` fornecido, usar (para preservar IDs durante migracao); senao, gerar UUID
    - Valida: amount > 0, timestamp e ISO valido
    - Retorna log criado com 201
  - `PUT /api/logs/[id]` — Atualiza log existente
    - Body: `{ amount?: number, timestamp?: string }`
    - Verifica ownership (log.userId === session.userId)
    - Retorna log atualizado ou 404
  - `DELETE /api/logs/[id]` — Remove log
    - Verifica ownership
    - Retorna 204 ou 404

  **Settings:**
  - `GET /api/settings` — Retorna settings do usuario autenticado
    - Se nao existir registro, retorna defaults: `{ dailyGoal: 2000, presets: [200, 300, 500] }`
    - Cria registro com defaults na primeira leitura (upsert pattern)
  - `PUT /api/settings` — Atualiza settings
    - Body: `{ dailyGoal?: number, presets?: number[] }`
    - Valida: dailyGoal 500-5000, cada preset 50-2000, presets array de 3 elementos
    - Upsert: cria se nao existir, atualiza se existir

  **Seguranca geral das APIs:**
  - Todas as rotas requerem sessao autenticada via NextAuth (`getServerSession`)
  - Retornar 401 para requests sem sessao
  - Verificar ownership em todas as operacoes (userId da sessao)
  - Validacao de input com zod ou similar
  - Rate limiting basico (opcional para MVP)

- **Dual-mode Zustand store:**
  - Refatorar o store existente (`hydra-store`) para suportar dois modos:
    - **Guest mode** (usuario nao logado): comportamento atual — Zustand persist com localStorage, zero mudanca
    - **Cloud mode** (usuario logado): Zustand como cache local + sync com API
  - Deteccao de modo: verificar sessao NextAuth (`useSession`)
  - Ao fazer sign-in: transicionar de guest para cloud mode
    - Carregar dados do servidor (`GET /api/logs`, `GET /api/settings`) e popular o store
    - A partir deste ponto, todas as actions (addLog, removeLog, setDailyGoal, setPresets) tambem fazem chamada API
  - Ao fazer sign-out: transicionar de cloud para guest mode
    - Limpar store e voltar ao modo localStorage only
    - Dados locais pos-sign-out comecam vazios (nao herdam dados cloud)

- **Optimistic updates:**
  - Ao chamar `addLog(log)`: atualizar store imediatamente, disparar `POST /api/logs` em background
  - Ao chamar `removeLog(id)`: remover do store imediatamente, disparar `DELETE /api/logs/[id]` em background
  - Ao chamar `updateLog(id, data)`: atualizar store imediatamente, disparar `PUT /api/logs/[id]` em background
  - Ao chamar `setDailyGoal(value)` ou `setPresets(values)`: atualizar store imediatamente, disparar `PUT /api/settings` em background
  - Se a chamada API falhar: reverter a mudanca no store (rollback) e exibir erro ao usuario
  - Debounce para settings: agrupar mudancas rapidas (ex: slider drag) em uma unica chamada API (300-500ms debounce)

- **Offline fallback:**
  - Detectar status de conexao via `navigator.onLine` e evento `online`/`offline`
  - Quando offline em cloud mode:
    - Mudancas sao aplicadas no store local (otimista) E adicionadas a uma fila de sync (`syncQueue`)
    - `syncQueue`: array de operacoes pendentes `{ type: 'CREATE'|'UPDATE'|'DELETE', entity: 'log'|'settings', payload: any, timestamp: string }`
    - Fila persiste em localStorage (sobrevive a reload)
  - Quando conexao volta (`online` event):
    - Processar fila em ordem cronologica (FIFO)
    - Para cada operacao: fazer chamada API correspondente
    - Em caso de conflito (ex: deletar log que ja foi deletado no servidor): ignorar silenciosamente (idempotent)
    - Apos processar toda a fila: fazer refresh completo dos dados do servidor para garantir consistencia
    - Limpar fila apos sync completo

- **Sync status indicator:**
  - Componente de status visivel na UI (adaptar do prototipo `account-profile.tsx` que tem badge "Synced across devices")
  - Estados possiveis:
    - `synced`: tudo sincronizado (badge verde "Synced")
    - `syncing`: sync em progresso (badge com spinner "Syncing...")
    - `offline`: sem conexao (badge amarelo "Offline — changes saved locally")
    - `error`: falha no sync (badge vermelho "Sync error — tap to retry")
  - Posicao: no header do dashboard ou na pagina de profile/settings
  - Guest mode: indicador nao aparece (nao e relevante)

## Criterios de experiencia do usuario

- **Transparencia total**: usuario logado nao precisa pensar em "salvar" ou "sincronizar" — tudo e automatico
- **Zero percepcao de latencia**: updates otimistas fazem UI responder instantaneamente; sync e invisivel quando funciona
- **Feedback quando relevante**: sync status so chama atencao quando ha problema (offline, erro) — quando synced, e discreto
- **Guest experience inalterada**: usuario que nao faz login nao percebe nenhuma mudanca na experiencia
- **Transicao suave**: ao fazer sign-in, dados cloud carregam sem tela de loading longa (skeleton ou dados locais como placeholder)
- **Offline resiliente**: usuario pode continuar usando o app normalmente offline; sync acontece automaticamente quando volta online, sem intervencao manual
- **Erro gracioso**: se API falhar, rollback e sutil (item some e reaparece com toast explicativo), nao crashs ou estado inconsistente
- **Indicador de sync**: pequeno, nao-intrusivo, posicao consistente — nao deve competir com conteudo principal

## Testes regressivos

- US-002: Store de persistencia local deve continuar funcionando identicamente para usuarios guest (localStorage, key `hydra-store`)
- US-003: Quick Log — adicionar log deve funcionar em ambos os modos (guest e cloud), com mesma UX
- US-004: Progress ring — deve refletir dados corretos independente da fonte (local ou cloud)
- US-005: Streak — calculo deve funcionar com dados cloud; streak nao deve quebrar durante sync
- US-006: History — chart e stats devem exibir dados cloud para usuarios logados
- US-007: Manage logs — editar e deletar logs deve funcionar via API para usuarios logados
- US-008: Settings — dailyGoal e presets devem sincronizar corretamente, alteracoes refletidas em todas as telas
- US-010/011: Auth flow deve integrar corretamente com a transicao guest-to-cloud do store
- US-012: Migracao deve funcionar com a API de logs/settings definida nesta US

## Criterios para QA

- **Cenarios de teste:**
  - Caminho feliz — Cloud CRUD: Usuario logado adiciona log, ve no dashboard, edita amount, deleta log — tudo via API, dados persistem apos reload
  - Caminho feliz — Settings sync: Usuario logado altera dailyGoal para 3000ml, abre app em outro browser/device, ve 3000ml
  - Caminho feliz — Guest mode: Usuario sem login adiciona logs, altera settings — tudo funciona via localStorage, identico ao Phase 1
  - Caminho feliz — Sign-in transicao: Usuario guest faz sign-in (apos migracao US-012), store transiciona para cloud mode, dados vem do servidor
  - Caminho feliz — Sign-out transicao: Usuario logado faz sign-out, store volta para guest mode, dados cloud nao aparecem mais
  - Caminho feliz — Offline + reconexao: Usuario logado perde conexao, adiciona 3 logs offline, reconecta — logs aparecem no servidor
  - Caminho de erro — API failure: POST /api/logs retorna 500, log otimista e revertido no store, toast de erro aparece
  - Caminho de erro — Rollback: Usuario adiciona log, API falha, log desaparece da UI com feedback explicativo
  - Edge case — Sync queue com muitas operacoes: 20+ operacoes offline, todas processadas em ordem ao reconectar
  - Edge case — Reload offline: Usuario esta offline, reloada o app, dados locais (cache) persistem, fila de sync intacta
  - Edge case — Concurrent edits: Mesmo usuario em dois devices altera dailyGoal simultaneamente — last write wins, sem crash
  - Performance: API de logs com 500+ entries responde em < 2s; store update nao causa re-render cascading
- **Padroes de qualidade:**
  - Todas as API routes retornam status codes corretos (200, 201, 204, 400, 401, 404, 500)
  - Validacao de input em todas as rotas (zod schemas)
  - Nenhuma rota expoe dados de outros usuarios (ownership check)
  - Store em cloud mode nunca faz write direto no localStorage (exceto sync queue)
  - Optimistic updates sao revertidos corretamente em caso de falha
  - Fila de sync e processada em ordem e limpa apos sucesso

## Criterios de aceitacao

- Database schema com Prisma configurado (User, HydrationLog, Settings) e migrations rodando
- API routes implementadas e funcionais: GET/POST/PUT/DELETE logs, GET/PUT settings
- Todas as APIs validam autenticacao (401 sem sessao) e ownership (403 se nao for dono)
- Store dual-mode: guest usa localStorage, logado usa API — transicao automatica baseada em sessao
- Optimistic updates em todas as operacoes (addLog, removeLog, updateLog, setDailyGoal, setPresets)
- Rollback funcional quando API falha
- Offline queue persiste em localStorage e e processada automaticamente ao reconectar
- Sync status indicator visivel para usuarios logados com estados: synced, syncing, offline, error
- Guest mode 100% identico ao comportamento pre-Phase 2 (zero regressao)
- Prototipos de referencia: `app/lab/phase2-accounts/components/account-profile.tsx` (sync status badge)
