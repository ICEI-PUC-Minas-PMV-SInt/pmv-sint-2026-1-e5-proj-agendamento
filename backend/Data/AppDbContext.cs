using AgendamentoAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AgendamentoAPI.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Cliente> Clientes { get; set; }
    public DbSet<Servico> Servicos { get; set; }
    public DbSet<Agendamento> Agendamentos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Índice único no e-mail do usuário
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Relacionamentos de Agendamento
        modelBuilder.Entity<Agendamento>()
            .HasOne(a => a.Cliente)
            .WithMany(c => c.Agendamentos)
            .HasForeignKey(a => a.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Agendamento>()
            .HasOne(a => a.Servico)
            .WithMany(s => s.Agendamentos)
            .HasForeignKey(a => a.ServicoId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Agendamento>()
            .HasOne(a => a.Usuario)
            .WithMany(u => u.Agendamentos)
            .HasForeignKey(a => a.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        // Enum como string no banco
        modelBuilder.Entity<Agendamento>()
            .Property(a => a.Status)
            .HasConversion<string>();

        // Seed: serviços iniciais (data estática para evitar re-migration a cada build)
        var seedDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<Servico>().HasData(
            new Servico { Id = 1, Nome = "Aplicação de Cílios", DuracaoMinutos = 120, Preco = 150.00m, CriadoEm = seedDate },
            new Servico { Id = 2, Nome = "Manutenção de Extensão de Cílios", DuracaoMinutos = 90, Preco = 100.00m, CriadoEm = seedDate },
            new Servico { Id = 3, Nome = "Design de Sobrancelhas", DuracaoMinutos = 35, Preco = 45.00m, CriadoEm = seedDate },
            new Servico { Id = 4, Nome = "Design de Sobrancelhas com Henna", DuracaoMinutos = 40, Preco = 55.00m, CriadoEm = seedDate }
        );
    }
}
