using HomeTaskSA.Domain.Enums;

namespace HomeTaskSA.Domain.Entities;

public class Booking
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public Guid? ServiceProviderId { get; set; }
    public DateTime Date { get; set; }
    public int DurationHours { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public BookingStatus Status { get; private set; } = BookingStatus.Pending;
    public PaymentStatus PaymentStatus { get; private set; } = PaymentStatus.Held;

    public User Customer { get; set; } = default!;
    public User? ServiceProvider { get; set; }
    public Review? Review { get; set; }
    public List<BookingApplication> Applications { get; set; } = [];

    public BookingApplication ShowInterest(Guid providerId, string? message = null)
    {
        if (CustomerId == providerId)
        {
            throw new InvalidOperationException("Customers cannot show interest in their own task.");
        }

        if (Status != BookingStatus.Pending && Status != BookingStatus.AwaitingCustomerSelection)
        {
            throw new InvalidOperationException("Task is not open for provider interest.");
        }

        if (Applications.Any(x =>
                x.ProviderId == providerId &&
                x.Status is BookingApplicationStatus.PendingCustomerDecision or BookingApplicationStatus.Selected))
        {
            throw new InvalidOperationException("You have already shown interest in this task.");
        }

        var application = new BookingApplication
        {
            Id = Guid.NewGuid(),
            BookingId = Id,
            ProviderId = providerId,
            Message = message,
            Booking = this
        };

        Applications.Add(application);
        ServiceProviderId = null;
        Status = BookingStatus.AwaitingCustomerSelection;

        return application;
    }

    public void AssignProvider(Guid providerId)
    {
        if (ServiceProviderId is not null && ServiceProviderId != providerId)
        {
            throw new InvalidOperationException("Task is already assigned to another provider.");
        }

        if (Status != BookingStatus.Pending && Status != BookingStatus.AwaitingCustomerSelection)
        {
            throw new InvalidOperationException("Only open tasks can be assigned.");
        }

        ServiceProviderId = providerId;
        Status = BookingStatus.InProgress;
    }

    public void Accept(Guid providerId)
    {
        AssignProvider(providerId);
    }

    public void Start()
    {
        if (Status == BookingStatus.InProgress)
        {
            return;
        }

        Transition(BookingStatus.Accepted, BookingStatus.InProgress);
    }

    public void CompleteByProvider() => Transition(BookingStatus.InProgress, BookingStatus.Completed);

    public void UpdatePendingDetails(DateTime date, int durationHours, string description, decimal totalAmount)
    {
        if (Status != BookingStatus.Pending && Status != BookingStatus.AwaitingCustomerSelection)
        {
            throw new InvalidOperationException("Only open tasks can be edited.");
        }

        Date = date;
        DurationHours = durationHours;
        Description = description;
        TotalAmount = totalAmount;
    }

    public void CancelByCustomer()
    {
        if (Status != BookingStatus.Pending && Status != BookingStatus.AwaitingCustomerSelection)
        {
            throw new InvalidOperationException("Only open tasks can be cancelled.");
        }

        Status = BookingStatus.Cancelled;
    }

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
