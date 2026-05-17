## 🧑‍💼 Spec para Humanos

> ⚠️ **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes. Caso voce decida fazer alteracao, faca atraves do agente para que ela seja refletida em todas as secoes.**

- **Tarefa:** Settings Rework — account card/banner + sign out + streak link (FE)
- **Objetivo:** Reestruturar a pagina Settings para incluir card de perfil (logado) ou banner promocional (guest) no topo, sign out no rodape, e alterar o link do streak badge no dashboard de /social para /profile
- **Topicos:**
  - Card de perfil clicavel no topo (logado): mini avatar, nome, email, badge "Synced", seta direita -> /profile
  - Banner promocional no topo (guest): icone cloud, "Sign in to sync", CTA para auth
  - Secoes existentes preservadas: Daily Goal, Quick Log Presets, Appearance, Data
  - Sign out no rodape (logado): botao com AlertDialog de confirmacao
  - Dashboard: streak badge Link href alterado de /social para /profile
  - Bottom nav inalterada (4 tabs)
  - Hydration safety com useStoreHydrated()
- **Dependencias:** NextAuth (useSession/signOut), shadcn/ui (Card, AlertDialog, Button, Badge), @remixicon/react, app/settings/page.tsx, app/page.tsx
- **Validacao:** Logado ve card de perfil no topo, Guest ve banner de sign-in, Secoes existentes intactas, Sign out funcional, Streak badge linka para /profile

---

## 🤖 Contexto Detalhado para Agentes

## Bloco 1: O Que? (Descricao)

### 1. Objetivo Tecnico Explicito

Reestruturar o arquivo `app/settings/page.tsx` existente para adicionar uma secao de conta no topo (card de perfil para logados, banner para guests) e botao de sign out no rodape (apenas logados). Adicionalmente, alterar em `app/page.tsx` o href do streak badge de `/social` para `/profile`. Todo o restante da pagina Settings (Daily Goal, Presets, Appearance, Data) deve permanecer identico.

### 2. Decomposicao em Cenarios

**Cenario A — Usuario logado abre Settings:**
- Card de perfil clicavel no topo com mini avatar, nome, email, badge "Synced", seta
- Clicar no card navega para `/profile`
- Secoes existentes abaixo (goal, presets, appearance, data) inalteradas
- Botao "Sign out" no rodape apos secao Data
- Sign out com AlertDialog de confirmacao

**Cenario B — Usuario guest abre Settings:**
- Banner promocional no topo com icone cloud, texto "Sign in to sync", subtexto, CTA
- CTA navega para fluxo de auth
- Secoes existentes abaixo inalteradas
- SEM botao sign out no rodape

**Cenario C — Streak badge no dashboard:**
- Em `app/page.tsx`, o `Link` que envolve o streak badge (`RiFireLine` + "X days")
- Alterar `href="/social"` para `href="/profile"`
- Comportamento visual identico, apenas destino muda

**Cenario D — Sign out via Settings:**
- Botao full-width outline com texto destructive e icone RiLogoutBoxRLine
- AlertDialog com titulo "Sign out?", descricao, botoes Cancel e Sign out
- Confirm: `signOut({ callbackUrl: "/" })`

**Cenario E — Funcionalidades existentes intactas:**
- Daily Goal: input numerico, shortcuts, auto-save com feedback "Saved"
- Presets: badges editaveis, add/remove
- Appearance: ThemeToggle
- Data: total entries, clear all com AlertDialog

### 3. Criterios de Aceite por Cenario

**Cenario A:**
- Card usa componentes Card/CardContent do shadcn/ui
- Mini avatar `size-10` com fallback RiUser3Line se image null
- Nome e email de `session.user`
- Badge "Synced" com icone RiCloudLine (variante secondary)
- RiArrowRightSLine no lado direito
- Card inteiro clicavel (`cursor-pointer`, `hover:bg-accent`)
- Envolvido em `Link href="/profile"` ou `onClick={() => router.push("/profile")}`
- Separador visual apos card, antes das secoes existentes

**Cenario B:**
- Banner com fundo sutil (`bg-primary/5` ou `bg-muted`)
- Icone RiCloudLine ou similar
- Texto principal "Sign in to sync"
- Subtexto "Create a free account to keep your data safe and access it from any device"
- Botao CTA "Sign in" que navega para fluxo de auth
- Separador visual apos banner

