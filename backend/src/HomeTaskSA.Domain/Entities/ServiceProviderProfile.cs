namespace HomeTaskSA.Domain.Entities;

public class ServiceProviderProfile
{
    public Guid UserId { get; set; }
    public decimal HourlyRate { get; set; }

    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string GovernmentIdNumber { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string AddressLine { get; set; } = string.Empty;

    public bool IsVerified { get; set; } = false;

    public User User { get; set; } = default!;
}
