# AgendamentoAPI — Backend

API REST desenvolvida em ASP.NET Core 9 para gerenciamento de agendamentos de estética. Fornece autenticação JWT, CRUD completo de clientes, serviços e agendamentos, e envio de e-mails de confirmação via SendGrid.

---

## Sumário

- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Configuração](#configuração)
- [Executando localmente](#executando-localmente)
- [Executando com Docker](#executando-com-docker)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Endpoints da API](#endpoints-da-api)
- [Autenticação](#autenticação)
- [Banco de dados](#banco-de-dados)
- [Notificações por e-mail](#notificações-por-e-mail)
- [Deploy (Fly.io)](#deploy-flyio)

---

## Tecnologias

| Dependência | Versão |
|---|---|
| .NET / ASP.NET Core | 9.0 |
| Entity Framework Core | 9.0.3 |
| PostgreSQL (Npgsql) | 9.0.4 |
| JWT Bearer Authentication | 9.0.3 |
| BCrypt.Net-Next | 4.0.3 |
| SendGrid | 9.29.3 |
| Swashbuckle (Swagger) | 7.3.1 |

---

## Pré-requisitos

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [PostgreSQL 14+](https://www.postgresql.org/download/) rodando localmente (ou acesso a uma instância remota)
- Conta SendGrid com uma API Key (opcional — sem ela, o envio de e-mails é ignorado com um aviso no log)

---

## Configuração

Copie o arquivo de exemplo e ajuste os valores conforme seu ambiente:

```
appsettings.json          ← valores padrão (commitado)
appsettings.Development.json  ← sobrescritas locais (não commitado, use este para segredos)
```

Campos obrigatórios em `appsettings.json` (ou em variáveis de ambiente):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=agendamento_db;Username=postgres;Password=sua_senha"
  },
  "Jwt": {
    "Key": "sua_chave_secreta_minimo_32_caracteres",
    "Issuer": "AgendamentoAPI",
    "Audience": "AgendamentoApp"
  },
  "SendGrid": {
    "ApiKey": "SG.xxxx",
    "FromEmail": "seu@email.com",
    "FromName": "Nome do Salão"
  }
}
```

### Variáveis de ambiente (produção)

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL de conexão no formato Neon/PostgreSQL (`postgres://user:pass@host/db`). Sobrescreve a `ConnectionStrings:DefaultConnection`. |
| `ASPNETCORE_ENVIRONMENT` | `Development` ou `Production` |
| `ASPNETCORE_URLS` | URL de escuta (ex: `http://+:8080`) |

---

## Executando localmente

```bash
# Restaurar dependências
dotnet restore

# Criar o banco e aplicar as migrations (feito automaticamente na inicialização)
# As migrations são aplicadas via db.Database.Migrate() em Program.cs

# Iniciar o servidor
dotnet run
```

A API estará disponível em `http://localhost:5034`.  
O Swagger UI fica em `http://localhost:5034/swagger`.

---

## Executando com Docker

```bash
# Build da imagem
docker build -t agendamento-api .

# Rodar o container
docker run -p 8080:8080 \
  -e DATABASE_URL="postgres://postgres:senha@host.docker.internal:5432/agendamento_db" \
  -e ASPNETCORE_ENVIRONMENT=Production \
  agendamento-api
```

---

## Estrutura do projeto

```
backend/
├── Controllers/        # Endpoints HTTP (Auth, Cliente, Servico, Agendamento)
├── Data/               # DbContext e factory para design-time
├── DTOs/               # Objetos de transferência (login, registro)
├── Migrations/         # Histórico de migrations do EF Core
├── Models/             # Entidades do domínio
├── Services/           # Lógica de negócio (TokenService, EmailService)
├── Program.cs          # Configuração e DI
├── appsettings.json    # Configuração base
├── Dockerfile          # Imagem multi-stage .NET 9
└── fly.toml            # Configuração de deploy no Fly.io
```

---

## Endpoints da API

### Autenticação — `/api/auth`

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/register` | Não | Cadastra novo usuário profissional |
| `POST` | `/api/auth/login` | Não | Faz login e retorna JWT (validade: 8h) |
| `GET` | `/api/auth/me` | JWT | Retorna dados do usuário autenticado |

### Clientes — `/api/cliente`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/cliente` | Lista todos os clientes (ordenados por nome) |
| `GET` | `/api/cliente/{id}` | Busca cliente pelo ID |
| `POST` | `/api/cliente` | Cadastra novo cliente |
| `PUT` | `/api/cliente/{id}` | Atualiza dados do cliente |
| `DELETE` | `/api/cliente/{id}` | Remove cliente e seus agendamentos |

Todos os endpoints de cliente requerem autenticação JWT.

### Agendamentos — `/api/agendamento`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/agendamento` | Lista agendamentos (filtros: `data`, `status`) |
| `GET` | `/api/agendamento/{id}` | Busca agendamento pelo ID |
| `GET` | `/api/agendamento/cliente/{clienteId}` | Histórico de agendamentos do cliente |
| `POST` | `/api/agendamento` | Cria agendamento (detecta conflito de horário + envia e-mail) |
| `PUT` | `/api/agendamento/{id}` | Atualiza agendamento (detecta conflito de horário) |
| `PATCH` | `/api/agendamento/{id}/cancelar` | Cancela o agendamento |
| `PATCH` | `/api/agendamento/{id}/concluir` | Marca o agendamento como realizado |

Todos os endpoints requerem autenticação JWT.

### Serviços — `/api/servico`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/servico` | Lista serviços (filtro opcional: `ativo=true/false`) |
| `GET` | `/api/servico/{id}` | Busca serviço pelo ID |
| `POST` | `/api/servico` | Cadastra novo serviço |
| `PUT` | `/api/servico/{id}` | Atualiza serviço |
| `DELETE` | `/api/servico/{id}` | Remove serviço |

Todos os endpoints requerem autenticação JWT.

---

## Autenticação

A API usa **JWT Bearer**. Para acessar endpoints protegidos:

1. Faça `POST /api/auth/login` com `{ "email": "...", "senha": "..." }`
2. Copie o token retornado
3. Inclua o header em todas as requisições subsequentes:

```
Authorization: Bearer <token>
```

Tokens expiram em **8 horas**. O Swagger UI tem suporte nativo ao Bearer token (botão "Authorize").

---

## Banco de dados

- **SGBD:** PostgreSQL
- **ORM:** Entity Framework Core com Npgsql
- **Migrations:** aplicadas automaticamente na inicialização (`db.Database.Migrate()`)

### Entidades

| Entidade | Descrição |
|---|---|
| `Usuario` | Profissional autenticado (email único, senha BCrypt) |
| `Cliente` | Dados do cliente (nome, telefone, e-mail, data de nascimento) |
| `Servico` | Serviço oferecido (nome, duração em minutos, preço) |
| `Agendamento` | Vínculo entre cliente, serviço e profissional, com data/hora e status |

**Status do agendamento:** `Agendado` | `Realizado` | `Cancelado`

### Serviços pré-cadastrados (seed)

| Serviço | Duração | Preço |
|---|---|---|
| Aplicação de Cílios | 120 min | R$ 150,00 |
| Manutenção de Extensão de Cílios | 90 min | R$ 100,00 |
| Design de Sobrancelhas | 35 min | R$ 45,00 |
| Design de Sobrancelhas com Henna | 40 min | R$ 55,00 |

---

## Notificações por e-mail

Ao criar um agendamento, a API envia automaticamente um e-mail de confirmação para o cliente (caso ele tenha e-mail cadastrado) via **SendGrid**.

O e-mail contém:
- Nome do cliente
- Serviço agendado e duração
- Data e horário
- Observações (se houver)

Se a chave do SendGrid não estiver configurada, a API registra um aviso no log e continua normalmente sem enviar o e-mail.

---

## Deploy (Fly.io)

O projeto inclui `fly.toml` e um `Dockerfile` multi-stage prontos para deploy no [Fly.io](https://fly.io).

```bash
# Primeiro deploy
fly launch

# Deploys subsequentes
fly deploy
```

O banco de dados em produção é um PostgreSQL gerenciado pelo [Neon](https://neon.tech), acessado via variável de ambiente `DATABASE_URL`.
