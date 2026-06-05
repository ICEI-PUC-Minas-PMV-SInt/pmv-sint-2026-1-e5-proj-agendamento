using AgendamentoAPI.Models;

namespace AgendamentoAPI.Services;

public interface IEmailService
{
    Task EnviarConfirmacaoAgendamentoAsync(Agendamento agendamento);
}
