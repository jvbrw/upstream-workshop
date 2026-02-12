## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario eu quero navegar entre as abas Today, History, Manage e Settings com transicoes fluidas para que eu possa acessar todas as funcionalidades do app sem recarregar a pagina.

### Funcionalidades Principais
- Bottom navigation fixa com 4 abas (Today, History, Manage, Settings)
- Navegacao por rotas do Next.js App Router (/, /history, /manage, /settings)
- Layout mobile-first com max-width 448px centralizado
- Safe area insets para dispositivos com notch

### Criterios de Aceite Chave
- Navegacao entre abas acontece sem full page reload
- Aba ativa destacada visualmente com cor primaria
- Touch targets minimo 44x44px em todos os botoes de navegacao
- Layout responsivo mantendo experiencia mobile-first em qualquer viewport

---

## Contexto Detalhado para Agentes

# User Story: App Shell & Navigation

## Declaracao da historia

Como um usuario eu quero navegar entre as abas Today, History, Manage e Settings com transicoes fluidas para que eu possa acessar todas as funcionalidades do app sem recarregar a pagina.

## Criterios funcionais

- Bottom navigation bar fixa no rodape da tela com 4 abas: Today (RiDropLine), History (RiBarChartBoxLine), Manage (RiFileList3Line), Settings (RiSettings3Line)
- Cada aba corresponde a uma rota do App Router: `/` (Today), `/history`, `/manage`, `/settings`
- A aba ativa deve ser destacada com a cor primaria do tema; abas inativas em muted-foreground
- Root layout (`app/layout.tsx`) deve conter: font Outfit, metadata, theme provider, navigation shell
- O navigation bar deve usar `backdrop-blur` e transparencia como no prototipo (`bg-background/95`)
- Safe area padding via `env(safe-area-inset-bottom)` para dispositivos com notch
- Container principal com `max-w-md mx-auto` e `h-dvh` para experiencia mobile-first
- Conteudo principal com overflow-y-auto e padding-bottom suficiente para nao ser coberto pela navbar

## Criterios de experiencia do usuario

- Transicao entre abas deve ser instantanea (sem loading spinner, sem skeleton)
- Icone + label em cada aba (label em texto 10px como no prototipo)
- Feedback visual imediato ao tocar uma aba (mudanca de cor)
- Navegacao nao deve causar scroll reset no conteudo da aba ativa
- Em viewports maiores que mobile, o app deve manter o layout centralizado com fundo neutro ao redor
- Respeitar `prefers-reduced-motion` para qualquer animacao de transicao

## Testes regressivos

- Nenhum — esta e a primeira US implementada, nao ha funcionalidade existente

## Criterios para QA

- Padroes de qualidade: WCAG AA, touch targets 44x44px, Lighthouse Performance > 95
- Cenarios de teste:
  - Caminho feliz: Usuario abre o app, ve aba Today ativa, toca em History, navega corretamente
  - Caminho feliz: Usuario navega por todas as 4 abas em sequencia
  - Caminho alternativo: Usuario acessa /history diretamente via URL — aba History deve estar ativa
  - Caminho alternativo: Usuario acessa rota invalida — deve redirecionar para / (Today)
  - Testes nao-funcionais: Verificar que nenhuma aba tem touch target menor que 44x44px; Lighthouse audit
- Homologacao: Testar em Safari iOS, Chrome Android, Chrome Desktop (viewport mobile)

## Criterios de aceitacao

- Validacao completa do fluxo: Todas as 4 rotas navegaveis via bottom nav e URL direta
- App shell renderiza em menos de 1.5s (First Contentful Paint em 4G simulado)
- Todas as abas do navigation possuem touch target >= 44x44px
- Layout se mantem correto em viewports de 320px a 1440px
- Focus ring visivel ao navegar via teclado
- Prototipo de referencia: `/lab/hydra-mvp` — a navegacao deve seguir o mesmo padrao visual
