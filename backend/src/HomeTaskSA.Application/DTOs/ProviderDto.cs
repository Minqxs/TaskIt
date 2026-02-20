namespace HomeTaskSA.Application.DTOs;

public record ProviderDto(
    Guid UserId,
    string Name,
    decimal HourlyRate,
    double Rating,
    string City,
    string District,
    bool IsVerified);

public record UpdateRateRequest(decimal HourlyRate);
