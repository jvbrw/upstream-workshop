## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario eu quero visualizar meus padroes de hidratacao da semana e do mes para que eu possa identificar tendencias e entender meus habitos ao longo do tempo.

### Funcionalidades Principais
- Grafico de barras semanal (7 dias) com linha de meta tracejada
- Visao mensal: calendario heat map de 30 dias com intensidade proporcional ao consumo
- Cards de estatisticas: media diaria, melhor streak, taxa de meta atingida
- Toggle entre visao semanal e mensal
- Barras verdes para dias que atingiram a meta

### Criterios de Aceite Chave
- Grafico reflete dados reais do store (sem mock data)
- Barra do dia atual destacada visualmente
- Dias com meta atingida em verde; dias parciais em cor primaria proporcional
- Stats cards calculados a partir de todo o historico disponivel
- Visao mensal exibe os ultimos 30 dias como calendario heat map

---

## Contexto Detalhado para Agentes

# User Story: History & Weekly Insights

## Declaracao da historia

Como um usuario eu quero visualizar meus padroes de hidratacao da semana e do mes para que eu possa identificar tendencias e entender meus habitos ao longo do tempo.

## Criterios funcionais

- Pagina History (rota `/history`) com 4 secoes:

**1. Period Toggle:**
- Toggle ou tabs para alternar entre "Week" e "Month"
- Default: "Week" (visao semanal)
- Ao trocar, chart e heat map atualizam para o periodo selecionado

**2. Weekly Chart (visivel no modo "Week"):**
- Grafico de barras vertical com 7 colunas (hoje + 6 dias anteriores)
- Cada barra representa o total de ml do dia
- Altura proporcional ao maximo entre os 7 dias e o dailyGoal
- Cores: verde (emerald-500/80) para dias que atingiram meta, primaria para hoje, primaria/40 para dias parciais
- Linha tracejada horizontal na altura correspondente ao dailyGoal
- Label acima de cada barra: volume formatado (Xml ou X.XL); "—" para dias sem dados
- Label abaixo de cada barra: letra do dia da semana (M, T, W, T, F, S, S)
- Dia atual com label em bold

**3. Monthly Heat Map (visivel no modo "Month"):**
- Grid calendario dos ultimos 30 dias
- Cada celula quadrada representa um dia, mostrando o numero do dia do mes
- Cor/opacidade proporcional a intensidade (total/dailyGoal):
  - Sem dados = muted background
  - Parcial = primaria com opacidade variavel (0.4 + intensity * 0.6)
  - Meta atingida = emerald com opacidade alta
- Labels de semana (S, M, T, W, T, F, S) no topo do grid
- Tooltip ou title com data completa e total ao passar o mouse/tocar
- Dias do mes anterior (para completar a primeira semana do grid) exibidos em opacidade reduzida

**4. Stats Cards (grid 3 colunas, sempre visivel):**
- "Avg daily": media de consumo diario calculada sobre todos os dias com dados
- "Best streak": maior sequencia de dias consecutivos com meta atingida
- "Goal rate": percentual de dias com meta atingida (sobre total de dias com dados)
- Stats calculados sobre TODO o historico disponivel (nao limitado ao periodo selecionado)

## Criterios de experiencia do usuario

- Header "History" com subtitulo que muda conforme o periodo: "Last 7 days" / "Last 30 days"
- Toggle Week/Month com visual de tabs ou segmented control compacto
- Charts puramente CSS/HTML (sem biblioteca de graficos) para manter bundle leve
- Barras com transicao de altura (duration-500) ao montar o componente
- Cards com hierarquia visual clara: numero grande + label pequeno
- Heat map mensal como calendario minimalista e legivel
- Em `prefers-reduced-motion`, desabilitar animacoes de barra
- Transicao suave ao alternar entre Week e Month

## Testes regressivos

- US-001: Aba History no navigation deve levar a esta pagina
- US-002: Dados devem vir do store persistido (nao mock data)
- US-003: Logs adicionados no Today devem ser refletidos ao navegar para History
- US-005: "Best streak" nos stats deve ser consistente com streak calculado

## Criterios para QA

- Padroes de qualidade: Calculos corretos, renderizacao fluida, responsivo
- Cenarios de teste:
  - Caminho feliz: Usuario na visao Week com 7 dias de dados ve chart preenchido, stats calculados
  - Caminho feliz: Usuario alterna para Month — heat map de 30 dias renderiza corretamente
  - Caminho feliz: Usuario adiciona log hoje e navega para History — barra do dia e celula do heat map atualizados
  - Caminho alternativo: Usuario novo (sem dados) — barras vazias, heat map muted, stats zerados
  - Caminho alternativo: Usuario com apenas 3 dias de dados — chart mostra dias vazios, heat map mostra 3 dias coloridos, stats sobre 3 dias
  - Caminho alternativo: Dia com consumo acima da meta (150%) — barra proporcional, celula verde no heat map
  - Caminho alternativo: Mes com poucos dados (primeira semana de uso) — heat map mostra maioria muted, dias recentes coloridos
  - Testes nao-funcionais: Renderizacao com 200+ logs (30 dias) nao deve causar jank (< 16ms frame time)
- Homologacao: Testar layout do grid em viewports 320px-448px; verificar que barras e celulas nao transbordam; testar toggle em touch devices

## Criterios de aceitacao

- Validacao completa do fluxo: chart semanal, heat map mensal, stats e toggle renderizam corretamente com dados reais
- Toggle Week/Month funcional e responsivo
- Chart semanal proporcional (barra mais alta = maximo do periodo ou dailyGoal)
- Heat map mensal com 30 dias, intensidade visual proporcional, labels de semana
- Stats calculados corretamente: avg, best streak, goal rate (sobre historico total)
- Sem biblioteca de graficos externa (CSS/SVG puro)
- Prototipo de referencia: `/lab/hydra-mvp` (HistoryView component — weekly chart como base; monthly view e nova funcionalidade)
