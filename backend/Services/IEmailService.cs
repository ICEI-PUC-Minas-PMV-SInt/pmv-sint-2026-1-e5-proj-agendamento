using AgendamentoAPI.Models;

namespace AgendamentoAPI.Services;

public interface IEmailService
{
    Task EnviarConfirmacaoAgendamentoAsync(Agendamento agendamento);
    Task EnviarAtualizacaoAgendamentoAsync(Agendamento agendamento);
    Task EnviarCancelamentoAgendamentoAsync(Agendamento agendamento);
}
