using System.Net.Http.Headers;
using System.Net.Http.Json;
using AgendamentoAPI.DTOs;

namespace AgendamentoAPI.Tests;

internal static class TestHelpers
{
    public static async Task<(HttpClient client, AuthResponseDto auth)> AuthenticatedClient(AgendamentoApiFactory factory, string emailSeed = "auth")
    {
        var client = factory.CreateClient();
        var email = $"{emailSeed}-{Guid.NewGuid():N}@test.dev";

        var register = await client.PostAsJsonAsync("/api/auth/register",
            new RegisterDto("Tester", email, "senha123"));
        register.EnsureSuccessStatusCode();
        var auth = (await register.Content.ReadFromJsonAsync<AuthResponseDto>())!;

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.Token);
        return (client, auth);
    }
}
