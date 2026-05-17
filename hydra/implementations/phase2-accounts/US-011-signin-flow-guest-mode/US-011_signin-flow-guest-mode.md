## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario eu quero ser convidado a fazer login ou continuar como convidado ao usar o app pela primeira vez para que eu possa escolher a experiencia que prefiro.

### Funcionalidades Principais
- Tela de sign-in prompt exibida na primeira visita (adaptada do prototipo `app/lab/phase2-accounts/components/sign-in-prompt.tsx`)
- Botao "Continue with Google" inicia fluxo de login via NextAuth (US-010)
- Botao "Continue without account" / "Try without account" dispensa o prompt e define flag de guest
- CTA sutil de sign-in na pagina Settings para usuarios guest (nao-intrusivo)
- Apos sign-in, redirecionar para fluxo de migracao se existirem dados locais (US-012)
- Estado de auth refletido na UI: avatar no header ou na pagina Settings

### Criterios de Aceite Chave
- Sign-in prompt aparece apenas na primeira visita (controlado por flag `hydra-signin-seen` em localStorage)
- Escolher "Continue without account" dispensa o prompt permanentemente e nao bloqueia nenhuma feature
- Escolher "Continue with Google" executa `signIn("google")` do NextAuth
- Apos login bem-sucedido, se `store.logs.length > 0`, redirecionar para tela de migracao (US-012)
- Guest veem CTA discreto em Settings; usuarios logados veem avatar/nome
- App funciona identicamente para guests e usuarios logados (nenhuma feature bloqueada)

---

## Contexto Detalhado para Agentes

# User Story: Sign-in Flow & Guest Mode

## Declaracao da historia

Como um usuario eu quero ser convidado a fazer login ou continuar como convidado ao usar o app pela primeira vez para que eu possa escolher a experiencia que prefiro.

## Criterios funcionais

**1. Sign-in Prompt (primeira visita):**
- Adaptar componente `SignInPrompt` de `app/lab/phase2-accounts/components/sign-in-prompt.tsx` para uso real
- O componente lab ja possui a UI completa: logo Hydra, lista de beneficios (sync, cloud, continuidade), botao Google, opcao skip, nota de privacidade
- Exibir como overlay fullscreen (z-index acima do conteudo) OU como pagina condicional antes do conteudo principal
- Controle de exibicao via flag em localStorage: `hydra-signin-seen`
  - Se flag NAO existe: exibir prompt
  - Se flag EXISTE (valor `"true"`): nao exibir prompt
- Prop `hasLocalData`: derivar do Zustand store — `true` se `store.logs.length > 0`
  - Se `hasLocalData === true`: botao skip mostra "Continue without account"
  - Se `hasLocalData === false`: botao skip mostra "Try without account"

**2. Acao "Continue with Google":**
- Ao clicar: chamar `signIn("google")` do NextAuth (via hook `useAuth()` da US-010)
- NextAuth redireciona para Google OAuth
- Apos callback de sucesso:
  - Setar flag `hydra-signin-seen` = `"true"` em localStorage
  - Verificar se existem dados locais (`store.logs.length > 0`)
    - Se SIM: redirecionar para rota de migracao (US-012 — pode ser placeholder por enquanto)
    - Se NAO: redirecionar para home (`/`)
- Se usuario cancela OAuth no Google: retorna ao app, prompt continua visivel

**3. Acao "Continue without account" / "Try without account":**
- Ao clicar: setar flag `hydra-signin-seen` = `"true"` em localStorage
- Dispensar o prompt imediatamente
- App continua funcionando normalmente em modo local-only (comportamento Phase 1)
- Flag garante que prompt nao aparece novamente em visitas futuras

**4. CTA de Sign-in em Settings (para guests):**
- Na pagina Settings (`app/settings/page.tsx`), adicionar card/secao de conta:
  - **Se usuario NAO esta logado (guest):**
    - Card com icone de usuario, texto "Sign in to sync your data across devices"
    - Botao "Sign in with Google" (estilo secundario/outline, nao chamativo)
    - Posicionar entre a secao "Appearance" e "Data" (ou no topo da pagina)
  - **Se usuario ESTA logado:**
    - Card com avatar (imagem do Google ou icone fallback), nome, email
    - Badge "Synced" ou indicador visual de que dados estao na nuvem
    - Botao "Sign out" discreto (texto destructive, sem preenchimento)
- CTA deve ser nao-intrusivo — nao usar banners, modals, ou elementos que interrompam o fluxo

**5. Auth State na UI:**
- Opcional para esta US (pode ser implementado aqui ou em US futura):
  - Avatar pequeno no canto superior direito da pagina Today (ao lado do ThemeToggle)
  - Se logado: mostrar imagem do Google (circular, 32px)
  - Se guest: nao mostrar nada (manter layout atual)
- Obrigatorio:
  - Settings reflete estado de auth conforme item 4 acima

