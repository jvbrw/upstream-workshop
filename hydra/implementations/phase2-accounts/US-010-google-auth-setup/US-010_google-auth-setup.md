## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario eu quero fazer login com minha conta Google para que eu possa sincronizar meus dados de hidratacao entre dispositivos.

### Funcionalidades Principais
- Configuracao do NextAuth.js com Google OAuth provider
- Rotas de API de autenticacao (`/api/auth/*`) funcionais
- SessionProvider envolvendo o app inteiro para acesso ao estado de auth
- Estado de autenticacao acessivel em qualquer componente via hook `useSession`
- Todas as rotas permanecem publicas — autenticacao e 100% opcional

### Criterios de Aceite Chave
- Fluxo completo de Google OAuth funciona: login e logout com redirecionamento correto
- SessionProvider esta no layout raiz sem quebrar SSR ou hydration do Next.js
- App funciona identicamente para usuarios nao-logados (nenhuma feature bloqueada)
- Credenciais de OAuth (client ID/secret) ficam em variavel de ambiente, nunca no codigo
- Estado de sessao (logado/nao-logado) e acessivel em qualquer componente client-side

---

## Contexto Detalhado para Agentes

# User Story: Google Authentication Setup

## Declaracao da historia

Como um usuario eu quero fazer login com minha conta Google para que eu possa sincronizar meus dados de hidratacao entre dispositivos.

## Criterios funcionais

**1. NextAuth.js Setup:**
- Instalar e configurar NextAuth.js (versao compativel com Next.js 16 / App Router)
- Configurar Google OAuth provider com credenciais via variavel de ambiente (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- Configurar `NEXTAUTH_SECRET` para assinatura de tokens
- Configurar `NEXTAUTH_URL` para ambiente de desenvolvimento e producao
- Criar arquivo de configuracao de auth (ex: `lib/auth.ts` ou `auth.ts` na raiz)

**2. API Routes:**
- Criar catch-all route handler em `app/api/auth/[...nextauth]/route.ts`
- Expor handlers GET e POST do NextAuth
- Configurar callbacks necessarios:
  - `session` callback: incluir `user.id` na sessao se necessario para sync futuro (US-012+)
  - `jwt` callback: incluir dados necessarios no token
- Configurar paginas customizadas se necessario (ou usar defaults do NextAuth)

**3. SessionProvider:**
- Criar componente wrapper `AuthProvider` (client component) que envolve `SessionProvider` do NextAuth
- Integrar `AuthProvider` no layout raiz (`app/layout.tsx`), envolvendo o conteudo do `<body>`
- Garantir que SessionProvider nao interfere com:
  - Hydration do Zustand store existente (`hydra-store`)
  - Theme script inline (dark mode detection no `<head>`)
  - StorageBanner e StoreNotifications existentes
  - BottomNav existente

**4. Hook de Auth Acessivel:**
- `useSession()` do NextAuth deve funcionar em qualquer componente client-side
- Criar hook utilitario opcional `useAuth()` em `hooks/use-auth.ts` que expoe:
  - `isAuthenticated: boolean`
  - `isLoading: boolean`
  - `user: { name, email, image } | null`
  - `signIn: () => void` (wrapper para `signIn("google")`)
  - `signOut: () => void`

**5. Rotas e Protecao:**
- NENHUMA rota deve ser protegida ou bloqueada
- Todas as rotas existentes (`/`, `/history`, `/manage`, `/settings`) permanecem 100% publicas
- Auth e puramente aditivo — nao muda nenhum comportamento existente
- Nao adicionar middleware de redirect ou protecao de rotas

**6. Configuracao de Ambiente:**
- Criar arquivo `.env.example` documentando as variaveis necessarias:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
- Adicionar `.env.local` ao `.gitignore` (se nao estiver ja)

## Criterios de experiencia do usuario

- Nenhuma mudanca visual nesta US — toda a UI de sign-in e da US-011
- O app deve carregar com a mesma velocidade de antes (SessionProvider nao deve adicionar loading state visivel)
- Nenhum flash de conteudo, loading spinner, ou tela em branco durante inicializacao da sessao
- Para usuarios nao-logados: experiencia identica a Phase 1 (zero diferenca perceptivel)

## Testes regressivos

- US-001: Navegacao entre abas (Today, History, Manage, Settings) funciona normalmente
- US-002: Zustand store continua persistindo dados em localStorage sem interferencia
- US-003: Quick log funciona normalmente na aba Today
- US-004: Progress ring renderiza corretamente
- US-005: Streak calcula corretamente
- US-006: History exibe dados corretamente
- US-007: Manage (editar/deletar logs) funciona normalmente
- US-008: Settings (goal, presets) funciona normalmente
- Layout raiz: BottomNav, StorageBanner, StoreNotifications continuam renderizando
- Theme toggle (dark/light) continua funcionando sem flash

## Criterios para QA

- Padroes de qualidade: Auth transparente, zero impacto em performance, zero regressao visual
- Cenarios de teste:
  - Caminho feliz: Chamar `signIn("google")` programaticamente redireciona para Google OAuth, retorna com sessao ativa
  - Caminho feliz: `useSession()` retorna `{ data: session, status: "authenticated" }` apos login
  - Caminho feliz: `signOut()` limpa a sessao, `useSession()` retorna `status: "unauthenticated"`
  - Caminho feliz: Recarregar a pagina apos login mantem a sessao ativa (cookie persistido)
  - Caminho de insucesso: Variaveis de ambiente ausentes — app deve carregar normalmente (auth desabilitado, nao crash)
  - Caminho de insucesso: Google OAuth falha (usuario cancela) — retorna ao app sem erro visivel
  - Caminho alternativo: Usuario nunca faz login — app funciona identicamente a Phase 1
  - Testes nao-funcionais: Medir tempo de carregamento do app antes e depois — delta < 100ms
  - Testes nao-funcionais: Verificar que nenhuma chamada de rede de auth e feita quando usuario nao esta logado
- Homologacao: Testar em Chrome, Safari, Firefox; testar em mobile (PWA mode); verificar que cookies de sessao sao criados corretamente

## Criterios de aceitacao

- NextAuth.js configurado com Google provider e rotas de API funcionais
- SessionProvider integrado no layout raiz sem quebrar nenhum componente existente
- `useSession()` retorna estado correto em componentes client-side (authenticated/unauthenticated/loading)
- Fluxo completo de login via Google OAuth funciona (redirect, callback, sessao ativa)
- Fluxo completo de logout funciona (limpa sessao, retorna a estado unauthenticated)
- Sessao persiste entre recarregamentos de pagina (cookie-based)
- Nenhuma rota protegida ou bloqueada — todas as rotas permanecem publicas
- Nenhuma regressao visual ou funcional em features de Phase 1
- Variaveis de ambiente documentadas em `.env.example`
- Prototipos de referencia: nao ha prototipo visual para esta US — e infraestrutura pura
