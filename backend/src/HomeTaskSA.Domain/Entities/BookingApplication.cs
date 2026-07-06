using HomeTaskSA.Domain.Enums;

namespace HomeTaskSA.Domain.Entities;

public class BookingApplication
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public Guid ProviderId { get; set; }
    public BookingApplicationStatus Status { get; private set; } = BookingApplicationStatus.PendingCustomerDecision;
    public string? Message { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

    public Booking Booking { get; set; } = default!;
    public User Provider { get; set; } = default!;

    public void Select()
    {
        Status = BookingApplicationStatus.Selected;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject()
    {
        Status = BookingApplicationStatus.Rejected;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Withdraw()
    {
        Status = BookingApplicationStatus.Withdrawn;
        UpdatedAt = DateTime.UtcNow;
    }
}
