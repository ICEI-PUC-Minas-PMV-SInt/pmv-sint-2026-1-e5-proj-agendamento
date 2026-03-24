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
public class ClienteController(AppDbContext db) : ControllerBase
{
    /// <summary>Lista todas as clientes</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Cliente>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll() =>
        Ok(await db.Clientes.OrderBy(c => c.Nome).ToListAsync());

    /// <summary>Busca uma cliente pelo ID</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Cliente), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var cliente = await db.Clientes.FindAsync(id);
        return cliente is null ? NotFound() : Ok(cliente);
    }

    /// <summary>Cadastra uma nova cliente</summary>
    [HttpPost]
    [ProducesResponseType(typeof(Cliente), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] Cliente cliente)
    {
        cliente.CriadoEm = DateTime.UtcNow;
        db.Clientes.Add(cliente);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = cliente.Id }, cliente);
    }

    /// <summary>Atualiza os dados de uma cliente</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] Cliente cliente)
    {
        if (id != cliente.Id) return BadRequest();
        db.Entry(cliente).State = EntityState.Modified;
        db.Entry(cliente).Property(c => c.CriadoEm).IsModified = false;
        await db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Remove uma cliente</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var cliente = await db.Clientes.FindAsync(id);
        if (cliente is null) return NotFound();
        db.Clientes.Remove(cliente);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
