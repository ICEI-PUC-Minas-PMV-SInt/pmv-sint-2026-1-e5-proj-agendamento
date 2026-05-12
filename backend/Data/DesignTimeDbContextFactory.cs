using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AgendamentoAPI.Data;

/// <summary>
/// Usado apenas pelo EF Core em tempo de design (dotnet ef migrations).
/// Conexão fake — não precisa de banco rodando para gerar as migrations.
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=5432;Database=agendamento_db;Username=postgres;Password=pucminasagendamento");

        return new AppDbContext(optionsBuilder.Options);
    }
}
