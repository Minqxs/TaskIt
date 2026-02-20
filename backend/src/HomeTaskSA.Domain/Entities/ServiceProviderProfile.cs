namespace HomeTaskSA.Domain.Entities;

public class ServiceProviderProfile
{
    public Guid UserId { get; set; }
    public decimal HourlyRate { get; set; }
    public bool IsVerified { get; set; } = false;

    public User User { get; set; } = default!;
}
