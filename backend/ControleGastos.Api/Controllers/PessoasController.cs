using ControleGastos.Api.Data;
using ControleGastos.Api.DTOs;
using ControleGastos.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ControleGastos.Api.Controllers
{
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
        public async Task<ActionResult<IEnumerable<Pessoa>>> Listar()
        {
            var pessoas = await _context.Pessoas.AsNoTracking().OrderBy(pessoa => pessoa.Nome).ToListAsync();

            return Ok(pessoas);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Pessoa>> ObterPorId(int id)
        {
            var pessoa = await _context.Pessoas.AsNoTracking().FirstOrDefaultAsync(pessoa => pessoa.Id == id);

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
        public async Task<ActionResult<Pessoa>> Criar(CriarPessoaDto dto)
        {
            var pessoa = new Pessoa
            {
                Nome = dto.Nome.Trim(),
                Idade = dto.Idade
            };

            _context.Pessoas.Add(pessoa);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(ObterPorId),
                new { id = pessoa.Id },
                pessoa
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
}
