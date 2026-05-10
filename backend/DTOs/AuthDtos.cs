using System.ComponentModel.DataAnnotations;

namespace AgendamentoAPI.DTOs;

public record LoginDto(
    [Required, EmailAddress] string Email,
    [Required] string Senha
);

public record RegisterDto(
    [Required, MaxLength(100)] string Nome,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Senha
);

public record AuthResponseDto(
    string Token,
    int Id,
    string Nome,
    string Email,
    string Role
);

public record MeDto(
    int Id,
    string Nome,
    string Email,
    string Role
);
