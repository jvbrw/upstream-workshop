## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes. Caso voce decida fazer alteracao, faca atraves do agente para que ela seja refletida em todas as secoes.**

- **Tarefa:** NextAuth.js setup + API routes + AuthProvider + useAuth hook (BE)
- **Objetivo:** Instalar e configurar NextAuth.js com Google OAuth no App Router, integrar SessionProvider no layout raiz sem regressao, e expor hook useAuth() para uso futuro.
- **Topicos:**
  - Instalacao e configuracao do NextAuth.js com Google provider
  - Arquivo de configuracao `lib/auth.ts` com callbacks de session e JWT
  - Route handler catch-all em `app/api/auth/[...nextauth]/route.ts`
  - Componente AuthProvider (client) envolvendo SessionProvider
  - Integracao no root layout sem quebrar Zustand, theme script, StorageBanner, StoreNotifications, BottomNav
  - Hook utilitario `hooks/use-auth.ts` com isAuthenticated, isLoading, user, signIn, signOut
  - Arquivo `.env.example` documentando variaveis
  - Verificacao de `.env.local` no `.gitignore`
- **Dependencias:** next-auth (NextAuth.js v5 / Auth.js), Google OAuth credentials, variaveis de ambiente
- **Validacao:**
  - Fluxo completo Google OAuth (login + logout + persistencia de sessao)
  - useSession() retorna estado correto em client components
  - Zero regressao visual/funcional em Phase 1
  - App funciona identicamente para usuarios nao-logados

---

## Contexto Detalhado para Agentes

## Bloco 1: O Que? (Descricao)

### 1. Objetivo Tecnico Explicito

Instalar e configurar NextAuth.js (compativel com Next.js 16 / App Router) com Google OAuth provider, criar route handler para `/api/auth/*`, integrar `SessionProvider` no layout raiz (`app/layout.tsx`) sem quebrar nenhum componente existente (Zustand store, theme script, StorageBanner, StoreNotifications, BottomNav), e criar hook utilitario `useAuth()` para acesso simplificado ao estado de autenticacao. Nenhuma rota deve ser protegida. A autenticacao e puramente aditiva -- zero impacto em usuarios nao-logados.

### 2. Decomposicao em Cenarios

**Cenario A -- Instalacao e Configuracao Base:**
Configurar NextAuth.js com Google OAuth provider, definir variaveis de ambiente, criar arquivo de configuracao centralizado em `lib/auth.ts`, e criar route handler catch-all.

**Cenario B -- Integracao no Layout Raiz:**
Criar componente `AuthProvider` (client component) que envolve `SessionProvider` do NextAuth e integra-lo em `app/layout.tsx` envolvendo o conteudo do `<body>`, sem interferir com o theme script inline no `<head>`, o Zustand store (`hydra-store`), StorageBanner, StoreNotifications ou BottomNav.

**Cenario C -- Hook Utilitario useAuth:**
Criar `hooks/use-auth.ts` expondo interface simplificada: `isAuthenticated`, `isLoading`, `user`, `signIn()`, `signOut()`.

**Cenario D -- Configuracao de Ambiente e Documentacao:**
Criar `.env.example` documentando todas as variaveis necessarias. Verificar que `.env.local` esta no `.gitignore`.

**Cenario E -- Resiliencia (Variaveis Ausentes / OAuth Falha):**
App deve carregar normalmente se variaveis de ambiente estiverem ausentes (auth desabilitado, sem crash). Se usuario cancela OAuth flow, retorna ao app sem erro visivel.

### 3. Criterios de Aceite por Cenario

**Cenario A:**
- NextAuth.js instalado e funcional com Google OAuth provider
- `lib/auth.ts` exporta configuracao com `GoogleProvider`, callbacks de `session` e `jwt`
- `app/api/auth/[...nextauth]/route.ts` exporta handlers `GET` e `POST`
- Callback `session` inclui `user.id` na sessao (para sync futuro em US-012+)
- Callback `jwt` inclui dados necessarios no token

**Cenario B:**
- `AuthProvider` e um client component (`"use client"`)
- `SessionProvider` envolve o conteudo do body no layout raiz
- Nenhum flash de conteudo, loading spinner ou tela em branco durante inicializacao da sessao
- Theme script inline no `<head>` continua executando antes do React hydrate (sem flash de dark mode)
- Zustand store (`hydra-store`) continua persistindo em localStorage sem interferencia
- StorageBanner, StoreNotifications e BottomNav renderizam normalmente
- App carrega com a mesma velocidade de antes (delta < 100ms)

