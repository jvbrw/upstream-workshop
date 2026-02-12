# Template de Automação E2E - Playwright

**Framework:** Playwright
**Padrão de Arquitetura:** Clean Architecture (3 Layers)
**Padrão de Teste:** AAA (Arrange, Act, Assert)
**Locators:** Semânticos (getByRole, getByLabel, getByText)

---

## Arquitetura de Testes E2E

### 1. Camada de Interface (UI Layer)

**Localização:** `/pages/{feature}/*Locators.ts` e `/pages/{feature}/*Pages.ts`
**Função:** Interação direta com elementos da interface usando locators semânticos

**Estrutura de Diretórios:**
```
/pages/Login/
  ├── LoginLocators.ts    # Seletores semânticos
  ├── LoginPages.ts       # Ações e interações
/pages/Dashboard/
  ├── DashboardLocators.ts
  ├── DashboardPages.ts
```

**Exemplo de Locators.ts:**
```typescript
export class LoginLocators {
  constructor(private page: Page) {}

  // ✅ Prioridade 1: Locators por Role (acessibilidade)
  emailInput = () => this.page.getByRole('textbox', { name: /email/i });
  passwordInput = () => this.page.getByRole('textbox', { name: /senha|password/i });
  submitButton = () => this.page.getByRole('button', { name: /entrar|login/i });

  // ✅ Prioridade 2: Locators por Label
  emailByLabel = () => this.page.getByLabel('Email');
  passwordByLabel = () => this.page.getByLabel('Senha');

  // ✅ Prioridade 3: Locators por Placeholder
  emailByPlaceholder = () => this.page.getByPlaceholder('seu@email.com');

  // ✅ Prioridade 4: Locators por Text
  errorMessage = () => this.page.getByText('Credenciais inválidas');
  welcomeMessage = () => this.page.getByText(/bem-vindo/i);

  // ⚠️ Usar apenas quando locators semânticos não funcionam
  emailByTestId = () => this.page.locator('[data-testid="email-input"]');
}
```

**Exemplo de Pages.ts:**
```typescript
import { Page } from '@playwright/test';
import { LoginLocators } from './LoginLocators';

export class LoginPage {
  private locators: LoginLocators;

  constructor(private page: Page) {
    this.locators = new LoginLocators(page);
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async fillEmail(email: string) {
    await this.locators.emailInput().fill(email);
  }

  async fillPassword(password: string) {
    await this.locators.passwordInput().fill(password);
  }

  async clickSubmit() {
    await this.locators.submitButton().click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();
  }

  async getErrorMessage() {
    return await this.locators.errorMessage().textContent();
  }

  async isWelcomeMessageVisible() {
    return await this.locators.welcomeMessage().isVisible();
  }
}
```

---

### 2. Camada de Lógica de Negócio (Business Logic Layer)

**Localização:** `/pages/*Pages.ts` e `/fixtures/api/`
**Função:** Fluxos de negócio complexos e orquestração de múltiplas ações

**Exemplo de Fluxo Complexo:**
```typescript
export class UserRegistrationPage {
  constructor(private page: Page) {}

  async completeRegistration(userData: {
    name: string;
    email: string;
    password: string;
  }) {
    await this.navigate();
    await this.fillPersonalInfo(userData.name, userData.email);
    await this.fillPassword(userData.password);
    await this.acceptTerms();
    await this.submit();
    await this.waitForConfirmation();
  }

  private async waitForConfirmation() {
    await this.page.waitForURL('**/dashboard');
    await this.page.getByRole('heading', { name: 'Bem-vindo' }).waitFor();
  }
}
```

**Exemplo de API Fixtures:**
```typescript
// /fixtures/api/users.ts
export async function createUserViaAPI(request: APIRequestContext, userData: any) {
  const response = await request.post('/api/users', { data: userData });
  return response.json();
}

export async function deleteUserViaAPI(request: APIRequestContext, userId: string) {
  await request.delete(`/api/users/${userId}`);
}
```

---

### 3. Camada de Testes (Test Layer)

