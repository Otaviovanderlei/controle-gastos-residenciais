# Controle de Gastos Residenciais

Aplicação full stack desenvolvida para gerenciamento de pessoas, receitas, despesas e totais financeiros de uma residência.

O projeto utiliza uma API REST construída com ASP.NET Core e Entity Framework Core, persistência local com SQLite e uma interface web desenvolvida em React com TypeScript.

## Funcionalidades

- Cadastro e listagem de pessoas
- Exclusão de pessoas
- Cadastro e listagem de receitas e despesas
- Consulta de transações por identificador
- Consulta dos totais financeiros por pessoa
- Consulta dos totais gerais da residência
- Persistência dos dados após o encerramento da aplicação
- Exclusão automática das transações vinculadas a uma pessoa
- Validações no front-end e no back-end
- Mensagens de sucesso e erro para as operações

## Regras de negócio

- Os identificadores são gerados automaticamente.
- O nome da pessoa deve ter entre 2 e 100 caracteres.
- A idade deve estar entre 0 e 130 anos.
- Cada transação deve estar vinculada a uma pessoa existente.
- O valor da transação deve ser maior que zero.
- Pessoas menores de 18 anos podem possuir somente despesas.
- Ao excluir uma pessoa, suas transações também são excluídas.
- O saldo é calculado por `receitas - despesas`.

## Arquitetura

O fluxo principal da aplicação é:

```text
Interface React
      ↓
Services do front-end
      ↓
Axios
      ↓
ASP.NET Core Web API
      ↓
Controllers e DTOs
      ↓
Entity Framework Core
      ↓
SQLite
```

### Back-end

O back-end está organizado por responsabilidades:

```text
Controllers/   Recebem requisições HTTP e retornam respostas da API
Data/          Configuração do AppDbContext e acesso ao banco
DTOs/          Contratos de entrada e saída da API
Migrations/    Histórico da estrutura do banco de dados
Models/        Entidades persistidas pelo Entity Framework Core
Properties/    Configurações de execução local
Program.cs     Registro de serviços e configuração da aplicação
```

### Front-end

O front-end separa interface, acesso HTTP e contratos:

```text
api/           Configuração central do Axios
pages/         Páginas da aplicação
services/      Comunicação com os endpoints da API
types/         Tipos e interfaces TypeScript
utils/         Funções utilitárias compartilhadas
```

## Tecnologias

### Back-end

- C#
- .NET 10
- ASP.NET Core Web API
- Entity Framework Core
- SQLite
- Data Annotations
- OpenAPI

### Front-end

- React
- TypeScript
- Vite
- Axios
- React Router DOM
- CSS

## Estrutura do projeto

```text
controle-gastos-residenciais/
├── backend/
│   └── ControleGastos.Api/
│       ├── Controllers/
│       ├── Data/
│       ├── DTOs/
│       ├── Migrations/
│       ├── Models/
│       ├── Properties/
│       ├── ControleGastos.Api.csproj
│       ├── ControleGastos.Api.http
│       ├── Program.cs
│       └── appsettings.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

## Pré-requisitos

Antes de executar o projeto, tenha instalado:

- .NET SDK 10
- Node.js e npm
- Ferramenta `dotnet-ef`

Caso o `dotnet-ef` ainda não esteja instalado:

```bash
dotnet tool install --global dotnet-ef
```

## Como executar

### 1. Clonar o repositório

```bash
git clone https://github.com/Otaviovanderlei/controle-gastos-residenciais.git
cd controle-gastos-residenciais
```

### 2. Executar o back-end

```bash
cd backend/ControleGastos.Api
dotnet restore
dotnet ef database update
dotnet run
```

A API será iniciada, por padrão, em:

```text
http://localhost:5220
```

O arquivo `ControleGastos.Api.http` pode ser usado para testar os endpoints diretamente pelo Visual Studio ou VS Code.

### 3. Configurar o front-end

Em outro terminal:

```bash
cd frontend
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

No Linux ou macOS:

```bash
cp .env.example .env
```

O arquivo deve conter:

```env
VITE_API_URL=http://localhost:5220/api
```

### 4. Executar o front-end

```bash
npm install
npm run dev
```

A aplicação será iniciada, por padrão, em:

```text
http://localhost:5173
```

O back-end e o front-end precisam permanecer em execução ao mesmo tempo.

## Endpoints da API

### Pessoas

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/pessoas` | Lista todas as pessoas |
| `GET` | `/api/pessoas/{id}` | Consulta uma pessoa pelo ID |
| `POST` | `/api/pessoas` | Cadastra uma pessoa |
| `DELETE` | `/api/pessoas/{id}` | Exclui uma pessoa e suas transações |

Exemplo de cadastro:

```json
{
  "nome": "Otávio Vanderlei",
  "idade": 21
}
```

### Transações

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/transacoes` | Lista todas as transações |
| `GET` | `/api/transacoes/{id}` | Consulta uma transação pelo ID |
| `POST` | `/api/transacoes` | Cadastra uma receita ou despesa |

Exemplo de cadastro:

```json
{
  "descricao": "Conta de internet",
  "valor": 120.50,
  "tipo": 1,
  "pessoaId": 1
}
```

Tipos de transação:

```text
1 = Despesa
2 = Receita
```

### Totais

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/totais` | Retorna totais por pessoa e totais gerais |

## Validação do projeto

O projeto possui testes de integração com xUnit, `WebApplicationFactory` e SQLite em memória.

Os testes cobrem:

- bloqueio de receitas para menores de idade;
- permissão de despesas para menores;
- bloqueio de transação para pessoa inexistente;
- validação de valores maiores que zero;
- exclusão em cascata de pessoas e transações;
- cálculo de receitas, despesas e saldo.

Para executar:

```bash
cd backend
dotnet test ControleGastos.Api.Tests/ControleGastos.Api.Tests.csproj
### Back-end

```bash
cd backend/ControleGastos.Api
dotnet format ControleGastos.Api.csproj
dotnet build
dotnet list package --vulnerable --include-transitive
```

### Front-end

```bash
cd frontend
npm run lint
npm run build
```

## Decisões técnicas

- O SQLite foi escolhido por oferecer persistência local com configuração simples e por não exigir um servidor de banco separado.
- O Entity Framework Core foi utilizado para mapear as entidades e controlar migrations.
- DTOs de entrada e saída evitam expor diretamente as entidades persistidas pelo banco.
- Consultas somente de leitura utilizam `AsNoTracking`.
- A exclusão em cascata garante que não existam transações vinculadas a pessoas removidas.
- A regra que impede receitas para menores de idade foi implementada no back-end para não depender somente da interface.
- O front-end utiliza services para separar as requisições HTTP dos componentes visuais.
- A URL da API é configurada por variável de ambiente.
- O Axios centraliza a comunicação HTTP entre React e ASP.NET Core.

## Melhorias futuras

- Criar pipeline de integração contínua com GitHub Actions
- Permitir exclusão de transações
- Extrair regras de negócio do Controller para uma camada de serviço
- Configurar a origem do CORS por ambiente
- Adicionar testes de componentes no front-end
- Publicar uma versão demonstrativa da aplicação

## Autor

Desenvolvido por [Otávio Vanderlei](https://github.com/Otaviovanderlei) como desafio técnico full stack.