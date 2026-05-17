using System.Net;
using System.Net.Http.Json;
using AgendamentoAPI.Models;

namespace AgendamentoAPI.Tests;

public class ClienteEndpointsTests : IClassFixture<AgendamentoApiFactory>
{
    private readonly AgendamentoApiFactory _factory;
    public ClienteEndpointsTests(AgendamentoApiFactory factory) => _factory = factory;

    [Fact]
    public async Task Lista_sem_token_retorna_401()
    {
        var client = _factory.CreateClient();
        var resp = await client.GetAsync("/api/Cliente");
        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    [Fact]
    public async Task Crud_completo_de_cliente()
    {
        var (client, _) = await TestHelpers.AuthenticatedClient(_factory, "cli");

        // CREATE
        var create = await client.PostAsJsonAsync("/api/Cliente", new Cliente
        {
            Nome = "Amanda Silva",
            Telefone = "11999990000",
            Email = "amanda@test.dev",
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var criado = await create.Content.ReadFromJsonAsync<Cliente>();
        Assert.True(criado!.Id > 0);

        // GET BY ID
        var get = await client.GetAsync($"/api/Cliente/{criado.Id}");
        Assert.Equal(HttpStatusCode.OK, get.StatusCode);
        var found = await get.Content.ReadFromJsonAsync<Cliente>();
        Assert.Equal("Amanda Silva", found!.Nome);

        // UPDATE
        criado.Nome = "Amanda Souza";
        var put = await client.PutAsJsonAsync($"/api/Cliente/{criado.Id}", criado);
        Assert.Equal(HttpStatusCode.NoContent, put.StatusCode);

        var afterPut = await (await client.GetAsync($"/api/Cliente/{criado.Id}"))
            .Content.ReadFromJsonAsync<Cliente>();
        Assert.Equal("Amanda Souza", afterPut!.Nome);

        // LIST
        var list = await client.GetFromJsonAsync<List<Cliente>>("/api/Cliente");
        Assert.NotNull(list);
        Assert.Contains(list!, c => c.Id == criado.Id);

        // DELETE
        var del = await client.DeleteAsync($"/api/Cliente/{criado.Id}");
        Assert.Equal(HttpStatusCode.NoContent, del.StatusCode);

        var notFound = await client.GetAsync($"/api/Cliente/{criado.Id}");
        Assert.Equal(HttpStatusCode.NotFound, notFound.StatusCode);
    }

    [Fact]
    public async Task Excluir_cliente_com_agendamentos_remove_em_cascata()
    {
        // Regressão CT12: excluir uma cliente que possui agendamentos
        // estava retornando HTTP 500 por violação de FK (DeleteBehavior.Restrict).
        var (client, _) = await TestHelpers.AuthenticatedClient(_factory, "cli-cascade");

        var cliente = await (await client.PostAsJsonAsync("/api/Cliente", new Cliente
        {
            Nome = "Débora Silva",
        })).Content.ReadFromJsonAsync<Cliente>();

        var servico = await (await client.PostAsJsonAsync("/api/Servico", new Servico
        {
            Nome = "Volume Russo", DuracaoMinutos = 90, Preco = 180m, Ativo = true,
        })).Content.ReadFromJsonAsync<Servico>();

        var agendamento = await (await client.PostAsJsonAsync("/api/Agendamento", new Agendamento
        {
            ClienteId = cliente!.Id,
            ServicoId = servico!.Id,
            DataHora = DateTime.UtcNow.AddDays(2).Date.AddHours(14),
        })).Content.ReadFromJsonAsync<Agendamento>();

        // A exclusão deve funcionar (204), não retornar 500
        var del = await client.DeleteAsync($"/api/Cliente/{cliente.Id}");
        Assert.Equal(HttpStatusCode.NoContent, del.StatusCode);

        // A cliente e o agendamento relacionado devem ter sido removidos
        var clienteNotFound = await client.GetAsync($"/api/Cliente/{cliente.Id}");
        Assert.Equal(HttpStatusCode.NotFound, clienteNotFound.StatusCode);

        var agendamentoNotFound = await client.GetAsync($"/api/Agendamento/{agendamento!.Id}");
        Assert.Equal(HttpStatusCode.NotFound, agendamentoNotFound.StatusCode);
    }
}