**Localização:** `/tests/e2e/{feature}/`
**Função:** Cenários de teste usando padrão AAA (Arrange, Act, Assert)

**Estrutura de Diretórios:**
```
/tests/e2e/
  ├── login/
  │   ├── login-happy-path.spec.ts
  │   ├── login-error-handling.spec.ts
  ├── dashboard/
  │   ├── dashboard-navigation.spec.ts
```

**Exemplo de Teste (Padrão AAA):**
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '@/pages/Login/LoginPages';

test.describe('Login - Happy Path', () => {
  test('deve realizar login com credenciais válidas', async ({ page }) => {
    // ARRANGE: Preparar dados e instanciar page objects
    const loginPage = new LoginPage(page);
    const validUser = {
      email: 'user@example.com',
      password: 'ValidPass123!'
    };

    // ACT: Executar ações
    await loginPage.navigate();
    await loginPage.login(validUser.email, validUser.password);

    // ASSERT: Validar resultados esperados
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(loginPage.locators.welcomeMessage()).toBeVisible();
  });
});
```

---

## Padrões de Nomenclatura

### Arquivos de Teste
- **Formato:** `{feature}-{type}.spec.ts`
- **Exemplos:**
  - `login-happy-path.spec.ts`
  - `registration-error-handling.spec.ts`
  - `dashboard-edge-cases.spec.ts`

### Page Objects
- **Locators:** `{Feature}Locators.ts` (ex: `LoginLocators.ts`)
- **Pages:** `{Feature}Pages.ts` (ex: `LoginPages.ts`)
- **Classes:** `{Feature}Page` (ex: `LoginPage`)

### Métodos de Teste
- **Formato:** Descritivo em português
- **Exemplos:**
  - `deve realizar login com credenciais válidas`
  - `deve exibir erro ao submeter formulário vazio`
  - `deve redirecionar após logout`

---

## Priorização de Locators Semânticos

### Ordem de Prioridade (do mais para menos semântico)

1. **getByRole** - Melhor para acessibilidade
```typescript
page.getByRole('button', { name: 'Entrar' })
page.getByRole('textbox', { name: /email/i })
page.getByRole('heading', { name: 'Dashboard' })
```

2. **getByLabel** - Associa com labels de formulário
```typescript
page.getByLabel('Email')
page.getByLabel('Senha')
page.getByLabel('Confirmar senha')
```

3. **getByPlaceholder** - Útil quando não há label
```typescript
page.getByPlaceholder('seu@email.com')
page.getByPlaceholder('Digite sua senha')
```

4. **getByText** - Para conteúdo textual
```typescript
page.getByText('Bem-vindo de volta')
page.getByText(/erro ao processar/i)
```

5. **data-testid** - APENAS quando locators semânticos não funcionam
```typescript
// ⚠️ Último recurso
page.locator('[data-testid="complex-component"]')
```

### ❌ Evitar (locators frágeis)
```typescript
// Baseados em estrutura CSS
page.locator('.form-group > input:nth-child(2)') // NÃO
page.locator('#some-generated-id-12345')         // NÃO
page.locator('div.container span')               // NÃO
```

---

## Padrão AAA (Arrange, Act, Assert)

### Estrutura Obrigatória

```typescript
test('descrição do cenário', async ({ page }) => {
  // ========== ARRANGE ==========
  // Preparar: dados, page objects, estado inicial
  const loginPage = new LoginPage(page);
  const userData = { email: 'test@example.com', password: 'Pass123' };

  // ========== ACT ==========
  // Executar: ações do usuário
  await loginPage.navigate();
  await loginPage.login(userData.email, userData.password);

  // ========== ASSERT ==========
  // Validar: resultados esperados
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

---

## Boas Práticas

### 1. Testes Atômicos
Cada teste deve ser **independente** e testar **uma funcionalidade específica**.

**❌ Ruim:**
```typescript
test('deve fazer login E criar evento E editar perfil', async ({ page }) => {
  // Teste fazendo múltiplas coisas não relacionadas
});
```

**✅ Bom:**
```typescript
test('deve realizar login com credenciais válidas', async ({ page }) => {
  // Apenas testa login
});

test('deve criar novo evento', async ({ page }) => {
  // Apenas testa criação de evento
});
```

### 2. Setup e Cleanup via API

**Use fixtures de API** para preparar dados e limpar após testes:

```typescript
test.describe('Dashboard', () => {
  let userId: string;

  test.beforeEach(async ({ request }) => {
    // Setup via API (mais rápido que UI)
    const user = await createUserViaAPI(request, {
      name: 'Test User',
      email: 'test@example.com'
    });
    userId = user.id;
  });

  test.afterEach(async ({ request }) => {
    // Cleanup via API
    await deleteUserViaAPI(request, userId);
  });

  test('deve exibir dados do usuário', async ({ page }) => {
    // Teste foca apenas no que importa
  });
});
```

### 3. Esperando por Estados Assíncronos

```typescript
// ✅ Aguardar elemento aparecer
await page.getByRole('button', { name: 'Salvar' }).waitFor({ state: 'visible' });

// ✅ Aguardar navegação
await page.waitForURL('**/dashboard');

// ✅ Aguardar resposta de API
await page.waitForResponse(response =>
  response.url().includes('/api/users') && response.status() === 200
);
```

### 4. Testes Multi-Browser

```typescript
import { test as base } from '@playwright/test';

const browsers = ['chromium', 'firefox', 'webkit'];

browsers.forEach(browserName => {
  test.describe(`Login - ${browserName}`, () => {
    test(`deve fazer login no ${browserName}`, async ({ page }) => {
      // Implementação
    });
  });
});
```

### 5. Testes Mobile

```typescript
test('deve funcionar em viewport mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });

  const loginPage = new LoginPage(page);
  await loginPage.navigate();

  // Validações específicas mobile
  await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
});
```

### 6. Screenshots e Traces para Debugging

```typescript
test('cenário com evidências', async ({ page }) => {
  await page.goto('/dashboard');

  // Screenshot em ponto específico
  await page.screenshot({ path: 'dashboard-loaded.png' });

  // Screenshot apenas em caso de falha (configurado no playwright.config.ts)
  await expect(page.getByRole('heading')).toBeVisible();
});
```

---

## Diretrizes de Questionamento

### "Onde coloco...?"

1. **Um novo seletor** → `*Locators.ts`
2. **Uma nova ação** → `*Pages.ts`
3. **Um novo teste** → `/tests/e2e/{feature}/`
4. **Dados de teste** → `/fixtures/*.json`
5. **Lógica de API** → `/fixtures/api/index.ts`

### "Como implemento...?"

1. **Teste simples** → Use page objects existentes + padrão AAA
2. **Fluxo complexo** → Crie método orquestrador na classe Page
3. **Validação** → Use `expect` do Playwright com locators semânticos
4. **Setup/Cleanup** → Use API fixtures nos hooks `beforeEach`/`afterEach`

### "Quando usar...?"

1. **beforeEach** → Setup específico do teste (criar dados, autenticar)
2. **API calls** → Preparação de dados (setup) ou limpeza (cleanup)
3. **Page methods** → Ações que podem ser reutilizadas em múltiplos testes
4. **Direct locators** → Apenas dentro de `*Locators.ts`

---

## Priorização de Cenários

### 1. Happy Paths (Prioridade ALTA)
Fluxos principais que usuários seguem com sucesso.

```typescript
test.describe('Login - Happy Path', () => {
  test('deve realizar login com credenciais válidas', async ({ page }) => {
    // Cenário de sucesso
  });
});
```

### 2. Error Handling (Prioridade ALTA)
Cenários de erro que usuários podem encontrar.

```typescript
test.describe('Login - Error Handling', () => {
  test('deve exibir erro ao submeter credenciais inválidas', async ({ page }) => {
    // Cenário de erro
  });
});
```

### 3. Edge Cases (Prioridade BAIXA)
Casos extremos ou menos comuns.

```typescript
test.describe('Login - Edge Cases', () => {
  test('deve lidar com email com caracteres especiais', async ({ page }) => {
    // Cenário de edge case
  });
});
```

---

## Acessibilidade (a11y)

### Apenas para cenários de Login

```typescript
import AxeBuilder from '@axe-core/playwright';

test.describe('Login - Acessibilidade', () => {
  test('deve não ter violações de acessibilidade', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('deve permitir navegação por teclado', async ({ page }) => {
    await page.goto('/login');

    // Tab para email
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Email')).toBeFocused();

    // Tab para senha
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Senha')).toBeFocused();

    // Tab para botão
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeFocused();
  });
});
```

---

## Marcação de Testes (Tags)

Use tags para organizar e filtrar execução:

```typescript
test.describe('Login', () => {
  test('deve fazer login @smoke @critical', async ({ page }) => {
    // Teste crítico de smoke
  });

  test('deve validar formato de email @regression', async ({ page }) => {
    // Teste de regressão
  });

  test('deve testar timeout de sessão @slow', async ({ page }) => {
    // Teste lento
  });
});
```

**Executar por tag:**
```bash
npx playwright test --grep @smoke
npx playwright test --grep @critical
npx playwright test --grep-invert @slow
```

---

## Restrições

- ❌ Não criar lógicas de negócio diretamente na camada de testes
- ❌ Não duplicar código entre Page Objects
- ❌ Não usar seletores CSS frágeis (nth-child, classes geradas)
- ❌ Não ignorar falhas intermitentes sem análise
- ❌ Não fazer múltiplas ações não relacionadas em um teste
- ❌ Não usar `data-testid` quando locators semânticos funcionam

---

## Abordagem de Trabalho (Quando Invocado)

1. **Ler arquivo de cenários** (padrão: `/specs/scenarios/{us-id}-test-cases.md`)
2. **Priorizar Happy Paths** - automatizar primeiro
3. **Automatizar um teste por vez:**
   - Criar `*Locators.ts` com locators semânticos
   - Criar `*Pages.ts` com ações
   - Criar `.spec.ts` com teste usando padrão AAA
   - **Usar Playwright MCP** para capturar locators reais da aplicação
4. **Executar teste** e validar antes de próximo
5. **Acessibilidade:** apenas para cenários de Login
6. **Ao final:** perguntar ao usuário se deseja automatizar outros cenários (Error Handling, Edge Cases)

---

## Exemplo Completo: Fluxo de Login

### 1. LoginLocators.ts
```typescript
import { Page } from '@playwright/test';

export class LoginLocators {
  constructor(private page: Page) {}

  emailInput = () => this.page.getByRole('textbox', { name: /email/i });
  passwordInput = () => this.page.getByRole('textbox', { name: /senha|password/i });
  submitButton = () => this.page.getByRole('button', { name: /entrar|login/i });
  errorMessage = () => this.page.getByText(/credenciais inválidas/i);
  forgotPasswordLink = () => this.page.getByRole('link', { name: /esqueceu a senha/i });
}
```

### 2. LoginPages.ts
```typescript
import { Page } from '@playwright/test';
import { LoginLocators } from './LoginLocators';

export class LoginPage {
  readonly locators: LoginLocators;

  constructor(private page: Page) {
    this.locators = new LoginLocators(page);
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.locators.emailInput().fill(email);
    await this.locators.passwordInput().fill(password);
    await this.locators.submitButton().click();
  }

  async getErrorMessage() {
    return await this.locators.errorMessage().textContent();
  }
}
```

### 3. login-happy-path.spec.ts
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '@/pages/Login/LoginPages';

test.describe('Login - Happy Path', () => {
  test('deve realizar login com credenciais válidas @smoke @critical', async ({ page }) => {
    // ARRANGE
    const loginPage = new LoginPage(page);
    const validCredentials = {
      email: 'user@example.com',
      password: 'ValidPass123!'
    };

    // ACT
    await loginPage.navigate();
    await loginPage.login(validCredentials.email, validCredentials.password);

    // ASSERT
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
```

---

**Fim do Template**
