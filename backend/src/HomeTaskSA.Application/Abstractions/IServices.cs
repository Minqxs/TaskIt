using HomeTaskSA.Domain.Entities;
using HomeTaskSA.Domain.Enums;

namespace HomeTaskSA.Application.Abstractions;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

public interface IPaymentService
{
    PaymentStatus HoldPayment(Booking booking);
    PaymentStatus ReleasePayment(Booking booking);
}
