# BossaBox AI Framework

Este template reúne os ativos necessários para executar o ecossistema de agentes da BossaBox. Ele serve como ponto de partida para novos projetos ou projetos existentes, garantindo que cada papel tenha comandos, workflows e documentação consistentes.

## Instalação

### Instalação Rápida com NPX (Recomendado)

Execute o comando abaixo no diretório onde deseja instalar o framework:

```bash
npx ai-framework-bossabox-labs
```

Este comando irá:
- ✅ Copiar toda a estrutura `.claude/` com agentes, comandos e templates
- ✅ Criar diretórios vazios: `codebases/`, `implementations/`, `logs/`, `outputs/`, `resources/`
- ✅ Copiar arquivos de configuração (`.gitignore`, `README.md`)
- ✅ Incluir arquivos warmup de exemplo (`warmup-product.md`, `warmup-project.md`, `warmup-tech.md`)
- ✅ Incluir sistema completo de observabilidade

**Próximos passos após instalação:**
1. Copiar suas bases de código para `./codebases/`
2. Personalizar os arquivos `warmup-*.md` para seu projeto (ou usar os comandos `/create-warmup-*` para recriá-los)
3. Seguir o fluxo de trabalho (veja seção [Fluxo de Trabalho](#fluxo-de-trabalho))

### Instalação Manual (Alternativa)

Se preferir, você também pode clonar o repositório diretamente:

```bash
git clone git@github.com:BossaBox-Labs/ai-framework.git
cd ai-framework
```

Depois, copie as bases de códigos para a pasta `./codebases/`.

## Fluxo de Setup

É obrigatório concluir o setup antes de iniciar qualquer iniciativa. Os artefatos gerados neste momento alimentam os agentes ao longo de todo o ciclo de desenvolvimento.

### 1. Arquivos de Warmup

O setup inicial é organizado em três artefatos obrigatórios:
- **Warmup product**: descreve a visão do produto e suas funcionalidades principais.
- **Warmup project**: consolida guardrails, padrões de qualidade e processos do time.
- **Warmup tech**: registra o panorama técnico das codebases envolvidas.

**IMPORTANTE: execute o fluxo completo de setup antes de qualquer outro comando.**

#### 1.1 Warmup 
- Comando: `/warmup`
Gera o arquivo `warmup-project.md` conduzindo o usuário por perguntas estruturadas. O agente valida existência de versões anteriores, aplica modos mínimo ou completo e produz um resumo com estatísticas de preenchimento.
Produz o arquivo `warmup-product.md` a partir de uma entrevista interativa. O fluxo trata confirmações de sobrescrita, coleta informações de visão e mapeia funcionalidades com contagem dinâmica.
Responsável por gerar `warmup-tech.md`, combinando análise automática de codebases com um modo guiado quando não há bases de código mapeadas. O agente valida diretórios, consolida fontes e aplica uma revisão humana do Tech Lead antes de concluir.

## Fluxo de Trabalho

O roteiro a seguir descreve o encadeamento recomendado dos papéis, começando pelo setup e destacando os comandos principais de cada etapa.

1. **Setup** - Executar Fluxo de Setup mencionado previamente
2. **Trabalhar em uma iniciativa:**
   - `/initiative-start <iniative>`: classifica a iniciativa, valida o warmup-tech e, se necessário, dispara o comando `/create-warmup-tech` para gerar o arquivo `warmup-tech.md`. Ao final, aciona automaticamente o fluxo de User Stories (`/create-us`).
3. **Criação das Histórias de Usuário**
   - Após a classificação da demanda ser finaliza, conforme passo anterior, o comando `/create-us` é acionado parar gerar, validar e coletar aprovação das User Stories usando o setup de arquivos warmups criados anteriormente e contextos estruturados.
   - **Output**: As histórias são escritas em arquivos MDs na pasta implementations.

## Próximos Passos:

4. **Refinamento das Histórias de Usuário**
   - Com as histórias de usuários escritas nos passos anteriores. Devemos rodar o comando `/refinement` que converte uma US específica em um pacote DoR, com geração de tasks, checagem de cobertura e quebra de tarefa em backend e frontend.
   - **Output**: tarefas refinadas são escritas na pasta implementations.
5. **Implementação das tarefas refinadas**
   - Baseado nas histórias de usuários e tarefas refinadas, o comando `/implement` orquestra a execução da US, planejando tarefas, conduzindo implementação BE/FE com TDD e consolidando resultados.
   - **Output**: alteração direta no código das codebases informadas nas etapas anteriores.
6. **QA**
   - `/qa-test`: cria cenários E2E no formato Given-When-Then e automações Playwright opcionais, apresentando métricas e arquivos gerados em `output/qa/`.

## Estrutura de Diretórios

```
template/
├── .claude/
│   ├── agents/         # Definições de agentes especializados
│   ├── commands/       # Comandos slash disponíveis
│   ├── observability/  # Sistema de telemetria e logs
│   └── templates/      # Modelos de documentos base
├── implementations/    # Código implementado durante as execuções
├── logs/               # Logs de execução
├── outputs/            # Artefatos gerados (specs, USs, relatórios)
└── resources/          # Recursos de entrada (contextos, specs, anexos)
```

## Observações

- Todos os artefatos gerados ficam concentrados em `outputs/`.
- Os logs de execução ficam disponíveis em `logs/`.
- O framework mantém contexto entre comandos via memória compartilhada entre agentes.
