# T001-FE: Polish Settings - Goal Range, Validacao e Feedback

## 🧑‍💼 Spec para Humanos

> ⚠️ **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes. Caso voce decida fazer alteracao, faca atraves do agente para que ela seja refletida em todas as secoes.**

- **Tarefa:** T001-FE (Frontend) - Polish da pagina Settings
- **Objetivo:** Ajustar pagina Settings existente para cobrir range completo de meta (500-5000ml), validacao correta de presets (50-2000ml), feedback visual de salvamento e melhorias de acessibilidade.
- **Topicos:**
  - Substituir grid de 5 botoes por input numerico com step 100 + botoes de preset rapido
  - Ajustar validacao de presets para range 50-2000ml
  - Adicionar indicador "Saved" temporario (1-2s) apos qualquer alteracao
  - Adicionar aria-label no input de novo preset
  - Adicionar suporte a Enter para confirmar novo preset
- **Dependencias:** Zustand store (`useHydrationStore`), componentes shadcn/ui (`Input`, `Card`, `Button`, `Badge`)
- **Validacao:**
  - Meta aceita 500-5000ml com step 100
  - Preset rejeitado fora de 50-2000ml
  - Indicador "Saved" aparece e desaparece em 1-2s
  - Enter confirma novo preset
  - Leitores de tela anunciam campo corretamente

---

## 🤖 Contexto Detalhado para Agentes

---

## 1. O Que? (Descricao)

### 1.1 Objetivo Tecnico

Ajustar a pagina Settings (`app/settings/page.tsx`) que ja esta implementada para fechar gaps com a especificacao da US-008: expandir range de selecao de meta diaria, corrigir validacao de presets, adicionar feedback visual de salvamento e melhorar acessibilidade.

**Estado atual vs. especificado:**

| Aspecto | Atual | Especificado |
|---------|-------|-------------|
| Selecao de meta | 5 botoes fixos [1500, 2000, 2500, 3000, 3500] | Range 500-5000ml, step 100 |
| Validacao de preset | `amount > 0 && amount <= 5000` | 50-2000ml |
| Feedback de salvamento | Nenhum | Indicador "Saved" temporario |
| aria-label no input preset | Ausente | Obrigatorio |
| Enter para confirmar preset | Ausente | Obrigatorio |

### 1.2 Decomposicao em Cenarios

**Cenario A: Selecao de meta diaria com range expandido**
- Substituir `GOAL_OPTIONS` (grid de 5 botoes) por um `<input type="number">` com min=500, max=5000, step=100
- Manter botoes de acesso rapido para valores comuns (ex: 1500, 2000, 2500, 3000) como atalhos opcionais
- Exibir valor atual formatado (ex: "2L" para 2000, "2.5L" para 2500)
- Chamar `setDailyGoal(value)` ao alterar (auto-save)

**Cenario B: Validacao de presets corrigida**
- Alterar validacao em `handleAddPreset` de `amount > 0 && amount <= 5000` para `amount >= 50 && amount <= 2000`
- Alterar atributos `min` e `max` do input de novo preset para `min={50}` e `max={2000}`
- Exibir mensagem de erro inline se valor fora do range

**Cenario C: Feedback de salvamento**
- Adicionar estado `saved` que e ativado apos qualquer alteracao (meta ou preset)
- Exibir texto "Saved" ou icone de checkmark por 1-2 segundos
- Posicao: discreto, proximo ao topo da pagina ou dentro do Card alterado
- Usar `setTimeout` para limpar o estado

**Cenario D: Acessibilidade e UX do input de preset**
- Adicionar `aria-label="New preset amount in milliliters"` no input de novo preset
- Adicionar handler `onKeyDown` para que Enter confirme o novo preset (chamar `handleAddPreset`)

### 1.3 Criterios de Aceite por Cenario

**Cenario A:**
- [ ] Input numerico permite valores de 500 a 5000 com step de 100
- [ ] Valores fora do range sao rejeitados/clamped
- [ ] Valor alterado chama `setDailyGoal` imediatamente
- [ ] Valor exibido corretamente formatado

**Cenario B:**
- [ ] Preset < 50ml e rejeitado com feedback visual
- [ ] Preset > 2000ml e rejeitado com feedback visual
- [ ] Atributos min/max do input refletem 50-2000

**Cenario C:**
- [ ] Indicador "Saved" aparece apos alterar meta
- [ ] Indicador "Saved" aparece apos adicionar/remover preset
- [ ] Indicador desaparece em 1-2 segundos
- [ ] Indicador nao bloqueia interacao

**Cenario D:**
- [ ] Input de preset tem aria-label descritivo
- [ ] Pressionar Enter no input de preset adiciona o preset

---

## 2. Como? (Implementacao)

### 2.1 Codigo de Referencia

**Arquivo a modificar:**
`app/settings/page.tsx`

