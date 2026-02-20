namespace HomeTaskSA.Domain.Entities;

public class CustomerProfile
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;

    public User User { get; set; } = default!;
}
