---
status: completed
filled_at: 2026-02-10T19:00:00Z
---

# Produto

## Descrição do Produto

Hydra é um aplicativo web mobile-first que ajuda pessoas a transformar hidratação diária em rotina e evolui para uma plataforma de engajamento em saúde conectando usuários, profissionais de saúde e marcas de wellness. O produto resolve um dos problemas de saúde mais negligenciados: desidratação crônica — associada a doenças renais, declínio cognitivo e problemas cardiovasculares. O diferencial não é contar copos de água, é construir o hábito de forma sustentável.

**Moat:** Hidratação como rotina. Não competimos em features ou gamificação — competimos na capacidade de fazer o usuário voltar todo dia, sem esforço. A audiência engajada e recorrente cria valor para profissionais e anunciantes.

## Funcionalidades do Produto

### Quick Log
Registro de consumo de água com um toque. Presets configuráveis (200ml, 300ml, 500ml) e opção customizada. Meta: completar o registro em menos de 3 segundos.

### Daily Goal + Progress Ring
Meta diária personalizada (padrão: 2L, ajustável por profissional conectado). Indicador visual circular mostrando progresso em tempo real — quanto falta para atingir a meta do dia.

### Streaks
Contador de dias consecutivos em que o usuário atingiu a meta. Reforço positivo baseado em consistência, não em pontuação. Streak visível na tela principal.

### History
Visualização semanal e mensal dos padrões de hidratação. Permite ao usuário identificar tendências (dias da semana com menor consumo, horários de pico).

### Manage Logs
Edição e exclusão de entradas passadas. Agrupamento por dia com totais. Confirmação antes de deletar.

### Reminders
Notificações opcionais em intervalos configuráveis. O usuário define horário de início, fim e frequência. Push notifications via Web Push API.

### Account & Google Sign-In
Criação de conta via Google OAuth. Migração transparente de dados locais (localStorage) para a nuvem. Sincronização cross-device em tempo real.

### Instagram Story Export
Geração de cards visuais com stats de hidratação (progresso, streak, conquistas). Templates on-brand para compartilhamento direto no Instagram Stories via Web Share API. Motor de crescimento orgânica.

### Achievement Badges
Milestones desbloqueáveis (streak de 7 dias, 30 dias, 100L total). Compartilháveis como story cards. Reforço de engajamento de longo prazo.

### Professional Recommendations
Profissionais de saúde verificados publicam recomendações de hidratação e conteúdo educacional. Cards bite-sized visíveis no feed do usuário. Metas personalizadas por profissional conectado.

### Client Connection
Fluxo de convite: profissional envia link, usuário aceita para compartilhar dados de aderência (agregados, não individuais). Revogável a qualquer momento.

### Ads Platform
Placements nativos e não-intrusivos para marcas de wellness. Aparecem em momentos contextuais (pós-meta atingida, insights semanais). Nunca interrompem o fluxo de logging. Portal self-serve para gestão de campanhas.

### Premium Tier
Experiência sem ads, insights avançados (correlação hidratação × atividade), acesso prioritário a recomendações profissionais.

## Personas

### Usuários

#### Ana — A Profissional de Mesa
32 anos, product designer, trabalha 8h+ sentada. Sabe que não bebe água suficiente, tem dor de cabeça às 15h. Já tentou apps de tracking, sempre abandona em uma semana. Precisa de registro sem fricção e lembretes gentis. Compartilha conquistas no Instagram quando se sente motivada.

#### Lucas — O Construtor de Hábitos
28 anos, engenheiro de software, começou rotina de wellness recentemente. Acompanha sono e exercício, quer adicionar hidratação. Motivado por streaks e consistência. Precisa de meta diária clara e histórico para ver padrões. Segue recomendações de profissionais que confia.

### Profissionais

#### Camila — A Nutricionista
35 anos, nutricionista clínica com 200+ pacientes ativos. Atualmente envia recomendações de hidratação via WhatsApp — sem forma de acompanhar se pacientes seguem. Quer publicar guias baseados em evidência e ver dados agregados de aderência. Valoriza credibilidade e ferramentas profissionais.

#### Rafael — O Personal Trainer
30 anos, personal trainer em academia boutique. Gerencia 40 clientes e sempre lembra de hidratar. Quer definir metas personalizadas baseadas em nível de atividade e peso corporal. Precisa onboardar clientes de forma simples e monitorar adesão sem ser intrusivo.

### Ads Managers

#### Marina — A Brand Manager
29 anos, gerente de marketing em empresa de suplementos wellness. Gerencia campanhas digitais em múltiplas plataformas. Interesse no Hydra pela audiência health-conscious e engajada diariamente. Precisa de dashboard self-serve com segmentação por nível de engajamento, reporting claro e placement brand-safe. Valoriza transparência de performance e qualidade de audiência.

#### Thiago — O Media Buyer de Agência
33 anos, trabalha em agência digital gerenciando campanhas para múltiplas marcas de saúde e fitness. Precisa de gestão bulk de campanhas, A/B testing e analytics detalhado. Quer acesso via API para integração com plataformas existentes. Valoriza eficiência e granularidade de dados.

## Métricas de Sucesso

### Métricas de Produto (Usuários)

| Métrica | Meta |
|---------|------|
| Tempo de registro | < 3 segundos |
| Completar meta diária | 60% dos usuários ativos 4x/semana |
| Retenção 7 dias | > 40% |
| Streak mediana | > 5 dias (usuários retidos) |
| Conversão guest → conta | 50% em 14 dias |
| Share rate (Instagram) | 15% dos usuários/mês |

### Métricas de Profissionais

| Métrica | Meta |
|---------|------|
| Profissionais verificados (6 meses) | 500 |
| Melhora de aderência (clientes conectados) | +30% |
| Publicação de conteúdo | 2+ cards/semana por profissional ativo |

### Métricas de Ads

| Métrica | Meta |
|---------|------|
| CTR em placements contextuais | > 2% |
| Percepção não-intrusiva (survey) | > 70% dos usuários |
| Tempo médio até primeira campanha | < 30 minutos |
