## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario eu quero ver meu progresso diario de hidratacao como um anel visual para que eu saiba de relance quanto falta para atingir minha meta do dia.

### Funcionalidades Principais
- Anel SVG circular mostrando progresso (0-100%) em relacao a meta diaria
- Texto central: volume atual e meta (ex: "1.2L of 2L")
- Estado de meta atingida com cor verde e mensagem "Goal reached!"
- Header com data do dia e badge de streak

### Criterios de Aceite Chave
- O anel atualiza em tempo real conforme novos logs sao adicionados
- Ao atingir 100% da meta, anel muda para verde com animacao suave
- Texto central formata valores: ml abaixo de 1000, L (com 1 decimal) acima
- Animacao do anel respeita `prefers-reduced-motion`

---

## Contexto Detalhado para Agentes

# User Story: Daily Progress Visualization

## Declaracao da historia

Como um usuario eu quero ver meu progresso diario de hidratacao como um anel visual para que eu saiba de relance quanto falta para atingir minha meta do dia.

## Criterios funcionais

- Componente ProgressRing como SVG circular com:
  - Anel de fundo (cor muted)
  - Anel de progresso (cor primaria, transition para emerald-500 ao completar)
  - Stroke width 14px, tamanho 200x200px
  - strokeLinecap round para extremidades arredondadas
  - Progresso calculado: min(todayTotal / dailyGoal, 1)
- Centro do anel exibe:
  - Estado normal: volume atual (ex: "1.2L") + "of 2L" abaixo
  - Estado completo (>= 100%): volume em verde + "Goal reached!" abaixo
- Formatacao de volume: valores < 1000 em "Xml", valores >= 1000 em "X.XL"
- Header da pagina Today com:
  - "Today" como titulo (h1, 2xl, semibold)
  - Data atual formatada (weekday long, month short, day numeric)
  - Badge de streak (se > 0): icone fogo laranja + "X day(s)" (consumido da US-005)
- O progresso reage em tempo real a cada log adicionado (via Zustand selector)

## Criterios de experiencia do usuario

- Animacao do anel: transicao suave de 700ms com ease-out ao adicionar log
- Ao atingir a meta pela primeira vez no dia, transicao de cor (primary -> emerald) deve ser suave
- Anel deve ser aria-hidden com texto acessivel alternativo via sr-only span
- Texto central deve ter contraste suficiente contra o fundo (WCAG AA)
- Em `prefers-reduced-motion: reduce`, desabilitar animacao de transicao — atualizar instantaneamente
- O anel nao deve "pular" ao rehydratar do localStorage (SSR mismatch prevention)

## Testes regressivos

- US-001: Header e progress ring devem aparecer apenas na aba Today
- US-002: Progresso deve refletir dados persistidos ao reabrir o app
- US-003: Cada quick log deve atualizar o anel imediatamente

## Criterios para QA

- Padroes de qualidade: SVG renderiza corretamente, animacao fluida, acessivel
- Cenarios de teste:
  - Caminho feliz: Usuario com 1050ml logados ve "1.1L" no centro e anel ~52% preenchido (meta 2L)
  - Caminho feliz: Usuario atinge 2000ml — anel fica verde, texto muda para "Goal reached!"
  - Caminho feliz: Usuario ultrapassa meta (2500ml) — anel fica 100% verde, texto mostra "2.5L"
  - Caminho alternativo: Usuario sem logs hoje — anel vazio, texto "0ml of 2L"
  - Caminho alternativo: Meta configurada como 3000ml — anel proporcional a nova meta
  - Testes nao-funcionais: SVG nao causa reflow/repaint excessivo; testar com 50 logs no dia
- Homologacao: Verificar renderizacao SVG em Safari iOS, Chrome Android, Firefox

## Criterios de aceitacao

- Validacao completa do fluxo: anel reflete progresso corretamente de 0% a 100%+
- Animacao suave ao adicionar log (700ms ease-out)
- Formatacao de volume correta para todos os ranges (0, 500, 999, 1000, 2500)
- Meta atingida: cor muda para verde, texto muda para "Goal reached!"
- Acessibilidade: texto alternativo para screen readers, contraste AA
- Sem hydration mismatch ao carregar (SSR-safe)
- Prototipo de referencia: `/lab/hydra-mvp` (ProgressRing + TodayView header)
