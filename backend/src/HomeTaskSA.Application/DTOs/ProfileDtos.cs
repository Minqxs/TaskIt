namespace HomeTaskSA.Application.DTOs;

public record CustomerProfileDto(
    Guid UserId,
    string Email,
    string FullName,
    string PhoneNumber);

public record UpdateCustomerProfileRequest(
    string FullName,
    string PhoneNumber);

public record ServiceProviderProfileDto(
    Guid UserId,
    string Email,
    string FullName,
    string PhoneNumber,
    decimal HourlyRate,
    string GovernmentIdNumber,
    string City,
    string District,
    string AddressLine,
    bool IsVerified);

public record UpdateServiceProviderProfileRequest(
    string FullName,
    string PhoneNumber,
    decimal HourlyRate,
    string GovernmentIdNumber,
    string City,
    string District,
    string AddressLine);
