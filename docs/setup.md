# Setup local

## 1. Pré-requisitos

- Docker Desktop
- Git
- Conta no GitHub

## 2. Configurar ambiente

No PowerShell, dentro da pasta do projeto:

```powershell
Copy-Item .env.example .env
```

Abra `.env` e troque obrigatoriamente:

- `POSTGRES_PASSWORD`
- `N8N_ENCRYPTION_KEY`

Para gerar uma chave no PowerShell:

```powershell
[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
```

## 3. Subir o ambiente

```powershell
docker compose up -d
```

Verifique:

```powershell
docker compose ps
```

Acesse:

```text
http://localhost:5678
```

Na primeira execução, crie o usuário proprietário do n8n.

## 4. Importar o primeiro workflow

No n8n:

1. Abra a área de workflows.
2. Use a opção de importar workflow de arquivo.
3. Importe `workflows/github-issue-intake.json`.
4. Abra o node `GitHub Webhook`.
5. Clique para testar/escutar o webhook.
6. Copie a **Test URL** exibida pelo n8n.

## 5. Testar sem GitHub

Com o workflow escutando em modo de teste, rode no PowerShell, ajustando a URL se necessário:

```powershell
$headers = @{
  "X-GitHub-Event" = "issues"
  "X-GitHub-Delivery" = "local-test-001"
  "Content-Type" = "application/json"
}

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:5678/webhook-test/github/issues" `
  -Headers $headers `
  -InFile ".\\examples\\github-issue-opened.json"
```

Resposta esperada:

```json
{
  "accepted": true,
  "eventType": "issues",
  "action": "opened",
  "classification": "bug",
  "priority": "normal"
}
```

## 6. GitHub real

O GitHub precisa alcançar uma URL pública HTTPS. `localhost` não funciona diretamente como webhook do GitHub.

Quando chegarmos nessa etapa, use uma URL pública apontando para o n8n e configure `WEBHOOK_URL` com essa URL. Depois ative o workflow e cadastre no repositório GitHub em **Settings > Webhooks**.
