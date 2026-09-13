# DevFlow — GitHub Automation Platform with n8n

DevFlow é um projeto de portfólio para automação de processos de desenvolvimento usando **n8n, GitHub Webhooks, PostgreSQL e Docker**.

O objetivo é evoluir de um webhook simples para uma plataforma capaz de classificar Issues, automatizar labels, registrar eventos, processar Pull Requests, gerar changelogs e produzir métricas de engenharia.

## Arquitetura inicial

```text
GitHub / teste local
        |
        v
   n8n Webhook
        |
        v
Normalize & Classify
        |
        v
     200 OK

PostgreSQL já preparado para a próxima etapa.
```

## MVP 1

- [x] Docker Compose
- [x] n8n self-hosted
- [x] PostgreSQL
- [x] Schema `devflow`
- [x] Webhook para Issues
- [x] Classificação básica: `bug`, `feature`, `documentation`, `security`, `other`
- [x] Priorização básica
- [x] Payload de teste
- [ ] Persistir eventos no PostgreSQL
- [ ] Validar assinatura `X-Hub-Signature-256`
- [ ] Adicionar labels no GitHub automaticamente
- [ ] Automação de Pull Requests
- [ ] Release notes / changelog
- [ ] Dashboard de métricas

## Stack

- n8n
- PostgreSQL 16
- Docker / Docker Compose
- GitHub Webhooks
- JavaScript

## Início rápido

```powershell
git clone <URL_DO_SEU_REPOSITORIO>
cd devflow-n8n
Copy-Item .env.example .env
docker compose up -d
```

Abra:

```text
http://localhost:5678
```

Depois importe:

```text
workflows/github-issue-intake.json
```

O tutorial completo está em [`docs/setup.md`](docs/setup.md).

## Banco

O container PostgreSQL cria automaticamente:

```text
devflow.github_events
```

Esse registro será usado na próxima versão para persistir eventos recebidos do GitHub e gerar métricas.

## Segurança

Nunca publique `.env`, tokens do GitHub, senhas, chaves de API ou credenciais exportadas do n8n.

## Roadmap

### V1 — Issues
Receber, classificar, persistir e rotular Issues.

### V2 — Pull Requests
Registrar PRs, commits, arquivos alterados e merges.

### V3 — Releases
Gerar changelog e release notes automaticamente.

### V4 — Inteligência
Adicionar classificação e resumo semântico com IA.

### V5 — Dashboard
Criar API e frontend para métricas do fluxo de desenvolvimento.
