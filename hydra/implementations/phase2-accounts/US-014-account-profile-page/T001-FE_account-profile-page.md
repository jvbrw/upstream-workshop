## 🧑‍💼 Spec para Humanos

> ⚠️ **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes. Caso voce decida fazer alteracao, faca atraves do agente para que ela seja refletida em todas as secoes.**

- **Tarefa:** Account Profile Page (FE)
- **Objetivo:** Substituir placeholder da rota /profile por pagina de perfil funcional com dados reais da sessao NextAuth, estatisticas do store e fluxo de sign out
- **Topicos:**
  - Header do perfil: avatar (sessao + fallback), nome, email, badge de verificacao, edit placeholder
  - Sync status banner: fundo emerald, icone cloud, "Synced across devices"
  - Stats cards grid 3 colunas: total logs, day streak (useStreak), daily goal
  - Account info card: member since, storage, provider
  - Sign out com AlertDialog de confirmacao e redirect
  - Modo guest: avatar placeholder, CTA "Create account", stats locais, sem sync/account/signout
  - Hydration safety com useStoreHydrated()
- **Dependencias:** NextAuth (useSession/signOut), Zustand store (useHydrationStore, useStreak, useStoreHydrated), shadcn/ui (Card, Badge, AlertDialog, Button, Separator), @remixicon/react
- **Validacao:** Usuario logado ve perfil completo com dados reais, Sign out com confirmacao funciona, Guest ve CTA sem info de conta, Fallback de avatar funciona, Sem hydration mismatch

---

## 🤖 Contexto Detalhado para Agentes

## Bloco 1: O Que? (Descricao)

### 1. Objetivo Tecnico Explicito

Substituir o conteudo placeholder atual de `app/profile/page.tsx` por uma pagina de perfil funcional que consome dados reais da sessao NextAuth e do Zustand store. A pagina deve exibir informacoes do usuario, status de sincronizacao, estatisticas de hidratacao, informacoes da conta e botao de sign out com confirmacao. Para usuarios guest (sem sessao), exibir versao simplificada com CTA para criacao de conta.

### 2. Decomposicao em Cenarios

**Cenario A — Usuario logado com avatar:**
- Sessao NextAuth ativa com `session.user.image` disponivel
- Exibir avatar real (img com src da sessao), nome, email
- Badge de verificacao (RiShieldCheckLine) no canto inferior do avatar
- Botao edit profile (placeholder/no-op)
- Sync status banner com fundo emerald
- Stats cards com dados reais do store
- Account info card completo
- Botao sign out funcional

**Cenario B — Usuario logado sem avatar:**
- `session.user.image` e null/undefined
- Exibir fallback: circulo com bg `primary/10` e icone `RiUser3Line`
- Restante identico ao Cenario A

**Cenario C — Usuario guest (sem sessao):**
- `session` e null (useSession retorna status "unauthenticated")
- Avatar placeholder com icone generico
- Titulo "Guest User"
- Descricao incentivando criacao de conta
- CTA "Create account" que redireciona para fluxo de sign-in
- Stats cards com dados locais (store funciona mesmo sem auth)
- NAO exibir: sync status, account info, botao sign out

**Cenario D — Sign out com confirmacao:**
- Usuario clica "Sign out"
- AlertDialog aparece com titulo "Sign out?", descricao e botoes Cancel/Sign out
- Cancel: fecha dialog, sessao mantida
- Confirm: chama `signOut()` do NextAuth, redireciona para `/`

**Cenario E — Hydration do store:**
- Antes do store hidratar (`_hydrated === false`), nao renderizar conteudo que depende do store
- Usar `useStoreHydrated()` para condicionar renderizacao
- Evitar flash de conteudo incorreto

### 3. Criterios de Aceite por Cenario

**Cenario A:**
- Avatar renderiza `<img>` com `src={session.user.image}`, `alt={session.user.name}`, classes `size-16 rounded-full object-cover ring-2 ring-primary/20`
- Nome e email extraidos de `session.user.name` e `session.user.email`
- Badge de verificacao posicionada com `absolute -bottom-0.5 -right-0.5`
- Sync banner com `bg-emerald-500/10`, icone `RiCloudLine`, texto "Synced across devices", badge "Just now"
- Stats: Total logs = `logs.length`, Streak = `useStreak()`, Goal = `dailyGoal` formatado
- Account info: Member since (fallback "Feb 2026"), Storage "Cloud", Provider "Google"

