## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario eu quero que meus dados de hidratacao sejam salvos automaticamente entre sessoes para que eu nunca perca meu historico ao fechar o app ou reiniciar o navegador.

### Funcionalidades Principais
- Persistencia automatica de todos os logs de hidratacao no localStorage
- Dados rehydratados ao abrir o app (sem tela de loading)
- Validacao de integridade ao carregar dados (reset gracioso se corrompidos)
- Meta diaria padrao de 2000ml configuravel

### Criterios de Aceite Chave
- Ao fechar e reabrir o app, todos os logs anteriores estao presentes
- Se localStorage indisponivel (modo incognito), app funciona com aviso
- Dados corrompidos sao detectados e resetados com aviso ao usuario
- Presets padrao (200ml, 300ml, 500ml) disponiveis desde o primeiro uso

---

## Contexto Detalhado para Agentes

# User Story: Hydration Data Persistence

## Declaracao da historia

Como um usuario eu quero que meus dados de hidratacao sejam salvos automaticamente entre sessoes para que eu nunca perca meu historico ao fechar o app ou reiniciar o navegador.

## Criterios funcionais

- Zustand store (`useHydrationStore`) com persist middleware salvando no localStorage
- Estado persistido inclui: logs (HydrationLog[]), dailyGoal (number), presets (number[])
- HydrationLog type: `{ id: string, amount: number, timestamp: string }`
- Ao abrir o app, store rehydrata do localStorage automaticamente (Zustand persist pattern)
- Valores padrao: dailyGoal = 2000, presets = [200, 300, 500]
- Funcoes do store: addLog, deleteLog, editLog, setDailyGoal, setPresets
- Validacao de schema ao carregar dados do localStorage: se estrutura invalida, resetar para defaults e exibir toast de aviso
- Se localStorage indisponivel, app deve funcionar em modo ephemeral (session only) com banner de aviso
- Cada log recebe ID unico baseado em timestamp (`log-${Date.now()}`)

## Criterios de experiencia do usuario

- Salvamento e automatico e invisivel — usuario nunca precisa clicar "salvar"
- Ao abrir o app pela primeira vez, estado inicial limpo (sem mock data — diferente do prototipo)
- Se dados sao resetados por corrupcao, exibir notificacao clara: "Seus dados foram resetados devido a um problema. Desculpe pelo inconveniente."
- Se localStorage indisponivel, exibir banner persistente no topo: "Seus dados nao serao salvos nesta sessao. Use um navegador regular para manter seu historico."
- Nenhum loading state visivel durante rehydratacao — o store deve estar pronto antes do primeiro render

## Testes regressivos

- US-001: Navegacao entre abas deve continuar funcionando apos adicionar o store

## Criterios para QA

- Padroes de qualidade: Dados persistem corretamente, zero data loss em uso normal
- Cenarios de teste:
  - Caminho feliz: Usuario adiciona 3 logs, fecha o browser, reabre — 3 logs presentes
  - Caminho feliz: Usuario edita um log, fecha, reabre — edicao preservada
  - Caminho feliz: Usuario deleta um log, fecha, reabre — log removido permanentemente
  - Caminho de insucesso: localStorage cheio — app deve tratar erro graciosamente
  - Caminho de insucesso: Dados corrompidos manualmente no DevTools — app reseta e avisa
  - Caminho alternativo: Modo incognito (localStorage pode ser limitado) — app funciona sem persistencia
  - Testes nao-funcionais: localStorage nao deve exceder 100KB para uso normal de 1 ano
- Homologacao: Testar em Safari iOS (localStorage pode ser purgado apos 7 dias sem uso), Chrome, Firefox

## Criterios de aceitacao

- Validacao completa do fluxo: CRUD de logs (add, edit, delete) persiste entre sessoes
- dailyGoal e presets persistem entre sessoes
- App funciona (sem crash) quando localStorage esta indisponivel
- Dados corrompidos sao detectados e tratados sem crash
- Store rehydrata sem causar flash de conteudo vazio (hydration mismatch)
- Prototipo de referencia: `/lab/hydra-mvp` — domain types e store actions devem cobrir todas as operacoes do prototipo
