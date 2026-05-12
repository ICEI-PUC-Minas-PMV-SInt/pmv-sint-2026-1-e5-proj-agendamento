# Implantação do Software

Esta seção descreve o planejamento da implantação da aplicação em ambiente de produção. A estratégia adotada utiliza **serviços gratuitos** que se adequam ao escopo de um MVP acadêmico de uso por uma única profissional.

## Visão geral da arquitetura de implantação

```
┌──────────────────────┐        HTTPS         ┌──────────────────────┐
│  App Mobile (APK)    │ ───────────────────▶ │  Backend .NET 9      │
│  React Native /      │                      │  ASP.NET Core API    │
│  Expo                │                      │  Fly.io (gru region) │
└──────────────────────┘                      └──────────┬───────────┘
                                                         │
                                                         │ Npgsql
                                                         ▼
                                              ┌──────────────────────┐
                                              │   Banco de Dados     │
                                              │   PostgreSQL 17      │
                                              │   Neon (free tier)   │
                                              └──────────────────────┘
```

| Camada | Tecnologia / Serviço | Plano |
|--------|----------------------|-------|
| Banco de dados | PostgreSQL 17 (gerenciado pelo **Neon**) | Free (0,5 GB) |
| Backend | ASP.NET Core (.NET 9) em container Docker no **Fly.io** | Free (`shared-cpu-1x`, 256 MB, hiberna sem tráfego) |
| App mobile | React Native (Expo) com build via **EAS Build** | Free tier |
| Repositório | GitHub | Free |

A escolha do Fly.io para o backend foi feita pelo *cold start* rápido (~1-3 s contra ~30 s de outros provedores quando o serviço hiberna). A escolha do Neon foi feita pela ausência de cartão de crédito obrigatório e pelo tier gratuito permanente. O Expo EAS Build gera o `.apk` que pode ser instalado diretamente no dispositivo da profissional, sem necessidade de publicação na Play Store.

## Tecnologias e justificativas

- **Backend em Docker no Fly.io:** o `Dockerfile` da aplicação faz um build multi-stage utilizando as imagens oficiais `mcr.microsoft.com/dotnet/sdk:9.0` (para compilação) e `mcr.microsoft.com/dotnet/aspnet:9.0` (para execução), resultando em uma imagem final enxuta (~86 MB). A aplicação é exposta na porta 8080 via HTTPS gerenciado pelo proxy do Fly.io.

- **Banco PostgreSQL no Neon:** o Entity Framework Core gerencia o esquema do banco através de migrations versionadas, aplicadas automaticamente na inicialização da aplicação em produção. A connection string é injetada via variável de ambiente `DATABASE_URL` e convertida automaticamente do formato Neon (`postgres://...`) para o formato esperado pelo Npgsql.

- **JWT para autenticação:** a chave de assinatura do JWT (`Jwt:Key`) e os parâmetros `Issuer` e `Audience` são injetados via variáveis de ambiente (`Jwt__Key`, `Jwt__Issuer`, `Jwt__Audience`) como segredos no Fly.io, evitando que credenciais sejam versionadas no repositório.

- **App mobile como APK distribuído manualmente:** considerando o escopo de uso interno por uma única profissional, optou-se pela geração de um `.apk` via EAS Build, instalado manualmente no dispositivo da empreendedora. Essa abordagem dispensa o processo (e a taxa anual de US$ 25) de publicação na Play Store, adequado ao contexto acadêmico do MVP.

## Processo de implantação

O processo completo de implantação envolveu quatro etapas principais:

1. **Provisionamento do banco de dados:** criação do projeto no Neon, geração da connection string e configuração da região (US East 1 - Virginia, escolhida pela disponibilidade no tier gratuito).
2. **Deploy do backend:** build da imagem Docker, push para o registry do Fly.io, criação da máquina virtual na região `gru` (São Paulo) e injeção das variáveis de ambiente como segredos. As migrations do EF Core são aplicadas automaticamente durante o startup da aplicação.
3. **Build do app mobile:** geração do APK via EAS Build, com a URL pública do backend (`EXPO_PUBLIC_API_URL`) injetada em tempo de compilação a partir do perfil `production` do `eas.json`.
4. **Distribuição:** envio do APK para o dispositivo da profissional para instalação manual.

## URLs do ambiente de produção

| Componente | URL |
|------------|-----|
| Backend / Swagger | https://studio-lash-api.fly.dev/ |
| Dashboard de monitoramento Fly.io | https://fly.io/apps/studio-lash-api/monitoring |
| Dashboard do banco (Neon) | https://console.neon.tech/ |
| Projeto no Expo | https://expo.dev/accounts/rodrigocsouza7/projects/studio-lash |

## Planejamento de evolução

Após a entrega do MVP, foram identificadas as seguintes evoluções possíveis para o sistema:

| Evolução | Descrição | Prioridade |
|----------|-----------|------------|
| Integração com WhatsApp | Botão direto para iniciar conversa com a cliente (link `wa.me`) — atende ao RF-011 | Alta |
| Integração com Google Agenda | Sincronizar agendamentos com a agenda pessoal da profissional — atende ao RF-012 | Média |
| Notificações push | Lembretes automáticos antes do horário do atendimento | Média |
| Suporte multi-usuário | Permitir que mais de uma profissional utilize o sistema — atende ao RNF-010 | Baixa |
| Painel financeiro | Relatórios mensais de faturamento, ticket médio e clientes frequentes | Baixa |
| Publicação na Play Store | Tornar o app instalável sem o passo manual do `.apk` | Baixa |

## Custos da implantação

Por se tratar de um projeto acadêmico, toda a infraestrutura escolhida é gratuita dentro dos limites necessários ao MVP:

| Item | Custo mensal |
|------|--------------|
| Neon (PostgreSQL 0,5 GB) | R$ 0,00 |
| Fly.io (`shared-cpu-1x` 256 MB, hibernando) | R$ 0,00 (dentro do crédito gratuito de US$ 5) |
| Expo EAS Build (free tier) | R$ 0,00 |
| GitHub | R$ 0,00 |
| **Total** | **R$ 0,00** |
