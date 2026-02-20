using HomeTaskSA.Application.Abstractions;
using HomeTaskSA.Application.DTOs;
using HomeTaskSA.Domain.Enums;

namespace HomeTaskSA.Application.Features.Providers;

public class ProviderService(IUserRepository users)
{
    public async Task<List<ProviderDto>> GetProvidersAsync(CancellationToken cancellationToken = default)
    {
        var providers = await users.GetProvidersAsync(cancellationToken);
        return providers.Select(p => new ProviderDto(
            p.Id,
            p.Email,
            p.ServiceProviderProfile?.HourlyRate ?? 0,
            4.5)).ToList();
    }

    public async Task UpdateRateAsync(Guid providerId, UpdateRateRequest request, CancellationToken cancellationToken = default)
    {
        var provider = await users.GetByIdAsync(providerId, cancellationToken)
            ?? throw new InvalidOperationException("Provider not found");

        if (provider.Role != UserRole.ServiceProvider || provider.ServiceProviderProfile is null)
        {
            throw new InvalidOperationException("Not a service provider");
        }

        provider.ServiceProviderProfile.HourlyRate = request.HourlyRate;
        await users.SaveChangesAsync(cancellationToken);
    }
}
