using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
    public Cliente? Cliente { get; set; }

    // FK Serviço
    public int ServicoId { get; set; }
    public Servico? Servico { get; set; }

    // FK Usuário (profissional que realizou)
    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    // Armazenado como `timestamp without time zone` — o app trata DataHora como
    // horário "cru" digitado pela profissional (ex: "14:00"), sem semântica de
    // timezone. Isso evita o problema do Npgsql 9 rejeitar Kind=Unspecified
    // em colunas timestamptz e faz com que o JSON volte sem "Z" no final,
    // o que o JavaScript do app interpreta como local time corretamente.
    [Required]
    [Column(TypeName = "timestamp without time zone")]
    public DateTime DataHora { get; set; }

    public StatusAgendamento Status { get; set; } = StatusAgendamento.Agendado;

    public string? Observacoes { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