**6. Integracao com Store:**
- Nao alterar o Zustand store (`use-hydration-store.ts`) nesta US
- Apenas LER dados do store para:
  - Determinar `hasLocalData` (logs.length > 0)
  - Exibir stats no card de conta em Settings (total entries, streak)
- Auth state vem do NextAuth (`useSession`), nao do Zustand

## Criterios de experiencia do usuario

- Sign-in prompt deve ser visualmente polido — componente do lab ja possui design final
- Transicao suave ao dispensar o prompt (fade out ou slide, nao desaparecer abruptamente)
- Botao Google deve ter tamanho confortavel para toque (h-12, full-width, icone + texto)
- Opcao "Continue without account" deve ser visivel mas claramente secundaria (ghost/text style)
- Nota de privacidade deve ser discreta e transmitir confianca
- Em Settings, secao de conta deve se integrar com visual existente (Cards do shadcn/ui)
- Para guests: CTA de sign-in deve ser convidativo mas nao agressivo (nao usar cores chamativas, nao repetir em multiplos lugares)
- Para logados: avatar + nome deve ser reconhecivel mas discreto
- Loading state durante OAuth redirect: pode mostrar um spinner sutil ou nao (redirect e rapido)

## Testes regressivos

- US-001: Navegacao entre abas funciona normalmente apos dispensar sign-in prompt
- US-002: Store Zustand continua funcionando — prompt nao interfere com persistencia
- US-003: Quick log funciona normalmente na aba Today (com ou sem sign-in prompt visivel)
- US-004: Progress ring renderiza corretamente
- US-005: Streak calcula corretamente
- US-006: History exibe dados corretamente
- US-007: Manage funciona normalmente
- US-008: Settings (goal, presets, appearance, data) continuam funcionando — secao de conta e aditiva
- US-010: NextAuth setup continua funcional (sessao, cookies, hooks)
- Layout: BottomNav, StorageBanner, StoreNotifications renderizam normalmente
- Theme: dark/light mode funciona sem interferencia

## Criterios para QA

- Padroes de qualidade: UX de primeiro uso fluido, zero bloqueio para guests, auth opcional percebido como beneficio
- Cenarios de teste:
  - Caminho feliz: Primeiro acesso — sign-in prompt aparece. Usuario clica "Continue with Google" — redireciona para Google, retorna logado, prompt nao aparece mais
  - Caminho feliz: Primeiro acesso — sign-in prompt aparece. Usuario clica "Try without account" — prompt some, app funciona normalmente, prompt nao aparece em proxima visita
  - Caminho feliz: Guest acessa Settings — CTA de sign-in visivel. Clica "Sign in with Google" — fluxo OAuth inicia
  - Caminho feliz: Usuario logado acessa Settings — ve avatar, nome, email, botao "Sign out"
  - Caminho feliz: Usuario logado clica "Sign out" em Settings — sessao encerrada, Settings mostra CTA de sign-in novamente
  - Caminho feliz: Usuario com dados locais faz sign-in — redirecionado para fluxo de migracao (US-012)
  - Caminho feliz: Usuario sem dados locais faz sign-in — redirecionado para home (`/`)
  - Caminho de insucesso: Usuario cancela OAuth no Google — retorna ao app, sign-in prompt ainda visivel
  - Caminho de insucesso: OAuth falha (erro de rede) — app nao crasha, usuario pode tentar novamente ou escolher guest
  - Caminho alternativo: Usuario limpa localStorage — flag `hydra-signin-seen` removida, prompt aparece novamente na proxima visita
  - Caminho alternativo: Usuario faz sign-out e depois visita Settings — ve CTA de sign-in (nao o prompt fullscreen, apenas o card discreto)
  - Testes nao-funcionais: Sign-in prompt deve renderizar em < 200ms (sem skeleton/loader)
  - Testes nao-funcionais: Prompt deve ser responsivo em telas de 320px ate 428px de largura
- Homologacao: Testar fluxo completo em Chrome mobile, Safari iOS, Firefox Android; verificar que prompt nao aparece sobre modals/dialogs existentes; testar com localStorage desabilitado (prompt deve aparecer toda vez, graceful degradation)

## Criterios de aceitacao

- Sign-in prompt fullscreen aparece na primeira visita e nao reaparece apos ser dispensado
- "Continue with Google" executa fluxo OAuth completo via NextAuth
- "Continue without account" / "Try without account" dispensa prompt e seta flag de guest
- Texto do botao skip reflete presenca de dados locais (`hasLocalData`)
- Settings exibe secao de conta contextual: CTA para guests, perfil para logados
- CTA em Settings e nao-intrusivo e nao quebra layout existente
- Apos sign-in com dados locais existentes, usuario e direcionado para migracao (US-012)
- Apos sign-in sem dados locais, usuario e direcionado para home
- Nenhuma feature e bloqueada para guests — auth e puramente opcional
- Nenhuma regressao visual ou funcional em features de Phase 1
- Prototipo de referencia: `app/lab/phase2-accounts/components/sign-in-prompt.tsx` (UI base para o sign-in prompt)
