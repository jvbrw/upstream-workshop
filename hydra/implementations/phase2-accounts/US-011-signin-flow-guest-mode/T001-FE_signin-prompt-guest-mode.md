## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes. Caso voce decida fazer alteracao, faca atraves do agente para que ela seja refletida em todas as secoes.**

- **Tarefa:** Sign-in prompt + guest flag + Settings account CTA (FE)
- **Objetivo:** Implementar o fluxo de primeira visita com sign-in prompt, modo guest via localStorage flag, e secao de conta contextual em Settings
- **Topicos:**
  - Sign-in prompt fullscreen na primeira visita (adaptar prototipo do lab)
  - Controle de exibicao via localStorage flag `hydra-signin-seen`
  - Integracao com NextAuth via hook `useAuth()` (US-010)
  - Redirect pos-login condicional (migracao se dados locais, home se nao)
  - Modo guest: dismiss permanente, zero bloqueio de features
  - Secao de conta contextual em Settings (CTA para guests, perfil para logados)
  - Transicao suave ao dispensar prompt (fade out)
- **Dependencias:** NextAuth/SessionProvider (US-010), Zustand store (`use-hydration-store.ts`), shadcn/ui (Card, Button, Badge), @remixicon/react
- **Validacao:** Primeiro acesso mostra prompt, dismiss persiste, OAuth executa, redirect condicional funciona, Settings reflete estado de auth, nenhuma regressao Phase 1

---

## Contexto Detalhado para Agentes

## Bloco 1: O Que? (Descricao)

### 1. Objetivo Tecnico Explicito

Adaptar o componente `SignInPrompt` do prototipo lab (`app/lab/phase2-accounts/components/sign-in-prompt.tsx`) para uso real no app, implementando: (a) overlay fullscreen controlado por localStorage flag na primeira visita, (b) integracao com NextAuth para fluxo OAuth Google, (c) modo guest sem bloqueio, (d) secao de conta contextual na pagina Settings existente.

### 2. Decomposicao em Cenarios

**Cenario A -- Primeira visita (prompt visivel)**
O usuario abre o app pela primeira vez (flag `hydra-signin-seen` nao existe em localStorage). O sign-in prompt e exibido como overlay fullscreen acima do conteudo. O conteudo do app (Today, BottomNav) fica oculto atras do overlay.

**Cenario B -- "Continue with Google" (fluxo OAuth)**
O usuario clica no botao "Continue with Google". O app chama `signIn("google")` via hook `useAuth()` da US-010. O browser redireciona para Google OAuth. Apos callback de sucesso:
- Flag `hydra-signin-seen` e setada como `"true"` em localStorage
- Se `store.logs.length > 0`: redirect para rota de migracao (US-012 -- pode ser `/migrate` como placeholder)
- Se `store.logs.length === 0`: redirect para home (`/`)

**Cenario C -- "Continue without account" / "Try without account" (modo guest)**
O usuario clica no botao skip. A flag `hydra-signin-seen` e setada como `"true"` em localStorage. O overlay e dispensado com animacao fade out. O app continua funcionando em modo local-only (comportamento Phase 1 identico). O prompt nao aparece novamente.

**Cenario D -- Visita subsequente (prompt nao aparece)**
O usuario retorna ao app com flag `hydra-signin-seen` ja existente. O sign-in prompt NAO e exibido. O app carrega normalmente mostrando a pagina Today.

**Cenario E -- Settings: usuario guest**
Um usuario nao-logado acessa a pagina Settings. Entre as secoes "Appearance" e "Data", um card de conta e exibido com icone de usuario, texto "Sign in to sync your data across devices", e botao "Sign in with Google" (estilo outline/secundario). O CTA e nao-intrusivo.

**Cenario F -- Settings: usuario logado**
Um usuario logado acessa a pagina Settings. O card de conta mostra avatar (imagem Google ou fallback), nome, email, badge "Synced", e botao "Sign out" (texto destructive, sem preenchimento). Clicar "Sign out" encerra a sessao; o card volta a exibir CTA de guest.

**Cenario G -- Texto do botao skip condicional**
Prop `hasLocalData` e derivada de `store.logs.length > 0`:
- Se `true`: botao mostra "Continue without account"
- Se `false`: botao mostra "Try without account"

