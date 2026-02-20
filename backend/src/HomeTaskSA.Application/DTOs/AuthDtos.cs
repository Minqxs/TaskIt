using HomeTaskSA.Domain.Enums;

namespace HomeTaskSA.Application.DTOs;

public record RegisterRequest(string Email, string Password, UserRole Role);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, Guid UserId, UserRole Role);
