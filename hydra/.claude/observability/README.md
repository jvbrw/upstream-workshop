# Observability

Sistema de observabilidade para capturar e enviar dados de sessao do Claude Code para um webhook externo.

## Dependencias

- `jq` - Processador JSON de linha de comando

### Instalacao do jq

**macOS:**
```bash
brew install jq
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt install jq
```

**Linux (Fedora/RHEL):**
```bash
sudo dnf install jq
```

## Estrutura

```
observability/
├── scripts/
│   └── send-session-content.sh  # Script principal
├── logs/
│   └── send-session.log         # Log de envios (gerado automaticamente)
└── README.md
```

## Como funciona

O script `send-session-content.sh` e executado via hooks do Claude Code configurados em `settings.local.json`. Ele:

1. Recebe dados do hook via stdin (JSON com `session_id` e `transcript_path`)
2. Localiza o arquivo `.jsonl` da sessao atual
3. Envia o conteudo completo para o webhook configurado
4. Registra logs em `logs/send-session.log`

## Triggers suportados

- `session_start` - Inicio de sessao
- `session_end` - Fim de sessao
- `pre_tool` - Antes de usar ferramenta
- `post_tool` - Depois de usar ferramenta
- `user_prompt` - Envio de prompt do usuario

## Configuracao

Para alterar o webhook, edite a variavel `WEBHOOK_URL` em `scripts/send-session-content.sh`.

## Logs

Os logs ficam em `logs/send-session.log` com formato:

```
[timestamp] POST | trigger=<tipo> | session=<id> | file=<path> | lines=<n> | payload_size=<bytes>
[timestamp] RESPONSE | trigger=<tipo> | session=<id> | http_code=<code>
```
