using ControleGastos.Api.Data;
using ControleGastos.Api.DTOs;
using ControleGastos.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace ControleGastos.Api.Controllers
{
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
        public async Task<ActionResult> Listar()
        {
            var transacoes = await _context.Transacoes.AsNoTracking().Include(transacao => transacao.Pessoa).OrderByDescending(transacao => transacao.Id).Select(transacao => new
            {
                transacao.Id,
                transacao.Descricao,
                transacao.Valor,
                transacao.Tipo,
                transacao.PessoaId,
                PessoaNome = transacao.Pessoa.Nome
            }).ToListAsync();

            return Ok(transacoes);
        }

        [HttpPost]
        public async Task<ActionResult> Criar(CriarTransacaoDto dto)
        {
            var pessoa = await _context.Pessoas.FirstOrDefaultAsync(pessoa => pessoa.Id == dto.PessoaId);

            if (pessoa is null)
            {
                return BadRequest(new
                {
                    mensagem = "A pessoa informada não existe."
                });
            }


            if (pessoa.Idade < 18 && dto.Tipo == TipoTransacao.Receita)
            {
                return BadRequest(new
                {
                    mensagem = "Pessoas menores de 18 anos só podem cadastrar despesas."
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

            return Created(
                $"/api/transacoes/{transacao.Id}",
                new
                {
                    transacao.Id,
                    transacao.Descricao,
                    transacao.Valor,
                    transacao.Tipo,
                    transacao.PessoaId,
                    PessoaNome = pessoa.Nome
                }
            );
        }

    }
}
