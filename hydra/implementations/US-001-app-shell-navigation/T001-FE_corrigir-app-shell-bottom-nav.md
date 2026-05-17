## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes. Caso voce decida fazer alteracao, faca atraves do agente para que ela seja refletida em todas as secoes.**

- **Tarefa:** Corrigir App Shell & Bottom Nav (FE)
- **Objetivo:** Corrigir os gaps da bottom navigation, acessibilidade e dark mode FOUC no app shell existente
- **Topicos:**
  - Tabs erradas: trocar Social/Profile por Manage/Settings na bottom nav
  - Acessibilidade: adicionar aria-current, aria-label e focus-visible ring
  - Dark mode FOUC: adicionar script bloqueante no head para aplicar .dark antes do primeiro paint
  - 404 page: revisar not-found.tsx existente (ja criado, verificar conformidade)
- **Dependencias:** @remixicon/react (RiFileList3Line, RiSettings3Line), Next.js App Router
- **Validacao:** Navegacao entre 4 abas, aba ativa destacada, focus ring no teclado, sem FOUC no dark mode, 404 redireciona para Today

---

## Contexto Detalhado para Agentes

## Bloco 1: O Que? (Descricao)

### 1. Objetivo Tecnico Explicito

Corrigir o componente `BottomNav` e o `RootLayout` existentes para alinhar com a especificacao da US-001. O app shell ja existe e funciona, mas possui 6 gaps especificos que precisam ser resolvidos: tabs erradas (3 e 4), ausencia de `aria-current="page"`, ausencia de `aria-label` no `<nav>`, ausencia de `:focus-visible` ring, ausencia de tratamento de FOUC no dark mode, e verificacao do `not-found.tsx`.

### 2. Decomposicao em Cenarios

**Cenario A -- Correcao dos tabs 3 e 4 da bottom nav**

A bottom nav atualmente exibe Social (RiTrophyLine, `/social`) e Profile (RiUser3Line, `/profile`) como tabs 3 e 4. Deve ser corrigido para Manage (RiFileList3Line, `/manage`) e Settings (RiSettings3Line, `/settings`).

**Cenario B -- Acessibilidade da navegacao**

O `<nav>` nao possui `aria-label`. Os links ativos nao possuem `aria-current="page"`. Os links nao possuem estilo `:focus-visible`. Todos os tres atributos devem ser adicionados.

**Cenario C -- Dark mode FOUC (Flash of Unstyled Content)**

O `ThemeToggle` le o localStorage via `useEffect`, o que causa flash de tema claro antes do dark mode ser aplicado. Solucao: adicionar script inline bloqueante no `<head>` do `layout.tsx` que aplica a classe `.dark` no `<html>` antes do primeiro paint.

**Cenario D -- Pagina 404**

O arquivo `app/not-found.tsx` ja existe com link para Today. Verificar se atende os criterios (redireciona ou mostra mensagem com link para `/`).

### 3. Criterios de Aceite por Cenario

**Cenario A:**
- Tab 3 deve exibir icone `RiFileList3Line`, label "Manage", rota `/manage`
- Tab 4 deve exibir icone `RiSettings3Line`, label "Settings", rota `/settings`
- Imports de `RiTrophyLine` e `RiUser3Line` removidos do bottom-nav.tsx
- Rotas `/social` e `/profile` nao devem existir na navegacao

**Cenario B:**
- `<nav>` deve ter `aria-label="Main navigation"`
- Link ativo deve ter `aria-current="page"` (links inativos nao devem ter o atributo)
- Todos os links devem ter `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` no className
- Focus ring visivel ao navegar via teclado (Tab key)

**Cenario C:**
- Nenhum flash de tema claro quando usuario tem dark mode salvo no localStorage
- Script inline no `<head>` deve ler `localStorage.getItem("hydra-theme")` e `prefers-color-scheme: dark`
- Script deve aplicar `document.documentElement.classList.add("dark")` antes do body ser renderizado
- ThemeToggle continua funcionando normalmente apos a correcao