**Cenario B:**
- Fallback avatar: `div` com `size-16 rounded-full bg-primary/10 ring-2 ring-primary/20` contendo `RiUser3Line size-7 text-primary`

**Cenario C:**
- Titulo "Guest User", subtitulo com texto motivacional
- Botao CTA variante `default`, full-width, texto "Create account"
- CTA navega para fluxo de auth (signIn ou rota de auth)
- Stats cards renderizam com dados locais
- Secoes de sync, account info e sign out ausentes

**Cenario D:**
- AlertDialog com titulo "Sign out?", descricao "Your data is safely stored in the cloud..."
- Botao Cancel fecha dialog
- Botao Sign out chama `signOut({ callbackUrl: "/" })`

**Cenario E:**
- Condicional `if (!hydrated) return null` ou skeleton enquanto store nao hidratou

## Bloco 2: Como? (Implementacao)

### 4. Codigo de Referencia

**Arquivo a modificar:** `app/profile/page.tsx`

O arquivo atual e um placeholder com conteudo estatico (mock "Ana Costa"). Deve ser completamente reescrito para consumir dados dinamicos.

**Prototipo de referencia (adaptar de props para hooks):**
Arquivo: `app/lab/phase2-accounts/components/account-profile.tsx`

```tsx
// Prototipo usa props estaticas — versao real deve usar hooks:
// import { useSession, signOut } from "next-auth/react";
// import { useHydrationStore, useStreak, useStoreHydrated } from "@/hooks/use-hydration-store";

// Avatar com fallback (padrao do prototipo):
{avatarUrl ? (
  <img src={avatarUrl} alt={name} className="size-16 rounded-full object-cover ring-2 ring-primary/20" />
) : (
  <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
    <RiUser3Line className="size-7 text-primary" />
  </div>
)}

// Stats grid (padrao do prototipo):
<div className="grid grid-cols-3 gap-3">
  <Card size="sm">
    <CardContent className="flex flex-col items-center gap-1 pt-4">
      <RiDropLine className="size-5 text-primary" />
      <p className="text-lg font-bold text-foreground">{totalEntries}</p>
      <p className="text-[10px] text-muted-foreground">Total logs</p>
    </CardContent>
  </Card>
  {/* ... streak, goal ... */}
</div>
```

**Hook useStreak (referencia existente):**
Arquivo: `hooks/use-hydration-store.ts` (linhas 229-266)

```tsx
export function useStreak() {
  const logs = useHydrationStore((s) => s.logs);
  const dailyGoal = useHydrationStore((s) => s.dailyGoal);
  // ... calcula streak baseado em dias consecutivos com goal atingido
  return streak;
}
```

**Hook useStoreHydrated (referencia existente):**
Arquivo: `hooks/use-hydration-store.ts` (linhas 193-195)

```tsx
export function useStoreHydrated() {
  return useHydrationStore((s) => s._hydrated);
}
```

### 5. Contratos e Estruturas de Dados

**Sessao NextAuth:**
```typescript
// useSession() retorna:
{
  data: {
    user: {
      name: string | null;
      email: string | null;
      image: string | null;
    };
    expires: string;
  } | null;
  status: "loading" | "authenticated" | "unauthenticated";
}
```

**Store Zustand (campos relevantes):**
```typescript
{
  logs: HydrationLog[];        // { id, amount, timestamp }
  dailyGoal: number;           // default 2000
  presets: number[];            // default [200, 300, 500]
  _hydrated: boolean;
}
```

**Dados derivados:**
```typescript
const totalLogs = logs.length;
const streak = useStreak();        // number
const formattedGoal = dailyGoal >= 1000 ? `${dailyGoal / 1000}L` : `${dailyGoal}ml`;
```

### 6. Dependencias e Interacoes

**Componentes shadcn/ui a utilizar (ja existem no projeto):**
- `@/components/ui/card` — Card, CardContent, CardHeader, CardTitle
- `@/components/ui/badge` — Badge
- `@/components/ui/button` — Button
- `@/components/ui/separator` — Separator
- `@/components/ui/alert-dialog` — AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger

**Icones @remixicon/react:**
- RiUser3Line, RiShieldCheckLine, RiCloudLine, RiDropLine, RiFireLine, RiCalendarCheckLine, RiLogoutBoxRLine, RiPencilLine