**Cenario H -- Cancelamento OAuth**
O usuario inicia OAuth mas cancela no Google. O app retorna sem sessao ativa. O prompt continua visivel (flag nao foi setada). O usuario pode tentar novamente ou escolher guest.

**Cenario I -- Sign-out e revisita Settings**
O usuario faz sign-out via Settings. Ao voltar para Settings, o card mostra CTA de sign-in (nao o prompt fullscreen -- o fullscreen so aparece quando `hydra-signin-seen` nao existe).

### 3. Criterios de Aceite por Cenario

| Cenario | Criterio |
|---------|----------|
| A | Prompt fullscreen renderiza em < 200ms, sem skeleton. Responsivo de 320px a 428px. z-index acima de todo conteudo. |
| B | `signIn("google")` e chamado via `useAuth()`. Redirect condicional funciona para ambos os caminhos (migracao / home). Flag setada antes do redirect. |
| C | Flag `hydra-signin-seen` = `"true"` setada em localStorage. Overlay desaparece com fade out (nao desaparece abruptamente). App funciona identicamente apos dismiss. |
| D | Nenhum flash do prompt. Condicional verificada antes do primeiro render visivel. |
| E | Card de conta posicionado entre "Appearance" e "Data" em Settings. Botao outline, nao chamativo. Nao quebra layout existente. |
| F | Avatar circular (32px ou similar), nome, email visiveis. Badge "Synced". Botao "Sign out" com estilo destructive text. `signOut()` limpa sessao. |
| G | Texto do botao alterna corretamente baseado em `store.logs.length`. |
| H | Prompt permanece visivel. Nenhum erro. Usuario pode interagir novamente. |
| I | Settings mostra CTA de guest (nao prompt fullscreen). Flag `hydra-signin-seen` permanece. |

---

## Bloco 2: Como? (Implementacao)

### 4. Codigo de Referencia

**Prototipo do sign-in prompt (UI base pronta):**
Arquivo: `app/lab/phase2-accounts/components/sign-in-prompt.tsx`

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RiGoogleLine, RiDropLine, RiDeviceLine, RiShieldCheckLine, RiLoopLeftLine } from "@remixicon/react";

export type SignInPromptProps = {
  hasLocalData: boolean;
  onSignIn: () => void;
  onSkip: () => void;
};

export function SignInPrompt({ hasLocalData, onSignIn, onSkip }: SignInPromptProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <RiDropLine className="size-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">hydra</h1>
        <p className="text-center text-sm text-muted-foreground">
          Build your hydration habit,<br />one glass at a time
        </p>
      </div>

      {/* Benefits */}
      <div className="mb-8 w-full max-w-sm space-y-3">
        {[
          { icon: RiLoopLeftLine, text: "Sync across all your devices" },
          { icon: RiShieldCheckLine, text: "Keep your data safe in the cloud" },
          { icon: RiDeviceLine, text: "Pick up where you left off, anywhere" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <item.icon className="size-4 text-muted-foreground" />
            </div>
            <span className="text-sm text-foreground">{item.text}</span>
          </div>
        ))}
      </div>

      {/* Sign in button */}
      <div className="w-full max-w-sm space-y-3">
        <Button className="w-full gap-3 text-base" size="lg" onClick={onSignIn}>
          <RiGoogleLine className="size-5" />
          Continue with Google
        </Button>
        <Button variant="ghost" className="w-full text-muted-foreground" size="sm" onClick={onSkip}>
          {hasLocalData ? "Continue without account" : "Try without account"}
        </Button>
      </div>

      {/* Privacy note */}
      <p className="mt-6 max-w-xs text-center text-xs text-muted-foreground/70">
        Your hydration data stays private. We only use your Google account for authentication.
      </p>
    </div>
  );
}
```

**Prototipo do account profile (referencia para secao Settings):**
Arquivo: `app/lab/phase2-accounts/components/account-profile.tsx`

Este componente demonstra o padrao visual para exibir avatar, nome, email, badge "Synced", e botao "Sign out". Usar como referencia visual para a secao de conta em Settings, adaptando para formato Card inline (nao pagina inteira).

**Pagina Settings atual (onde inserir secao de conta):**
Arquivo: `app/settings/page.tsx`

A secao de conta deve ser inserida entre o card "Appearance" (linha ~227) e o card "Data" (linha ~240). A pagina ja usa o padrao `Card > CardHeader > CardTitle + CardContent` do shadcn/ui. Seguir o mesmo padrao visual.

**Hook de auth (US-010 -- dependencia):**
Arquivo esperado: `hooks/use-auth.ts` (criado pela US-010)

Interface esperada:
```tsx
export function useAuth(): {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { name?: string | null; email?: string | null; image?: string | null } | null;
  signIn: () => void;
  signOut: () => void;
};
```

Se `hooks/use-auth.ts` nao existir ainda (US-010 nao implementada), criar um stub temporario que retorna `{ isAuthenticated: false, isLoading: false, user: null, signIn: () => {}, signOut: () => {} }` e documentar o TODO.

**Store Zustand (somente leitura):**
Arquivo: `hooks/use-hydration-store.ts`

```tsx
// Para verificar hasLocalData:
const logs = useHydrationStore((s) => s.logs);
const hasLocalData = logs.length > 0;
```

**Padrao de layout existente (root layout):**
Arquivo: `app/layout.tsx`

```tsx
<div className="mx-auto flex h-dvh max-w-md flex-col bg-background">
  <StorageBanner />
  <StoreNotifications />
  <main className="flex-1 overflow-y-auto pb-20">{children}</main>
  <BottomNav />
