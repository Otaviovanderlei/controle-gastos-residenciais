using ControleGastos.Api.Data;
using ControleGastos.Api.DTOs;
using ControleGastos.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ControleGastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PessoasController : ControllerBase
{
    private readonly AppDbContext _context;

    public PessoasController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PessoaRespostaDto>>> Listar()
    {
        var pessoas = await _context.Pessoas.AsNoTracking().OrderBy(pessoa => pessoa.Nome).Select(pessoa => new PessoaRespostaDto
        {
            Id = pessoa.Id,
            Nome = pessoa.Nome,
            Idade = pessoa.Idade
        }).ToListAsync();

        return Ok(pessoas);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PessoaRespostaDto>> ObterPorId(int id)
    {
        var pessoa = await _context.Pessoas.AsNoTracking().Where(pessoa => pessoa.Id == id).Select(pessoa => new PessoaRespostaDto
        {
            Id = pessoa.Id,
            Nome = pessoa.Nome,
            Idade = pessoa.Idade
        }).FirstOrDefaultAsync();

        if (pessoa is null)
        {
            return NotFound(new
            {
                mensagem = "Pessoa não encontrada."
            });
        }

        return Ok(pessoa);
    }

    [HttpPost]
    public async Task<ActionResult<PessoaRespostaDto>> Criar(
        CriarPessoaDto dto
    )
    {
        var pessoa = new Pessoa
        {
            Nome = dto.Nome.Trim(),
            Idade = dto.Idade
        };

        _context.Pessoas.Add(pessoa);
        await _context.SaveChangesAsync();

        var resposta = new PessoaRespostaDto
        {
            Id = pessoa.Id,
            Nome = pessoa.Nome,
            Idade = pessoa.Idade
        };

        return CreatedAtAction(
            nameof(ObterPorId),
            new { id = pessoa.Id },
            resposta
        );
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var pessoa = await _context.Pessoas.FindAsync(id);

        if (pessoa is null)
        {
            return NotFound(new
            {
                mensagem = "Pessoa não encontrada."
            });
        }

        _context.Pessoas.Remove(pessoa);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}