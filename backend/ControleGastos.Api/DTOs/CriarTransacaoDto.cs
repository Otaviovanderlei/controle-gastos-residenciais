using ControleGastos.Api.Models;
using System.ComponentModel.DataAnnotations;

namespace ControleGastos.Api.DTOs

{
    public class CriarTransacaoDto
    {
        [Required(ErrorMessage = "A descrição é obrigatória.")]
        [StringLength(
                   200,
                   MinimumLength = 2,
                   ErrorMessage = "A descrição deve ter entre 2 e 200 caracteres."
               )]
        public string Descricao { get; set; } = string.Empty;

        [Range(
            0.01,
            double.MaxValue,
            ErrorMessage = "O valor deve ser maior que zero."
        )]
        public decimal Valor { get; set; }

        [EnumDataType(
            typeof(TipoTransacao),
            ErrorMessage = "O tipo deve ser Despesa ou Receita."
        )]
        public TipoTransacao Tipo { get; set; }

        [Range(
            1,
            int.MaxValue,
            ErrorMessage = "Informe um identificador de pessoa válido."
        )]
        public int PessoaId { get; set; }
    }
}
