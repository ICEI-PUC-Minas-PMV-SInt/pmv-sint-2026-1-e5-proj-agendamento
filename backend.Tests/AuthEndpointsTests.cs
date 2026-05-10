using System.Net;
using System.Net.Http.Json;
using AgendamentoAPI.DTOs;

namespace AgendamentoAPI.Tests;

public class AuthEndpointsTests : IClassFixture<AgendamentoApiFactory>
{
    private readonly AgendamentoApiFactory _factory;
    public AuthEndpointsTests(AgendamentoApiFactory factory) => _factory = factory;

    [Fact]
    public async Task Register_devolve_token_e_dados_do_usuario()
    {
        var client = _factory.CreateClient();
        var email = $"u-{Guid.NewGuid():N}@test.dev";

        var resp = await client.PostAsJsonAsync("/api/auth/register",
            new RegisterDto("Maria", email, "senha123"));

        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(body);
        Assert.False(string.IsNullOrWhiteSpace(body!.Token));
        Assert.Equal("Maria", body.Nome);
        Assert.Equal(email, body.Email);
        Assert.True(body.Id > 0);
    }

    [Fact]
    public async Task Register_email_duplicado_retorna_409()
    {
        var client = _factory.CreateClient();
        var email = $"dup-{Guid.NewGuid():N}@test.dev";

        var first = await client.PostAsJsonAsync("/api/auth/register",
            new RegisterDto("Maria", email, "senha123"));
        first.EnsureSuccessStatusCode();

        var second = await client.PostAsJsonAsync("/api/auth/register",
            new RegisterDto("Maria 2", email, "senha456"));

        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    [Fact]
    public async Task Login_credenciais_validas_retorna_token()
    {
        var client = _factory.CreateClient();
        var email = $"login-{Guid.NewGuid():N}@test.dev";

        await client.PostAsJsonAsync("/api/auth/register",
            new RegisterDto("Joana", email, "minhasenha"));

        var resp = await client.PostAsJsonAsync("/api/auth/login",
            new LoginDto(email, "minhasenha"));

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.False(string.IsNullOrWhiteSpace(body!.Token));
    }

    [Fact]
    public async Task Login_senha_invalida_retorna_401()
    {
        var client = _factory.CreateClient();
        var email = $"bad-{Guid.NewGuid():N}@test.dev";

        await client.PostAsJsonAsync("/api/auth/register",
            new RegisterDto("X", email, "certo"));

        var resp = await client.PostAsJsonAsync("/api/auth/login",
            new LoginDto(email, "errado"));

        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    [Fact]
    public async Task Me_sem_token_retorna_401()
    {
        var client = _factory.CreateClient();
        var resp = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }

    [Fact]
    public async Task Me_com_token_retorna_dados_do_usuario()
    {
        var (client, auth) = await TestHelpers.AuthenticatedClient(_factory, "me");
        var resp = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<MeDto>();
        Assert.Equal(auth.Id, body!.Id);
        Assert.Equal(auth.Email, body.Email);
    }
}
