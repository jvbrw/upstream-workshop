## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario logado eu quero ver meu perfil de conta com estatisticas e status de sincronizacao para que eu saiba que meus dados estao seguros e conectados.

### Funcionalidades Principais
- Pagina de perfil na rota `/profile` com avatar, nome e email do usuario (dados reais da sessao NextAuth)
- Badge de sync status mostrando horario da ultima sincronizacao
- Cards de estatisticas: total de logs, streak atual, meta diaria (dados do store Zustand)
- Informacoes da conta: membro desde, storage (Cloud), provider (Google)
- Botao de sign out com dialog de confirmacao
- Para usuarios guest (nao logados): CTA "Create account" em vez do perfil completo

### Criterios de Aceite Chave
- Dados do perfil (nome, email, avatar) vem da sessao NextAuth, nao de dados mock
- Estatisticas (totalEntries, streak, dailyGoal) refletem os valores reais do store
- Sign out funcional: limpa sessao e redireciona para a pagina principal
- Guest vê tela simplificada com CTA para criar conta que leva ao fluxo de sign-in
- Pagina acessivel via navegacao (link a partir de Settings)

---

## Contexto Detalhado para Agentes

# User Story: Account Profile Page

## Declaracao da historia

Como um usuario logado eu quero ver meu perfil de conta com estatisticas e status de sincronizacao para que eu saiba que meus dados estao seguros e conectados.

## Criterios funcionais

- Rota `/profile` — substituir o conteudo placeholder atual em `app/profile/page.tsx`

**Componente base:** Adaptar `app/lab/phase2-accounts/components/account-profile.tsx` do lab para o app real. O prototipo do lab usa props estaticas; a versao real deve consumir dados dinamicos.

**1. Header do Perfil (usuario logado):**
- Avatar do usuario (imagem da sessao NextAuth via `session.user.image`) com fallback para icone `RiUser3Line` em circulo com bg `primary/10`
- Badge de verificacao (icone `RiShieldCheckLine`) no canto inferior do avatar
- Nome do usuario (`session.user.name`)
- Email do usuario (`session.user.email`)
- Botao edit profile (pode ser placeholder/no-op nesta entrega, funcionalidade de edicao e escopo futuro)

**2. Sync Status Banner:**
- Banner com fundo `emerald-500/10` mostrando icone de nuvem e texto "Synced across devices"
- Badge com horario da ultima sincronizacao (ex: "Just now", "2 min ago")
- Se sync nao disponivel ou pendente: texto alternativo "Sync pending" com cor `amber`
- Dados de sync virao da camada de sincronizacao implementada em Entrega 2 (US-012/013). Se nao disponivel ainda, usar "Just now" como placeholder.

**3. Cards de Estatisticas (grid 3 colunas):**
- Total logs: `useHydrationStore((s) => s.logs).length` com icone `RiDropLine`
- Day streak: usar hook `useStreak()` existente com icone `RiFireLine`
- Daily goal: `useHydrationStore((s) => s.dailyGoal)` formatado como "2L" ou "2500ml" com icone `RiCalendarCheckLine`

**4. Card de Informacoes da Conta:**
- "Member since": data de criacao da conta (se disponivel na sessao/DB, senao usar data do primeiro log ou "Feb 2026" como fallback)
- "Storage": "Cloud" para logado, "Local only" para guest
- "Provider": "Google" (ou o provider retornado pelo NextAuth)

**5. Botao Sign Out:**
- Botao full-width com variante `outline`, texto `text-destructive`, icone `RiLogoutBoxRLine`
- Ao clicar: abrir `AlertDialog` de confirmacao com titulo "Sign out?", descricao explicando que dados continuam salvos na nuvem, botoes "Cancel" e "Sign out"
- Ao confirmar: chamar `signOut()` do NextAuth e redirecionar para `/`

