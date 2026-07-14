using ControleGastos.Api.Data;
using ControleGastos.Api.DTOs;
using ControleGastos.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ControleGastos.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class TotaisController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TotaisController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<ConsultaTotaisDto>> Consultar()
        {
            var pessoas = await _context.Pessoas.AsNoTracking().Include(pessoa => pessoa.Transacoes).OrderBy(pessoa => pessoa.Nome).ToListAsync();

            var totaisPorPessoa = pessoas
                .Select(pessoa =>
                {
                    var totalReceitas = pessoa.Transacoes.Where(transacao =>
                            transacao.Tipo == TipoTransacao.Receita).Sum(transacao => transacao.Valor);

                    var totalDespesas = pessoa.Transacoes.Where(transacao =>
                            transacao.Tipo == TipoTransacao.Despesa).Sum(transacao => transacao.Valor);

                    return new TotalPessoaDto
                    {
                        PessoaId = pessoa.Id,
                        Nome = pessoa.Nome,
                        TotalReceitas = totalReceitas,
                        TotalDespesas = totalDespesas,

                        // O saldo corresponde às receitas .
                        Saldo = totalReceitas - totalDespesas
                    };
                }).ToList();

            var totalGeralReceitas = totaisPorPessoa.Sum(pessoa => pessoa.TotalReceitas);

            var totalGeralDespesas = totaisPorPessoa.Sum(pessoa => pessoa.TotalDespesas);

            var resultado = new ConsultaTotaisDto
            {
                Pessoas = totaisPorPessoa,
                TotalGeralReceitas = totalGeralReceitas,
                TotalGeralDespesas = totalGeralDespesas,

                // Representa o resultado financeiro .
                SaldoLiquidoGeral =
                    totalGeralReceitas - totalGeralDespesas
            };

            return Ok(resultado);
        }
    }
}
