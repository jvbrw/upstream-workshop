## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario eu quero que a pagina Settings seja reorganizada para acomodar funcionalidades de conta para que eu possa acessar todas as configuracoes em um lugar logico.

### Funcionalidades Principais
- Settings reestruturado: para logados, link para perfil no topo; para guests, banner "Sign in" no topo
- Secoes existentes mantidas: meta diaria, presets, aparencia, dados
- Link do streak badge no dashboard (`app/page.tsx`) alterado de `/social` para `/profile`
- Acoes de conta em Settings: sign out (logados) ou sign in (guests)
- Navegacao bottom nav mantida com 4 tabs (Today, History, Manage, Settings) — Profile acessivel dentro de Settings

### Criterios de Aceite Chave
- Usuario logado ve card de perfil clicavel no topo de Settings que leva a `/profile`
- Usuario guest ve banner com CTA "Sign in" no topo de Settings
- Todas as funcionalidades existentes de Settings continuam funcionando (meta, presets, aparencia, clear data)
- Streak badge no dashboard linka para `/profile` em vez de `/social`
- Bottom nav inalterada (4 tabs)

---

## Contexto Detalhado para Agentes

# User Story: Settings Page Rework

## Declaracao da historia

Como um usuario eu quero que a pagina Settings seja reorganizada para acomodar funcionalidades de conta para que eu possa acessar todas as configuracoes em um lugar logico.

## Criterios funcionais

**Arquivo principal:** `app/settings/page.tsx` (reestruturar, nao recriar)

**1. Secao de Conta no Topo (NOVO):**

**Para usuario logado (session !== null):**
- Card clicavel no topo da pagina com:
  - Mini avatar (size-10) com fallback para icone `RiUser3Line`
  - Nome e email do usuario (da sessao NextAuth)
  - Badge "Synced" com icone de nuvem
  - Seta para a direita (`RiArrowRightSLine`) indicando navegacao
- Ao clicar: navega para `/profile`
- Abaixo do card: separador visual antes das secoes de configuracao existentes

**Para usuario guest (session === null):**
- Banner promocional no topo com:
  - Icone ou ilustracao de nuvem/sync
  - Texto: "Sign in to sync" ou "Sync your data across devices"
  - Subtexto: "Create a free account to keep your data safe and access it from any device"
  - Botao CTA: "Sign in" que redireciona para fluxo de auth
- Abaixo do banner: separador visual antes das secoes de configuracao existentes

**2. Secoes Existentes (MANTER):**
- Daily Goal — manter exatamente como esta (input numerico, shortcuts, auto-save)
- Quick Log Presets — manter exatamente como esta (badges editaveis, add/remove)
- Appearance — manter exatamente como esta (ThemeToggle)
- Data — manter exatamente como esta (total entries, clear all com AlertDialog)

**3. Secao de Conta no Rodape (NOVO):**

**Para usuario logado:**
- Botao "Sign out" com variante `outline`, texto `text-destructive`, icone `RiLogoutBoxRLine`
- Ao clicar: `AlertDialog` de confirmacao (mesmo padrao do sign out em /profile)
- Ao confirmar: `signOut()` do NextAuth, redireciona para `/`

**Para usuario guest:**
- Nao exibir botao de sign out
- (CTA de sign-in ja esta no topo)

**4. Alteracao no Dashboard — Streak Badge Link:**
- Arquivo: `app/page.tsx`
- Alterar o `Link` do streak badge de `href="/social"` para `href="/profile"`
- O streak badge exibe `RiFireLine` + "X days" e atualmente linka para `/social` (rota que nao tem conteudo relevante)
- Apos alteracao: clicar no streak badge leva a `/profile` onde o usuario ve suas stats incluindo streak

**5. Bottom Nav — SEM ALTERACAO:**
- Manter os 4 tabs atuais: Today (`/`), History (`/history`), Manage (`/manage`), Settings (`/settings`)
- Profile e acessivel via Settings (card no topo) ou via streak badge no dashboard
- Nao adicionar tab de Profile na bottom nav — manter navegacao limpa com 4 tabs
- Arquivo `components/layout/bottom-nav.tsx` nao precisa ser alterado

