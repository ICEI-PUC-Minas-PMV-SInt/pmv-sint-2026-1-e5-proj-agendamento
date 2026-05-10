using AgendamentoAPI.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace AgendamentoAPI.Tests;

public class AgendamentoApiFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = $"AgendamentoTests_{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // Remove o registro existente do AppDbContext (Pomelo MySQL)
            var descriptors = services
                .Where(s =>
                    s.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                    s.ServiceType == typeof(AppDbContext))
                .ToList();
            foreach (var d in descriptors) services.Remove(d);

            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));
        });
    }
}
