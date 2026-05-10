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
}