**Cenario D:**
- `app/not-found.tsx` deve existir e conter link para `/` (Today)
- Acessar rota invalida (ex: `/xyz`) deve mostrar a pagina 404

---

## Bloco 2: Como? (Implementacao)

### 4. Codigo de Referencia

**Arquivo a modificar: `components/layout/bottom-nav.tsx`**

Codigo atual (com os problemas marcados):

```tsx
// components/layout/bottom-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiDropLine,
  RiBarChartBoxLine,
  RiTrophyLine,     // REMOVER
  RiUser3Line,      // REMOVER
} from "@remixicon/react";

const NAV_ITEMS = [
  { href: "/", label: "Today", icon: RiDropLine },
  { href: "/history", label: "History", icon: RiBarChartBoxLine },
  { href: "/social", label: "Social", icon: RiTrophyLine },       // CORRIGIR
  { href: "/profile", label: "Profile", icon: RiUser3Line },      // CORRIGIR
] as const;

export function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/lab")) return null;

  return (
    // FALTA: aria-label="Main navigation"
    <nav className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              // FALTA: aria-current={isActive ? "page" : undefined}
              // FALTA: focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
              className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-1.5 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

**Codigo corrigido esperado (bottom-nav.tsx):**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiDropLine,
  RiBarChartBoxLine,
  RiFileList3Line,
  RiSettings3Line,
} from "@remixicon/react";

const NAV_ITEMS = [
  { href: "/", label: "Today", icon: RiDropLine },
  { href: "/history", label: "History", icon: RiBarChartBoxLine },
  { href: "/manage", label: "Manage", icon: RiFileList3Line },
  { href: "/settings", label: "Settings", icon: RiSettings3Line },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/lab")) return null;

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80"
    >
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

**Arquivo a modificar: `app/layout.tsx`**

Codigo atual:

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { BottomNav } from "@/components/layout/bottom-nav";
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
    <html lang="en" className={outfit.variable}>
      {/* FALTA: script bloqueante no <head> para dark mode */}
      <body className="bg-background font-sans text-foreground antialiased">
        <div className="mx-auto flex h-dvh max-w-md flex-col bg-background">
          <main className="flex-1 overflow-y-auto pb-20">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
```

**Correcao esperada (layout.tsx) -- adicionar script bloqueante:**

```tsx
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
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem("hydra-theme");
                  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  if (stored === "dark" || (!stored && prefersDark)) {
                    document.documentElement.classList.add("dark");
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-background font-sans text-foreground antialiased">
        <div className="mx-auto flex h-dvh max-w-md flex-col bg-background">
          <main className="flex-1 overflow-y-auto pb-20">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
```

Notas sobre a correcao do FOUC:
- `suppressHydrationWarning` no `<html>` e necessario porque o script modifica a classe antes da hidratacao do React
- O script usa IIFE com try/catch para seguranca (SSR e ambientes sem localStorage)
- Chave no localStorage: `"hydra-theme"` (mesmo valor usado pelo `ThemeToggle` existente)
- O `ThemeToggle` (`components/layout/theme-toggle.tsx`) NAO precisa ser modificado -- ele ja funciona corretamente apos o mount

**Arquivo existente (verificar apenas): `app/not-found.tsx`**

```tsx
// app/not-found.tsx -- JA EXISTE, verificar se atende
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 pt-20 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-primary hover:underline"
      >
        Go to Today
      </Link>
    </div>
  );
}
```

Status: **ja atende os criterios**. Exibe mensagem e link para Today (`/`). Nenhuma alteracao necessaria.

### 5. Contratos e Estruturas de Dados

Nao se aplica a esta task (nao ha API, apenas componentes de UI).

**Estrutura de dados relevante -- NAV_ITEMS:**

```typescript
type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

// Valores corretos:
const NAV_ITEMS: readonly NavItem[] = [
  { href: "/",         label: "Today",    icon: RiDropLine },
  { href: "/history",  label: "History",  icon: RiBarChartBoxLine },
  { href: "/manage",   label: "Manage",   icon: RiFileList3Line },
  { href: "/settings", label: "Settings", icon: RiSettings3Line },
];
```

