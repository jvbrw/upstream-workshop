## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario eu quero ver meus dias consecutivos de meta atingida para que eu me sinta motivado a manter o habito de hidratacao.

### Funcionalidades Principais
- Contador de streak: dias consecutivos em que a meta diaria foi alcancada
- Badge no header do Today com icone de fogo e contagem
- Logica: conta de ontem para tras; hoje conta se meta ja atingida
- Streak visivel apenas quando > 0

### Criterios de Aceite Chave
- Streak calcula corretamente a partir dos logs persistidos
- Streak atualiza em tempo real ao atingir a meta do dia
- Badge desaparece quando streak e 0
- Streak sobrevive entre sessoes (derivado dos logs persistidos)

---

## Contexto Detalhado para Agentes

# User Story: Streak Tracking

## Declaracao da historia

Como um usuario eu quero ver meus dias consecutivos de meta atingida para que eu me sinta motivado a manter o habito de hidratacao.

## Criterios funcionais

- Logica de calculo de streak:
  1. Agrupar todos os logs por dia (date string YYYY-MM-DD)
  2. Somar amount por dia
  3. Se hoje ja atingiu meta: comecar contagem a partir de hoje (dia 0)
  4. Se hoje ainda nao atingiu: comecar a partir de ontem (dia 1)
  5. Contar dias consecutivos para tras onde total >= dailyGoal
  6. Parar na primeira falha (dia sem meta atingida ou sem logs)
- Streak exibido como Badge no header da pagina Today:
  - Icone RiFireLine (laranja, 16px)
  - Texto: "X day" (singular) ou "X days" (plural)
  - Variante secondary com padding horizontal 12px
- Streak visivel APENAS quando > 0 (sem badge para streak 0)
- Streak e derivado dos logs (computed, nao armazenado separadamente)
- Hook `useStreak` ou selector do Zustand store encapsula a logica

## Criterios de experiencia do usuario

- Ao atingir a meta do dia, o streak deve atualizar instantaneamente (sem refresh)
- Se o usuario deleta um log que o levava abaixo da meta de um dia anterior, o streak deve recalcular
- Badge deve ser discreto e nao competir visualmente com o progress ring
- Streak incentiva consistencia — nunca deve mostrar mensagens negativas ao perder o streak

## Testes regressivos

- US-002: Streak deve ser derivado dos logs persistidos; ao reabrir o app, streak correto
- US-003: Ao adicionar log que faz total do dia >= meta, streak deve atualizar
- US-004: Badge de streak no header deve coexistir com o progress ring

## Criterios para QA

- Padroes de qualidade: Calculo correto para todos os edge cases, reativo, acessivel
- Cenarios de teste:
  - Caminho feliz: Usuario com 5 dias consecutivos de meta atingida ve "5 days"
  - Caminho feliz: Usuario atinge meta hoje — streak incrementa de 5 para 6
  - Caminho feliz: Usuario com 1 dia de streak ve "1 day" (singular)
  - Caminho de insucesso: Usuario nao atingiu meta ontem — streak volta a 0 (ou 1 se atingiu hoje)
  - Caminho alternativo: Usuario novo sem historico — sem badge visivel
  - Caminho alternativo: Usuario deleta log que fazia dia anterior atingir meta — streak recalcula
  - Caminho alternativo: Gap de 1 dia entre dois periodos — streak conta apenas o periodo recente
  - Testes nao-funcionais: Streak deve calcular em < 10ms mesmo com 365 dias de dados
- Homologacao: Verificar timezone handling (virada de dia deve respeitar timezone local)

## Criterios de aceitacao

- Validacao completa do fluxo: streak calculado corretamente em todos os cenarios
- Streak reativo: atualiza ao adicionar, editar ou deletar logs
- Badge exibido apenas quando streak > 0
- Singular/plural correto ("1 day" vs "X days")
- Streak sobrevive entre sessoes (derivado de logs persistidos)
- Sem impacto perceptivel em performance (calculo eficiente)
- Prototipo de referencia: `/lab/hydra-mvp` (calculateStreak function + Badge in TodayView)
