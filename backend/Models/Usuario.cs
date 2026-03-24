using System.ComponentModel.DataAnnotations;

namespace AgendamentoAPI.Models;

public class Usuario
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Nome { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string SenhaHash { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Role { get; set; } = "admin";

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    // Navegação
    public ICollection<Agendamento> Agendamentos { get; set; } = [];
}