## Criterios de experiencia do usuario

- Card de perfil no topo: usa mesmos componentes `Card`/`CardContent` do shadcn/ui, com `cursor-pointer` e `hover:bg-accent` para indicar clicabilidade (mesmo padrao do link "Manage entries" no profile placeholder atual)
- Banner de guest: visual atrativo mas nao intrusivo — fundo sutil (ex: `primary/5` ou `muted`), nao deve parecer um alerta/erro
- Transicao visual entre estados logado/guest sem layout shift (ambos ocupam espaco similar no topo)
- Secoes existentes mantidas na mesma ordem e com mesmo visual — usuario que ja usa o app nao deve sentir ruptura
- Header "Settings" com subtitulo ajustado: "Customize your hydration goals" (manter) ou atualizar para "Account & preferences" para refletir novo escopo
- Auto-save feedback "Saved" (checkmark verde) continua funcionando para goal e presets
- Sign out no rodape de Settings: posicionado apos a secao Data, como ultima acao da pagina
- Usar `useStoreHydrated()` para evitar hydration mismatch na renderizacao condicional logado/guest

## Testes regressivos

- US-001: Bottom nav continua funcionando — 4 tabs, Settings ativo quando em `/settings`
- US-002: Alteracoes de goal e presets em Settings persistem entre sessoes (nenhum comportamento alterado)
- US-003: Presets alterados refletem nos botoes de Quick Log no dashboard
- US-004: Goal alterado reflete no progress ring do dashboard
- US-005: Streak badge no dashboard agora linka para `/profile` — verificar que navegacao funciona
- US-008: Toda a funcionalidade de configuracao de goal/presets permanece identica
- US-014: Link para profile no topo de Settings navega corretamente para `/profile`

## Criterios para QA

- Padroes de qualidade: Funcionalidade existente intacta, estados condicionais corretos, navegacao consistente
- Cenarios de teste:
  - Caminho feliz (logado): Usuario logado abre Settings — ve card de perfil no topo com nome/email, secoes de configuracao abaixo, botao sign out no rodape
  - Caminho feliz (logado — navega profile): Usuario clica card de perfil — navega para `/profile`
  - Caminho feliz (logado — sign out): Usuario clica sign out em Settings — dialog confirma — sessao encerrada
  - Caminho feliz (guest): Guest abre Settings — ve banner "Sign in" no topo, secoes de configuracao abaixo, sem sign out
  - Caminho feliz (guest — sign in): Guest clica "Sign in" no banner — redirecionado para fluxo de auth
  - Caminho feliz (streak link): Usuario clica streak badge no dashboard — navega para `/profile` (nao `/social`)
  - Caminho de regressao (goal): Alterar goal em Settings — progress ring no dashboard reflete nova meta
  - Caminho de regressao (presets): Alterar preset em Settings — botoes Quick Log no dashboard refletem
  - Caminho de regressao (clear data): Clear all data funciona — dialog de confirmacao, dados limpos
  - Caminho de regressao (theme): Toggle de aparencia continua funcionando
  - Testes nao-funcionais: Sem hydration mismatch no console; layout estavel sem shift ao carregar estado de auth
- Homologacao: Testar transicao logado/guest (sign in, voltar para settings, verificar que card de perfil aparece); testar em mobile

## Criterios de aceitacao

- Settings exibe card de perfil (logado) ou banner de sign-in (guest) no topo da pagina
- Todas as 4 secoes existentes (goal, presets, appearance, data) funcionam identicamente ao estado anterior
- Sign out disponivel no rodape de Settings para usuarios logados, com dialog de confirmacao
- Streak badge em `app/page.tsx` linka para `/profile` em vez de `/social`
- Bottom nav inalterada: 4 tabs (Today, History, Manage, Settings)
- Sem regressao nas funcionalidades existentes de Settings
- Sem dados mock hardcoded — estado logado/guest determinado pela sessao NextAuth
- Sem erros de hydration no console
