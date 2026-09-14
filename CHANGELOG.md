# Changelog

Todas as mudanças relevantes do DevFlow são documentadas neste arquivo.

O formato segue os princípios do
[Keep a Changelog](https://keepachangelog.com/)
e o versionamento utiliza
[Semantic Versioning](https://semver.org/).

---

## [1.0.0] - 2026-09-14

### Added

- GitHub webhook ingestion para Issues e Pull Requests.
- Validação HMAC SHA-256 dos webhooks.
- Pipeline de Pull Request Intelligence.
- Cálculo automatizado de nível e score de risco.
- Policy Gate para avaliação de Pull Requests.
- Histórico de análises de Pull Requests.
- Persistência de eventos do GitHub.
- API REST desenvolvida com NestJS.
- Integração com Prisma ORM e PostgreSQL.
- Swagger/OpenAPI para documentação da API.
- Dashboard Angular responsivo.
- Tela de Overview.
- Listagem e detalhes de Pull Requests.
- Risk Analysis.
- Policy Gate dashboard.
- GitHub Events dashboard.
- Suporte a filtros e paginação na API.
- Serialização segura de valores BigInt.
- Validação de DTOs com ValidationPipe.
- Ambiente Docker Compose.
- Containers independentes para API e Dashboard.
- Nginx para servir o frontend Angular.
- GitHub Actions CI.
- GitHub Actions CD.
- Build automatizado das imagens Docker.
- Publicação de imagens no GitHub Container Registry.
- Branch protection para `main`.
- CodeQL.
- Dependency Review.
- Dependency Graph.
- Dependabot Alerts.
- Dependabot Security Updates.
- Dependabot Version Updates.
- Secret Scanning.
- Push Protection.
- Coverage Gate para API e Dashboard.

### Testing

- 43 testes automatizados na API.
- 11 testes automatizados no Dashboard.
- API com 100% de cobertura em:
  - statements;
  - branches;
  - functions;
  - lines.
- Coverage Gate mínimo de 95% para a API.
- Coverage Gate configurado para o Dashboard.

### Security

- Atualização do Multer de `2.2.0` para `2.3.0`
  através de override controlado.
- Remoção do tooling não utilizado `@nestjs/mau`.
- Remoção da cadeia transitiva vulnerável relacionada a:
  - `inquirer`;
  - `external-editor`;
  - `tmp`;
  - `undici`.
- Production dependency audit da API com:
  - `0 vulnerabilities`.

### Changed

- Escopo de cobertura da API ajustado para medir somente
  código relevante da aplicação.
- Código gerado pelo Prisma excluído da métrica de coverage.
- Coverage Gate da API fortalecido para 95%.
- Documentação técnica atualizada com arquitetura,
  CI/CD, testes e DevSecOps.

### Infrastructure

- PostgreSQL 16.
- NestJS 12.
- Angular 22.
- Prisma 7.10.
- TypeScript 6.
- Vitest 4.
- Docker / Docker Compose.
- GitHub Container Registry.
- n8n para automação e orquestração.

### Known limitations

- Dependências internas do tooling do Prisma ainda podem
  apresentar advisories em auditorias completas de desenvolvimento.
- A árvore de dependências utilizada em produção possui
  `0 vulnerabilities` segundo `npm audit --omit=dev`.
- Atualizações breaking ou downgrades inseguros do Prisma
  não são aplicados apenas para eliminar findings de tooling.

---

## Versioning

A versão `1.0.0` representa o primeiro release estável do DevFlow,
com fluxo completo de ingestão de eventos, análise de Pull Requests,
API, Dashboard, persistência, testes, CI/CD e controles DevSecOps.