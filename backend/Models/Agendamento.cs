using System.ComponentModel.DataAnnotations;

namespace AgendamentoAPI.Models;

public enum StatusAgendamento
{
    Agendado,
    Realizado,
    Cancelado
}

public class Agendamento
{
    public int Id { get; set; }

    // FK Cliente
    public int ClienteId { get; set; }
    public Cliente Cliente { get; set; } = null!;

    // FK Serviço
    public int ServicoId { get; set; }
    public Servico Servico { get; set; } = null!;

    // FK Usuário (profissional que realizou)
    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;

    [Required]
    public DateTime DataHora { get; set; }

    public StatusAgendamento Status { get; set; } = StatusAgendamento.Agendado;

    public string? Observacoes { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