**Cenario C:**
- `useAuth()` retorna `{ isAuthenticated, isLoading, user, signIn, signOut }`
- `isAuthenticated` e `true` quando `useSession().status === "authenticated"`
- `isLoading` e `true` quando `useSession().status === "loading"`
- `user` e `{ name, email, image } | null`
- `signIn()` chama `signIn("google")`
- `signOut()` chama `signOut()` do NextAuth

**Cenario D:**
- `.env.example` lista: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `.env.local` esta coberto pelo `.gitignore` existente (ja coberto pelo pattern `.env*`)

**Cenario E:**
- Sem variaveis de ambiente: app carrega normalmente, auth fica inoperante mas nao crash
- Usuario cancela OAuth: retorna ao app sem erro visivel
- Nenhuma chamada de rede de auth e feita quando usuario nao esta logado


## Bloco 2: Como? (Implementacao)

### 4. Codigo de Referencia

**4.1 Layout raiz atual (`app/layout.tsx`) -- arquivo que sera modificado:**

```tsx
// Arquivo: app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { BottomNav } from "@/components/layout/bottom-nav";
import { StorageBanner } from "@/components/layout/storage-banner";
import { StoreNotifications } from "@/components/layout/store-notifications";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Hydra",
  description: "Daily hydration tracker — build the habit, one glass at a time",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("hydra-theme");var d=window.matchMedia("(prefers-color-scheme:dark)").matches;if(s==="dark"||(!s&&d)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-background font-sans text-foreground antialiased">
        <div className="mx-auto flex h-dvh max-w-md flex-col bg-background">
          <StorageBanner />
          <StoreNotifications />
          <main className="flex-1 overflow-y-auto pb-20">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
```

**4.2 Pattern de hook existente (`hooks/use-hydration-store.ts`) -- referencia de estilo:**

```tsx
// Arquivo: hooks/use-hydration-store.ts
// Convencoes observadas:
// - Named exports (sem default export)
// - Hook nomeado como useXxx
// - useMemo para valores derivados
// - TypeScript strict (tipos explicitos)
export function useStoreHydrated() {
  return useHydrationStore((s) => s._hydrated);
}
```

**4.3 Pattern de client component existente (`components/layout/storage-banner.tsx`):**

```tsx
// Arquivo: components/layout/storage-banner.tsx
"use client";

import { useIsEphemeral } from "@/hooks/use-hydration-store";

export function StorageBanner() {
  const isEphemeral = useIsEphemeral();
  if (!isEphemeral) return null;
  // ...
}
```

**4.4 Estrutura de referencia para `lib/auth.ts` (a criar):**

```tsx
// Arquivo: lib/auth.ts
// Configuracao centralizada do NextAuth.js
// Usar NextAuth v5 (Auth.js) compativel com App Router
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
```

**4.5 Estrutura de referencia para route handler (a criar):**

```tsx
// Arquivo: app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

**4.6 Estrutura de referencia para AuthProvider (a criar):**

```tsx
// Arquivo: components/auth/auth-provider.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

**4.7 Estrutura de referencia para useAuth hook (a criar):**

```tsx
// Arquivo: hooks/use-auth.ts
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    user: session?.user
      ? {
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          image: session.user.image ?? null,
        }
      : null,
    signIn: () => signIn("google"),
    signOut: () => signOut(),
  };
}
```

**4.8 Layout raiz modificado (resultado esperado):**

```tsx
// Arquivo: app/layout.tsx (modificado)
import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { BottomNav } from "@/components/layout/bottom-nav";
import { StorageBanner } from "@/components/layout/storage-banner";
import { StoreNotifications } from "@/components/layout/store-notifications";
import "./globals.css";

// ... metadata, viewport, font (sem alteracao) ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("hydra-theme");var d=window.matchMedia("(prefers-color-scheme:dark)").matches;if(s==="dark"||(!s&&d)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-background font-sans text-foreground antialiased">
        <AuthProvider>
          <div className="mx-auto flex h-dvh max-w-md flex-col bg-background">
            <StorageBanner />
            <StoreNotifications />
            <main className="flex-1 overflow-y-auto pb-20">{children}</main>
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 5. Contratos e Estruturas de Dados

**5.1 Variaveis de ambiente (server-side):**

| Variavel | Tipo | Obrigatoria | Descricao |
|----------|------|-------------|-----------|
| `GOOGLE_CLIENT_ID` | string | Sim | Client ID do Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | string | Sim | Client Secret do Google Cloud Console |
| `NEXTAUTH_SECRET` | string | Sim | Secret para assinatura de JWT (gerar com `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | string | Sim (dev) | URL base da aplicacao (ex: `http://localhost:3000`) |

**5.2 Sessao (NextAuth Session object):**

