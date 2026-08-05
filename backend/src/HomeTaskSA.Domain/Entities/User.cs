using HomeTaskSA.Domain.Enums;

namespace HomeTaskSA.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string EmailDomain
    {
        get
        {
            if (string.IsNullOrWhiteSpace(Email))
            {
                return string.Empty;
            }

            var atIndex = Email.IndexOf('@');
            return atIndex < 0 ? string.Empty : Email[(atIndex + 1)..].Trim();
        }
    }

    public string EmailLocalPart
    {
        get
        {
            if (string.IsNullOrWhiteSpace(Email))
            {
                return string.Empty;
            }

            var trimmedEmail = Email.Trim();
            var atIndex = trimmedEmail.IndexOf('@');
            if (atIndex <= 0 || atIndex != trimmedEmail.LastIndexOf('@'))
            {
                return string.Empty;
            }

            var localPart = trimmedEmail[..atIndex].Trim();
            var domain = trimmedEmail[(atIndex + 1)..].Trim();
            return localPart.Length == 0 || domain.Length == 0 ? string.Empty : localPart;
        }
    }

    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }

    public CustomerProfile? CustomerProfile { get; set; }
    public ServiceProviderProfile? ServiceProviderProfile { get; set; }
}
