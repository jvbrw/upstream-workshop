## 🧑‍💼 Spec para Humanos

> ⚠️ **Humano, você pode ler apenas esta seção, o resto é contexto adicional para os agentes. Caso você decida fazer alteração, faça através do agente para que ela seja refletida em todas as seções.**

- **Tarefa:** [Nome descritivo] ([BE|FE])
- **Objetivo:** [Uma frase clara]
- **Tópicos:**
  - [Tópico 1]: [descrição breve]
  - [Tópico 2]: [descrição breve]
- **Dependências:** [serviço/lib 1], [serviço/lib 2]
- **Validação:** [cenário 1], [cenário 2]

---

## 🤖 Contexto Detalhado para Agentes

## Bloco 1: O Quê? (Descrição)

| Item | Descrição | Por que é importante para a IA? |
|:---|:---|:---|
| 1. Objetivo Técnico Explícito | Descreve a meta técnica específica e concisa. Ex: "Refatorar o handler CGERequesterHandler para gerenciar as respostas da pessoa-api com base no número de registros CGE." | A IA precisa de uma instrução clara e direta que resuma a intenção do código a ser gerado. |
| 2. Decomposição em Cenários | Quebra a lógica de negócio em cenários de comportamento independentes e detalhados (ex: Cenário A - Lista Vazia, Cenário B - 1 Registro). | Permite que a IA construa a lógica de forma incremental e focada, tratando cada branch(if/else) do código como um bloco separado. |
| 3. Critérios de Aceite por Cenário | Para cada cenário, lista as ações obrigatórias e os resultados esperados de forma inequívoca. | Funciona como um sub-requisito detalhado, garantindo que todas as condições e validações de cada cenário sejam implementadas. |

## Bloco 2: Como? (Implementação)

| Item | Descrição | Por que é importante para a IA? |
|:---|:---|:---|
| 4. Código de Referência | (O mais importante) Inclui trechos do código existente que serão modificados ou que servirão de contexto. Identifica arquivos, classes e métodos relevantes. | Fornece o contexto mais rico possível. A IA aprende o estilo de código, a arquitetura local, as variáveis disponíveis e onde exatamente inserir a nova lógica. |
| 5. Contratos e Estruturas de Dados | Detalha os contratos de API (Request/Response, Status Codes) e fornece exemplos concretos de payloads JSON, objetos ou estruturas de dados. | Elimina a ambiguidade sobre o formato dos dados de entrada e saída, prevenindo erros de serialização/deserialização. |
| 6. Dependências e Interações | Mapeia claramente as dependências externas (outras APIs, serviços, bibliotecas) e internas (outros módulos, services, repositories). | Informa à IA quais "ferramentas" ela tem à sua disposição (ex: BoletaService, CgeService) e como elas devem ser chamadas. |
| 7. Requisitos Não-Funcionais | Especifica restrições de performance (ex: < 500ms), segurança, ou uso de recursos. Inclui diretrizes sobre logging e tratamento de erros. | Garante que o código gerado não apenas funcione, mas que atenda aos padrões de qualidade e resiliência da aplicação. |

## Bloco 3: Como Validar? (Validação)

| Item | Descrição | Por que é importante para a IA? |
|:---|:---|:---|
| 8. Cenários de Teste (BDD) | Escreve cenários de teste no formato Given-When-Then (Dado-Quando-Então) para cada cenário de comportamento. | Serve como uma especificação final do comportamento esperado e pode ser usado pela IA para gerar os testes unitários ou de integração, garantindo a qualidade e a corretude do código. |
