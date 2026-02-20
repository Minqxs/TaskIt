namespace HomeTaskSA.Application.DTOs;

public record CreateReviewRequest(Guid BookingId, int Rating, string Comment);
