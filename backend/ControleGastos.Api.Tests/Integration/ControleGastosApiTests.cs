using ControleGastos.Api.DTOs;
using ControleGastos.Api.Models;
using ControleGastos.Api.Tests.Infrastructure;
using System.Net;
using System.Net.Http.Json;

namespace ControleGastos.Api.Tests.Integration;

public sealed class ControleGastosApiTests
    : IClassFixture<ControleGastosApiFactory>
{
    private readonly ControleGastosApiFactory _factory;
    private readonly HttpClient _client;

    public ControleGastosApiTests(
        ControleGastosApiFactory factory
    )
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task ReceitaParaMenor_DeveSerBloqueada()
    {
        await _factory.ResetarBancoAsync();

        var menor = await CriarPessoaAsync(
            nome: "Pessoa menor",
            idade: 16
        );

        var resposta = await _client.PostAsJsonAsync(
            "/api/transacoes",
            new CriarTransacaoDto
            {
                Descricao = "Pagamento",
                Valor = 500m,
                Tipo = TipoTransacao.Receita,
                PessoaId = menor.Id
            }
        );

        Assert.Equal(
            HttpStatusCode.BadRequest,
            resposta.StatusCode
        );

        var erro = await resposta.Content
            .ReadFromJsonAsync<ErroResposta>();

        Assert.NotNull(erro);

        Assert.Equal(
            "Pessoas menores de 18 anos só podem cadastrar despesas.",
            erro.Mensagem
        );

        var transacoes = await ListarTransacoesAsync();

        Assert.Empty(transacoes);
    }

    [Fact]
    public async Task DespesaParaMenor_DeveSerPermitida()
    {
        await _factory.ResetarBancoAsync();

        var menor = await CriarPessoaAsync(
            nome: "Pessoa menor",
            idade: 16
        );

        var resposta = await _client.PostAsJsonAsync(
            "/api/transacoes",
            new CriarTransacaoDto
            {
                Descricao = "Material escolar",
                Valor = 80m,
                Tipo = TipoTransacao.Despesa,
                PessoaId = menor.Id
            }
        );

        Assert.Equal(
            HttpStatusCode.Created,
            resposta.StatusCode
        );

        var transacao = await resposta.Content
            .ReadFromJsonAsync<TransacaoRespostaDto>();

        Assert.NotNull(transacao);
        Assert.True(transacao.Id > 0);
        Assert.Equal("Material escolar", transacao.Descricao);
        Assert.Equal(80m, transacao.Valor);
        Assert.Equal(TipoTransacao.Despesa, transacao.Tipo);
        Assert.Equal(menor.Id, transacao.PessoaId);
        Assert.Equal(menor.Nome, transacao.PessoaNome);

        Assert.NotNull(resposta.Headers.Location);

        var respostaConsulta = await _client.GetAsync(
            resposta.Headers.Location
        );

        Assert.Equal(
            HttpStatusCode.OK,
            respostaConsulta.StatusCode
        );
    }

    [Fact]
    public async Task TransacaoParaPessoaInexistente_DeveSerBloqueada()
    {
        await _factory.ResetarBancoAsync();

        var resposta = await _client.PostAsJsonAsync(
            "/api/transacoes",
            new CriarTransacaoDto
            {
                Descricao = "Conta de internet",
                Valor = 120.50m,
                Tipo = TipoTransacao.Despesa,
                PessoaId = 999999
            }
        );

        Assert.Equal(
            HttpStatusCode.BadRequest,
            resposta.StatusCode
        );

        var erro = await resposta.Content
            .ReadFromJsonAsync<ErroResposta>();

        Assert.NotNull(erro);

        Assert.Equal(
            "A pessoa informada não existe.",
            erro.Mensagem
        );

        var transacoes = await ListarTransacoesAsync();

        Assert.Empty(transacoes);
    }

    [Fact]
    public async Task TransacaoComValorZero_DeveSerBloqueada()
    {
        await _factory.ResetarBancoAsync();

        var pessoa = await CriarPessoaAsync(
            nome: "Pessoa adulta",
            idade: 25
        );

        var resposta = await _client.PostAsJsonAsync(
            "/api/transacoes",
            new CriarTransacaoDto
            {
                Descricao = "Valor inválido",
                Valor = 0m,
                Tipo = TipoTransacao.Despesa,
                PessoaId = pessoa.Id
            }
        );

        Assert.Equal(
            HttpStatusCode.BadRequest,
            resposta.StatusCode
        );

        var transacoes = await ListarTransacoesAsync();

        Assert.Empty(transacoes);
    }

    [Fact]
    public async Task ExcluirPessoa_DeveExcluirSuasTransacoes()
    {
        await _factory.ResetarBancoAsync();

        var pessoa = await CriarPessoaAsync(
            nome: "Pessoa adulta",
            idade: 30
        );

        await CriarTransacaoAsync(
            descricao: "Conta de energia",
            valor: 200m,
            tipo: TipoTransacao.Despesa,
            pessoaId: pessoa.Id
        );

        var transacoesAntes = await ListarTransacoesAsync();

        Assert.Single(transacoesAntes);

        var respostaExclusao = await _client.DeleteAsync(
            $"/api/pessoas/{pessoa.Id}"
        );

        Assert.Equal(
            HttpStatusCode.NoContent,
            respostaExclusao.StatusCode
        );

        var respostaPessoa = await _client.GetAsync(
            $"/api/pessoas/{pessoa.Id}"
        );

        Assert.Equal(
            HttpStatusCode.NotFound,
            respostaPessoa.StatusCode
        );

        var transacoesDepois = await ListarTransacoesAsync();

        Assert.Empty(transacoesDepois);
    }

    [Fact]
    public async Task ConsultarTotais_DeveCalcularReceitasDespesasESaldo()
    {
        await _factory.ResetarBancoAsync();

        var pessoa = await CriarPessoaAsync(
            nome: "Pessoa adulta",
            idade: 28
        );

        await CriarTransacaoAsync(
            descricao: "Salário",
            valor: 2500m,
            tipo: TipoTransacao.Receita,
            pessoaId: pessoa.Id
        );

        await CriarTransacaoAsync(
            descricao: "Conta de internet",
            valor: 120.50m,
            tipo: TipoTransacao.Despesa,
            pessoaId: pessoa.Id
        );

        var resposta = await _client.GetAsync(
            "/api/totais"
        );

        Assert.Equal(
            HttpStatusCode.OK,
            resposta.StatusCode
        );

        var totais = await resposta.Content
            .ReadFromJsonAsync<ConsultaTotaisDto>();

        Assert.NotNull(totais);

        Assert.Equal(
            2500m,
            totais.TotalGeralReceitas
        );

        Assert.Equal(
            120.50m,
            totais.TotalGeralDespesas
        );

        Assert.Equal(
            2379.50m,
            totais.SaldoLiquidoGeral
        );

        var totalPessoa = Assert.Single(
            totais.Pessoas
        );

        Assert.Equal(
            pessoa.Id,
            totalPessoa.PessoaId
        );

        Assert.Equal(
            pessoa.Nome,
            totalPessoa.Nome
        );

        Assert.Equal(
            2500m,
            totalPessoa.TotalReceitas
        );

        Assert.Equal(
            120.50m,
            totalPessoa.TotalDespesas
        );

        Assert.Equal(
            2379.50m,
            totalPessoa.Saldo
        );
    }

    private async Task<PessoaRespostaDto> CriarPessoaAsync(
        string nome,
        int idade
    )
    {
        var resposta = await _client.PostAsJsonAsync(
            "/api/pessoas",
            new CriarPessoaDto
            {
                Nome = nome,
                Idade = idade
            }
        );

        Assert.Equal(
            HttpStatusCode.Created,
            resposta.StatusCode
        );

        return await resposta.Content
            .ReadFromJsonAsync<PessoaRespostaDto>()
            ?? throw new InvalidOperationException(
                "A API não retornou a pessoa criada."
            );
    }

    private async Task<TransacaoRespostaDto>
        CriarTransacaoAsync(
            string descricao,
            decimal valor,
            TipoTransacao tipo,
            int pessoaId
        )
    {
        var resposta = await _client.PostAsJsonAsync(
            "/api/transacoes",
            new CriarTransacaoDto
            {
                Descricao = descricao,
                Valor = valor,
                Tipo = tipo,
                PessoaId = pessoaId
            }
        );

        Assert.Equal(
            HttpStatusCode.Created,
            resposta.StatusCode
        );

        return await resposta.Content
            .ReadFromJsonAsync<TransacaoRespostaDto>()
            ?? throw new InvalidOperationException(
                "A API não retornou a transação criada."
            );
    }

    private async Task<List<TransacaoRespostaDto>>
        ListarTransacoesAsync()
    {
        return await _client
            .GetFromJsonAsync<List<TransacaoRespostaDto>>(
                "/api/transacoes"
            )
            ?? [];
    }

    private sealed class ErroResposta
    {
        public string Mensagem { get; set; }
            = string.Empty;
    }
}