</div>
```

O sign-in prompt overlay deve ficar ACIMA deste container (z-index alto), usando `fixed inset-0` ou posicionamento equivalente.

### 5. Contratos e Estruturas de Dados

**localStorage flag:**
```
Key:   "hydra-signin-seen"
Value: "true" (string literal)
Read:  localStorage.getItem("hydra-signin-seen") === "true"
Write: localStorage.setItem("hydra-signin-seen", "true")
```

**Props do SignInPrompt (adaptado do lab):**
```tsx
export type SignInPromptProps = {
  hasLocalData: boolean;
  onSignIn: () => void;
  onSkip: () => void;
};
```

**Dados do NextAuth session (via useAuth):**
```tsx
// user object quando autenticado:
{
  name: string | null;    // Nome do Google
  email: string | null;   // Email do Google
  image: string | null;   // URL do avatar Google
}
```

**Nao ha API endpoints a consumir nesta task.** Toda logica e client-side (localStorage + NextAuth session cookie).

### 6. Dependencias e Interacoes

**Componentes existentes que DEVEM ser reutilizados:**
- `components/ui/button.tsx` -- Button (primary para Google, ghost para skip, outline para CTA Settings)
- `components/ui/card.tsx` -- Card, CardContent, CardHeader, CardTitle (para secao de conta em Settings)
- `components/ui/badge.tsx` -- Badge (para "Synced" no perfil logado)

**Hooks existentes que DEVEM ser usados:**
- `hooks/use-hydration-store.ts` -- `useHydrationStore((s) => s.logs)` para derivar `hasLocalData`
- `hooks/use-auth.ts` (US-010) -- `useAuth()` para `signIn()`, `signOut()`, `isAuthenticated`, `user`, `isLoading`

**Icones que DEVEM ser usados (de @remixicon/react):**
- `RiGoogleLine` -- botao Google
- `RiDropLine` -- logo Hydra
- `RiDeviceLine`, `RiShieldCheckLine`, `RiLoopLeftLine` -- beneficios
- `RiUser3Line` -- fallback avatar guest
- `RiCloudLine` -- badge "Synced"
- `RiLogoutBoxRLine` -- botao sign out

**Arquivos a CRIAR:**
- `components/auth/sign-in-prompt.tsx` -- Componente adaptado do lab com logica de overlay
- `components/settings/account-section.tsx` -- Secao de conta para Settings (guest CTA + perfil logado)

**Arquivos a MODIFICAR:**
- `app/settings/page.tsx` -- Inserir `<AccountSection />` entre "Appearance" e "Data"
- `app/layout.tsx` -- Possivelmente adicionar o sign-in prompt overlay (ou em um wrapper de pagina)

**Dependencia critica:**
- **US-010 (Google Auth Setup):** Fornece NextAuth, SessionProvider, e hook `useAuth()`. Se US-010 nao estiver implementada, usar stub local.

### Integracoes com Backend

Esta task e 100% frontend, sem backend proprio. A unica integracao e com o servico de autenticacao:

| Servico | Task Relacionada | Contrato |
|---------|-----------------|----------|
| NextAuth Google OAuth | US-010 (T001-BE-google-auth-setup) | `signIn("google")` / `signOut()` via `useAuth()` hook |
| NextAuth Session | US-010 | `useSession()` retorna `{ data: session, status }` |

### 7. Requisitos Nao-Funcionais

**Performance:**
- Sign-in prompt deve renderizar em < 200ms (sem skeleton, sem loader)
- Verificacao da flag localStorage deve ser sincrona (nao causar flash do prompt em visitas subsequentes)
- Animacao de fade out deve ser leve (CSS transition, nao JS animation framework)

**UI Framework:** shadcn/ui com Radix Maia style (Cyan theme). OBRIGATORIO usar componentes do shadcn existentes em `components/ui/`.

**Formatadores:** ESLint 9 flat config com `next/core-web-vitals` + `next/typescript`. Sem Prettier configurado -- seguir formatacao do codebase existente.

**Estrutura de arquivos:**
```
components/
  auth/
    sign-in-prompt.tsx       # Overlay do prompt (adaptado do lab)
  settings/
    account-section.tsx      # Secao de conta contextual
