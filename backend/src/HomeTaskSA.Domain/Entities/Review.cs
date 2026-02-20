namespace HomeTaskSA.Domain.Entities;

public class Review
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;

    public Booking Booking { get; set; } = default!;
}
