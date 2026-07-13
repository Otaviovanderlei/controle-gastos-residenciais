# Controle de Gastos Residenciais

Aplicação full stack para gerenciamento de pessoas, receitas, despesas e consulta de totais financeiros.

## Tecnologias

### Back-end

- C#
- ASP.NET Core Web API
- Entity Framework Core
- SQLite

### Front-end

- React
- TypeScript
- Vite
- Axios
- React Router

## Funcionalidades

- Cadastro, listagem e exclusão de pessoas
- Exclusão automática das transações vinculadas à pessoa
- Cadastro e listagem de transações
- Validação de pessoa existente
- Bloqueio de receitas para pessoas menores de 18 anos
- Consulta de receitas, despesas e saldo por pessoa
- Consulta dos totais gerais
- Persistência dos dados com SQLite

## Regras de negócio

- Os identificadores são únicos e gerados automaticamente.
- Cada transação precisa estar vinculada a uma pessoa existente.
- Pessoas menores de 18 anos podem possuir apenas despesas.
- Ao excluir uma pessoa, todas as suas transações são removidas.
- O saldo é calculado por receitas menos despesas.

## Como executar

### Back-end

```bash
cd backend/ControleGastos.Api
dotnet restore
dotnet ef database update
dotnet run