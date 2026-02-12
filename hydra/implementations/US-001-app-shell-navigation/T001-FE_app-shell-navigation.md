## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

- **Tarefa:** App shell layout, bottom navigation & route structure (FE)
- **Objetivo:** Criar o shell do aplicativo com root layout atualizado, componente BottomNav com 4 abas roteadas, e paginas placeholder para cada rota
- **Topicos:**
  - Root layout: Atualizar metadata, limpar fonts desnecessarias, adicionar navigation shell wrapper
  - BottomNav: Componente com 4 abas (Today, History, Manage, Settings), deteccao de rota ativa, icones Remix, safe area
  - Route pages: Criar paginas placeholder para /, /history, /manage, /settings
  - Not-found: Redirecionar rotas invalidas para / (Today)
- **Dependencias:** @remixicon/react (ja instalado), Next.js App Router (usePathname, Link)
- **Validacao:** Navegar entre 4 abas sem page reload, aba ativa destacada, touch targets 44x44px, URL direta funcional

---

## Contexto Detalhado para Agentes

## Bloco 1: O Que? (Descricao)

### 1. Objetivo Tecnico Explicito

Implementar o app shell do Hydra: atualizar o root layout para incluir metadata do produto, wrapper de navegacao e font cleanup; criar o componente `BottomNav` com 4 abas roteadas usando Next.js App Router; criar paginas placeholder para as 4 rotas; adicionar handler de not-found com redirect para Today.

### 2. Decomposicao em Cenarios

**Cenario A — Root Layout Update:**
- Atualizar metadata: title "Hydra" e description "Daily hydration tracker"
- Remover fonts Geist (desnecessarias) — manter apenas Outfit como `--font-sans`
- Adicionar `<html>` com `className` incluindo `outfit.variable`
- Body com `bg-background text-foreground font-sans antialiased`
- Wrapper principal: `<main className="mx-auto flex h-dvh max-w-md flex-col bg-background">` envolvendo `{children}`
- BottomNav renderizado fora do children, fixo no rodape

**Cenario B — BottomNav Component:**
- Novo arquivo: `components/layout/bottom-nav.tsx`
- Client component (`"use client"`)
- 4 abas configuradas como array: `[{ href: "/", label: "Today", icon: RiDropLine }, { href: "/history", label: "History", icon: RiBarChartBoxLine }, { href: "/manage", label: "Manage", icon: RiFileList3Line }, { href: "/settings", label: "Settings", icon: RiSettings3Line }]`
- Usar `usePathname()` do `next/navigation` para detectar rota ativa
- Cada aba: `<Link>` com icone (size-5) + label (text-[10px] font-medium)
- Aba ativa: `text-primary`; inativa: `text-muted-foreground hover:text-foreground`
- Container: `fixed bottom-0`, `border-t border-border`, `bg-background/95 backdrop-blur-sm`
- Safe area: `pb-[max(0.5rem,env(safe-area-inset-bottom))]`
- Touch targets: cada aba com `min-h-[44px] min-w-[44px]`
- Props interface: `BottomNavProps` (vazio por ora, mas preparado para extensao)
- Named export: `export function BottomNav()`

**Cenario C — Route Pages (placeholders):**
- `app/page.tsx`: Limpar conteudo atual (ComponentExample), renderizar `<div className="flex-1 overflow-y-auto pb-20"><div className="px-4 pt-6"><h1 className="text-2xl font-semibold">Today</h1></div></div>`
- `app/history/page.tsx`: Placeholder com titulo "History"
- `app/manage/page.tsx`: Placeholder com titulo "Manage"
- `app/settings/page.tsx`: Placeholder com titulo "Settings"
- Cada pagina e Server Component (sem `"use client"`) — apenas conteudo estatico placeholder

**Cenario D — Not Found Handler:**
- `app/not-found.tsx`: Componente que redireciona para `/` usando `redirect("/")` do `next/navigation`
- Alternativa: `app/[...catchAll]/page.tsx` com redirect — avaliar qual abordagem Next.js 16 suporta melhor

### 3. Criterios de Aceite por Cenario

**Cenario A:**
- `<title>` renderiza "Hydra"
- Body usa font Outfit como primaria
- Container principal tem max-width 448px centralizado
- Layout funciona em viewports 320px a 1440px

**Cenario B:**
- 4 abas visiveis no rodape com icone + label
- Aba correspondente a rota atual destacada em cor primaria
- Toque em aba navega para rota correta sem full page reload
- Cada aba tem touch target >= 44x44px
- Safe area padding renderiza em dispositivos com notch
- Focus ring visivel ao navegar via teclado (Tab key)
- Backdrop blur visivel quando conteudo faz scroll por tras da nav

