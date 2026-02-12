# Test Cases: [Nome da User Story]

**US-ID:** [ID da User Story]
**Feature:** [Nome da Feature]
**Data:** [Data de Criação]

---

## Rastreabilidade de Critérios de Aceite

| ID Critério | Descrição | Cenários de Teste | Status |
|-------------|-----------|-------------------|--------|
| CA-{us_id}-01 | [Texto do critério 1] | TC-{us_id}-XX, TC-{us_id}-YY | ✅ Coberto |
| CA-{us_id}-02 | [Texto do critério 2] | TC-{us_id}-ZZ | ✅ Coberto |
| CA-{us_id}-03 | [Texto do critério 3] | - | ⚠️ Não Coberto |

**Cobertura de Critérios:** X/Y (Z%)

---

## Cenário: [Nome do Cenário 1]

**ID:** TC-{us_id}-01
**Tipo:** Happy Path | Edge Case | Error Handling
**Prioridade:** Alta | Média | Baixa
**Critério(s) Validado(s):** CA-{us_id}-XX

### Descrição
Breve descrição do que este cenário valida.

### Pré-condições
- [Condição necessária 1]
- [Condição necessária 2]

### Fluxo de Teste

```
Dado: [Estado inicial ou contexto]
Quando: [Ação executada pelo usuário]
Então: [Resultado esperado principal]
E: [Validação adicional 1]
E: [Validação adicional 2]
```

### Dados de Teste
- **Input:** [Dados de entrada específicos]
- **Expected Output:** [Saída esperada]

### Validações Específicas
- [ ] [Validação técnica 1]
- [ ] [Validação técnica 2]
- [ ] [Validação de UI/UX]
- [ ] [Validação de acessibilidade, se aplicável]

---

## Cenário: [Nome do Cenário 2]

**ID:** TC-{us_id}-02
**Tipo:** Happy Path | Edge Case | Error Handling
**Prioridade:** Alta | Média | Baixa
**Critério(s) Validado(s):** CA-{us_id}-XX

### Descrição
Breve descrição do que este cenário valida.

### Pré-condições
- [Condição necessária 1]
- [Condição necessária 2]

### Fluxo de Teste

```
Dado: [Estado inicial ou contexto]
Quando: [Ação executada pelo usuário]
Então: [Resultado esperado principal]
E: [Validação adicional 1]
E: [Validação adicional 2]
```

### Dados de Teste
- **Input:** [Dados de entrada específicos]
- **Expected Output:** [Saída esperada]

### Validações Específicas
- [ ] [Validação técnica 1]
- [ ] [Validação técnica 2]
- [ ] [Validação de UI/UX]

---

## Cenário: [Nome do Cenário 3 - Error Handling]

**ID:** TC-{us_id}-03
**Tipo:** Error Handling
**Prioridade:** Alta | Média | Baixa
**Critério(s) Validado(s):** CA-{us_id}-XX

### Descrição
Breve descrição do cenário de erro que está sendo validado.

### Pré-condições
- [Condição necessária 1]
- [Condição necessária 2]

### Fluxo de Teste

```
Dado: [Estado inicial com condição de erro]
Quando: [Ação que causa o erro]
Então: [Mensagem de erro clara deve ser exibida]
E: [Formulário deve manter entrada do usuário]
E: [Usuário deve conseguir corrigir e reenviar]
```

### Dados de Teste
- **Input Inválido:** [Dados que causam erro]
- **Expected Error:** [Mensagem de erro esperada]

### Validações Específicas
- [ ] [Mensagem de erro é clara e acionável]
- [ ] [Estado da aplicação permanece consistente]
- [ ] [Dados do usuário não são perdidos]
- [ ] [Possibilidade de correção e retry]

---

## Notas de Implementação

### Considerações para Playwright
- [Locators recomendados para este fluxo]
- [Estados assíncronos a serem aguardados]
- [Interações específicas necessárias]

### Dados de Setup
- [Dados que precisam ser criados antes dos testes]
- [Estados iniciais da aplicação]
- [Configurações específicas]

### Cleanup
- [Dados a serem removidos após os testes]
- [Estados a serem resetados]
