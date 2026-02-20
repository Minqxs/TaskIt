namespace HomeTaskSA.Domain.Entities;

public class OAuthIdentity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string OAuthSubject { get; set; } = string.Empty;

    public User User { get; set; } = default!;
}
