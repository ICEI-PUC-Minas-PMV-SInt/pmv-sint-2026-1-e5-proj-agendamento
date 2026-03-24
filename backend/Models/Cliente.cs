using System.ComponentModel.DataAnnotations;

namespace AgendamentoAPI.Models;

public class Cliente
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Nome { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Telefone { get; set; }

    [MaxLength(150)]
    public string? Email { get; set; }

    public DateOnly? DataNascimento { get; set; }

    public string? Observacoes { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    // Navegação
    public ICollection<Agendamento> Agendamentos { get; set; } = [];
}
