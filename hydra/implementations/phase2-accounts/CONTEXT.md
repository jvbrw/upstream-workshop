# Phase 2 — Accounts

## Classificacao
- **Tipo**: WIDE
- **Confianca**: HIGH

## Analise de Impacto

### Personas Impactadas

| Persona | Impacto |
|---------|---------|
| **Ana (Profissional de Mesa)** | Alto. Valoriza zero friccao — sign-in (mesmo opcional) adiciona ponto de decisao. Reminders sao diretamente relevantes para lembrar de beber agua durante o trabalho. |
| **Lucas (Construtor de Habitos)** | Alto. Maior beneficiado: sync entre dispositivos = nao perder streak. Lembretes reforcam habito. Mas tambem quem mais sofre se migracao falhar. |
| **Usuarios novos (sem dados locais)** | Medio. Experiencia de primeiro uso muda — decisao "criar conta ou nao" antes de comecar a usar. |

### Fluxos Afetados

| Fluxo | Tipo |
|-------|------|
| Onboarding / First Launch | NOVO — Sign-in prompt com decisao "com conta" vs. "sem conta" |
| Migracao de Dados | NOVO — Fluxo pos-sign-in para usuarios com dados locais (manter vs. comecar do zero) |
| Profile / Conta | NOVO — Perfil com avatar, stats, sync status, sign out |
| Reminders / Lembretes | NOVO — Config de push notifications com horarios, frequencia, preview |
| Settings (existente) | ALTERADO — Precisa acomodar profile/reminders ou ser reestruturado |
| Dashboard (existente) | ALTERADO — Indicadores de sync, banner de sign-in contextual |
| Navegacao | ALTERADO — Novas rotas/tabs na hierarquia existente |

## Justificativa

Iniciativa **WIDE** porque:

1. **Muda o modelo mental do usuario** — de "app local sem identidade" para "tenho uma conta, meus dados estao na nuvem". Mudanca de paradigma, nao feature incremental.
2. **4 dominios funcionais distintos** — identidade/auth, sincronizacao de dados, notificacoes push, e configuracoes de conta.
3. **Cria ramificacao condicional** — app passa a ter dois modos (local vs. cloud), multiplicando complexidade de UX futura.
4. **5+ decisoes de produto abertas** — sign-in obrigatorio ou opcional? Onde fica trigger? Profile como tab ou secao? Conflito de dados local vs. cloud?
5. **Adiciona backend** — muda fundamentalmente a arquitetura (local-first → client-server).

## Proximos Passos Sugeridos

Esta iniciativa WIDE deve ser fatiada em entregas FOCUSED incrementais. Sugestao de fatiamento:

### Entrega 1: Auth + Sign-in Flow (FOCUSED)
- Configurar NextAuth.js com Google provider
- Tela de sign-in (adaptar prototipo do lab)
- Sign-in opcional (nao bloqueia uso do app)
- Dual-mode: app funciona identico para logado e nao-logado inicialmente
- **Valor entregue**: usuario pode criar conta

### Entrega 2: Migration + Sync (FOCUSED)
- Tela de migracao de dados locais para cloud
- API de sync (upload de logs existentes)
- Persistencia em banco de dados para usuarios logados
- Resolucao de conflito: local sempre ganha no merge inicial
- **Valor entregue**: dados seguros na nuvem, continuidade entre dispositivos

### Entrega 3: Profile + Settings Rework (FOCUSED)
- Tela de perfil com stats e info de conta
- Integrar profile na navegacao (substituir ou complementar Settings)
- Sync status visible
- Sign out funcional
- **Valor entregue**: usuario ve e gerencia sua conta

### Entrega 4: Reminders (FOCUSED)
- Config de push notifications (adaptar prototipo do lab)
- Web Push API + service worker
- Persistencia de configuracao (local para guest, cloud para logado)
- **Valor entregue**: lembretes personalizados de hidratacao

---

**Proximo comando**: Use `/create-us` para criar User Stories para cada entrega, ou quebre em iniciativas menores com `/initiative-start` para cada fatia.
