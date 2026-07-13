using System.ComponentModel.DataAnnotations;

namespace ControleGastos.Api.DTOs
{
    public class CriarPessoaDto
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        [StringLength(
            100,
            MinimumLength = 2,
            ErrorMessage = "O nome deve ter entre 2 e 100 caracteres."
        )]
        public string Nome { get; set; } = string.Empty;

        [Range(
            0,
            130,
            ErrorMessage = "A idade deve estar entre 0 e 130 anos."
        )]
        public int Idade { get; set; }
    }
}
