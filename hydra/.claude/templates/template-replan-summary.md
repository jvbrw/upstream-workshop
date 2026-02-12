# Replan Summary

**Data**: {{timestamp}}
**Trigger US**: {{trigger_us_id}}
**Orientações**: {{orientacoes}}

---

## USs Alteradas

{{#each affected_us}}
### {{us_id}} - {{us_name}}

**Tipo**: {{type}}
{{#if cascade_reason}}**Motivo cascata**: {{cascade_reason}}{{/if}}

#### Alterações:
{{#each changes}}
- **{{section}}**: {{description}}
{{/each}}
{{/each}}

---

## Tasks Alteradas

{{#each affected_tasks}}
### {{task_id}} ({{parent_us_id}})

**Tipo**: {{type}}

#### Alterações:
{{#each changes}}
- **{{block}}**: {{description}}
{{/each}}
{{/each}}

---

## Cadeia de Cascata

```
{{cascade_chain_visualization}}
```

---

## Referências

- Warmup Tech: ./warmup-tech.md
- Warmup Product: ./warmup-product.md
