## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes. Caso voce decida fazer alteracao, faca atraves do agente para que ela seja refletida em todas as secoes.**

- **Tarefa:** Verificar streak e documentar limitacoes (FE)
- **Objetivo:** Verificar edge cases do calculo de streak existente e documentar a limitacao conhecida de retroatividade da meta no codigo como trade-off de MVP
- **Topicos:**
  - Verificacao de edge cases: validar comportamento com zero logs, dia unico, gaps, hoje incompleto
  - Singular/plural: confirmar que "1 day" vs "X days" esta correto
  - Documentacao no codigo: adicionar comentario TODO sobre limitacao forward-only vs retroatividade da meta
- **Dependencias:** `hooks/use-hydration-store.ts` (useStreak), `app/page.tsx` (Badge)
- **Validacao:** Streak 0 sem badge, streak 1 singular, streak N plural, gap reseta streak, mudanca de meta retroativa (limitacao documentada)

---

## Contexto Detalhado para Agentes

## Bloco 1: O Que? (Descricao)

### 1. Objetivo Tecnico Explicito

Verificar que o hook `useStreak` em `hooks/use-hydration-store.ts` (linhas 85-118) calcula corretamente o streak para todos os edge cases definidos nos criterios de aceite da US-005, e adicionar comentario de documentacao no codigo sobre a limitacao conhecida do MVP: a meta atual (`dailyGoal`) e usada retroativamente para avaliar todos os dias historicos, em vez do comportamento "forward only" desejado (onde mudancas de meta so afetariam dias futuros).

Esta e uma tarefa de **verificacao + documentacao**. O streak ja esta implementado e funcional. Alteracoes de codigo esperadas: ~5 linhas de comentarios.

### 2. Decomposicao em Cenarios

**Cenario A - Verificacao de edge cases do calculo:**
Revisar a logica do `useStreak` hook e validar mentalmente (ou via testes manuais) os seguintes cenarios:
- Usuario sem nenhum log (dayMap vazio) -> streak deve ser 0
- Usuario com logs apenas hoje, meta atingida -> streak deve ser 1
- Usuario com logs apenas hoje, meta NAO atingida -> streak deve ser 0
- Usuario com 5 dias consecutivos de meta atingida (incluindo hoje) -> streak deve ser 5
- Gap de 1 dia entre dois periodos de meta atingida -> streak conta apenas o periodo mais recente
- Usuario deleta log que fazia dia anterior atingir meta -> streak recalcula reativamente

**Cenario B - Verificacao de singular/plural no Badge:**
Revisar `app/page.tsx` linha 92: `{streak} day{streak !== 1 ? "s" : ""}` e confirmar que:
- streak = 1 -> "1 day"
- streak = 2+ -> "X days"
- streak = 0 -> badge nao renderiza (condicional na linha 88)

**Cenario C - Documentacao da limitacao forward-only:**
Adicionar comentario no hook `useStreak` (proximo a linha 109 onde `dailyGoal` e comparado) explicando:
- Decisao de produto: mudanca de meta deveria ser "forward only"
- Limitacao atual: `dailyGoal` atual e usado para avaliar TODOS os dias historicos
- Para implementar corretamente: precisaria de historico de mudancas de meta ou snapshots diarios
- Aceito como trade-off de MVP

### 3. Criterios de Aceite por Cenario

**Cenario A:**
- Todos os edge cases listados foram verificados contra a logica do codigo
- Nenhum bug encontrado OU bugs encontrados foram corrigidos
- Se algum edge case falhar: documentar e corrigir

**Cenario B:**
- Singular/plural confirmado como correto no codigo existente
- Badge oculto quando streak = 0 confirmado

**Cenario C:**
- Comentario adicionado no hook `useStreak` em `hooks/use-hydration-store.ts`
- Comentario inclui: descricao da limitacao, decisao de produto, e TODO para Phase 2
- Nenhuma alteracao na logica de calculo

## Bloco 2: Como? (Implementacao)

### 4. Codigo de Referencia

**Arquivo principal: `hooks/use-hydration-store.ts` - hook useStreak (linhas 85-118)**

```typescript
export function useStreak() {
  const logs = useHydrationStore((s) => s.logs);
  const dailyGoal = useHydrationStore((s) => s.dailyGoal);

  return useMemo(() => {
    const dayMap = new Map<string, number>();

    logs.forEach((log) => {
      const day = new Date(log.timestamp).toISOString().split("T")[0];
      dayMap.set(day, (dayMap.get(day) ?? 0) + log.amount);
    });

    let streak = 0;
    const today = new Date();
    const todayKey = today.toISOString().split("T")[0];
    const todayTotal = dayMap.get(todayKey) ?? 0;
    const startFrom = todayTotal >= dailyGoal ? 0 : 1;

    for (let i = startFrom; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      const total = dayMap.get(key) ?? 0;

      if (total >= dailyGoal) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [logs, dailyGoal]);
}
```

**Arquivo de exibicao: `app/page.tsx` - Badge de streak (linhas 88-95)**

```tsx
{streak > 0 && (
  <Link href="/social">
    <Badge variant="secondary" className="gap-1 px-3 py-1 text-sm">
      <RiFireLine className="size-4 text-orange-500" />
      {streak} day{streak !== 1 ? "s" : ""}
    </Badge>
  </Link>
)}
```

**Alteracao esperada: adicionar bloco de comentario ANTES da linha `if (total >= dailyGoal)` (linha 109):**

