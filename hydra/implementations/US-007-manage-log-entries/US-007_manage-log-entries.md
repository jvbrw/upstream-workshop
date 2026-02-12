## Spec para Humanos

> **Humano, voce pode ler apenas esta secao, o resto e contexto adicional para os agentes.**

### Historia

Como um usuario eu quero editar e excluir registros passados de hidratacao agrupados por dia para que eu possa corrigir erros no meu historico.

### Funcionalidades Principais
- Entradas agrupadas por dia (Today, Yesterday, data formatada) com total diario
- Edicao inline: toque no lapis, campo numerico aparece no lugar, confirma ou cancela
- Exclusao com dialog de confirmacao (AlertDialog)
- Contagem total de entradas no header

### Criterios de Aceite Chave
- Edicao e exclusao persistem imediatamente no store
- Dialog de confirmacao antes de excluir (nao pode ser desfeito)
- Agrupamento correto por dia com labels "Today", "Yesterday", ou data formatada
- Total diario atualiza ao editar/excluir entradas

---

## Contexto Detalhado para Agentes

# User Story: Manage Log Entries

## Declaracao da historia

Como um usuario eu quero editar e excluir registros passados de hidratacao agrupados por dia para que eu possa corrigir erros no meu historico.

## Criterios funcionais

- Pagina Manage (rota `/manage`) com:
  - Header: "Manage" (h1) + contagem total de entradas ("X entries total")
  - Entradas agrupadas por dia, ordenadas por data descendente (mais recente primeiro)
  - Labels de grupo: "Today", "Yesterday", ou data formatada (ex: "Mon, Feb 10")
  - Total diario por grupo (ex: "1.8L total" ou "850ml total")

**Cada entrada mostra:**
- Amount (ex: "300ml") e horario (ex: "9:45 AM")
- Botao editar (RiPencilLine) e botao excluir (RiDeleteBinLine)
- Botoes alinhados a direita, tamanho icon-xs

**Modo edicao inline:**
- Ao tocar editar: amount e horario sao substituidos por input numerico (1-5000) + "ml" + botao confirmar (check) + botao cancelar (X)
- Input focado automaticamente com valor atual pre-preenchido
- Confirmar: atualiza amount no store via editLog(id, newAmount)
- Cancelar: restaura valor original, fecha modo edicao

**Exclusao:**
- Ao tocar excluir: abre AlertDialog de confirmacao
- Titulo: "Delete entry?"
- Descricao: "Remove this Xml entry. This can't be undone."
- Acoes: "Cancel" (outline) e "Delete" (destructive)
- Confirmar: remove log do store via deleteLog(id)

**Estado vazio:**
- Se nao ha entradas: container com borda tracejada, "No entries yet." + "Log some water on the Today tab."

## Criterios de experiencia do usuario

- Edicao inline (sem modal/popup) para manter fluxo rapido
- Apenas uma entrada por vez em modo edicao (abrir editar em outra deve fechar a anterior)
- Input de edicao abre teclado numerico em mobile
- Botao excluir com icone em cor destructive para indicar acao perigosa
- AlertDialog centralizado com overlay escuro
- Ao excluir ultima entrada de um grupo, o grupo desaparece da lista
- Scroll position mantido apos edicao/exclusao

## Testes regressivos

- US-001: Aba Manage no navigation deve levar a esta pagina
- US-002: Edicoes e exclusoes devem persistir no localStorage
- US-003: Entradas logadas via Quick Log devem aparecer aqui
- US-004: Ao editar/excluir, progress ring no Today deve atualizar
- US-005: Ao editar/excluir, streak deve recalcular
- US-006: Ao editar/excluir, History charts e stats devem refletir mudancas

## Criterios para QA

- Padroes de qualidade: CRUD completo, persistencia, AlertDialog acessivel
- Cenarios de teste:
  - Caminho feliz: Usuario edita entrada de 200ml para 500ml — valor atualiza, total do grupo atualiza
  - Caminho feliz: Usuario exclui entrada — dialog aparece, confirma, entrada removida
  - Caminho feliz: Lista com 14 dias de dados — agrupamento e labels corretos
  - Caminho de insucesso: Usuario tenta salvar edicao com valor 0 — nao deve salvar
  - Caminho alternativo: Usuario cancela edicao — valor original restaurado
  - Caminho alternativo: Usuario cancela exclusao via dialog — entrada permanece
  - Caminho alternativo: Sem entradas — estado vazio com mensagem
  - Testes nao-funcionais: Lista com 200+ entradas deve scrollar sem jank
- Homologacao: Testar AlertDialog em Safari iOS (z-index e overlay), teclado numerico em mobile

## Criterios de aceitacao

- Validacao completa do fluxo: editar e excluir entradas com persistencia
- Agrupamento por dia com labels corretos (Today/Yesterday/data)
- Total diario correto e atualizado apos edicao/exclusao
- AlertDialog funcional e acessivel (focusable, dismissible via ESC)
- Estado vazio renderizado quando nao ha entradas
- Nenhuma operacao destrutiva sem confirmacao explicita
- Prototipo de referencia: `/lab/hydra-mvp` (ManageView component)