```

**Acessibilidade:**
- Touch targets minimo 44x44px (botao Google ja e `size="lg"` = h-12)
- Focus ring visivel em todos os botoes interativos
- Semantic HTML: role="dialog" ou equivalente no overlay
- `aria-label` descritivo nos botoes
- Respeitar `prefers-reduced-motion` na animacao de fade out

**Responsividade:**
- Sign-in prompt responsivo de 320px ate 428px de largura
- Layout centralizado com `max-w-sm` (ja presente no prototipo lab)
- Settings account section se adapta ao padrao de cards existente

**Dark mode:**
- Todos os componentes devem funcionar em light e dark mode
- Usar CSS custom properties do theme (oklch color space)
- Avatar com ring sutil (`ring-2 ring-primary/20`)

**Graceful degradation:**
- Se localStorage indisponivel: prompt aparece toda vez (sem crash)
- Se `useAuth()` retorna `isLoading: true`: nao mostrar prompt ate resolver (ou mostrar com botoes desabilitados)

---

## Bloco 3: Como Validar? (Validacao)

### 8. Cenarios de Teste (BDD)

**Cenario 1: Sign-in prompt aparece na primeira visita**

```gherkin
Dado que o usuario nunca visitou o app antes
  E a flag "hydra-signin-seen" nao existe em localStorage
Quando o usuario acessa a pagina principal
Entao o sign-in prompt fullscreen e exibido
  E o conteudo do app fica oculto atras do overlay
  E o prompt renderiza em menos de 200ms
  E o prompt e responsivo entre 320px e 428px de largura
```

**Cenario 2: Prompt nao aparece em visita subsequente**

```gherkin
Dado que o usuario ja dispensou o prompt anteriormente
  E a flag "hydra-signin-seen" tem valor "true" em localStorage
Quando o usuario acessa a pagina principal
Entao o sign-in prompt NAO e exibido
  E a pagina Today carrega normalmente
  E nao ha flash momentaneo do prompt
```

**Cenario 3: Texto do botao skip com dados locais**

```gherkin
Dado que o sign-in prompt esta visivel
  E existem logs de hidratacao no Zustand store (logs.length > 0)
Quando o usuario visualiza o botao de skip
Entao o texto exibido e "Continue without account"
```

**Cenario 4: Texto do botao skip sem dados locais**

```gherkin
Dado que o sign-in prompt esta visivel
  E nao existem logs de hidratacao no Zustand store (logs.length === 0)
Quando o usuario visualiza o botao de skip
Entao o texto exibido e "Try without account"
```

**Cenario 5: Fluxo OAuth com "Continue with Google"**

```gherkin
Dado que o sign-in prompt esta visivel
Quando o usuario clica em "Continue with Google"
Entao a funcao signIn("google") do NextAuth e chamada via useAuth()
  E o browser redireciona para a pagina de consentimento do Google
```

**Cenario 6: Redirect pos-login COM dados locais**

```gherkin
Dado que o usuario completou o login via Google OAuth
  E existem logs de hidratacao no Zustand store (logs.length > 0)
