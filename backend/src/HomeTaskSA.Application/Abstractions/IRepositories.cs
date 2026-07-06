using HomeTaskSA.Domain.Entities;

namespace HomeTaskSA.Application.Abstractions;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<User>> GetProvidersAsync(CancellationToken cancellationToken = default);
    Task<User?> GetByOAuthSubjectAsync(string provider, string oauthSubject, CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
    Task AddOAuthIdentityAsync(OAuthIdentity oauthIdentity, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Booking?> GetByIdWithApplicationsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Booking>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<List<Booking>> GetProviderQueueAsync(Guid providerId, CancellationToken cancellationToken = default);
    Task<List<Booking>> GetAvailableForProviderAsync(Guid providerId, CancellationToken cancellationToken = default);
    Task<List<BookingApplication>> GetApplicationsForProviderAsync(Guid providerId, CancellationToken cancellationToken = default);
    Task<List<BookingApplication>> GetApplicationsForBookingAsync(Guid bookingId, CancellationToken cancellationToken = default);
    Task<bool> HasActiveApplicationAsync(Guid bookingId, Guid providerId, CancellationToken cancellationToken = default);
    Task AddAsync(Booking booking, CancellationToken cancellationToken = default);
    Task AddApplicationAsync(BookingApplication application, CancellationToken cancellationToken = default);
    Task<bool> HasReviewAsync(Guid bookingId, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
