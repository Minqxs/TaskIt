using FluentValidation;
using HomeTaskSA.Application.Abstractions;
using HomeTaskSA.Application.DTOs;
using HomeTaskSA.Domain.Entities;
using HomeTaskSA.Domain.Enums;

namespace HomeTaskSA.Application.Features.Reviews;

public class CreateReviewRequestValidator : AbstractValidator<CreateReviewRequest>
{
    public CreateReviewRequestValidator()
    {
        RuleFor(x => x.BookingId).NotEmpty();
        RuleFor(x => x.Rating).InclusiveBetween(1, 5);
        RuleFor(x => x.Comment).NotEmpty().MaximumLength(250);
    }
}

public class ReviewService(IBookingRepository bookings)
{
    public async Task AddReviewAsync(CreateReviewRequest request, CancellationToken cancellationToken = default)
    {
        var booking = await bookings.GetByIdAsync(request.BookingId, cancellationToken)
            ?? throw new InvalidOperationException("Booking not found");

        if (booking.Status != BookingStatus.Completed)
        {
            throw new InvalidOperationException("Review is only allowed for completed bookings.");
        }

        if (await bookings.HasReviewAsync(request.BookingId, cancellationToken))
        {
            throw new InvalidOperationException("Review already exists.");
        }

        booking.Review = new Review
        {
            Id = Guid.NewGuid(),
            BookingId = request.BookingId,
            Rating = request.Rating,
            Comment = request.Comment
        };

        await bookings.SaveChangesAsync(cancellationToken);
    }
}
