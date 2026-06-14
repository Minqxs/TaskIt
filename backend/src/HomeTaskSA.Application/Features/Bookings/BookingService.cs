using FluentValidation;
using HomeTaskSA.Application.Abstractions;
using HomeTaskSA.Application.DTOs;
using HomeTaskSA.Domain.Entities;
using HomeTaskSA.Domain.Enums;

namespace HomeTaskSA.Application.Features.Bookings;

public class CreateBookingRequestValidator : AbstractValidator<CreateBookingRequest>
{
    public CreateBookingRequestValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.Date).GreaterThan(DateTime.UtcNow.AddMinutes(-1));
        RuleFor(x => x.DurationHours).InclusiveBetween(1, 12);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
        When(x => x.ServiceProviderId is null, () =>
        {
            RuleFor(x => x.OfferedPrice).NotNull().GreaterThan(0);
        });
    }
}

public class UpdateBookingRequestValidator : AbstractValidator<UpdateBookingRequest>
{
    public UpdateBookingRequestValidator()
    {
        RuleFor(x => x.Date).GreaterThan(DateTime.UtcNow.AddMinutes(-1));
        RuleFor(x => x.DurationHours).InclusiveBetween(1, 12);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
        RuleFor(x => x.OfferedPrice).GreaterThan(0);
    }
}

public class BookingService(IBookingRepository bookings, IUserRepository users, IPaymentService payments)
{
    public async Task<BookingDto> CreateAsync(CreateBookingRequest request, CancellationToken cancellationToken = default)
    {
        decimal totalAmount;

        if (request.ServiceProviderId is Guid providerId)
        {
            var provider = await users.GetByIdAsync(providerId, cancellationToken)
                ?? throw new InvalidOperationException("Provider not found");

            var rate = provider.ServiceProviderProfile?.HourlyRate
                ?? throw new InvalidOperationException("Provider profile missing");

            totalAmount = rate * request.DurationHours;
        }
        else
        {
            totalAmount = request.OfferedPrice ?? throw new InvalidOperationException("Offered price is required.");
        }

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            CustomerId = request.CustomerId,
            ServiceProviderId = request.ServiceProviderId,
            Date = request.Date,
            DurationHours = request.DurationHours,
            Description = request.Description,
            TotalAmount = totalAmount
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

    public async Task<List<BookingDto>> GetForCurrentUserAsync(Guid userId, UserRole role, CancellationToken cancellationToken = default)
    {
        var result = role == UserRole.ServiceProvider
            ? await bookings.GetProviderQueueAsync(userId, cancellationToken)
            : await bookings.GetByUserIdAsync(userId, cancellationToken);

        return result.Select(ToDto).ToList();
    }

    public async Task<BookingDto> UpdateByCustomerAsync(Guid bookingId, Guid customerId, UpdateBookingRequest request, CancellationToken cancellationToken = default)
    {
        var booking = await bookings.GetByIdAsync(bookingId, cancellationToken)
            ?? throw new InvalidOperationException("Booking not found");

        if (booking.CustomerId != customerId)
        {
            throw new InvalidOperationException("Only the customer can edit this task.");
        }

        booking.UpdatePendingDetails(request.Date, request.DurationHours, request.Description, request.OfferedPrice);
        await bookings.SaveChangesAsync(cancellationToken);

        return ToDto(booking);
    }

    public async Task CancelByCustomerAsync(Guid bookingId, Guid customerId, CancellationToken cancellationToken = default)
    {
        var booking = await bookings.GetByIdAsync(bookingId, cancellationToken)
            ?? throw new InvalidOperationException("Booking not found");

        if (booking.CustomerId != customerId)
        {
            throw new InvalidOperationException("Only the customer can cancel this task.");
        }

        booking.CancelByCustomer();
        await bookings.SaveChangesAsync(cancellationToken);
    }

    public async Task AcceptAsync(Guid bookingId, Guid providerId, CancellationToken cancellationToken = default)
    {
        var booking = await bookings.GetByIdAsync(bookingId, cancellationToken) ?? throw new InvalidOperationException("Booking not found");
        if (booking.ServiceProviderId is not null && booking.ServiceProviderId != providerId)
        {
            throw new InvalidOperationException("Only assigned provider can accept.");
        }

        booking.Accept(providerId);
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
