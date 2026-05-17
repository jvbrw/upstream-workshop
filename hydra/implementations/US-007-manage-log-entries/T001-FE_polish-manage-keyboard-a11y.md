## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes. Caso voce decida fazer alteracao, faca atraves do agente para que ela seja refletida em todas as secoes.**

- **Tarefa:** Polish Manage - keyboard, single-edit e a11y (FE)
- **Objetivo:** Adicionar atalhos de teclado (Enter/ESC), single-edit mode e acessibilidade no input de edicao da pagina Manage
- **Topicos:**
  - Enter para confirmar edicao inline
  - ESC para cancelar edicao inline
  - Single-edit mode (apenas uma entrada editavel por vez)
  - aria-label no input de edicao
  - Feedback visual (borda vermelha) ao tentar salvar valor invalido
- **Dependencias:** `app/manage/page.tsx` (componente LogEntry + ManagePage), useHydrationStore
- **Validacao:** Enter confirma, ESC cancela, abrir edit em outra entrada fecha a anterior, input tem aria-label, borda vermelha em valor invalido

---

## Contexto Detalhado para Agentes

## Bloco 1: O Que? (Descricao)

### 1. Objetivo Tecnico Explicito

Refinar o componente `LogEntry` e o `ManagePage` em `app/manage/page.tsx` para cobrir 5 gaps de UX e acessibilidade na edicao inline: suporte a Enter/ESC, single-edit mode (lift state), aria-label no input, e feedback visual de validacao. A pagina Manage ja esta funcional -- esta task trata exclusivamente de polish.

### 2. Decomposicao em Cenarios

**Cenario A -- Enter para confirmar edicao**

O input de edicao inline (`<input type="number">` na linha 103-111 de `app/manage/page.tsx`) nao responde a tecla Enter. Ao pressionar Enter, o valor editado deve ser salvo (mesmo comportamento do botao check). Se o valor for invalido (<=0 ou >5000), nao deve salvar e deve mostrar feedback visual.

**Cenario B -- ESC para cancelar edicao**

O input de edicao inline nao responde a tecla Escape. Ao pressionar ESC, a edicao deve ser cancelada: restaurar o valor original (`log.amount`) e fechar o modo edicao (mesmo comportamento do botao X).

**Cenario C -- Single-edit mode (apenas uma entrada por vez)**

Atualmente cada `LogEntry` gerencia seu proprio estado `editing` via `useState` interno. Isso permite que multiplas entradas fiquem em modo edicao simultaneamente. A especificacao da US-007 exige: "Apenas uma entrada por vez em modo edicao (abrir editar em outra deve fechar a anterior)". Solucao: elevar o estado de edicao para `ManagePage`, passando `editingId` e `onStartEdit` como props para `LogEntry`.

**Cenario D -- aria-label no input de edicao**

O input de edicao (linha 103-111) nao possui `aria-label`. Adicionar `aria-label="Edit amount in milliliters"` para acessibilidade com screen readers.

**Cenario E -- Feedback visual de validacao no edit**

Quando o usuario tenta salvar um valor invalido (<=0, >5000, ou vazio), o input deve exibir feedback visual com borda vermelha (`border-destructive`). O feedback deve ser removido quando o usuario corrigir o valor ou cancelar a edicao.

### 3. Criterios de Aceite por Cenario

**Cenario A:**
- Pressionar Enter no input de edicao chama `handleSave()` (salva se valido)
- Se valor invalido, Enter nao salva e mostra feedback visual (Cenario E)
- Comportamento identico ao botao check (RiCheckLine)

**Cenario B:**
- Pressionar ESC no input de edicao cancela a edicao
- Valor original (`log.amount`) e restaurado
- Modo edicao e fechado
- Comportamento identico ao botao X (RiCloseLine)