**Padrao de estado local com timeout (referencia de `app/page.tsx`, linhas 48-53):**
```tsx
// Padrao existente na TodayPage para feedback temporario
function handleLog(amount: number) {
  addLog(amount);
  setLastLogged(amount);
  setShowCustom(false);
  setTimeout(() => setLastLogged(null), 1500);
}
```
Usar este mesmo padrao para o indicador "Saved".

**Padrao de input numerico com confirmacao (referencia de `app/page.tsx`, linhas 139-147):**
```tsx
<input
  type="number"
  value={customAmount}
  onChange={(e) => setCustomAmount(e.target.value)}
  className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-center text-lg font-semibold outline-none focus:border-primary"
  min={1}
  max={5000}
  autoFocus
/>
```

**Store - setDailyGoal (referencia de `hooks/use-hydration-store.ts`, linha 50):**
```tsx
setDailyGoal: (goal) => set({ dailyGoal: goal }),
```
Aceita qualquer number. A validacao de range deve ser feita no componente antes de chamar.

**Componente InputGroup disponivel (referencia de `components/ui/input-group.tsx`):**
O projeto possui `InputGroup`, `InputGroupAddon`, `InputGroupInput` do shadcn/ui. Considerar usar para o campo de meta com sufixo "ml".

### 2.2 Contratos e Estruturas de Dados

**Store (sem alteracao necessaria):**
```typescript
// hooks/use-hydration-store.ts - interfaces existentes, nao mudam
setDailyGoal: (goal: number) => void;
setPresets: (presets: number[]) => void;
```

**Constantes (sem alteracao necessaria):**
```typescript
// lib/constants.ts
export const DEFAULT_GOAL = 2000;
export const DEFAULT_PRESETS = [200, 300, 500];
```

**Novo estado local no componente:**
```typescript
// Adicionar em SettingsPage
const [showSaved, setShowSaved] = useState(false);
const [goalInput, setGoalInput] = useState(dailyGoal.toString());
```

### 2.3 Dependencias e Interacoes

**Componentes existentes que DEVEM ser reutilizados:**
- `@/components/ui/card` - Card, CardContent, CardHeader, CardTitle (ja usado)
- `@/components/ui/button` - Button (ja usado)
- `@/components/ui/badge` - Badge (ja usado)
- `@/components/ui/input` - Input (disponivel, considerar para campo de meta)
- `@/components/ui/input-group` - InputGroup, InputGroupAddon, InputGroupInput (disponivel, considerar para campo com sufixo "ml")
- `@/components/ui/alert-dialog` - AlertDialog (ja usado)

**Hooks existentes que DEVEM ser usados:**
- `useHydrationStore` de `@/hooks/use-hydration-store` (ja usado)

**Icones existentes (Remix Icon via @remixicon/react):**
- `RiCheckLine` - ja importado, usar para indicador "Saved"
- `RiAddLine`, `RiCloseLine`, `RiDeleteBinLine` - ja importados

**Impacto cross-feature (verificacao, nao implementacao nesta task):**
- `app/page.tsx` (Today): consome `presets` e `dailyGoal` do store - refletira mudancas automaticamente
- `components/dashboard/progress-ring.tsx`: consome `dailyGoal` via prop - refletira automaticamente
- `hooks/use-hydration-store.ts` (`useStreak`): usa `dailyGoal` - recalculara automaticamente
- `app/history/page.tsx`: se consome `dailyGoal` para chart/stats - refletira automaticamente

### 2.4 Requisitos Nao-Funcionais

- **UI Framework:** shadcn/ui - OBRIGATORIO usar componentes existentes
- **Styling:** Tailwind CSS 4 - seguir classes utilitarias existentes
- **Formatadores:** seguir configuracao existente do projeto
- **Estrutura de arquivos:** modificacao in-place em `app/settings/page.tsx`
- **Performance:** se usar input type=number para meta, considerar debounce no `setDailyGoal` para evitar escritas excessivas no store durante digitacao rapida (similar ao que a US-008 menciona sobre "slider drag")
- **Acessibilidade:** aria-labels em inputs, labels descritivos
- **Persistencia:** via Zustand persist (ja configurado, sem alteracao)

### 2.5 Plano de Implementacao Detalhado

**Passo 1: Substituir selecao de meta**
- Remover constante `GOAL_OPTIONS` e grid de botoes
- Adicionar estado local `goalInput` inicializado com `dailyGoal.toString()`
- Criar input type="number" com min=500, max=5000, step=100
- Handler `onChange`: atualizar `goalInput` local
- Handler `onBlur` ou debounced `onChange`: validar range, chamar `setDailyGoal(clampedValue)`, trigger feedback
- Adicionar botoes de preset rapido (1500, 2000, 2500, 3000) como chips/badges clicaveis abaixo do input
- Exibir valor formatado (ex: "2L" ou "2500ml")

**Passo 2: Corrigir validacao de presets**
- Em `handleAddPreset`: trocar `amount > 0 && amount <= 5000` por `amount >= 50 && amount <= 2000`
- Em input de novo preset: trocar `min={1} max={5000}` por `min={50} max={2000}`
- Adicionar mensagem de erro inline se valor invalido