**Chave localStorage para dark mode:**

```
key: "hydra-theme"
values: "dark" | "light" (ou ausente = seguir prefers-color-scheme)
```

### 6. Dependencias e Interacoes

**Componentes existentes que DEVEM ser reutilizados:**

| Componente | Path | Uso |
|:---|:---|:---|
| BottomNav | `components/layout/bottom-nav.tsx` | Componente a ser MODIFICADO |
| ThemeToggle | `components/layout/theme-toggle.tsx` | NAO modificar, apenas garantir compatibilidade |
| RootLayout | `app/layout.tsx` | Adicionar script bloqueante no head |
| NotFound | `app/not-found.tsx` | Ja existe, apenas verificar |

**Icones Remix que DEVEM ser usados:**

| Icone | Pacote | Tab |
|:---|:---|:---|
| RiDropLine | @remixicon/react | Today |
| RiBarChartBoxLine | @remixicon/react | History |
| RiFileList3Line | @remixicon/react | Manage (NOVO) |
| RiSettings3Line | @remixicon/react | Settings (NOVO) |

**Icones a REMOVER do bottom-nav.tsx:**
- `RiTrophyLine` (era Social)
- `RiUser3Line` (era Profile)

**Design tokens relevantes (de `app/globals.css`):**

| Token | Uso |
|:---|:---|
| `--primary` | Cor da aba ativa |
| `--muted-foreground` | Cor das abas inativas |
| `--ring` | Cor do focus ring (focus-visible:ring-ring) |
| `--border` | Borda superior da nav bar |
| `--background` | Background com transparencia (bg-background/95) |

**Nota sobre links `/social` em outros arquivos:**

Existem links para `/social` em `app/page.tsx` (linha 89), `app/history/page.tsx` (linha 289) e `components/dashboard/goal-celebration.tsx` (linha 93). Esses sao links no badge de streak e no celebration modal, NAO fazem parte do escopo desta task. A rota `/social` pode continuar existindo como pagina futura, apenas nao deve estar na bottom nav.

### 7. Requisitos Nao-Funcionais

**Performance:**
- App shell deve renderizar em < 1.5s (FCP em 4G simulado)
- Script de dark mode deve ser minimo e sincrono (nao bloquear carregamento perceptivel)
- Navegacao entre abas sem full page reload (ja garantido pelo Next.js Link)

**Acessibilidade (WCAG AA):**
- Touch targets >= 44x44px em todos os botoes de navegacao (ja implementado via `min-h-[44px] min-w-[44px]`)
- `aria-label="Main navigation"` no `<nav>`
- `aria-current="page"` no link ativo
- Focus ring visivel via teclado: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Respeitar `prefers-reduced-motion` (ja tratado pelo Tailwind `motion-safe:`)

**UI Framework:**
- Tailwind CSS 4 (CSS-first config, oklch color space)
- shadcn/ui com tema Cyan (Radix Maia)
- Convencao: `"use client"` em componentes interativos
- Path alias: `@/*`
- Named exports para componentes

**Formatacao:**
- Seguir estilo existente do codebase (indentacao 2 espacos, aspas duplas em JSX)
- Sem alteracao em arquivos fora do escopo

**Estrutura de arquivos:**
- Componentes de layout em `components/layout/`
- Paginas em `app/*/page.tsx`
- 404 em `app/not-found.tsx`

---

## Bloco 3: Como Validar? (Validacao)

### 8. Cenarios de Teste (BDD)

**Cenario 1: Navegacao entre as 4 abas sem reload**

```gherkin
Dado que o usuario esta na pagina Today (/)
Quando o usuario toca na aba "History"
Entao a navegacao ocorre sem full page reload
E a URL muda para /history
E a aba "History" fica destacada com cor primaria
E a aba "Today" volta para cor muted-foreground
```

**Cenario 2: Aba ativa destacada com cor primaria**

```gherkin
Dado que o usuario esta na pagina /manage
Quando a pagina e renderizada
Entao a aba "Manage" exibe icone RiFileList3Line com cor primaria
E as abas "Today", "History" e "Settings" exibem cor muted-foreground
```