**Cenario C:**
- Ao clicar em editar na entrada A, ela entra em modo edicao
- Ao clicar em editar na entrada B (enquanto A esta em edicao), A sai do modo edicao (valor restaurado) e B entra
- Apenas um input de edicao visivel por vez em toda a lista
- Estado `editingId` gerenciado no `ManagePage` (nao no `LogEntry`)

**Cenario D:**
- Input de edicao tem atributo `aria-label="Edit amount in milliliters"`
- Screen reader anuncia o proposito do campo ao receber foco

**Cenario E:**
- Input exibe `border-destructive` quando `handleSave()` falha por validacao
- Borda vermelha aparece ao pressionar Enter ou clicar no check com valor invalido
- Borda volta ao normal (`border-input`) ao digitar novo valor (onChange) ou cancelar

---

## Bloco 2: Como? (Implementacao)

### 4. Codigo de Referencia

**Arquivo a modificar: `app/manage/page.tsx`**

Codigo atual do `LogEntry` (linhas 79-176) -- com gaps marcados:

```tsx
function LogEntry({
  log,
  onDelete,
  onEdit,
}: {
  log: HydrationLog;
  onDelete: (id: string) => void;
  onEdit: (id: string, newAmount: number) => void;
}) {
  const [editing, setEditing] = useState(false);   // PROBLEMA: estado local
  const [editValue, setEditValue] = useState(String(log.amount));

  function handleSave() {
    const amount = parseInt(editValue, 10);
    if (amount > 0 && amount <= 5000) {
      onEdit(log.id, amount);
      setEditing(false);
    }
    // FALTA: feedback visual quando validacao falha
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
      {editing ? (
        <>
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 w-20 rounded-md border border-input bg-transparent px-2 text-center font-medium outline-none focus:border-primary"
            min={1}
            max={5000}
            autoFocus
            // FALTA: onKeyDown para Enter e ESC
            // FALTA: aria-label="Edit amount in milliliters"
          />
          {/* ... botoes check e X ... */}
        </>
      ) : (
        <>
          {/* ... display mode ... */}
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => setEditing(true)}  // PROBLEMA: nao notifica parent
          >
            <RiPencilLine className="size-3" />
          </Button>
          {/* ... delete dialog ... */}
        </>
      )}
    </div>
  );
}
```

**Implementacao corrigida esperada:**

1. **Alterar props do LogEntry** para receber controle externo de edicao:

```tsx
function LogEntry({
  log,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onDelete,
  onEdit,
}: {
  log: HydrationLog;
  isEditing: boolean;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newAmount: number) => void;
}) {
  const [editValue, setEditValue] = useState(String(log.amount));
  const [hasError, setHasError] = useState(false);

  // Reset editValue quando entra em modo edicao (para caso o log.amount tenha mudado)
  // e limpar erro
  useEffect(() => {
    if (isEditing) {
      setEditValue(String(log.amount));
      setHasError(false);
    }
  }, [isEditing, log.amount]);

  function handleSave() {
    const amount = parseInt(editValue, 10);
    if (amount > 0 && amount <= 5000) {
      onEdit(log.id, amount);
      onCancelEdit(); // fecha modo edicao
    } else {
      setHasError(true);
    }
  }

  function handleCancel() {
    setEditValue(String(log.amount));
    setHasError(false);
    onCancelEdit();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
      {isEditing ? (
        <>
          <input
            type="number"
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setHasError(false); // limpa erro ao digitar
            }}
            onKeyDown={handleKeyDown}
            aria-label="Edit amount in milliliters"
            className={`h-8 w-20 rounded-md border bg-transparent px-2 text-center font-medium outline-none focus:border-primary ${
              hasError ? "border-destructive" : "border-input"
            }`}
            min={1}
            max={5000}
            autoFocus
          />
          <span className="text-sm text-muted-foreground">ml</span>
          <div className="ml-auto flex gap-1">
            <Button size="icon-xs" variant="default" onClick={handleSave}>
              <RiCheckLine className="size-3" />
            </Button>
            <Button size="icon-xs" variant="ghost" onClick={handleCancel}>
              <RiCloseLine className="size-3" />
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* display mode inalterado */}
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => onStartEdit(log.id)}
          >
            <RiPencilLine className="size-3" />
          </Button>
          {/* AlertDialog inalterado */}
        </>
      )}
    </div>
  );
}
```

