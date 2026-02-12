---
status: pending  # pending | completed
filled_at: null  # null ou ISO 8601 timestamp (ex: 2025-11-04T14:30:00Z)
---

# Technical Specification (Warmup Tech)

<!--
TEMPLATE METADATA:
- template_version: 2.0
- last_updated: 2025-10-30
- total_sections: 12
- total_required_bullets: ~67 (contar durante parsing)
- template_id: warmup-tech-template-v2.0
- language: pt-BR
- format: markdown + xml tags

INSTRUÇÕES PARA O GENERATOR:
- Remover TODOS os comentários XML (<!-- ... -->) do arquivo final
- Remover TODAS as tags XML (<tag>...</tag>) do arquivo final
- Manter APENAS o conteúdo markdown puro
- Preencher seções Information Sources e Thinking Transparency ao final
- Aplicar hierarquia de 3 níveis: ### Título → **Subtema** → - Bullets
- GARANTIR 100% DE COBERTURA: Todos bullets devem ser processados (preenchidos ou marcados 🔴 GAP)
  -->

## Current Technical State

### Existing System Analysis
<current_technical_state>
- Stack tecnológico e versões (existentes ou planejadas)
- Arquitetura, padrões e organização de código (atuais ou propostos)
- Débito técnico, gaps de segurança e gargalos de performance (se aplicável)
  </current_technical_state>

### Codebase Analysis Results
<codebase_analysis>
- **Stack e Dependências**: Linguagens, frameworks, versões, bibliotecas
- **Arquitetura e Organização**: Padrões arquiteturais, estrutura de diretórios, convenções de nomenclatura
- **Testing e Deploy**: Frameworks de teste, cobertura, ferramentas de build e configuração de deployment
  </codebase_analysis>

### Architecture Diagrams
<architecture_diagrams>
[Insert Mermaid diagrams when applicable to document current architecture, data flows, and component relationships]
</architecture_diagrams>

### Legacy Dependencies and Technical Debt
<legacy_dependencies>
- **Componentes Legacy e Débito Técnico**: Componentes a modernizar, áreas a refatorar (se aplicável)
- **Dependências e Segurança**: Bibliotecas desatualizadas, vulnerabilidades identificadas (se aplicável)
- **Performance**: Gargalos de performance identificados (se aplicável)
  </legacy_dependencies>

## Technical Context and Scope

### Technical Context
<technical_context>
- Contexto de negócio traduzido para requisitos técnicos
- Limitações técnicas atuais (se existentes) e premissas de arquitetura
- Escopo técnico baseado na análise e requisitos de integração/evolução
  </technical_context>

## Non-Functional Requirements

### Performance
<nfr_performance>
- **Tempo de Resposta**: Requisitos de latência para APIs/páginas (ex: p95 < 200ms para endpoints críticos)
- **Throughput**: Capacidade de processamento (requisições/segundo, transações/minuto)
- **Escalabilidade**: Estratégia de escalonamento (horizontal/vertical), limites de capacidade
- **Otimizações**: Caching strategy, CDN usage, database query optimization, bundle size targets
- **Resource Utilization**: CPU, memória, storage limits e monitoring
  </nfr_performance>

### Security
<nfr_security>
- **Autenticação**: Mecanismos de autenticação (OAuth, JWT, session-based, MFA)
- **Autorização**: Controle de acesso (RBAC, ABAC), permissões granulares
- **Validação e Sanitização**: Input validation, output encoding, proteção contra injection (SQL, XSS, CSRF)
- **Encriptação**: Dados em trânsito (TLS/SSL), dados em repouso (encryption at rest), key management
- **Auditoria**: Logging de ações sensíveis, audit trails, compliance requirements
- **Vulnerabilidades**: Dependency scanning, OWASP Top 10 compliance, security headers
  </nfr_security>

### Reliability
<nfr_reliability>
- **Disponibilidade**: SLA targets (ex: 99.9% uptime), downtime tolerance
- **Resiliência**: Fault tolerance, graceful degradation, fallback mechanisms
- **Recovery**: Backup strategy, RTO (Recovery Time Objective), RPO (Recovery Point Objective)
- **Error Handling**: Error handling patterns, retry logic, circuit breakers
- **Data Integrity**: Validation rules, consistency guarantees, transaction management
- **Monitoring**: Health checks, alerting thresholds, incident response
  </nfr_reliability>

### Accessibility
<nfr_accessibility>
- **WCAG Compliance**: Nível de conformidade (A, AA, AAA) e diretrizes aplicadas
- **Screen Readers**: Suporte para leitores de tela, ARIA labels, semantic HTML
- **Keyboard Navigation**: Navegação completa via teclado, focus management, skip links
- **Visual**: Contraste de cores, tamanho de fonte ajustável, responsive design
- **Cognitive**: Simplicidade de interface, mensagens de erro claras, help text
- **Testing**: Ferramentas de teste (axe, WAVE), automated accessibility checks
  </nfr_accessibility>

