using HomeTaskSA.Domain.Enums;

namespace HomeTaskSA.Application.DTOs;

public record CreateBookingRequest(Guid CustomerId, Guid ServiceProviderId, DateTime Date, int DurationHours, string Description);
public record BookingDto(Guid Id, Guid CustomerId, Guid ServiceProviderId, DateTime Date, int DurationHours, string Description, decimal TotalAmount, BookingStatus Status, PaymentStatus PaymentStatus);
