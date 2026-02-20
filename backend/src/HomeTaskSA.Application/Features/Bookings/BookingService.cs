using FluentValidation;
using HomeTaskSA.Application.Abstractions;
using HomeTaskSA.Application.DTOs;
using HomeTaskSA.Domain.Entities;

namespace HomeTaskSA.Application.Features.Bookings;

public class CreateBookingRequestValidator : AbstractValidator<CreateBookingRequest>
{
    public CreateBookingRequestValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.ServiceProviderId).NotEmpty();
        RuleFor(x => x.Date).GreaterThan(DateTime.UtcNow.AddMinutes(-1));
        RuleFor(x => x.DurationHours).InclusiveBetween(1, 12);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(200);
    }
}

public class BookingService(IBookingRepository bookings, IUserRepository users, IPaymentService payments)
{
    public async Task<BookingDto> CreateAsync(CreateBookingRequest request, CancellationToken cancellationToken = default)
    {
        var provider = await users.GetByIdAsync(request.ServiceProviderId, cancellationToken)
            ?? throw new InvalidOperationException("Provider not found");

        var rate = provider.ServiceProviderProfile?.HourlyRate
            ?? throw new InvalidOperationException("Provider profile missing");

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            CustomerId = request.CustomerId,
            ServiceProviderId = request.ServiceProviderId,
            Date = request.Date,
            DurationHours = request.DurationHours,
            Description = request.Description,
            TotalAmount = rate * request.DurationHours
        };

        payments.HoldPayment(booking);
        await bookings.AddAsync(booking, cancellationToken);
        await bookings.SaveChangesAsync(cancellationToken);

        return ToDto(booking);
    }

    public async Task<List<BookingDto>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var result = await bookings.GetByUserIdAsync(userId, cancellationToken);
        return result.Select(ToDto).ToList();
    }

    public async Task AcceptAsync(Guid bookingId, Guid providerId, CancellationToken cancellationToken = default)
    {
        var booking = await bookings.GetByIdAsync(bookingId, cancellationToken) ?? throw new InvalidOperationException("Booking not found");
        if (booking.ServiceProviderId != providerId)
        {
            throw new InvalidOperationException("Only assigned provider can accept.");
        }

        booking.Accept();
        await bookings.SaveChangesAsync(cancellationToken);
    }

    public async Task StartAsync(Guid bookingId, Guid providerId, CancellationToken cancellationToken = default)
    {
        var booking = await bookings.GetByIdAsync(bookingId, cancellationToken) ?? throw new InvalidOperationException("Booking not found");
        if (booking.ServiceProviderId != providerId)
        {
            throw new InvalidOperationException("Only assigned provider can start.");
        }

        booking.Start();
        await bookings.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkCompletedByProviderAsync(Guid bookingId, Guid providerId, CancellationToken cancellationToken = default)
    {
        var booking = await bookings.GetByIdAsync(bookingId, cancellationToken) ?? throw new InvalidOperationException("Booking not found");
        if (booking.ServiceProviderId != providerId)
        {
            throw new InvalidOperationException("Only assigned provider can mark completed.");
        }

        booking.CompleteByProvider();
        await bookings.SaveChangesAsync(cancellationToken);
    }

    public async Task ConfirmCompletionByCustomerAsync(Guid bookingId, Guid customerId, CancellationToken cancellationToken = default)
    {
        var booking = await bookings.GetByIdAsync(bookingId, cancellationToken) ?? throw new InvalidOperationException("Booking not found");
        if (booking.CustomerId != customerId)
        {
            throw new InvalidOperationException("Only customer can confirm completion.");
        }

        booking.ConfirmCompletionByCustomer();
        payments.ReleasePayment(booking);
        await bookings.SaveChangesAsync(cancellationToken);
    }

    private static BookingDto ToDto(Booking booking) =>
        new(booking.Id, booking.CustomerId, booking.ServiceProviderId, booking.Date, booking.DurationHours, booking.Description, booking.TotalAmount, booking.Status, booking.PaymentStatus);
}
