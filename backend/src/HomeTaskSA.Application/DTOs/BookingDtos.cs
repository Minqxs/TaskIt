using HomeTaskSA.Domain.Enums;

namespace HomeTaskSA.Application.DTOs;

public record CreateBookingRequest(Guid CustomerId, Guid? ServiceProviderId, DateTime Date, int DurationHours, string Description, decimal? OfferedPrice);
public record UpdateBookingRequest(DateTime Date, int DurationHours, string Description, decimal OfferedPrice);
public record BookingDto(Guid Id, Guid CustomerId, Guid? ServiceProviderId, DateTime Date, int DurationHours, string Description, decimal TotalAmount, BookingStatus Status, PaymentStatus PaymentStatus);
