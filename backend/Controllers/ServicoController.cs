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
public class ServicoController(AppDbContext db) : ControllerBase
{
    /// <summary>Lista todos os serviços ativos</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Servico>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] bool? ativo) =>
        Ok(await db.Servicos
            .Where(s => ativo == null || s.Ativo == ativo)
            .OrderBy(s => s.Nome)
            .ToListAsync());

    /// <summary>Busca um serviço pelo ID</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Servico), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var servico = await db.Servicos.FindAsync(id);
        return servico is null ? NotFound() : Ok(servico);
    }

    /// <summary>Cadastra um novo serviço</summary>
    [HttpPost]
    [ProducesResponseType(typeof(Servico), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] Servico servico)
    {
        servico.CriadoEm = DateTime.UtcNow;
        db.Servicos.Add(servico);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = servico.Id }, servico);
    }

    /// <summary>Atualiza um serviço</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] Servico servico)
    {
        if (id != servico.Id) return BadRequest();
        db.Entry(servico).State = EntityState.Modified;
        db.Entry(servico).Property(s => s.CriadoEm).IsModified = false;
        await db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Remove um serviço</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(int id)
    {
        var servico = await db.Servicos.FindAsync(id);
        if (servico is null) return NotFound();
        db.Servicos.Remove(servico);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
