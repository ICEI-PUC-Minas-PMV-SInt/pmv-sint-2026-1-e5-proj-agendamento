using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AgendamentoAPI.Data;

/// <summary>
/// Usado apenas pelo EF Core em tempo de design (dotnet ef migrations).
/// Usa versão fixa do MySQL para não precisar de conexão ativa.
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

        // MySQL 8.0 — ajuste a versão se necessário
        optionsBuilder.UseMySql(
            "Server=localhost;Database=agendamento_db;User=root;Password=pucminasagendamento;",
            new MySqlServerVersion(new Version(8, 0, 36)));

        return new AppDbContext(optionsBuilder.Options);
    }
}
