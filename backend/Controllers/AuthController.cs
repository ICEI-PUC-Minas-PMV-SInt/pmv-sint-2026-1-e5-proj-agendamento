using AgendamentoAPI.Data;
using AgendamentoAPI.DTOs;
using AgendamentoAPI.Models;
using AgendamentoAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgendamentoAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController(AppDbContext db, TokenService tokenService) : ControllerBase
{
    /// <summary>Registra um novo usuário (profissional)</summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await db.Usuarios.AnyAsync(u => u.Email == dto.Email))
            return Conflict(new { message = "E-mail já cadastrado." });

        var usuario = new Usuario
        {
            Nome = dto.Nome,
            Email = dto.Email,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha)
        };

        db.Usuarios.Add(usuario);
        await db.SaveChangesAsync();

        var token = tokenService.GerarToken(usuario);
        return CreatedAtAction(nameof(Register), new AuthResponseDto(token, usuario.Nome, usuario.Email, usuario.Role));
    }

    /// <summary>Realiza login e retorna o token JWT</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (usuario is null || !BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash))
            return Unauthorized(new { message = "Credenciais inválidas." });

        var token = tokenService.GerarToken(usuario);
        return Ok(new AuthResponseDto(token, usuario.Nome, usuario.Email, usuario.Role));
    }
}