```typescript
// TODO [Phase 2]: Implementar "forward-only" para mudancas de meta.
// LIMITACAO MVP: dailyGoal atual e usado para avaliar TODOS os dias historicos.
// Decisao de produto: mudanca de meta deveria afetar apenas dias futuros.
// Para corrigir: armazenar historico de mudancas de meta ou snapshots diarios.
```

### 5. Contratos e Estruturas de Dados

**Tipo HydrationLog (lib/types.ts):**
```typescript
export type HydrationLog = {
  id: string;
  amount: number;
  timestamp: string; // ISO 8601
};
```

**Constantes (lib/constants.ts):**
```typescript
export const DEFAULT_GOAL = 2000;
export const DEFAULT_PRESETS = [200, 300, 500];
export const STORAGE_KEY = "hydra-store";
```

**dayMap derivado:** `Map<string, number>` onde key = "YYYY-MM-DD", value = soma de amount do dia.

**Retorno do useStreak:** `number` (quantidade de dias consecutivos).

### 6. Dependencias e Interacoes

**Componentes envolvidos:**
| Arquivo | Path | Funcao |
|---------|------|--------|
| useStreak hook | `hooks/use-hydration-store.ts` | Calculo do streak (linhas 85-118) |
| TodayPage | `app/page.tsx` | Exibicao do Badge (linhas 88-95) |
| Types | `lib/types.ts` | HydrationLog type |
| Constants | `lib/constants.ts` | DEFAULT_GOAL, STORAGE_KEY |

**Dependencias de estado Zustand:**
- `logs: HydrationLog[]` - array de todos os logs persistidos
- `dailyGoal: number` - meta diaria atual (default 2000ml)

**Reatividade garantida por:**
- `useMemo` com deps `[logs, dailyGoal]` - recalcula quando logs mudam (add/delete/edit) ou meta muda
- Zustand persist middleware - logs sobrevivem entre sessoes

### 7. Requisitos Nao-Funcionais

- **Performance:** Calculo limitado a 365 dias (ja implementado). Deve executar em < 10ms.
- **UI Framework:** shadcn/ui Badge com variante `secondary`. Remixicon `RiFireLine` com cor `text-orange-500`.
- **Formatadores:** Seguir configuracoes existentes de Prettier/ESLint do projeto.
- **Estrutura de arquivos:** Nenhum arquivo novo. Apenas modificacao in-place de `hooks/use-hydration-store.ts`.
- **Testes:** BASIC AND CHEAP - verificacao manual dos edge cases e suficiente para esta tarefa de documentacao. Nao e necessario criar arquivos de teste.

## Bloco 3: Como Validar? (Validacao)

### 8. Cenarios de Teste (BDD)

**Cenario 1: Streak zero sem logs**
```
Dado que o usuario nao possui nenhum log de hidratacao
Quando o hook useStreak e executado
Entao o streak retornado deve ser 0
E o Badge de streak NAO deve ser renderizado na tela
```

**Cenario 2: Streak de 1 dia (singular)**
```
Dado que o usuario atingiu a meta apenas hoje (todayTotal >= dailyGoal)
E nao possui logs de dias anteriores
Quando o hook useStreak e executado
Entao o streak retornado deve ser 1
E o Badge deve exibir "1 day" (singular, sem "s")
```

**Cenario 3: Streak de multiplos dias (plural)**
```
Dado que o usuario atingiu a meta nos ultimos 5 dias consecutivos incluindo hoje
Quando o hook useStreak e executado
Entao o streak retornado deve ser 5
E o Badge deve exibir "5 days" (plural)
```

**Cenario 4: Hoje incompleto com streak anterior**
```
Dado que o usuario atingiu a meta nos ultimos 3 dias (ontem, anteontem, e dia anterior)
E hoje ainda NAO atingiu a meta
Quando o hook useStreak e executado
Entao o streak retornado deve ser 3
E a contagem deve comecar a partir de ontem (startFrom = 1)
```

**Cenario 5: Gap quebra o streak**
```
Dado que o usuario atingiu a meta hoje e ontem
E NAO atingiu a meta anteontem
E atingiu a meta 3 dias antes de anteontem
Quando o hook useStreak e executado
Entao o streak retornado deve ser 2 (apenas hoje + ontem)
E os dias anteriores ao gap NAO devem ser contados
```

**Cenario 6: Streak reativo a delecao de log**
```
Dado que o usuario tem streak de 3 dias
E ontem o total e exatamente igual a meta (ex: 2000ml de uma unica entrada)
Quando o usuario deleta o log de ontem
Entao o useStreak deve recalcular automaticamente (via useMemo)
E o streak deve diminuir para refletir a perda do dia de ontem
```

**Cenario 7: Mudanca de meta afeta streak retroativamente (limitacao documentada)**
```
Dado que o usuario atingiu 1500ml por dia nos ultimos 5 dias com meta de 1500ml
E o streak atual e 5
Quando o usuario altera a meta para 2000ml
Entao o streak deve recalcular para 0 (pois 1500ml < 2000ml)
E este comportamento e uma limitacao conhecida do MVP
E deve estar documentado como TODO no codigo
```

**Cenario 8: Badge oculto quando streak e zero**
```
Dado que o streak calculado e 0
Quando a pagina Today e renderizada
Entao o Badge com icone de fogo NAO deve ser visivel
E nenhuma mensagem negativa deve ser exibida
```