Quando o callback do OAuth retorna ao app
Entao a flag "hydra-signin-seen" e setada como "true" em localStorage
  E o usuario e redirecionado para a rota de migracao (US-012)
```

**Cenario 7: Redirect pos-login SEM dados locais**

```gherkin
Dado que o usuario completou o login via Google OAuth
  E nao existem logs de hidratacao no Zustand store (logs.length === 0)
Quando o callback do OAuth retorna ao app
Entao a flag "hydra-signin-seen" e setada como "true" em localStorage
  E o usuario e redirecionado para a pagina home (/)
```

**Cenario 8: Dismiss com "Continue without account"**

```gherkin
Dado que o sign-in prompt esta visivel
Quando o usuario clica em "Continue without account" ou "Try without account"
Entao a flag "hydra-signin-seen" e setada como "true" em localStorage
  E o overlay desaparece com animacao de fade out (transicao suave)
  E o app exibe a pagina Today normalmente
  E todas as features continuam funcionando (nenhum bloqueio para guest)
```

**Cenario 9: Cancelamento do OAuth**

```gherkin
Dado que o sign-in prompt esta visivel
  E o usuario clicou em "Continue with Google"
  E o browser redirecionou para Google
Quando o usuario cancela o fluxo OAuth no Google
Entao o app retorna sem sessao ativa
  E o sign-in prompt continua visivel
  E a flag "hydra-signin-seen" NAO foi setada
  E o usuario pode tentar novamente ou escolher guest
```

**Cenario 10: Settings mostra CTA para guest**

```gherkin
Dado que o usuario esta usando o app como guest (nao autenticado)
Quando o usuario acessa a pagina Settings
Entao um card de conta e exibido entre "Appearance" e "Data"
  E o card mostra icone de usuario e texto "Sign in to sync your data across devices"
  E o card mostra botao "Sign in with Google" com estilo outline (nao chamativo)
  E o card nao quebra o layout existente de Settings
```

**Cenario 11: Settings mostra perfil para usuario logado**

```gherkin
Dado que o usuario esta autenticado via Google
Quando o usuario acessa a pagina Settings
Entao um card de conta e exibido entre "Appearance" e "Data"
  E o card mostra avatar do Google (ou fallback), nome e email
  E o card mostra badge "Synced"
  E o card mostra botao "Sign out" com estilo de texto destructive
```

**Cenario 12: Sign out via Settings**

```gherkin
Dado que o usuario esta autenticado via Google
  E esta na pagina Settings visualizando seu perfil
Quando o usuario clica em "Sign out"
Entao a funcao signOut() do NextAuth e chamada via useAuth()
  E a sessao e encerrada
  E o card de conta em Settings muda para exibir CTA de guest
  E o prompt fullscreen NAO reaparece (flag "hydra-signin-seen" permanece)
```

**Cenario 13: Limpeza de localStorage restaura prompt**

```gherkin
Dado que o usuario ja dispensou o prompt anteriormente
Quando o usuario limpa os dados do browser (localStorage)
  E acessa o app novamente
Entao o sign-in prompt fullscreen e exibido novamente
  E o comportamento e identico ao da primeira visita
```

**Cenario 14: Nenhuma regressao em features Phase 1**

```gherkin
Dado que o sign-in prompt foi dispensado (via guest ou login)
Quando o usuario navega entre Today, History, Manage, Settings
Entao todas as abas carregam normalmente
  E quick log funciona na aba Today
  E progress ring renderiza corretamente
  E streak calcula corretamente
  E History exibe dados
  E Manage permite editar/deletar
  E Settings (goal, presets, appearance, data) funcionam sem alteracao
  E BottomNav, StorageBanner, StoreNotifications renderizam normalmente
  E dark/light mode funciona sem interferencia
```

**Cenario 15: LocalStorage indisponivel (graceful degradation)**

```gherkin
Dado que o localStorage esta indisponivel (ex: modo incognito restrito)
Quando o usuario acessa o app
Entao o sign-in prompt aparece (nao consegue verificar flag)
  E o app nao crasha
  E o usuario pode interagir com os botoes normalmente
  E ao dispensar, o prompt pode reaparecer na proxima visita (comportamento aceitavel)
```