**Passo 3: Adicionar feedback "Saved"**
- Adicionar `const [showSaved, setShowSaved] = useState(false)` e ref para timeout
- Criar funcao `triggerSaved()` que seta true e agenda setTimeout para false em 1500ms
- Chamar `triggerSaved()` em: `setDailyGoal`, `handleAddPreset`, `handleRemovePreset`
- Renderizar indicador no topo ou proximo ao header: texto "Saved" com icone `RiCheckLine`, animacao fade-in/out
- Usar classes Tailwind para animacao: `animate-in fade-in` ou transicao de opacidade

**Passo 4: Acessibilidade**
- Adicionar `aria-label="New preset amount in milliliters"` no input de novo preset (linha 104-111 atual)
- Adicionar `onKeyDown` no input de novo preset:
  ```tsx
  onKeyDown={(e) => { if (e.key === "Enter") handleAddPreset(); }}
  ```
- Adicionar `aria-label="Daily goal in milliliters"` no novo input de meta

---

## 3. Como Validar? (Validacao)

### 3.1 Cenarios de Teste (BDD)

**Cenario 1: Alterar meta diaria para valor valido**
```gherkin
Given o usuario esta na pagina Settings
  And a meta atual e 2000ml
When o usuario altera o input de meta para 3000
Then o store.dailyGoal e atualizado para 3000
  And o indicador "Saved" aparece
  And o indicador desaparece apos 1-2 segundos
```

**Cenario 2: Meta diaria rejeita valor abaixo do minimo**
```gherkin
Given o usuario esta na pagina Settings
When o usuario tenta definir meta como 400
Then o valor e rejeitado ou clamped para 500 (minimo)
  And a meta no store nao e definida como 400
```

**Cenario 3: Meta diaria rejeita valor acima do maximo**
```gherkin
Given o usuario esta na pagina Settings
When o usuario tenta definir meta como 6000
Then o valor e rejeitado ou clamped para 5000 (maximo)
  And a meta no store nao e definida como 6000
```

**Cenario 4: Adicionar preset com valor valido**
```gherkin
Given o usuario esta na pagina Settings
  And os presets atuais sao [200, 300, 500]
When o usuario abre o input de novo preset
  And digita 150
  And confirma (botao ou Enter)
Then o preset 150 e adicionado
  And os presets sao exibidos ordenados: [150, 200, 300, 500]
  And o indicador "Saved" aparece
```

**Cenario 5: Rejeitar preset fora do range**
```gherkin
Given o usuario esta na pagina Settings
When o usuario tenta adicionar preset de 30ml
Then o preset nao e adicionado
  And feedback de erro inline e exibido

Given o usuario esta na pagina Settings
When o usuario tenta adicionar preset de 2500ml
Then o preset nao e adicionado
  And feedback de erro inline e exibido
```

**Cenario 6: Confirmar preset com tecla Enter**
```gherkin
Given o usuario esta na pagina Settings
  And o input de novo preset esta visivel com valor 250
When o usuario pressiona a tecla Enter
Then o preset 250 e adicionado (mesmo comportamento do botao de confirmar)
```

**Cenario 7: Remover preset exibe feedback**
```gherkin
Given o usuario esta na pagina Settings
  And os presets sao [200, 300, 500]
When o usuario remove o preset 300
Then os presets sao [200, 500]
  And o indicador "Saved" aparece
```

**Cenario 8: Meta alterada reflete no progress ring**
```gherkin
Given o usuario alterou a meta de 2000 para 3000 em Settings
When o usuario navega para a pagina Today
Then o progress ring exibe a nova meta de 3000ml
  And a porcentagem e recalculada com base em 3000ml
```

**Cenario 9: Presets alterados refletem no Quick Log**
```gherkin
Given o usuario adicionou preset 150ml em Settings
When o usuario navega para a pagina Today
Then os botoes de Quick Log incluem 150ml
```

**Cenario 10: Persistencia entre sessoes**
```gherkin
Given o usuario alterou meta para 3500 e adicionou preset 150
When o usuario fecha e reabre o app
Then a meta permanece 3500
  And os presets incluem 150
```

### 3.2 Testes Recomendados (Estrategia BASIC AND CHEAP)

Dado que a estrategia de testes e minimal:
- **Manual:** Verificar todos os 10 cenarios BDD acima manualmente no browser
- **Opcional:** Se houver setup de testes, um teste simples de que `handleAddPreset` rejeita valores fora de 50-2000

---

## Metadata

| Campo | Valor |
|-------|-------|
| task_id | T001-FE |
| task_type | Frontend |
| task_name | Polish Settings - Goal Range, Validacao e Feedback |
| file_path | `app/settings/page.tsx` |
| us_reference | US-008 Goal Presets Configuration |
| requirements_covered | AC1 (meta reflete cross-feature), AC3 (validacao ranges), AC4 (salvamento automatico), AC5 (feedback sutil), AC2 (presets refletem no Quick Log - via store, nao requer mudanca no Today) |