**Cenario C:**
- Cada rota renderiza pagina correspondente
- Acessar `/history` diretamente via URL mostra pagina History com aba History ativa na nav
- Nenhuma pagina placeholder causa erro de build

**Cenario D:**
- Acessar `/xyz` (rota invalida) redireciona para `/`

## Bloco 2: Como? (Implementacao)

### 4. Codigo de Referencia

**Prototipo de referencia** (`app/lab/hydra-mvp/page.tsx`, linhas 100-127):
```tsx
{/* Bottom Navigation — referencia para estilo visual */}
<nav className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
  <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
    {TABS.map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-1.5 transition-colors ${
            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className="size-5" />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      );
    })}
  </div>
</nav>
```

**Layout atual** (`app/layout.tsx`):
```tsx
import { Geist, Geist_Mono, Outfit } from "next/font/google";
// Outfit ja esta carregado com variable --font-sans
// Geist e Geist_Mono podem ser removidos (nao usados no design)
```

**Current page** (`app/page.tsx`):
```tsx
import { ComponentExample } from "@/components/component-example";
// Substituir por placeholder Today
```

### 5. Contratos e Estruturas de Dados

**Tab config type:**
```typescript
type NavTab = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};
```

**Nenhuma API envolvida** — esta e uma task puramente de UI/routing.

### 6. Dependencias e Interacoes

| Dependencia | Status | Uso |
|-------------|--------|-----|
| `next/navigation` (usePathname, Link, redirect) | Disponivel | Routing e deteccao de rota ativa |
| `@remixicon/react` | Instalado (4.9.0) | Icones das abas |
| `next/font/google` (Outfit) | Configurado | Font primaria |
| `components/ui/*` | Disponivel | Nao necessario para esta task (nav e custom) |

**Arquivos impactados:**
- `app/layout.tsx` — EDITAR (metadata, fonts, shell wrapper, BottomNav import)
- `app/page.tsx` — EDITAR (substituir ComponentExample por placeholder Today)
- `components/layout/bottom-nav.tsx` — CRIAR
- `app/history/page.tsx` — CRIAR
- `app/manage/page.tsx` — CRIAR
- `app/settings/page.tsx` — CRIAR
- `app/not-found.tsx` — CRIAR

**Arquivos que NAO devem ser alterados:**
- `app/globals.css` — tema ja esta correto
- `components/ui/*` — componentes shadcn intocaveis
- `app/lab/*` — prototipo preservado como referencia

### 7. Requisitos Nao-Funcionais

- **Performance:** FCP < 1.5s em 4G simulado; Lighthouse Performance > 95
- **Acessibilidade:** WCAG AA; focus ring visivel; touch targets 44x44px; `<nav>` com role implicito
- **Responsividade:** Layout correto de 320px a 1440px; centralizado em viewports grandes
- **Motion:** Respeitar `prefers-reduced-motion` em transicoes da nav
- **Bundle:** Nenhuma dependencia nova (tudo ja instalado)

## Bloco 3: Como Validar? (Validacao)

### 8. Cenarios de Teste (BDD)

**Cenario 1: Navegacao basica entre abas**
```
Given o usuario abre o app na rota /
When o usuario toca na aba "History"
Then a rota muda para /history
And a aba "History" esta destacada em cor primaria
And a aba "Today" esta em cor muted
And nenhum full page reload acontece
```

**Cenario 2: Navegacao sequencial por todas as abas**
```
Given o usuario esta na aba Today
When o usuario toca em History, depois Manage, depois Settings, depois Today
Then cada rota corresponde a aba tocada (/, /history, /manage, /settings, /)
And a aba ativa esta sempre destacada corretamente
```

**Cenario 3: Acesso direto via URL**
```
Given o usuario digita /history na barra de enderecos
When a pagina carrega
Then a pagina History e exibida
And a aba "History" na bottom nav esta destacada
```

**Cenario 4: Rota invalida**
```
Given o usuario acessa /pagina-inexistente
When a pagina carrega
Then o usuario e redirecionado para / (Today)
```

**Cenario 5: Touch targets**
```
Given o app esta renderizado em viewport mobile (375px)
When inspecionamos cada botao da bottom nav
Then cada botao tem dimensoes minimas de 44x44 pixels
```

**Cenario 6: Navegacao por teclado**
```
Given o usuario usa Tab para navegar
When o foco chega em uma aba da bottom nav
Then um focus ring visivel aparece ao redor da aba
And pressionar Enter navega para a rota correspondente
```

**Cenario 7: Layout responsivo**
```
Given o app esta renderizado em viewport 1440px
When observamos o layout
Then o container principal tem max-width 448px centralizado
And o fundo ao redor e neutro (background color)
```