```typescript
// Tipo da sessao retornada por useSession()
type Session = {
  user: {
    id: string;       // Incluido via callback (para sync futuro)
    name: string;
    email: string;
    image: string;
  };
  expires: string;     // ISO date string
};
```

**5.3 Interface do hook useAuth:**

```typescript
type UseAuthReturn = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
  signIn: () => void;
  signOut: () => void;
};
```

**5.4 Rotas de API do NextAuth (automaticas):**

| Rota | Metodo | Descricao |
|------|--------|-----------|
| `/api/auth/signin` | GET | Pagina de sign-in (default NextAuth) |
| `/api/auth/signin/google` | POST | Inicia OAuth flow com Google |
| `/api/auth/callback/google` | GET | Callback do Google OAuth |
| `/api/auth/signout` | POST | Encerra sessao |
| `/api/auth/session` | GET | Retorna sessao atual |
| `/api/auth/csrf` | GET | CSRF token |

### 6. Dependencias e Interacoes

**6.1 Pacote a instalar:**

```bash
npm install next-auth@beta
```

> **Nota:** Para Next.js 16 / App Router, usar NextAuth v5 (Auth.js). A versao `@beta` do npm corresponde ao v5. Verificar compatibilidade no momento da implementacao -- se v5 estiver estavel, usar a versao estavel.

**6.2 Arquivos existentes que serao MODIFICADOS:**

| Arquivo | Modificacao |
|---------|-------------|
| `app/layout.tsx` | Adicionar `<AuthProvider>` envolvendo conteudo do `<body>` |

**6.3 Arquivos existentes que NAO devem ser modificados:**

| Arquivo | Motivo |
|---------|--------|
| `hooks/use-hydration-store.ts` | Zustand store -- sem alteracao |
| `components/layout/bottom-nav.tsx` | Navegacao -- sem alteracao |
| `components/layout/storage-banner.tsx` | Banner -- sem alteracao |
| `components/layout/store-notifications.tsx` | Notificacoes -- sem alteracao |
| `components/ui/*` | Componentes shadcn -- nunca modificar diretamente |
| `lib/utils.ts` | Utility cn() -- sem alteracao |
| `lib/types.ts` | Domain types -- sem alteracao |
| `lib/constants.ts` | Constantes -- sem alteracao |

**6.4 Arquivos NOVOS a criar:**

| Arquivo | Descricao |
|---------|-----------|
| `lib/auth.ts` | Configuracao centralizada do NextAuth (providers, callbacks) |
| `app/api/auth/[...nextauth]/route.ts` | Route handler catch-all (GET + POST) |
| `components/auth/auth-provider.tsx` | Client component wrapper para SessionProvider |
| `hooks/use-auth.ts` | Hook utilitario com interface simplificada |
| `.env.example` | Documentacao das variaveis de ambiente |

**6.5 Convencoes obrigatorias (extraidas do codebase):**

- Named exports apenas (sem default exports, exceto pages do Next.js)
- `"use client"` directive explicita em client components
- Path alias `@/*` para imports
- Props interfaces nomeadas como `[Component]Props` (se aplicavel)
- Componentes em pastas tematicas: `components/auth/`, `hooks/`
- TypeScript strict mode

**6.6 Hierarquia de providers no layout (ordem de aninhamento):**

```
<html>
  <head> (theme script inline -- executa antes de React) </head>
  <body>
    <AuthProvider>           <!-- NOVO: SessionProvider -->
      <div.container>
        <StorageBanner />    <!-- usa Zustand -->
        <StoreNotifications /> <!-- usa Zustand -->
        <main>{children}</main>
        <BottomNav />        <!-- usa usePathname -->
      </div.container>
    </AuthProvider>
  </body>
</html>
```

O `AuthProvider` envolve tudo dentro do `<body>` mas NAO interfere com:
- O theme script no `<head>` (executa antes do React)
- O Zustand store (inicializa independentemente via modulo)
- Nenhum componente existente (SessionProvider e passivo)

### 7. Requisitos Nao-Funcionais

**Performance:**
- SessionProvider NAO deve adicionar loading state visivel ou tela em branco
- Delta de carregamento antes/depois < 100ms
- Nenhuma chamada de rede de auth deve ser feita quando usuario nao esta logado (SessionProvider verifica sessao via cookie, sem round-trip extra se cookie ausente)

