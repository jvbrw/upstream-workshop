# Phase 2 — Accounts

## Objetivo

Adicionar sistema de contas de usuario ao Hydra, que hoje e 100% local-only (localStorage via Zustand persist). Phase 2 permite que usuarios facam login, sincronizem dados na nuvem, migrem dados locais existentes, e configurem lembretes de hidratacao.

## Prototipos Existentes

Todos os prototipos estao em `app/lab/phase2-accounts/` e foram validados visualmente no Prototype Lab.

### Tela 1: Sign-in Prompt
- Tela fullscreen de onboarding com logo Hydra
- Botao "Continue with Google" (auth via Google)
- Opcao "Continue without account" / "Try without account"
- Lista de beneficios: sync entre dispositivos, dados seguros na nuvem, continuar de onde parou
- Nota de privacidade
- Props: `hasLocalData`, `onSignIn`, `onSkip`

### Tela 2: Migration Prompt
- Exibida apos sign-in quando usuario tem dados locais
- Mostra resumo dos dados locais: entries, dias, best streak
- Visual de migracao: device → cloud
- Botao "Keep my data" (migra local → cloud)
- Botao "Start fresh" (descarta dados locais)
- Props: `localEntries`, `localDays`, `localStreak`, `onMigrate`, `onStartFresh`

### Tela 3: Account Profile
- Tela de perfil com avatar, nome, email
- Badge de sync status ("Synced across devices")
- Stats cards: total logs, streak, daily goal
- Info de conta: member since, storage (Cloud), provider (Google)
- Botao edit profile, botao sign out
- Props: `name`, `email`, `avatarUrl`, `dailyGoal`, `totalEntries`, `streak`, `memberSince`

### Tela 4: Reminders Config
- Toggle master para push notifications (com simulacao de permission request)
- Active hours: time pickers para start/end
- Frequency: grid de botoes (30min, 1h, 1.5h, 2h)
- Daily summary toggle
- Preview de notificacao com dados contextuais
- Calculo automatico de reminders/day
- Estado local: `ReminderState { enabled, startTime, endTime, intervalMinutes, dailySummary }`

## Contexto Tecnico Atual

- **Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Zustand 5
- **Persistencia atual**: localStorage via Zustand persist middleware (`hydra-store`)
- **Auth atual**: Nenhuma. App e 100% anonimo/local
- **Backend atual**: Nenhum. App e static/client-only
- **Store existente**: logs[], dailyGoal, presets[] — tudo em localStorage

## O Que Precisa Mudar

### Backend / Infra
- Adicionar autenticacao (Google OAuth via NextAuth.js ou similar)
- Adicionar banco de dados (para persistir dados de usuarios logados)
- API routes para sync de dados

### Frontend
- Integrar componentes do lab no app real (adaptar de props mock para store/auth real)
- Fluxo de sign-in: quando mostrar? (first launch? settings? prompt contextual?)
- Fluxo de migracao: detectar dados locais, oferecer merge
- Profile: substituir ou complementar pagina Settings atual
- Reminders: nova rota/tab ou secao dentro de Settings
- Dual-mode store: continuar funcionando offline/local para quem nao faz login

### UX Decisions Needed
- Sign-in obrigatorio ou opcional?
- Onde fica o trigger de sign-in? (tela inicial? settings? banner?)
- Reminders: tab propria ou dentro de Settings?
- Profile: tab propria ou dentro de Settings?
- Como lidar com conflito de dados (local vs cloud)?

## Personas Impactadas

- **Ana (Profissional de Mesa)**: Quer zero friccao. Sign-in opcional e essencial. Migracao transparente.
- **Lucas (Construtor de Habitos)**: Quer sync entre dispositivos e lembretes. Motivado por nao perder dados.

## Riscos

- Adicionar backend muda fundamentalmente a arquitetura (local-first → client-server)
- Auth + DB + API routes e um salto de complexidade significativo
- Reminders dependem de Web Push API + service workers (permissoes, compatibilidade)
- Scope creep: "accounts" pode virar muito grande se nao for bem delimitado
