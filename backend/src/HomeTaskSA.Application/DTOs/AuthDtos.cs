using HomeTaskSA.Domain.Enums;

namespace HomeTaskSA.Application.DTOs;

public record RegisterRequest(
    string Email,
    string Password,
    UserRole Role,
    string FullName,
    string PhoneNumber,
    string? GovernmentIdNumber,
    string? City,
    string? District,
    string? AddressLine);

public record OAuthLoginRequest(string Provider, string OAuthSubject, string Email, UserRole Role, string FullName);

public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, Guid UserId, UserRole Role);
