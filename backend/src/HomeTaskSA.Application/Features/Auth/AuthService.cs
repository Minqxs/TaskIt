using FluentValidation;
using HomeTaskSA.Application.Abstractions;
using HomeTaskSA.Application.DTOs;
using HomeTaskSA.Domain.Entities;
using HomeTaskSA.Domain.Enums;

namespace HomeTaskSA.Application.Features.Auth;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).MinimumLength(6);
        RuleFor(x => x.Role).Must(x => x is UserRole.Customer or UserRole.ServiceProvider);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(120);
        RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(30);

        When(x => x.Role == UserRole.ServiceProvider, () =>
        {
            RuleFor(x => x.GovernmentIdNumber).NotEmpty().MaximumLength(50);
            RuleFor(x => x.City).NotEmpty().MaximumLength(100);
            RuleFor(x => x.District).NotEmpty().MaximumLength(100);
            RuleFor(x => x.AddressLine).NotEmpty().MaximumLength(200);
        });
    }
}

public class OAuthLoginRequestValidator : AbstractValidator<OAuthLoginRequest>
{
    public OAuthLoginRequestValidator()
    {
        RuleFor(x => x.Provider).NotEmpty().MaximumLength(30);
        RuleFor(x => x.OAuthSubject).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Role).Must(x => x is UserRole.Customer or UserRole.ServiceProvider);
    }
}

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class AuthService(IUserRepository users, IPasswordHasher hasher, IJwtTokenService jwt)
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var existing = await users.GetByEmailAsync(request.Email, cancellationToken);
        if (existing is not null)
        {
            throw new InvalidOperationException("Email already exists");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = hasher.Hash(request.Password),
            Role = request.Role,
            CustomerProfile = request.Role == UserRole.Customer
                ? new CustomerProfile
                {
                    UserId = Guid.Empty,
                    FullName = request.FullName,
                    PhoneNumber = request.PhoneNumber
                }
                : null,
            ServiceProviderProfile = request.Role == UserRole.ServiceProvider
                ? new ServiceProviderProfile
                {
                    UserId = Guid.Empty,
                    HourlyRate = 100m,
                    FullName = request.FullName,
                    PhoneNumber = request.PhoneNumber,
                    GovernmentIdNumber = request.GovernmentIdNumber!,
                    City = request.City!,
                    District = request.District!,
                    AddressLine = request.AddressLine!,
                    IsVerified = false
                }
                : null
        };

        if (user.CustomerProfile is not null)
        {
            user.CustomerProfile.UserId = user.Id;
        }
        if (user.ServiceProviderProfile is not null)
        {
            user.ServiceProviderProfile.UserId = user.Id;
        }

        await users.AddAsync(user, cancellationToken);
        await users.SaveChangesAsync(cancellationToken);

        return new AuthResponse(jwt.GenerateToken(user), user.Id, user.Role);
    }

    public async Task<AuthResponse> OAuthLoginAsync(OAuthLoginRequest request, CancellationToken cancellationToken = default)
    {
        var existingByOAuth = await users.GetByOAuthSubjectAsync(request.Provider, request.OAuthSubject, cancellationToken);
        if (existingByOAuth is not null)
        {
            return new AuthResponse(jwt.GenerateToken(existingByOAuth), existingByOAuth.Id, existingByOAuth.Role);
        }

        var existingByEmail = await users.GetByEmailAsync(request.Email, cancellationToken);
        if (existingByEmail is not null)
        {
            await users.AddOAuthIdentityAsync(new OAuthIdentity
            {
                Id = Guid.NewGuid(),
                UserId = existingByEmail.Id,
                Provider = request.Provider,
                OAuthSubject = request.OAuthSubject
            }, cancellationToken);
            await users.SaveChangesAsync(cancellationToken);
            return new AuthResponse(jwt.GenerateToken(existingByEmail), existingByEmail.Id, existingByEmail.Role);
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = string.Empty,
            Role = request.Role,
            CustomerProfile = request.Role == UserRole.Customer
                ? new CustomerProfile { UserId = Guid.Empty, FullName = request.FullName, PhoneNumber = "" }
                : null,
            ServiceProviderProfile = request.Role == UserRole.ServiceProvider
                ? new ServiceProviderProfile
                {
                    UserId = Guid.Empty,
                    HourlyRate = 100m,
                    FullName = request.FullName,
                    PhoneNumber = string.Empty,
                    GovernmentIdNumber = string.Empty,
                    City = string.Empty,
                    District = string.Empty,
                    AddressLine = string.Empty,
                    IsVerified = false
                }
                : null
        };

        if (user.CustomerProfile is not null)
        {
            user.CustomerProfile.UserId = user.Id;
        }

        if (user.ServiceProviderProfile is not null)
        {
            user.ServiceProviderProfile.UserId = user.Id;
        }

        await users.AddAsync(user, cancellationToken);
        await users.AddOAuthIdentityAsync(new OAuthIdentity
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Provider = request.Provider,
            OAuthSubject = request.OAuthSubject
        }, cancellationToken);
        await users.SaveChangesAsync(cancellationToken);

        return new AuthResponse(jwt.GenerateToken(user), user.Id, user.Role);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await users.GetByEmailAsync(request.Email, cancellationToken)
            ?? throw new InvalidOperationException("Invalid credentials");

        if (string.IsNullOrWhiteSpace(user.PasswordHash) || !hasher.Verify(request.Password, user.PasswordHash))
        {
            throw new InvalidOperationException("Invalid credentials");
        }

        return new AuthResponse(jwt.GenerateToken(user), user.Id, user.Role);
    }
}
