using System.Net;
using System.Net.Http.Json;
using AgendamentoAPI.Models;

namespace AgendamentoAPI.Tests;

public class AgendamentoEndpointsTests : IClassFixture<AgendamentoApiFactory>
{
    private readonly AgendamentoApiFactory _factory;
    public AgendamentoEndpointsTests(AgendamentoApiFactory factory) => _factory = factory;

    private static async Task<(int clienteId, int servicoId)> SeedClienteServico(HttpClient client)
    {
        var c = await (await client.PostAsJsonAsync("/api/Cliente", new Cliente { Nome = "Cliente X" }))
            .Content.ReadFromJsonAsync<Cliente>();
        var s = await (await client.PostAsJsonAsync("/api/Servico", new Servico
        {
            Nome = "Volume Russo", DuracaoMinutos = 90, Preco = 180m, Ativo = true
        })).Content.ReadFromJsonAsync<Servico>();
        return (c!.Id, s!.Id);
    }

    [Fact]
    public async Task Criacao_com_conflito_retorna_409()
    {
        var (client, _) = await TestHelpers.AuthenticatedClient(_factory, "ag-conf");
        var (clienteId, servicoId) = await SeedClienteServico(client);
        var when = DateTime.UtcNow.AddDays(1).Date.AddHours(14);

        var first = await client.PostAsJsonAsync("/api/Agendamento", new Agendamento
        {
            ClienteId = clienteId, ServicoId = servicoId, DataHora = when,
        });
        first.EnsureSuccessStatusCode();

        var second = await client.PostAsJsonAsync("/api/Agendamento", new Agendamento
        {
            ClienteId = clienteId, ServicoId = servicoId, DataHora = when,
        });
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    [Fact]
    public async Task Cancelar_marca_status_como_cancelado()
    {
        var (client, _) = await TestHelpers.AuthenticatedClient(_factory, "ag-cancel");
        var (clienteId, servicoId) = await SeedClienteServico(client);

        var created = await (await client.PostAsJsonAsync("/api/Agendamento", new Agendamento
        {
            ClienteId = clienteId, ServicoId = servicoId,
            DataHora = DateTime.UtcNow.AddDays(2).Date.AddHours(10),
        })).Content.ReadFromJsonAsync<Agendamento>();

        var resp = await client.PatchAsync($"/api/Agendamento/{created!.Id}/cancelar", null);
        Assert.Equal(HttpStatusCode.NoContent, resp.StatusCode);

        var got = await client.GetFromJsonAsync<Agendamento>($"/api/Agendamento/{created.Id}");
        Assert.Equal(StatusAgendamento.Cancelado, got!.Status);
    }

    [Fact]
    public async Task Concluir_marca_status_como_realizado()
    {
        var (client, _) = await TestHelpers.AuthenticatedClient(_factory, "ag-done");
        var (clienteId, servicoId) = await SeedClienteServico(client);

        var created = await (await client.PostAsJsonAsync("/api/Agendamento", new Agendamento
        {
            ClienteId = clienteId, ServicoId = servicoId,
            DataHora = DateTime.UtcNow.AddDays(3).Date.AddHours(15),
        })).Content.ReadFromJsonAsync<Agendamento>();

        var resp = await client.PatchAsync($"/api/Agendamento/{created!.Id}/concluir", null);
        Assert.Equal(HttpStatusCode.NoContent, resp.StatusCode);

        var got = await client.GetFromJsonAsync<Agendamento>($"/api/Agendamento/{created.Id}");
        Assert.Equal(StatusAgendamento.Realizado, got!.Status);
    }

    [Fact]
    public async Task Historico_por_cliente_retorna_apenas_da_cliente_informada()
    {
        var (client, _) = await TestHelpers.AuthenticatedClient(_factory, "ag-hist");
        var (cliente1, servicoId) = await SeedClienteServico(client);
        var cliente2 = (await (await client.PostAsJsonAsync("/api/Cliente", new Cliente { Nome = "Outra" }))
            .Content.ReadFromJsonAsync<Cliente>())!.Id;

        await client.PostAsJsonAsync("/api/Agendamento", new Agendamento
        { ClienteId = cliente1, ServicoId = servicoId, DataHora = DateTime.UtcNow.AddDays(4).Date.AddHours(11) });
        await client.PostAsJsonAsync("/api/Agendamento", new Agendamento
        { ClienteId = cliente2, ServicoId = servicoId, DataHora = DateTime.UtcNow.AddDays(4).Date.AddHours(13) });

        var hist = await client.GetFromJsonAsync<List<Agendamento>>($"/api/Agendamento/cliente/{cliente1}");
        Assert.NotNull(hist);
        Assert.All(hist!, a => Assert.Equal(cliente1, a.ClienteId));
    }

    [Fact]
    public async Task Update_em_horario_ocupado_retorna_409()
    {
        var (client, _) = await TestHelpers.AuthenticatedClient(_factory, "ag-up");
        var (clienteId, servicoId) = await SeedClienteServico(client);
        var t1 = DateTime.UtcNow.AddDays(5).Date.AddHours(9);
        var t2 = DateTime.UtcNow.AddDays(5).Date.AddHours(11);

        var a1 = (await (await client.PostAsJsonAsync("/api/Agendamento", new Agendamento
        { ClienteId = clienteId, ServicoId = servicoId, DataHora = t1 })).Content.ReadFromJsonAsync<Agendamento>())!;
        var a2 = (await (await client.PostAsJsonAsync("/api/Agendamento", new Agendamento
        { ClienteId = clienteId, ServicoId = servicoId, DataHora = t2 })).Content.ReadFromJsonAsync<Agendamento>())!;

        a2.DataHora = t1; // colidir com a1
        var put = await client.PutAsJsonAsync($"/api/Agendamento/{a2.Id}", a2);
        Assert.Equal(HttpStatusCode.Conflict, put.StatusCode);
    }
}