**Cenario C:**
- Em `app/page.tsx`, linha ~98: alterar `<Link href="/social">` para `<Link href="/profile">`
- Nenhuma outra alteracao no dashboard

**Cenario D:**
- Botao posicionado apos a secao Data (ultima coisa na pagina)
- AlertDialog identico ao padrao usado em /profile (US-014)
- Apos confirmacao: `signOut({ callbackUrl: "/" })`

**Cenario E:**
- Zero alteracoes no comportamento de goal, presets, appearance, data
- Timer de "Saved" feedback continua funcionando
- Validacoes de presets continuam funcionando
- Clear all data AlertDialog continua funcionando

## Bloco 2: Como? (Implementacao)

### 4. Codigo de Referencia

**Arquivo principal a modificar:** `app/settings/page.tsx`

Codigo atual relevante (estrutura a preservar):
```tsx
// Arquivo: app/settings/page.tsx
// PRESERVAR INTEGRALMENTE: linhas 29-291 (toda a logica de goal, presets, appearance, data)

export default function SettingsPage() {
  // ... state e handlers existentes ...

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-4">
      {/* AQUI: Substituir header atual por secao de conta condicional */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Customize your hydration goals
          </p>
        </div>
        {showSaved && (/* ... Saved feedback ... */)}
      </div>

      {/* PRESERVAR: Daily Goal card */}
      {/* PRESERVAR: Presets card */}
      {/* PRESERVAR: Appearance card */}
      {/* PRESERVAR: Data card */}

      {/* NOVO: Sign out button (logado only) — adicionar aqui */}
    </div>
  );
}
```

**Referencia de card clicavel (padrao ja usado no profile placeholder):**
Arquivo: `app/profile/page.tsx` (linhas 229-251)
```tsx
<Link href="/manage">
  <Card className="cursor-pointer transition-colors hover:bg-accent">
    <CardContent className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
          <RiFileList3Line className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Manage entries</p>
          <p className="text-xs text-muted-foreground">Edit or delete past logs</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Badge variant="secondary">{logs.length}</Badge>
        <RiArrowRightSLine className="size-4 text-muted-foreground" />
      </div>
    </CardContent>
  </Card>
</Link>
```

**Streak badge a alterar em dashboard:**
Arquivo: `app/page.tsx` (linhas 97-104)
```tsx
{streak > 0 && (
  <Link href="/social">  {/* ALTERAR para href="/profile" */}
    <Badge variant="secondary" className="gap-1 px-3 py-1 text-sm">
      <RiFireLine className="size-4 text-orange-500" />
      {streak} day{streak !== 1 ? "s" : ""}
    </Badge>
  </Link>
)}
```

### 5. Contratos e Estruturas de Dados

**Sessao NextAuth (mesma da US-014):**
```typescript
// useSession() retorna:
{
  data: {
    user: { name: string | null; email: string | null; image: string | null };
  } | null;
  status: "loading" | "authenticated" | "unauthenticated";
}
```

**Condicional de renderizacao:**
```typescript
const { data: session, status } = useSession();
const isLoggedIn = status === "authenticated" && session !== null;
```

### 6. Dependencias e Interacoes

**Componentes shadcn/ui ja existentes no projeto:**
- `@/components/ui/card` — Card, CardContent, CardHeader, CardTitle
- `@/components/ui/badge` — Badge
- `@/components/ui/button` — Button
- `@/components/ui/alert-dialog` — AlertDialog (completo, ja usado na secao Data)

**Icones @remixicon/react (adicionar aos imports existentes):**
- RiUser3Line, RiCloudLine, RiArrowRightSLine, RiLogoutBoxRLine
- Manter todos os icones ja importados (RiCheckLine, RiDeleteBinLine, RiAddLine, RiCloseLine)

**Hooks do projeto:**
- `useHydrationStore` de `@/hooks/use-hydration-store` (ja importado)
- `useStoreHydrated` de `@/hooks/use-hydration-store` (adicionar import)

**NextAuth (adicionar):**
- `useSession` de `next-auth/react`
- `signOut` de `next-auth/react`

**Navegacao:**
- `Link` de `next/link` (adicionar import)
- `useRouter` de `next/navigation` (opcional, para push programatico)

