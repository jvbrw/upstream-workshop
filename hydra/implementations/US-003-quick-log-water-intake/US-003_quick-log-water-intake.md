## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario eu quero registrar meu consumo de agua com um toque usando quantidades predefinidas ou um valor customizado para que eu possa acompanhar minha hidratacao em menos de 3 segundos.

### Funcionalidades Principais
- Botoes de preset (200ml, 300ml, 500ml) para log com um toque
- Botao "+" para entrada de valor customizado (1-5000ml)
- Feedback visual imediato ao registrar (+Xml bounce animation)
- Lista de entradas do dia com horario de cada registro

### Criterios de Aceite Chave
- Do toque no botao ao feedback visual: menos de 3 segundos
- Valor customizado validado (1-5000ml) com campo numerico focado automaticamente
- Entradas do dia aparecem em ordem cronologica reversa (mais recente primeiro)
- Cada registro e persistido imediatamente no store

---

## Contexto Detalhado para Agentes

# User Story: Quick Log Water Intake

## Declaracao da historia

Como um usuario eu quero registrar meu consumo de agua com um toque usando quantidades predefinidas ou um valor customizado para que eu possa acompanhar minha hidratacao em menos de 3 segundos.

## Criterios funcionais

- Secao "Quick log" na pagina Today (rota `/`) com grid de 4 botoes: 3 presets + 1 botao custom (+)
- Presets default: 200ml, 300ml, 500ml (valores vindos do store, configuraveis via Settings)
- Cada botao de preset exibe o valor em fonte bold + "ml" em texto menor abaixo
- Botao "+" abre inline card com: input numerico, botao confirmar (check), botao cancelar (X)
- Input customizado: type number, range 1-5000, autoFocus ao abrir, valor default 350
- Ao registrar (preset ou custom): cria HydrationLog no store com amount + timestamp atual
- Feedback visual: badge "+Xml" com animacao bounce aparece por 1.5 segundos sobre o progress ring
- Lista "Today's entries" abaixo do quick log mostrando todas as entradas do dia
- Cada entrada mostra: amount (ex: "300ml") e horario (ex: "9:45 AM")
- Entradas ordenadas por timestamp descendente (mais recente primeiro)
- Filtro de entradas: apenas logs com timestamp >= 00:00 do dia atual

## Criterios de experiencia do usuario

- Botoes de preset com altura 48px (h-12), texto grande e legivel
- Toque no preset deve registrar imediatamente (sem confirmacao adicional)
- Ao abrir custom input, foco automatico no campo numerico
- Input custom pode ser confirmado via botao check OU pressionando Enter
- Cancelar custom input via botao X ou ESC fecha o card e volta ao estado normal
- Custom input nao deve aceitar valores negativos, zero, ou acima de 5000
- Se usuario tenta confirmar valor invalido, campo deve ter indicacao visual de erro

## Testes regressivos

- US-001: Navegacao deve continuar funcionando; quick log aparece apenas na aba Today
- US-002: Cada log registrado deve persistir no localStorage via Zustand store

## Criterios para QA

- Padroes de qualidade: Tempo de log < 3 segundos, touch targets 44x44px, acessibilidade AA
- Cenarios de teste:
  - Caminho feliz: Usuario toca "300" — log criado, feedback visual, entrada aparece na lista
  - Caminho feliz: Usuario abre custom, digita "750", confirma — log criado com 750ml
  - Caminho feliz: Usuario registra multiplos logs em sequencia rapida — todos aparecem na lista
  - Caminho de insucesso: Usuario tenta confirmar custom com valor 0 — nao deve criar log
  - Caminho de insucesso: Usuario tenta confirmar custom com valor 6000 — nao deve criar log
  - Caminho alternativo: Usuario abre custom, cancela com ESC — nenhum log criado
  - Caminho alternativo: Usuario confirma custom pressionando Enter
  - Testes nao-funcionais: Medir tempo do toque ao feedback visual (meta < 300ms)
- Homologacao: Testar input numerico em teclado mobile (iOS/Android devem abrir teclado numerico)

## Criterios de aceitacao

- Validacao completa do fluxo: registro via preset e via custom, com persistencia confirmada
- Tempo do toque ao feedback visual < 300ms (perceived performance)
- Todos os botoes de quick log possuem touch target >= 44x44px
- Input customizado abre teclado numerico em dispositivos mobile
- Feedback "+Xml" visivel por 1.5 segundos e desaparece automaticamente
- Lista de entradas do dia atualiza imediatamente apos cada registro
- Prototipo de referencia: `/lab/hydra-mvp` (TodayView component)