**Seguranca:**
- Credenciais OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`) NUNCA no codigo fonte
- Variaveis de ambiente server-side apenas (sem prefixo `NEXT_PUBLIC_`)
- `NEXTAUTH_SECRET` gerado com entropia suficiente (`openssl rand -base64 32`)

**Logging:**
- Erros de OAuth devem ser logados via `console.error` (sem crash do app)
- Em desenvolvimento, NextAuth loga automaticamente em modo debug

**Acessibilidade:**
- Sem impacto -- esta US nao adiciona elementos visuais

**Compatibilidade:**
- Testar em Chrome, Safari, Firefox
- Testar em mobile (PWA mode)
- Verificar que cookies de sessao sao criados corretamente em todos os browsers

**Formatacao e Linting:**
- ESLint 9 flat config com next/core-web-vitals + next/typescript
- Seguir convencoes de formatacao do codebase existente

**Estrutura de arquivos:**
- Seguir estrutura definida no warmup-tech: `lib/` para configuracao, `hooks/` para hooks, `components/[dominio]/` para componentes
- Path alias `@/*` mapeado para root do projeto

**Protecao de rotas:**
- NENHUMA rota protegida
- NAO adicionar middleware de redirect ou protecao
- Todas as rotas (`/`, `/history`, `/manage`, `/settings`) permanecem 100% publicas


## Bloco 3: Como Validar? (Validacao)

### 8. Cenarios de Teste (BDD)

**Cenario 1: Login com Google OAuth -- caminho feliz**

```gherkin
Dado que o usuario esta na aplicacao sem sessao ativa
Quando o usuario chama signIn("google") programaticamente
Entao o browser redireciona para a pagina de consentimento do Google
E apos autorizacao, retorna ao app com sessao ativa
E useSession() retorna { status: "authenticated", data: { user: { name, email, image, id } } }
```

**Cenario 2: Logout -- caminho feliz**

```gherkin
Dado que o usuario esta logado com sessao ativa
Quando o usuario chama signOut()
Entao a sessao e limpa
E useSession() retorna { status: "unauthenticated", data: null }
E o cookie de sessao e removido
```

**Cenario 3: Persistencia de sessao entre recarregamentos**

```gherkin
Dado que o usuario completou login com Google OAuth
Quando o usuario recarrega a pagina (F5 / refresh)
Entao a sessao permanece ativa
E useSession() retorna status "authenticated" com os mesmos dados de usuario
```

**Cenario 4: Hook useAuth retorna estado correto**

```gherkin
Dado que o usuario esta logado
Quando um componente client-side chama useAuth()
Entao isAuthenticated e true
E isLoading e false
E user contem { name, email, image } do Google
E signIn e uma funcao callable
E signOut e uma funcao callable
```

**Cenario 5: Aplicacao funciona sem login (usuario nao-logado)**

```gherkin
Dado que o usuario nunca fez login (sessao inexistente)
Quando o usuario acessa qualquer rota (/, /history, /manage, /settings)
Entao o app funciona identicamente a Phase 1
E nenhuma funcionalidade e bloqueada
E nenhuma chamada de rede de auth e feita
E useSession() retorna { status: "unauthenticated" }
```

**Cenario 6: Variaveis de ambiente ausentes**

```gherkin
Dado que as variaveis GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET nao estao definidas
Quando o app e iniciado
Entao o app carrega normalmente sem crash
E as funcionalidades de Phase 1 funcionam integralmente
E auth fica inoperante (signIn nao completa o flow)
```

**Cenario 7: Usuario cancela OAuth flow**

```gherkin
Dado que o usuario iniciou o flow de OAuth com Google
Quando o usuario cancela na pagina de consentimento do Google
Entao o usuario retorna ao app sem erro visivel
E a sessao permanece como "unauthenticated"
E nenhum crash ou tela de erro e exibida
```

**Cenario 8: Zero regressao em componentes existentes**

```gherkin
Dado que o AuthProvider foi integrado no layout raiz
Quando o app carrega (com ou sem sessao ativa)
Entao o BottomNav renderiza com navegacao funcional entre Today, History, Manage, Settings
E o StorageBanner exibe aviso apenas quando localStorage indisponivel
E o StoreNotifications exibe aviso apenas quando dados foram resetados
E o Zustand store (hydra-store) persiste dados em localStorage normalmente
E o theme toggle (dark/light) funciona sem flash
E o progress ring renderiza corretamente
E o streak calcula corretamente
E quick log funciona normalmente
E history exibe dados corretamente
E manage (editar/deletar) funciona normalmente
E settings (goal, presets) funciona normalmente
```

**Cenario 9: Performance -- sem degradacao perceptivel**

```gherkin
Dado que o app esta rodando com AuthProvider integrado
Quando medimos o tempo de carregamento do app
Entao o delta em relacao a versao sem AuthProvider e < 100ms
E nenhum flash de conteudo, loading spinner ou tela em branco aparece durante inicializacao da sessao
```
