using AgendamentoAPI.Data;
using AgendamentoAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgendamentoAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class AgendamentoController(AppDbContext db) : ControllerBase
{
    /// <summary>Lista agendamentos com filtro opcional por data</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Agendamento>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] DateTime? data,
        [FromQuery] StatusAgendamento? status)
    {
        var query = db.Agendamentos
            .Include(a => a.Cliente)
            .Include(a => a.Servico)
            .AsQueryable();

        if (data.HasValue)
            query = query.Where(a => a.DataHora.Date == data.Value.Date);

        if (status.HasValue)
            query = query.Where(a => a.Status == status.Value);

        return Ok(await query.OrderBy(a => a.DataHora).ToListAsync());
    }

    /// <summary>Busca um agendamento pelo ID</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Agendamento), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var agendamento = await db.Agendamentos
            .Include(a => a.Cliente)
            .Include(a => a.Servico)
            .FirstOrDefaultAsync(a => a.Id == id);

        return agendamento is null ? NotFound() : Ok(agendamento);
    }

    /// <summary>Retorna histórico de atendimentos de uma cliente</summary>
    [HttpGet("cliente/{clienteId:int}")]
    [ProducesResponseType(typeof(IEnumerable<Agendamento>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByCliente(int clienteId) =>
        Ok(await db.Agendamentos
            .Include(a => a.Servico)
            .Where(a => a.ClienteId == clienteId)
            .OrderByDescending(a => a.DataHora)
            .ToListAsync());

    /// <summary>Cria um novo agendamento</summary>
    [HttpPost]
    [ProducesResponseType(typeof(Agendamento), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] Agendamento agendamento)
    {
        // Verifica conflito de horário
        var conflito = await db.Agendamentos.AnyAsync(a =>
            a.UsuarioId == agendamento.UsuarioId &&
            a.Status == StatusAgendamento.Agendado &&
            a.DataHora == agendamento.DataHora);

        if (conflito)
            return Conflict(new { message = "Já existe um agendamento neste horário." });

        agendamento.CriadoEm = DateTime.UtcNow;
        db.Agendamentos.Add(agendamento);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = agendamento.Id }, agendamento);
    }

    /// <summary>Atualiza status ou dados de um agendamento</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] Agendamento agendamento)
    {
        if (id != agendamento.Id) return BadRequest();
        db.Entry(agendamento).State = EntityState.Modified;
        db.Entry(agendamento).Property(a => a.CriadoEm).IsModified = false;
        await db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Cancela um agendamento</summary>
    [HttpPatch("{id:int}/cancelar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Cancelar(int id)
    {
        var agendamento = await db.Agendamentos.FindAsync(id);
        if (agendamento is null) return NotFound();
        agendamento.Status = StatusAgendamento.Cancelado;
        await db.SaveChangesAsync();
        return NoContent();
    }
}
