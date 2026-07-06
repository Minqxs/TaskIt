using HomeTaskSA.Application.Abstractions;
using HomeTaskSA.Application.DTOs;
using HomeTaskSA.Domain.Entities;
using HomeTaskSA.Domain.Enums;

namespace HomeTaskSA.Application.Features.Profiles;

public class ProfileService(IUserRepository users)
{
    public async Task<CustomerProfileDto> GetCustomerProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await GetUserAsync(userId, cancellationToken);
        EnsureRole(user, UserRole.Customer);

        var profile = user.CustomerProfile ??= new CustomerProfile
        {
            UserId = user.Id,
            FullName = user.Email,
            PhoneNumber = string.Empty
        };

        await users.SaveChangesAsync(cancellationToken);
        return ToCustomerProfileDto(user, profile);
    }

    public async Task<CustomerProfileDto> UpdateCustomerProfileAsync(
        Guid userId,
        UpdateCustomerProfileRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await GetUserAsync(userId, cancellationToken);
        EnsureRole(user, UserRole.Customer);

        var profile = user.CustomerProfile ??= new CustomerProfile { UserId = user.Id };
        profile.FullName = request.FullName.Trim();
        profile.PhoneNumber = request.PhoneNumber.Trim();

        await users.SaveChangesAsync(cancellationToken);
        return ToCustomerProfileDto(user, profile);
    }

    public async Task<ServiceProviderProfileDto> GetProviderProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await GetUserAsync(userId, cancellationToken);
        EnsureRole(user, UserRole.ServiceProvider);

        var profile = user.ServiceProviderProfile ??= new ServiceProviderProfile
        {
            UserId = user.Id,
            FullName = user.Email,
            PhoneNumber = string.Empty
        };

        await users.SaveChangesAsync(cancellationToken);
        return ToProviderProfileDto(user, profile);
    }

    public async Task<ServiceProviderProfileDto> UpdateProviderProfileAsync(
        Guid userId,
        UpdateServiceProviderProfileRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await GetUserAsync(userId, cancellationToken);
        EnsureRole(user, UserRole.ServiceProvider);

        var profile = user.ServiceProviderProfile ??= new ServiceProviderProfile { UserId = user.Id };
        profile.FullName = request.FullName.Trim();
        profile.PhoneNumber = request.PhoneNumber.Trim();
        profile.HourlyRate = request.HourlyRate;
        profile.GovernmentIdNumber = request.GovernmentIdNumber.Trim();
        profile.City = request.City.Trim();
        profile.District = request.District.Trim();
        profile.AddressLine = request.AddressLine.Trim();

        await users.SaveChangesAsync(cancellationToken);
        return ToProviderProfileDto(user, profile);
    }

    private async Task<User> GetUserAsync(Guid userId, CancellationToken cancellationToken)
        => await users.GetByIdAsync(userId, cancellationToken)
            ?? throw new InvalidOperationException("User not found.");

    private static void EnsureRole(User user, UserRole role)
    {
        if (user.Role != role)
        {
            throw new InvalidOperationException($"User is not a {role}.");
        }
    }

    private static CustomerProfileDto ToCustomerProfileDto(User user, CustomerProfile profile)
        => new(user.Id, user.Email, profile.FullName, profile.PhoneNumber);

    private static ServiceProviderProfileDto ToProviderProfileDto(User user, ServiceProviderProfile profile)
        => new(
            user.Id,
            user.Email,
            profile.FullName,
            profile.PhoneNumber,
            profile.HourlyRate,
            profile.GovernmentIdNumber,
            profile.City,
            profile.District,
            profile.AddressLine,
            profile.IsVerified);
}