2. **Alterar ManagePage** para gerenciar `editingId`:

```tsx
export default function ManagePage() {
  const logs = useHydrationStore((s) => s.logs);
  const deleteLog = useHydrationStore((s) => s.deleteLog);
  const editLog = useHydrationStore((s) => s.editLog);
  const [editingId, setEditingId] = useState<string | null>(null);

  const groups = groupByDay(logs);

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-4">
      {/* header inalterado */}
      {groups.length === 0 ? (
        /* empty state inalterado */
      ) : (
        groups.map((group) => (
          <div key={group.date} className="space-y-2">
            {/* group header inalterado */}
            <div className="space-y-1">
              {group.logs.map((log) => (
                <LogEntry
                  key={log.id}
                  log={log}
                  isEditing={editingId === log.id}
                  onStartEdit={setEditingId}
                  onCancelEdit={() => setEditingId(null)}
                  onDelete={deleteLog}
                  onEdit={editLog}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
```

**Nota sobre import:** Adicionar `useEffect` ao import do React:

```tsx
import { useState, useEffect } from "react";
```

### 5. Contratos e Estruturas de Dados

Nao se aplica a esta task (nao ha API, apenas refinamento de componentes UI).

**Estrutura de dados relevante (inalterada):**

```typescript
// lib/types.ts
type HydrationLog = {
  id: string;
  amount: number;
  timestamp: string;
};
```

**Props alteradas do LogEntry:**

```typescript
// Antes:
type LogEntryProps = {
  log: HydrationLog;
  onDelete: (id: string) => void;
  onEdit: (id: string, newAmount: number) => void;
};

// Depois:
type LogEntryProps = {
  log: HydrationLog;
  isEditing: boolean;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newAmount: number) => void;
};
```

### 6. Dependencias e Interacoes

**Componentes existentes que DEVEM ser reutilizados:**

| Componente | Path | Uso |
|:---|:---|:---|
| ManagePage | `app/manage/page.tsx` | Componente a ser MODIFICADO (lift editingId state) |
| LogEntry | `app/manage/page.tsx` (funcao interna) | Componente a ser MODIFICADO (keyboard, a11y, props) |
| Button | `components/ui/button.tsx` | Ja utilizado, sem alteracao |
| AlertDialog | `components/ui/alert-dialog.tsx` | Ja utilizado, sem alteracao |

**Hooks existentes que DEVEM ser usados:**

| Hook | Path | Uso |
|:---|:---|:---|
| useHydrationStore | `hooks/use-hydration-store.ts` | Store Zustand (logs, editLog, deleteLog) -- sem alteracao |

**Design tokens relevantes:**

| Token | Uso |
|:---|:---|
| `border-input` | Borda default do input de edicao |
| `border-destructive` | Borda vermelha para erro de validacao |
| `border-primary` | Borda no focus do input |

### 7. Requisitos Nao-Funcionais

**Performance:**
- Nenhum impacto perceptivel -- alteracoes sao apenas handlers de evento e state lift
- `useEffect` no LogEntry e leve (apenas reset de string e boolean)

**Acessibilidade:**
- `aria-label="Edit amount in milliliters"` no input de edicao
- Teclado: Enter para confirmar, ESC para cancelar (padrao esperado de formularios inline)
- Feedback visual de erro via borda vermelha (perceptivel sem depender apenas de cor)

**UI Framework:**
- Tailwind CSS 4 (CSS-first config, oklch color space)
- shadcn/ui com tema Cyan (Radix Maia)
- Convencao: `"use client"` em componentes interativos
- Path alias: `@/*`