**Integracao com US-014:**
- O card de perfil no topo de Settings linka para `/profile` (US-014)
- O sign out em Settings usa mesmo padrao/copy do sign out em /profile

**Arquivo secundario a modificar:** `app/page.tsx`
- Apenas alterar href do Link do streak badge (linha ~98)

### 7. Requisitos Nao-Funcionais

- **UI Framework:** Tailwind CSS 4 + shadcn/ui — OBRIGATORIO
- **Formatadores:** Seguir Prettier/ESLint existentes
- **Estrutura:** Editar `app/settings/page.tsx` in-place (NAO recriar); editar `app/page.tsx` minimamente
- **Regressao zero:** Todas as funcionalidades existentes de Settings DEVEM continuar funcionando identicamente
- **Hydration safety:** Usar `useStoreHydrated()` para renderizacao condicional logado/guest
- **Layout:** Sem layout shift entre estados logado/guest (card e banner ocupam espaco similar)
- **Responsividade:** Mobile-first (max-w-md definido pelo layout pai)
- **Bottom nav:** NAO alterar `components/layout/bottom-nav.tsx` — manter 4 tabs

## Bloco 3: Como Validar? (Validacao)

### 8. Cenarios de Teste (BDD)

**Cenario: Usuario logado ve card de perfil no topo de Settings**
```
Given que o usuario esta logado com sessao NextAuth valida
When o usuario navega para /settings
Then um card de perfil clicavel e exibido no topo da pagina
  And o card mostra mini avatar (ou fallback), nome, email do usuario
  And o card mostra badge "Synced" com icone de nuvem
  And o card mostra seta para a direita
  And as secoes existentes (goal, presets, appearance, data) aparecem abaixo
```

**Cenario: Usuario logado clica card de perfil**
```
Given que o usuario logado esta em /settings
When o usuario clica no card de perfil no topo
Then o usuario e navegado para /profile
```

**Cenario: Usuario logado ve sign out no rodape**
```
Given que o usuario esta logado e em /settings
Then um botao "Sign out" e visivel apos a secao Data
  And o botao tem estilo outline com texto destructive
```

**Cenario: Sign out via Settings com confirmacao**
```
Given que o usuario logado esta em /settings
When o usuario clica no botao "Sign out"
Then um AlertDialog aparece com titulo "Sign out?" e opcoes Cancel/Sign out
When o usuario clica "Sign out" no dialog
Then signOut() e chamada e usuario e redirecionado para /
```

**Cenario: Sign out cancelado em Settings**
```
Given que o AlertDialog de sign out esta aberto em /settings
When o usuario clica "Cancel"
Then o dialog fecha e a sessao permanece ativa
```

**Cenario: Guest ve banner de sign-in no topo de Settings**
```
Given que o usuario nao esta logado (session e null)
When o usuario navega para /settings
Then um banner promocional e exibido no topo com icone de nuvem
  And o banner mostra texto "Sign in to sync" e subtexto explicativo
  And o banner contem botao CTA "Sign in"
  And as secoes existentes aparecem abaixo
  And o botao sign out NAO e visivel no rodape
```

**Cenario: Guest clica CTA de sign-in**
```
Given que o usuario guest esta em /settings
When o usuario clica "Sign in" no banner
Then o usuario e redirecionado para o fluxo de autenticacao
```

**Cenario: Streak badge no dashboard linka para /profile**
```
Given que o usuario esta no dashboard (/) com streak > 0
When o usuario clica no streak badge (icone de fogo + dias)
Then o usuario e navegado para /profile (nao para /social)
```

**Cenario: Regressao — funcionalidades de Settings intactas**
```
Given que o usuario esta em /settings
When o usuario altera o daily goal
Then o valor e salvo e feedback "Saved" aparece
When o usuario adiciona ou remove um preset
Then a lista de presets e atualizada e feedback "Saved" aparece
When o usuario altera o tema via ThemeToggle
Then o tema muda corretamente
When o usuario clica "Clear all data" e confirma
Then todos os dados sao apagados
```

**Cenario: Sem hydration mismatch**
```
Given que o usuario navega para /settings
When a pagina carrega no cliente
Then nenhum erro de hydration aparece no console do browser
  And a transicao entre loading e conteudo e suave (sem flash)
```