**Hooks do projeto:**
- `useHydrationStore` de `@/hooks/use-hydration-store`
- `useStreak` de `@/hooks/use-hydration-store`
- `useStoreHydrated` de `@/hooks/use-hydration-store`

**NextAuth:**
- `useSession` de `next-auth/react`
- `signOut` de `next-auth/react`

**Navegacao:**
- Pagina acessivel via link em Settings (implementado na US-015)
- Rota `/profile` ja existe no routing (app/profile/page.tsx)

### 7. Requisitos Nao-Funcionais

- **UI Framework:** Tailwind CSS 4 + shadcn/ui — OBRIGATORIO usar componentes existentes
- **Formatadores:** Seguir configuracao Prettier/ESLint do projeto
- **Estrutura de arquivos:** Manter em `app/profile/page.tsx` (arquivo ja existe)
- **Performance:** Nao fazer fetch desnecessario; dados vem de hooks locais (store + session)
- **Hydration safety:** OBRIGATORIO usar `useStoreHydrated()` para evitar mismatch SSR/client
- **Responsividade:** Funciona em viewport mobile (max-w-md definido pelo layout pai)
- **Acessibilidade:** AlertDialog com semantica correta, botoes com aria-labels
- **Avatar externo:** `<img>` com `next/image` nao obrigatorio (avatar vem de URL externa Google); se usar `<img>`, aceitar URLs externas
- **Diretiva:** `"use client"` obrigatorio no topo (componente usa hooks de estado e sessao)

## Bloco 3: Como Validar? (Validacao)

### 8. Cenarios de Teste (BDD)

**Cenario: Usuario logado visualiza perfil completo**
```
Given que o usuario esta logado com sessao NextAuth valida (nome, email, avatar)
  And o store Zustand contem logs de hidratacao
When o usuario navega para /profile
Then a pagina exibe o avatar real do usuario com badge de verificacao
  And o nome e email sao exibidos corretamente
  And o sync status banner mostra "Synced across devices"
  And os stats cards mostram total de logs, streak e daily goal com dados reais
  And o card de account info mostra member since, storage "Cloud" e provider "Google"
  And o botao "Sign out" e visivel
```

**Cenario: Usuario logado sem avatar ve fallback**
```
Given que o usuario esta logado mas session.user.image e null
When o usuario navega para /profile
Then a pagina exibe icone RiUser3Line em circulo como fallback de avatar
  And o badge de verificacao continua visivel
  And o restante do perfil funciona normalmente
```

**Cenario: Sign out com confirmacao**
```
Given que o usuario esta logado e na pagina /profile
When o usuario clica no botao "Sign out"
Then um AlertDialog aparece com titulo "Sign out?" e descricao
When o usuario clica "Sign out" no dialog
Then a funcao signOut() do NextAuth e chamada
  And o usuario e redirecionado para /
```

**Cenario: Sign out cancelado**
```
Given que o usuario esta logado e o AlertDialog de sign out esta aberto
When o usuario clica "Cancel"
Then o dialog fecha
  And a sessao permanece ativa
  And o usuario continua na pagina /profile
```

**Cenario: Guest visualiza perfil simplificado**
```
Given que o usuario nao esta logado (session e null)
When o usuario navega para /profile
Then a pagina exibe avatar placeholder com icone generico
  And o titulo "Guest User" e exibido
  And uma descricao incentivando criacao de conta e exibida
  And um botao CTA "Create account" e exibido
  And os stats cards mostram dados locais do store
  And o sync status banner NAO e exibido
  And o card de account info NAO e exibido
  And o botao sign out NAO e exibido
```

**Cenario: Guest clica CTA de criacao de conta**
```
Given que o usuario guest esta na pagina /profile
When o usuario clica "Create account"
Then o usuario e redirecionado para o fluxo de sign-in/auth
```

**Cenario: Hydration do store**
```
Given que a pagina /profile esta carregando
  And o store Zustand ainda nao hidratou (_hydrated === false)
When a pagina renderiza no cliente
Then nenhum dado do store e exibido (evita flash de valores default)
When o store completa a hidratacao
Then os dados corretos sao exibidos
  And nenhum erro de hydration aparece no console
```

**Cenario: Usuario com zero logs**
```
Given que o usuario esta logado
  And o store nao contem nenhum log de hidratacao
When o usuario navega para /profile
Then o total logs mostra "0"
  And o streak mostra "0"
  And o daily goal mostra o valor configurado (ex: "2L")
```