**Formatacao:**
- Seguir estilo existente do codebase (indentacao 2 espacos, aspas duplas em JSX)
- Sem alteracao em arquivos fora do escopo

**Testes:**
- BASIC AND CHEAP -- nenhum teste unitario ou E2E exigido para esta task de polish
- Validacao manual dos cenarios BDD e suficiente

---

## Bloco 3: Como Validar? (Validacao)

### 8. Cenarios de Teste (BDD)

**Cenario 1: Enter confirma edicao com valor valido**

```gherkin
Dado que o usuario esta na pagina /manage com entradas existentes
E uma entrada de 300ml esta em modo edicao
Quando o usuario digita "500" no input e pressiona Enter
Entao o valor da entrada e atualizado para 500ml
E o modo edicao e fechado
E o total do grupo e atualizado
```

**Cenario 2: Enter com valor invalido mostra erro visual**

```gherkin
Dado que uma entrada esta em modo edicao
Quando o usuario digita "0" no input e pressiona Enter
Entao o valor NAO e salvo
E o input exibe borda vermelha (border-destructive)
E o modo edicao permanece aberto
```

**Cenario 3: Enter com valor acima de 5000 mostra erro visual**

```gherkin
Dado que uma entrada esta em modo edicao
Quando o usuario digita "6000" no input e pressiona Enter
Entao o valor NAO e salvo
E o input exibe borda vermelha (border-destructive)
```

**Cenario 4: ESC cancela edicao e restaura valor**

```gherkin
Dado que uma entrada de 300ml esta em modo edicao
E o usuario digitou "999" no input
Quando o usuario pressiona ESC
Entao o modo edicao e fechado
E o valor exibido continua sendo 300ml (valor original)
E nenhuma alteracao e persistida no store
```

**Cenario 5: Single-edit mode -- abrir nova edicao fecha anterior**

```gherkin
Dado que a entrada A (200ml) esta em modo edicao
Quando o usuario clica no botao editar da entrada B (500ml)
Entao a entrada A sai do modo edicao (valor original restaurado)
E a entrada B entra em modo edicao com input exibindo "500"
E apenas um input de edicao esta visivel na tela
```

**Cenario 6: Single-edit mode -- apenas um input por vez**

```gherkin
Dado que existem 5 entradas na lista
Quando o usuario clica em editar na terceira entrada
Entao apenas a terceira entrada exibe o input de edicao
E todas as outras entradas exibem seus valores em modo display
```

**Cenario 7: aria-label presente no input de edicao**

```gherkin
Dado que uma entrada esta em modo edicao
Quando o input de edicao e renderizado
Entao o input possui atributo aria-label="Edit amount in milliliters"
E um screen reader anuncia "Edit amount in milliliters" ao focar no campo
```

**Cenario 8: Erro visual limpa ao digitar novo valor**

```gherkin
Dado que o input de edicao esta com borda vermelha (erro de validacao)
Quando o usuario digita um novo caractere no input
Entao a borda volta ao estado normal (border-input)
```

**Cenario 9: Erro visual limpa ao cancelar**

```gherkin
Dado que o input de edicao esta com borda vermelha (erro de validacao)
Quando o usuario pressiona ESC ou clica no botao X
Entao o modo edicao e fechado
E ao reabrir a edicao, o input aparece sem borda vermelha
```

**Cenario 10: Botao check continua funcionando (regressao)**

```gherkin
Dado que uma entrada esta em modo edicao com valor "400"
Quando o usuario clica no botao check (RiCheckLine)
Entao o valor e salvo como 400ml
E o modo edicao e fechado
```

---

## Checklist de Arquivos

| Arquivo | Acao | Descricao |
|:---|:---|:---|
| `app/manage/page.tsx` | MODIFICAR | Adicionar onKeyDown (Enter/ESC), lift editingId para ManagePage, aria-label, hasError state |