**6. Modo Guest (usuario nao logado):**
- Se `session` for null (usuario guest/anonimo):
  - Exibir avatar placeholder com icone generico
  - Titulo "Guest User" ou "Welcome to Hydra"
  - Descricao: "Create an account to sync your data across devices and never lose your progress."
  - CTA principal: botao "Create account" ou "Sign in" que redireciona para o fluxo de sign-in (rota de auth)
  - Abaixo do CTA: exibir os mesmos cards de estatisticas (dados locais) para que o guest veja o valor de criar conta
  - Nao exibir: sync status, informacoes da conta, botao sign out

## Criterios de experiencia do usuario

- Layout vertical com gap consistente (gap-6), padding `px-4 pt-6 pb-4` (mesmo padrao do lab)
- Cards usando componentes `Card`/`CardContent`/`CardHeader`/`CardTitle` do shadcn/ui
- Avatar com `ring-2 ring-primary/20` e tamanho `size-16` (64px)
- Stats cards com layout centrado: icone, valor bold, label pequena (text-[10px])
- Transicao suave entre estados guest e logado (sem flash de conteudo)
- Usar `useStoreHydrated()` para evitar hydration mismatch — mostrar skeleton ou nada ate store hidratar
- Responsivo: funciona em viewport mobile (max-w-md definido pelo layout pai)
- Dialog de sign out com backdrop e animacao padrao do shadcn AlertDialog
- CTA de guest visualmente proeminente (variante `default`, full-width)

## Testes regressivos

- US-002: Dados do store (logs, dailyGoal, presets) devem continuar funcionando normalmente — profile apenas le, nao altera
- US-005: Streak exibido no profile deve ser consistente com o streak no dashboard (mesmo hook `useStreak()`)
- US-008: dailyGoal exibido deve refletir a configuracao atual de Settings
- US-010/011 (auth): Sessao NextAuth deve fornecer dados corretos; sign out deve funcionar corretamente
- Bottom nav: Navegacao existente nao deve quebrar; profile acessivel via Settings (nao via tab direta)
- Rota `/profile`: Rota ja existe no routing, substituir conteudo atual sem quebrar navegacao

## Criterios para QA

- Padroes de qualidade: Dados reais (nao mock), estados condicionais (logado vs guest), sign out funcional
- Cenarios de teste:
  - Caminho feliz (logado): Usuario logado abre /profile — ve nome, email, avatar, stats corretas, sync badge, botao sign out
  - Caminho feliz (sign out): Usuario clica sign out — dialog aparece — confirma — sessao encerrada, redirecionado para /
  - Caminho feliz (guest): Usuario guest abre /profile — ve CTA "Create account", stats locais, sem info de conta
  - Caminho feliz (guest CTA): Guest clica "Create account" — redirecionado para fluxo de sign-in
  - Caminho alternativo: Usuario logado sem avatar (imagem null) — fallback para icone generico funciona
  - Caminho alternativo: Usuario com 0 logs — stats mostra 0 total, 0 streak, meta default
  - Caminho alternativo: Sign out cancelado — dialog fecha, sessao mantida
  - Testes nao-funcionais: Pagina carrega sem hydration mismatch (verificar console sem erros de hydration)
- Homologacao: Testar em mobile (touch), verificar que avatar carrega de URL externa (Google), testar fluxo completo sign out

## Criterios de aceitacao

- Rota `/profile` renderiza perfil funcional com dados reais da sessao NextAuth
- Stats (total logs, streak, daily goal) sao consistentes com dados do store Zustand
- Sign out com confirmacao funciona: limpa sessao e redireciona
- Modo guest exibe CTA de criacao de conta em vez de perfil completo
- Sem dados mock hardcoded — todos os dados sao dinamicos
- Componente adaptado do prototipo `app/lab/phase2-accounts/components/account-profile.tsx`
- Nenhum erro de hydration no console
- Pagina acessivel via link em Settings (integrado na US-015)
