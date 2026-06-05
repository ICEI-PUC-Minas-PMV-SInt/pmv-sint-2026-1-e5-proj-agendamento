using AgendamentoAPI.Models;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace AgendamentoAPI.Services;

public class EmailService(IConfiguration config, ILogger<EmailService> logger) : IEmailService
{
    public async Task EnviarConfirmacaoAgendamentoAsync(Agendamento agendamento)
    {
        var clienteEmail = agendamento.Cliente?.Email;
        if (string.IsNullOrWhiteSpace(clienteEmail))
            return;

        var apiKey = config["SendGrid:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            logger.LogWarning("SendGrid:ApiKey não configurada. Email de confirmação não enviado.");
            return;
        }

        var fromEmail = config["SendGrid:FromEmail"] ?? "noreply@agendamento.app";
        var fromName  = config["SendGrid:FromName"]  ?? "Ivinah Sousa Lash Design";

        var clienteNome  = agendamento.Cliente?.Nome ?? "Cliente";
        var servicoNome  = agendamento.Servico?.Nome ?? "Serviço";
        var dataHora     = agendamento.DataHora.ToString("dd/MM/yyyy 'às' HH:mm");

        var client  = new SendGridClient(apiKey);
        var from    = new EmailAddress(fromEmail, fromName);
        var to      = new EmailAddress(clienteEmail, clienteNome);
        var subject = "Agendamento confirmado!";

        var plainText = $"Olá, {clienteNome}! Seu agendamento foi confirmado.\n" +
                        $"Serviço: {servicoNome}\n" +
                        $"Data e hora: {dataHora}\n" +
                        (string.IsNullOrWhiteSpace(agendamento.Observacoes)
                            ? string.Empty
                            : $"Observações: {agendamento.Observacoes}\n");

        var html = $"""
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
            <style>@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;700&display=swap');</style>
            <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0">
                <tr>
                  <td align="center">
                    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
                      <tr>
                        <td style="background:#b76e79;padding:28px 32px;text-align:center">
                          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700">Agendamento Confirmado ✓</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:32px">
                          <p style="margin:0 0 16px;color:#333;font-size:24px;font-weight:700;font-family:'Bodoni Moda',Georgia,serif">Olá, <span style="color:#B76E79">{clienteNome}</span>!</p>
                          <p style="margin:0 0 24px;color:#555;font-size:15px">Seu agendamento foi registrado com sucesso com Ivinah Sousa Lash Design. Confira os detalhes abaixo:</p>
                          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf4f5;border-radius:6px;padding:20px">
                            <tr>
                              <td style="padding:8px 0;color:#888;font-size:13px;width:120px">SERVIÇO</td>
                              <td style="padding:8px 0;color:#333;font-size:15px;font-weight:600">{servicoNome}</td>
                            </tr>
                            <tr>
                              <td style="padding:8px 0;color:#888;font-size:13px">DATA E HORA</td>
                              <td style="padding:8px 0;color:#333;font-size:15px;font-weight:600">{dataHora}</td>
                            </tr>
                            {(string.IsNullOrWhiteSpace(agendamento.Observacoes) ? string.Empty : $"""
                            <tr>
                              <td style="padding:8px 0;color:#888;font-size:13px">OBSERVAÇÕES</td>
                              <td style="padding:8px 0;color:#333;font-size:14px">{agendamento.Observacoes}</td>
                            </tr>
                            """)}
                          </table>
                          <p style="margin:24px 0 0;color:#888;font-size:13px">Em caso de dúvidas ou para reagendar, entre em contato conosco.</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background:#f9f9f9;padding:16px 32px;text-align:center;border-top:1px solid #eee">
                          <p style="margin:0;color:#aaa;font-size:12px">Este é um email automático, por favor não responda.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """;

        var msg      = MailHelper.CreateSingleEmail(from, to, subject, plainText, html);
        var response = await client.SendEmailAsync(msg);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Body.ReadAsStringAsync();
            logger.LogError("Falha ao enviar email via SendGrid. Status: {Status}. Body: {Body}",
                response.StatusCode, body);
        }
        else
        {
            logger.LogInformation("Email de confirmação enviado para {Email} (agendamento #{Id})",
                clienteEmail, agendamento.Id);
        }
    }
}
