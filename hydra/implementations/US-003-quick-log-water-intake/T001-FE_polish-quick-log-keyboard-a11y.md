## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes. Caso voce decida fazer alteracao, faca atraves do agente para que ela seja refletida em todas as secoes.**

- **Tarefa:** Polish Quick Log - keyboard e a11y (FE)
- **Objetivo:** Adicionar suporte a teclado (Enter/ESC) no input customizado, feedback visual de validacao e aria-label para acessibilidade
- **Topicos:**
  - Handler de teclado: Enter confirma, ESC cancela input customizado
  - Feedback visual de erro: borda vermelha e mensagem quando valor invalido
  - Acessibilidade: aria-label no input customizado
- **Dependencias:** `app/page.tsx` (componente existente), shadcn/ui (Button, Card)
- **Validacao:** Enter confirma valor valido, ESC fecha input, erro visual em valor invalido, aria-label presente

---

## Contexto Detalhado para Agentes

## Bloco 1: O Que? (Descricao)

### 1. Objetivo Tecnico Explicito

Adicionar ao input customizado de Quick Log em `app/page.tsx` tres melhorias pontuais: (a) handler `onKeyDown` para Enter confirmar e ESC cancelar, (b) feedback visual de erro de validacao (borda vermelha + texto) quando o usuario tenta confirmar valor fora do range 1-5000, e (c) `aria-label` no campo input para acessibilidade.

### 2. Decomposicao em Cenarios

**Cenario A - Enter confirma input customizado:**
O usuario abre o card de input customizado, digita um valor valido (ex: 750) e pressiona Enter. O sistema deve chamar `handleCustomLog()`, registrar o log e fechar o card.

**Cenario B - ESC cancela input customizado:**
O usuario abre o card de input customizado e pressiona ESC. O sistema deve chamar `setShowCustom(false)`, fechando o card sem criar nenhum log.

**Cenario C - Feedback visual de erro de validacao:**
O usuario abre o card de input customizado, digita um valor invalido (0, negativo, vazio, ou > 5000) e tenta confirmar (via botao check ou Enter). O sistema NAO cria log e exibe feedback visual: borda vermelha no input + mensagem de erro breve (ex: "Informe 1-5000ml").

**Cenario D - Acessibilidade do input:**
O input customizado possui `aria-label="Custom amount in milliliters"` para leitores de tela.

### 3. Criterios de Aceite por Cenario

**Cenario A:**
- Pressionar Enter no input com valor valido (1-5000) chama `handleCustomLog()`
- Log e criado no store com o amount correto
- Card fecha apos confirmacao
- Feedback "+Xml" aparece por 1.5s

**Cenario B:**
- Pressionar ESC no input chama `setShowCustom(false)`
- Card fecha imediatamente
- Nenhum log e criado
- Estado do input e resetado na proxima abertura

**Cenario C:**
- Tentar confirmar com valor <= 0, vazio, ou > 5000 NAO cria log
- Input recebe borda vermelha (`border-destructive` ou `border-red-500`)
- Mensagem de erro aparece abaixo ou ao lado do input (ex: "Informe 1-5000ml")
- Erro desaparece quando usuario altera o valor no campo
- Erro desaparece quando usuario fecha o card (ESC ou botao X)

**Cenario D:**
- Input possui atributo `aria-label="Custom amount in milliliters"`
- Acessivel via leitores de tela

---

## Bloco 2: Como? (Implementacao)

### 4. Codigo de Referencia

**Arquivo a modificar:** `app/page.tsx`

**Estado atual do input customizado (linhas 136-167):**

```tsx
{showCustom && (
  <Card size="sm">
    <CardContent className="flex items-center gap-2">
      <input
        type="number"
        value={customAmount}
        onChange={(e) => setCustomAmount(e.target.value)}
        className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-center text-lg font-semibold outline-none focus:border-primary"
        min={1}
        max={5000}
        autoFocus
      />
      <span className="text-sm text-muted-foreground">ml</span>
      <Button
        size="icon"
        variant="default"
        onClick={handleCustomLog}
        className="shrink-0"
      >
        <RiCheckLine className="size-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setShowCustom(false)}
        className="shrink-0"
      >
        <RiCloseLine className="size-4" />
      </Button>
    </CardContent>
  </Card>
)}
```

**Estado atual da funcao handleCustomLog (linhas 55-60):**

```tsx
function handleCustomLog() {
  const amount = parseInt(customAmount, 10);
  if (amount > 0 && amount <= 5000) {
    handleLog(amount);
  }
}
```

**Implementacao esperada:**

1. Adicionar state de erro de validacao:
```tsx
const [customError, setCustomError] = useState("");
```

2. Modificar `handleCustomLog` para retornar feedback de erro:
```tsx
function handleCustomLog() {
  const amount = parseInt(customAmount, 10);
  if (amount > 0 && amount <= 5000) {
    setCustomError("");
    handleLog(amount);
  } else {
    setCustomError("Informe 1-5000ml");
  }
}
```

3. Adicionar handler `onKeyDown` no input:
```tsx
onKeyDown={(e) => {
  if (e.key === "Enter") handleCustomLog();
  if (e.key === "Escape") setShowCustom(false);
}}
```

4. Adicionar `aria-label` no input:
```tsx
aria-label="Custom amount in milliliters"
```