### Compliance
<nfr_compliance>
- **Regulatório**: LGPD/GDPR, HIPAA, PCI-DSS, SOX, outras regulamentações aplicáveis
- **Data Privacy**: Consentimento de usuários, direito ao esquecimento, portabilidade de dados
- **Retention Policies**: Políticas de retenção de dados, anonymization, data deletion
- **Audit Requirements**: Logs de auditoria, relatórios de compliance, certificações necessárias
- **Geographic**: Data residency requirements, cross-border data transfer restrictions
  </nfr_compliance>

## Macro Architecture & Infrastructure Planning

### Architectural Vision
<macro_architecture>
- Estilo arquitetural e componentes principais com responsabilidades
- Fluxos de dados, padrões de integração e setup de infraestrutura
- Estratégia de evolução (para sistemas existentes) ou implementação (para novos sistemas)
  </macro_architecture>

## Security Patterns

### Mandatory Patterns
<security_patterns>
- IAM (Identity and Access Management)
- Proteção de dados (in transit e at rest), auditoria e monitoring
- Compliance requirements (PCI, ISO, SOC2, etc.)
  </security_patterns>

## Code Patterns and File Structure

### Engineering Best Practices
<code_patterns>
- Linguagens, frameworks e estrutura de repositório
- Code conventions (lint, style guides) e políticas de code review
- Estratégia de testing automatizado (unit, integration, E2E) e cobertura
  </code_patterns>

## Technologies and Tools

### Technology Stack
<technologies_tools>
- Stack (linguagens, frameworks, bibliotecas com versões)
- Build, package tools, version control e branching strategy
- QA tools, test automation e critérios de avaliação/modernização
  </technologies_tools>

## Observability

### Monitoring and Metrics
<observability>
- Métricas de negócio e técnicas (atuais ou planejadas)
- Estratégia de logging, log levels, alerts e notifications
- Observability tools (Grafana, Kibana, Datadog, etc.) e arquitetura de monitoring
</observability>

## External Integrations & Dependencies

### External Systems
<external_integrations>
- Third-party APIs, external databases/repositories e messaging services
- Dependências críticas de negócio
- Arquitetura e padrões de integração (atuais ou planejados)
  </external_integrations>

## Environments (Dev, Staging, Prod, etc.)

### Environment Definition
<environments>
- Ambientes (dev, staging, prod), setup/configuration e diferenças
- Test data strategy, anonymization, access policies e isolation
- Environment provisioning automation (existente ou planejado)
</environments>

## Deployment Flow & Continuous Delivery (CI/CD)

### Deployment Pipeline
<deployment_flow>
- CI/CD strategy (GitHub Actions, GitLab CI, Jenkins, etc.) e setup
- Automated tests in pipeline, approvals strategy e rollback strategies
- Versioning, tagging policies e Infrastructure as Code
  </deployment_flow>

---

## Human Knowledge

<!--
INSTRUÇÕES: Esta seção contém conhecimento tácito coletado diretamente de stakeholders.
Estrutura livre - o agent organiza conforme necessidade usando Markdown.
NÃO usa classificação 🟢🟡🔴 pois é conhecimento humano validado diretamente.
PROIBIDO inventar ou adicionar informações não fornecidas pelo usuário.
-->

<human_knowledge>
[Conhecimento tácito coletado de stakeholders. Pode incluir:
- Componentes críticos do sistema e suas justificativas
- Fluxos de negócio importantes
- Pontos de atenção e armadilhas conhecidas
- Decisões arquiteturais não documentadas
- Dicas importantes para os agentes]
</human_knowledge>

---

## Information Sources

### Documents Analyzed
<documents_analyzed>
- Lista de arquivos de recursos analisados com caminhos completos
- Product Spec: [Encontrado/Não encontrado] - [Caminho se encontrado]
- Outros documentos técnicos analisados
  </documents_analyzed>

### Codebase Analysis
<codebase_analysis_summary>
- **Codebases analisados**: Lista de diretórios analisados (se aplicável)
- **Total de arquivos escaneados**: Número total de arquivos de código (se aplicável)
- **Linguagens identificadas**: Linguagens primárias por codebase (se aplicável)
- **Frameworks detectados**: Lista de frameworks identificados (se aplicável)
  </codebase_analysis_summary>

### External References
<external_references>
- Documentação externa consultada (se aplicável)
- Links para APIs, bibliotecas, frameworks mencionados
- Outras fontes de informação utilizadas
  </external_references>

---
