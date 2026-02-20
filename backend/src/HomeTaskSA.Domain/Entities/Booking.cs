using HomeTaskSA.Domain.Enums;

namespace HomeTaskSA.Domain.Entities;

public class Booking
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ServiceProviderId { get; set; }
    public DateTime Date { get; set; }
    public int DurationHours { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public BookingStatus Status { get; private set; } = BookingStatus.Pending;
    public PaymentStatus PaymentStatus { get; private set; } = PaymentStatus.Held;

    public User Customer { get; set; } = default!;
    public User ServiceProvider { get; set; } = default!;
    public Review? Review { get; set; }

    public void Accept() => Transition(BookingStatus.Pending, BookingStatus.Accepted);

    public void Start() => Transition(BookingStatus.Accepted, BookingStatus.InProgress);

    public void CompleteByProvider() => Transition(BookingStatus.InProgress, BookingStatus.Completed);

    public void ConfirmCompletionByCustomer()
    {
        if (Status != BookingStatus.Completed)
        {
            throw new InvalidOperationException("Booking must be completed by provider first.");
        }

        PaymentStatus = PaymentStatus.Released;
    }

    private void Transition(BookingStatus expected, BookingStatus next)
    {
        if (Status != expected)
        {
            throw new InvalidOperationException($"Invalid transition {Status} -> {next}");
        }

        Status = next;
    }
}
