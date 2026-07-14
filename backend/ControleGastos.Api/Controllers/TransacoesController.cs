using ControleGastos.Api.Data;
using ControleGastos.Api.DTOs;
using ControleGastos.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ControleGastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransacoesController : ControllerBase
{
    private readonly AppDbContext _context;

    public TransacoesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransacaoRespostaDto>>> Listar()
    {
        var transacoes = await _context.Transacoes.AsNoTracking().OrderByDescending(transacao => transacao.Id).Select(transacao => new TransacaoRespostaDto
        {
            Id = transacao.Id,
            Descricao = transacao.Descricao,
            Valor = transacao.Valor,
            Tipo = transacao.Tipo,
            PessoaId = transacao.PessoaId,
            PessoaNome = transacao.Pessoa.Nome
        }).ToListAsync();

        return Ok(transacoes);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TransacaoRespostaDto>> ObterPorId(
        int id
    )
    {
        var transacao = await _context.Transacoes.AsNoTracking().Where(transacao => transacao.Id == id).Select(transacao => new TransacaoRespostaDto
        {
            Id = transacao.Id,
            Descricao = transacao.Descricao,
            Valor = transacao.Valor,
            Tipo = transacao.Tipo,
            PessoaId = transacao.PessoaId,
            PessoaNome = transacao.Pessoa.Nome
        }).FirstOrDefaultAsync();

        if (transacao is null)
        {
            return NotFound(new
            {
                mensagem = "Transação não encontrada."
            });
        }

        return Ok(transacao);
    }

    [HttpPost]
    public async Task<ActionResult<TransacaoRespostaDto>> Criar(
        CriarTransacaoDto dto
    )
    {
        var pessoa = await _context.Pessoas.AsNoTracking().FirstOrDefaultAsync(pessoa => pessoa.Id == dto.PessoaId);

        if (pessoa is null)
        {
            return BadRequest(new
            {
                mensagem = "A pessoa informada não existe."
            });
        }

        if (
            pessoa.Idade < 18 &&
            dto.Tipo == TipoTransacao.Receita
        )
        {
            return BadRequest(new
            {
                mensagem =
                    "Pessoas menores de 18 anos só podem cadastrar despesas."
            });
        }

        var transacao = new Transacao
        {
            Descricao = dto.Descricao.Trim(),
            Valor = dto.Valor,
            Tipo = dto.Tipo,
            PessoaId = dto.PessoaId
        };

        _context.Transacoes.Add(transacao);
        await _context.SaveChangesAsync();

        var resposta = new TransacaoRespostaDto
        {
            Id = transacao.Id,
            Descricao = transacao.Descricao,
            Valor = transacao.Valor,
            Tipo = transacao.Tipo,
            PessoaId = transacao.PessoaId,
            PessoaNome = pessoa.Nome
        };

        return CreatedAtAction(
            nameof(ObterPorId),
            new { id = transacao.Id },
            resposta
        );
    }
}