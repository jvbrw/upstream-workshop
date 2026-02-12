---
status: completed
filled_at: 2026-02-10T12:00:00Z
---

# Project Configuration

## Setup
**Nome do projeto:** `hydra`
**Descrição:** `Daily Hydration Tracker — mobile-first web app para transformar hidratação em rotina`

### Estrutura de Diretórios
- **Codebase:** `codebases/`
- **Resources:** `resources/`
- **Implementations:** `implementations/`
  - **Padrão de saída:** `[us_id]-[title]/`
  - **Convenções de nomenclatura:**
    - `User story: [us_id]_[title].md`
- **Logs:** `logs/`
  - **Feedback:** `logs/feedback/`

## Repository
**Estrutura:** `single-repo`

### Frontends
| Nome | Path/Repo | Descrição |
|------|-----------|-----------|
| `hydra-web` | `./` (root) | Aplicação Next.js — dashboard de hidratação, logging, histórico |

## Preferences And Guardrails

### Stack
| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (Radix, Maia style, Cyan theme) |
| Icons | Remix Icon (@remixicon/react) |
| Font | Outfit |
| State | Zustand + localStorage |
| Database | Nenhum (local-first MVP) |
| Auth | Nenhum (MVP) |
| Notifications | Web Push API |
| Deploy | Vercel |

### Constraints
- Mobile-first responsive (sem app nativo)
- Sem conta obrigatória — localStorage para uso básico
- WCAG AA acessível
- Lighthouse Performance > 95
- Bundle < 100KB gzipped

### Team
#### Composição
| Papel | Descrição |
|-------|-----------|
| PM / Product Designer | Define escopo, valida entregas, testa UX |
| AI Framework | Gera user stories, tasks, e code scaffolding |

### Communication
#### Coleta de Feedback
- **Ativada:** `true`
- **Frequência:** `after-each-agent-execution`
- **Local de armazenamento:** `logs/feedback/[date]-feedback.xml`
- **Atualização automática de preferências:** `true`

#### Logging
- **Nível:** `info`
- **Incluir timestamps:** `true`

### Preferências Aprendidas
- Componentes shadcn não devem ser modificados diretamente — usar wrappers
- Named exports apenas (sem default exports exceto pages)
- Props interfaces nomeadas como `[Component]Props`
- Touch targets mínimo 44x44px
