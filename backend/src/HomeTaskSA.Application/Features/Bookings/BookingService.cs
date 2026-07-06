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
        RuleFor(x => x.OfferedPrice).NotNull().GreaterThan(0);
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

        totalAmount = request.OfferedPrice ?? throw new InvalidOperationException("Offered price is required.");

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            CustomerId = request.CustomerId,
            ServiceProviderId = null,
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

    public async Task<List<BookingDto>> GetAvailableForProviderAsync(Guid providerId, CancellationToken cancellationToken = default)
    {
        var result = await bookings.GetAvailableForProviderAsync(providerId, cancellationToken);
        return result.Select(ToDto).ToList();
    }

    public async Task<List<BookingApplicationDto>> GetApplicationsForProviderAsync(Guid providerId, CancellationToken cancellationToken = default)
    {
        var result = await bookings.GetApplicationsForProviderAsync(providerId, cancellationToken);
        return result.Select(ToApplicationDto).ToList();
    }

    public async Task<List<BookingProviderApplicationDto>> GetApplicationsForCustomerBookingAsync(
        Guid bookingId,
        Guid customerId,
        CancellationToken cancellationToken = default)
    {
        var booking = await bookings.GetByIdAsync(bookingId, cancellationToken)
            ?? throw new InvalidOperationException("Booking not found");

        if (booking.CustomerId != customerId)
        {
            throw new InvalidOperationException("Only the customer who created this task can view interested providers.");
        }

        var result = await bookings.GetApplicationsForBookingAsync(bookingId, cancellationToken);
        return result.Select(ToProviderApplicationDto).ToList();
    }

    public async Task<BookingDto> SelectProviderApplicationAsync(
        Guid bookingId,
        Guid applicationId,
        Guid customerId,
        CancellationToken cancellationToken = default)
    {
        var booking = await bookings.GetByIdWithApplicationsAsync(bookingId, cancellationToken)
            ?? throw new InvalidOperationException("Booking not found");

        if (booking.CustomerId != customerId)
        {
            throw new InvalidOperationException("Only the customer who created this task can assign a provider.");
        }

        var selectedApplication = booking.Applications.FirstOrDefault(x => x.Id == applicationId)
            ?? throw new InvalidOperationException("Provider application not found.");

        if (selectedApplication.Status == BookingApplicationStatus.Withdrawn)
        {
            throw new InvalidOperationException("Withdrawn applications cannot be selected.");
        }

        booking.AssignProvider(selectedApplication.ProviderId);
        selectedApplication.Select();

        foreach (var application in booking.Applications.Where(x => x.Id != selectedApplication.Id))
        {
            if (application.Status != BookingApplicationStatus.Withdrawn)
            {
                application.Reject();
            }
        }

        await bookings.SaveChangesAsync(cancellationToken);

        return ToDto(booking);
    }

    public async Task<BookingApplicationDto> ShowInterestAsync(
        Guid bookingId,
        Guid providerId,
        CreateBookingApplicationRequest request,
        CancellationToken cancellationToken = default)
    {
        var provider = await users.GetByIdAsync(providerId, cancellationToken)
            ?? throw new InvalidOperationException("Provider not found");

        if (provider.Role != UserRole.ServiceProvider)
        {
            throw new InvalidOperationException("Only service providers can show interest in tasks.");
        }

        if (await bookings.HasActiveApplicationAsync(bookingId, providerId, cancellationToken))
        {
            throw new InvalidOperationException("You have already shown interest in this task.");
        }

        var booking = await bookings.GetByIdWithApplicationsAsync(bookingId, cancellationToken)
            ?? throw new InvalidOperationException("Booking not found");

        var application = booking.ShowInterest(providerId, request.Message);
        await bookings.AddApplicationAsync(application, cancellationToken);
        await bookings.SaveChangesAsync(cancellationToken);

        return ToApplicationDto(application);
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
        await ShowInterestAsync(bookingId, providerId, new CreateBookingApplicationRequest(null), cancellationToken);
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

    private static BookingApplicationDto ToApplicationDto(BookingApplication application) =>
        new(
            application.Id,
            application.BookingId,
            application.ProviderId,
            application.Status,
            application.CreatedAt,
            application.UpdatedAt,
            application.Message,
            ToDto(application.Booking));

    private static BookingProviderApplicationDto ToProviderApplicationDto(BookingApplication application)
    {
        var profile = application.Provider.ServiceProviderProfile;

        return new BookingProviderApplicationDto(
            application.Id,
            application.BookingId,
            application.ProviderId,
            application.Status,
            application.CreatedAt,
            application.UpdatedAt,
            application.Message,
            new ProviderDto(
                application.Provider.Id,
                profile?.FullName ?? application.Provider.Email,
                profile?.HourlyRate ?? 0,
                4.5,
                profile?.City ?? string.Empty,
                profile?.District ?? string.Empty,
                profile?.IsVerified ?? false));
    }
}
