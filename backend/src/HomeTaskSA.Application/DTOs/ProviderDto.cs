namespace HomeTaskSA.Application.DTOs;

public record ProviderDto(Guid UserId, string Name, decimal HourlyRate, double Rating);
public record UpdateRateRequest(decimal HourlyRate);