5. Aplicar classe condicional de erro na borda do input:
```tsx
className={`h-10 w-full rounded-lg border bg-transparent px-3 text-center text-lg font-semibold outline-none focus:border-primary ${
  customError ? "border-red-500" : "border-input"
}`}
```

6. Renderizar mensagem de erro abaixo do CardContent (dentro do Card):
```tsx
{customError && (
  <p className="px-3 pb-2 text-xs text-red-500">{customError}</p>
)}
```

7. Limpar erro ao digitar:
```tsx
onChange={(e) => {
  setCustomAmount(e.target.value);
  if (customError) setCustomError("");
}}
```

8. Limpar erro ao fechar card - no `setShowCustom(false)` do botao X e do ESC, tambem chamar `setCustomError("")`. Alternativamente, limpar no efeito de abertura ou resetar quando `showCustom` muda para `false`.

### 5. Contratos e Estruturas de Dados

Nao ha contratos de API envolvidos. As alteracoes sao puramente de UI dentro do componente `TodayPage`.

**Estado local adicionado:**
| State | Tipo | Default | Descricao |
|-------|------|---------|-----------|
| `customError` | `string` | `""` | Mensagem de erro de validacao. Vazio = sem erro. |

### 6. Dependencias e Interacoes

**Componentes existentes (ja importados, sem mudancas):**
- `Button` de `@/components/ui/button` - botoes check e X
- `Card`, `CardContent` de `@/components/ui/card` - wrapper do input customizado
- `RiCheckLine`, `RiCloseLine` de `@remixicon/react` - icones dos botoes

**Store existente (sem mudancas):**
- `useHydrationStore` de `@/hooks/use-hydration-store` - `addLog` ja usado via `handleLog`

**Nenhuma dependencia nova necessaria.** Todas as mudancas sao internas ao arquivo `app/page.tsx`.

### 7. Requisitos Nao-Funcionais

- **Performance:** Nenhum impacto. Adicionar `onKeyDown` e um state string de erro e trivial.
- **Acessibilidade:** `aria-label="Custom amount in milliliters"` no input. Mensagem de erro deve usar cor com contraste suficiente (`text-red-500` sobre backgrounds claros/escuros do tema).
- **UI Framework:** Tailwind CSS 4 + shadcn/ui. Usar classes utilitarias existentes. Considerar usar `text-destructive` em vez de `text-red-500` se disponivel no tema.
- **Formatacao:** Seguir Prettier e ESLint configs do projeto. Usar `"use client"` no topo (ja presente).
- **Convencoes:** Named exports para utilitarios, mas este e `export default` (ja e assim, manter).

---

## Bloco 3: Como Validar? (Validacao)

### 8. Cenarios de Teste (BDD)

**Cenario 1: Enter confirma valor customizado valido**
```
Dado que o card de input customizado esta aberto
E o campo contem o valor "750"
Quando o usuario pressiona a tecla Enter
Entao um log de 750ml e criado no store
E o card de input customizado fecha
E o feedback "+750ml" aparece por 1.5 segundos
```

**Cenario 2: Enter com valor no limite inferior (1ml)**
```
Dado que o card de input customizado esta aberto
E o campo contem o valor "1"
Quando o usuario pressiona a tecla Enter
Entao um log de 1ml e criado no store
E o card fecha normalmente
```

**Cenario 3: Enter com valor no limite superior (5000ml)**
```
Dado que o card de input customizado esta aberto
E o campo contem o valor "5000"
Quando o usuario pressiona a tecla Enter
Entao um log de 5000ml e criado no store
E o card fecha normalmente
```

**Cenario 4: ESC cancela input customizado**
```
Dado que o card de input customizado esta aberto
E o campo contem qualquer valor
Quando o usuario pressiona a tecla Escape
Entao o card de input customizado fecha
E nenhum log e criado no store
```

**Cenario 5: Erro visual ao confirmar valor zero**
```
Dado que o card de input customizado esta aberto
E o campo contem o valor "0"
Quando o usuario pressiona Enter (ou clica no botao check)
Entao nenhum log e criado
E o input exibe borda vermelha
E a mensagem "Informe 1-5000ml" aparece visivel
```

**Cenario 6: Erro visual ao confirmar valor acima de 5000**
```
Dado que o card de input customizado esta aberto
E o campo contem o valor "6000"
Quando o usuario tenta confirmar
Entao nenhum log e criado
E o input exibe borda vermelha
E a mensagem "Informe 1-5000ml" aparece visivel
```

**Cenario 7: Erro visual ao confirmar campo vazio**
```
Dado que o card de input customizado esta aberto
E o campo esta vazio
Quando o usuario tenta confirmar
Entao nenhum log e criado
E o input exibe borda vermelha com mensagem de erro
```

**Cenario 8: Erro desaparece ao digitar novo valor**
```
Dado que o input esta em estado de erro (borda vermelha + mensagem)
Quando o usuario digita um novo caractere no campo
Entao a borda vermelha desaparece
E a mensagem de erro desaparece
```

**Cenario 9: aria-label presente no input**
```
Dado que o card de input customizado esta aberto
Quando um leitor de tela foca no campo de input
Entao o campo e anunciado como "Custom amount in milliliters"
```