**Cenario 3: Tabs corretas na bottom nav**

```gherkin
Dado que o app shell e renderizado em qualquer pagina
Quando o usuario visualiza a bottom navigation
Entao existem exatamente 4 abas na ordem: Today, History, Manage, Settings
E a aba "Manage" usa icone RiFileList3Line e navega para /manage
E a aba "Settings" usa icone RiSettings3Line e navega para /settings
E nao existe aba "Social" nem "Profile"
```

**Cenario 4: Touch targets minimo 44x44px**

```gherkin
Dado que o app esta aberto em viewport mobile (375px)
Quando o usuario inspeciona os botoes de navegacao
Entao cada botao de aba tem altura minima de 44px
E cada botao de aba tem largura minima de 44px
```

**Cenario 5: Layout responsivo mobile-first**

```gherkin
Dado que o app esta aberto em viewport de 1440px
Quando a pagina e renderizada
Entao o container principal tem max-width de 448px (max-w-md)
E o container esta centralizado horizontalmente
E a bottom nav tambem respeita max-w-md centralizado
```

**Cenario 6: Navegacao por URL direta**

```gherkin
Dado que o usuario acessa /settings diretamente via URL
Quando a pagina carrega
Entao a pagina Settings e exibida
E a aba "Settings" esta destacada como ativa na bottom nav
E o atributo aria-current="page" esta presente no link Settings
```

**Cenario 7: Rota invalida (404)**

```gherkin
Dado que o usuario acessa uma rota inexistente (ex: /xyz)
Quando a pagina carrega
Entao a pagina 404 e exibida com mensagem "Page not found"
E existe um link "Go to Today" apontando para /
```

**Cenario 8: Focus ring visivel no teclado**

```gherkin
Dado que o usuario esta na pagina Today
Quando o usuario navega pela bottom nav usando a tecla Tab
Entao cada link de aba recebe um focus ring visivel (ring-2)
E o focus ring usa a cor --ring do tema
```

**Cenario 9: Sem FOUC no dark mode**

```gherkin
Dado que o usuario tem "hydra-theme" = "dark" no localStorage
Quando o usuario recarrega a pagina (F5)
Entao a classe "dark" e aplicada ao <html> antes do primeiro paint
E nao ocorre flash de tema claro
E o ThemeToggle exibe o icone de sol (RiSunLine) indicando dark mode ativo
```

**Cenario 10: Dark mode via preferencia do sistema**

```gherkin
Dado que o usuario NAO tem "hydra-theme" no localStorage
E o sistema operacional esta em dark mode (prefers-color-scheme: dark)
Quando o usuario carrega a pagina pela primeira vez
Entao a classe "dark" e aplicada ao <html> antes do primeiro paint
E o app renderiza em dark mode sem flash
```

**Cenario 11: aria-current apenas na aba ativa**

```gherkin
Dado que o usuario esta na pagina /history
Quando a bottom nav e renderizada
Entao o link "History" tem aria-current="page"
E os links "Today", "Manage" e "Settings" NAO tem atributo aria-current
```

**Cenario 12: Prototipo de referencia**

```gherkin
Dado que o prototipo esta disponivel em /lab/hydra-mvp
Quando a bottom nav da app e comparada com o prototipo
Entao o padrao visual e consistente (icones, labels, espacamento, backdrop-blur)
```

---

## Checklist de Arquivos

| Arquivo | Acao | Descricao |
|:---|:---|:---|
| `components/layout/bottom-nav.tsx` | MODIFICAR | Trocar tabs 3/4, adicionar aria-current, aria-label, focus-visible |
| `app/layout.tsx` | MODIFICAR | Adicionar script bloqueante dark mode no head, suppressHydrationWarning |
| `app/not-found.tsx` | VERIFICAR | Ja existe e atende criterios, nenhuma alteracao necessaria |
| `components/layout/theme-toggle.tsx` | NAO MODIFICAR | Compativel com script bloqueante, nenhuma alteracao |
| `app/globals.css` | NAO MODIFICAR | Tokens ja configurados corretamente |
