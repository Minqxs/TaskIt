using HomeTaskSA.Domain.Enums;

namespace HomeTaskSA.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }

    public CustomerProfile? CustomerProfile { get; set; }
    public ServiceProviderProfile? ServiceProviderProfile { get; set; }
}
