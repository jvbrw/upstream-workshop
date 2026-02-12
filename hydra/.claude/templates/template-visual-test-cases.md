# Visual Fidelity Test Cases: [US-ID]

**US-ID:** [ID] | **Protótipo:** [URL/Path] | **Threshold:** 80%

## Métricas de Fidelidade

| Categoria | Peso | Score | Status |
|-----------|------|-------|--------|
| Layout | 30% | - | - |
| Cores | 25% | - | - |
| Tipografia | 20% | - | - |
| Espaçamentos | 15% | - | - |
| Componentes | 10% | - | - |
| **TOTAL** | 100% | **-** | **-** |

---

## VF-01: Cores Match Palette

**Tipo:** Visual Fidelity | **Prioridade:** Alta | **Categoria:** Cores

### Cenário

```gherkin
Dado: FE renderizada em viewport {breakpoint}
Quando: Extrair cores utilizadas nos elementos
Então: Delta-E < 2 para cada cor comparada com protótipo
```

### Validação de Cores

| Token | Esperado | Atual | Delta-E | Status |
|-------|----------|-------|---------|--------|
| primary | #XXXXXX | - | - | - |
| secondary | #XXXXXX | - | - | - |
| accent | #XXXXXX | - | - | - |
| background | #XXXXXX | - | - | - |
| text-primary | #XXXXXX | - | - | - |

### Notas Playwright

```typescript
// Extrair cor computada de elemento
const color = await page.locator('[data-testid="button"]').evaluate(el =>
  window.getComputedStyle(el).backgroundColor
);
```

---

## VF-02: Tipografia Match Specs

**Tipo:** Visual Fidelity | **Prioridade:** Alta | **Categoria:** Tipografia

### Cenário

```gherkin
Dado: Elementos de texto renderizados
Quando: Inspecionar font-family, font-size, font-weight
Então: Match exato com specs do protótipo
```

### Validação de Tipografia

| Elemento | Font-Family Esperado | Font-Size Esperado | Font-Weight Esperado | Status |
|----------|---------------------|-------------------|---------------------|--------|
| h1 | - | - | - | - |
| h2 | - | - | - | - |
| body | - | - | - | - |
| button | - | - | - | - |

### Notas Playwright

```typescript
// Extrair propriedades de tipografia
const styles = await page.locator('h1').evaluate(el => ({
  fontFamily: window.getComputedStyle(el).fontFamily,
  fontSize: window.getComputedStyle(el).fontSize,
  fontWeight: window.getComputedStyle(el).fontWeight
}));
```

---

## VF-03: Espaçamentos Tolerância ±4px

**Tipo:** Visual Fidelity | **Prioridade:** Média | **Categoria:** Espaçamentos

### Cenário

```gherkin
Dado: Layout renderizado
Quando: Medir margins e paddings dos elementos principais
Então: Diferença <= 4px do valor definido no protótipo
```

### Validação de Espaçamentos

| Elemento | Propriedade | Esperado | Atual | Diferença | Status |
|----------|-------------|----------|-------|-----------|--------|
| card | padding | - | - | - | - |
| button | padding | - | - | - | - |
| container | margin | - | - | - | - |
| section | gap | - | - | - | - |

### Notas Playwright

```typescript
// Extrair espaçamentos
const spacing = await page.locator('.card').evaluate(el => ({
  padding: window.getComputedStyle(el).padding,
  margin: window.getComputedStyle(el).margin
}));
```

---

## VF-04: Layout Responsivo

**Tipo:** Visual Fidelity | **Prioridade:** Alta | **Categoria:** Layout

### Cenário

```gherkin
Dado: FE renderizada
Quando: Viewport é alterado para {375px|768px|1280px}
Então: Layout adapta conforme breakpoint do protótipo
```

### Validação por Viewport

| Viewport | Width | Elementos Visíveis | Layout | Status |
|----------|-------|-------------------|--------|--------|
| Mobile | 375px | - | - | - |
| Tablet | 768px | - | - | - |
| Desktop | 1280px | - | - | - |

### Notas Playwright

```typescript
// Testar diferentes viewports
const viewports = [
  { width: 375, height: 667, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1280, height: 720, name: 'desktop' }
];

for (const viewport of viewports) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.screenshot({ path: `screenshot-${viewport.name}.png` });
}
```

---

## VF-05: Componentes Match Variantes

**Tipo:** Visual Fidelity | **Prioridade:** Média | **Categoria:** Componentes

### Cenário

```gherkin
Dado: Componentes do Design System renderizados
Quando: Comparar com variantes do protótipo
Então: Estados visuais (default, hover, active, disabled) correspondem
```

### Validação de Componentes

| Componente | Variante | Estado | Match Protótipo | Status |
|------------|----------|--------|-----------------|--------|
| Button | primary | default | - | - |
| Button | primary | hover | - | - |
| Button | primary | active | - | - |
| Button | primary | disabled | - | - |
| Input | default | default | - | - |
| Input | default | focus | - | - |
| Input | default | error | - | - |

### Notas Playwright

```typescript
// Testar estados de hover
await page.locator('button').hover();
await page.screenshot({ path: 'button-hover.png' });

// Testar estado de focus
await page.locator('input').focus();
await page.screenshot({ path: 'input-focus.png' });
```

---

## Resultado Final

### Score de Fidelidade

| Categoria | Peso | Score | Pontos |
|-----------|------|-------|--------|
| Layout | 30% | -% | -/30 |
| Cores | 25% | -% | -/25 |
| Tipografia | 20% | -% | -/20 |
| Espaçamentos | 15% | -% | -/15 |
| Componentes | 10% | -% | -/10 |
| **TOTAL** | **100%** | **-%** | **-/100** |

### Veredicto

- **Fidelity Score:** -%
- **Threshold:** 80%
- **Status:** [PASS/FAIL]
- **Data:** [YYYY-MM-DD]
- **Responsável:** [Nome/Agent]

### Issues Encontrados

| # | Categoria | Descrição | Severidade | Sugestão |
|---|-----------|-----------|------------|----------|
| 1 | - | - | - | - |

### Screenshots de Referência

- [ ] Desktop (1280px): [path]
- [ ] Tablet (768px): [path]
- [ ] Mobile (375px): [path]
