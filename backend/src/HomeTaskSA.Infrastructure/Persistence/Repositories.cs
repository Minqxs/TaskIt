using HomeTaskSA.Application.Abstractions;
using HomeTaskSA.Domain.Entities;
using HomeTaskSA.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HomeTaskSA.Infrastructure.Persistence;

public class UserRepository(AppDbContext dbContext) : IUserRepository
{
    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default) =>
        dbContext.Users
            .Include(x => x.CustomerProfile)
            .Include(x => x.ServiceProviderProfile)
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);

    public Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        dbContext.Users
            .Include(x => x.CustomerProfile)
            .Include(x => x.ServiceProviderProfile)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<List<User>> GetProvidersAsync(CancellationToken cancellationToken = default) =>
        dbContext.Users
            .Include(x => x.ServiceProviderProfile)
            .Where(x => x.Role == UserRole.ServiceProvider)
            .ToListAsync(cancellationToken);

    public Task<User?> GetByOAuthSubjectAsync(string provider, string oauthSubject, CancellationToken cancellationToken = default) =>
        dbContext.OAuthIdentities
            .Where(x => x.Provider == provider && x.OAuthSubject == oauthSubject)
            .Select(x => x.User)
            .Include(x => x.CustomerProfile)
            .Include(x => x.ServiceProviderProfile)
            .FirstOrDefaultAsync(cancellationToken);

    public Task AddAsync(User user, CancellationToken cancellationToken = default) => dbContext.Users.AddAsync(user, cancellationToken).AsTask();

    public Task AddOAuthIdentityAsync(OAuthIdentity oauthIdentity, CancellationToken cancellationToken = default) => dbContext.OAuthIdentities.AddAsync(oauthIdentity, cancellationToken).AsTask();

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) => dbContext.SaveChangesAsync(cancellationToken);
}

public class BookingRepository(AppDbContext dbContext) : IBookingRepository
{
    public Task<Booking?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        dbContext.Bookings.Include(x => x.Review).FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<Booking?> GetByIdWithApplicationsAsync(Guid id, CancellationToken cancellationToken = default) =>
        dbContext.Bookings
            .Include(x => x.Applications)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<List<Booking>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default) =>
        dbContext.Bookings.Where(x => x.CustomerId == userId || x.ServiceProviderId == userId).OrderByDescending(x => x.Date).ToListAsync(cancellationToken);

    public Task<List<Booking>> GetProviderQueueAsync(Guid providerId, CancellationToken cancellationToken = default) =>
        dbContext.Bookings
            .Where(x =>
                x.ServiceProviderId == providerId &&
                x.Status != BookingStatus.Pending &&
                x.Status != BookingStatus.AwaitingCustomerSelection &&
                x.Status != BookingStatus.Cancelled)
            .OrderByDescending(x => x.Date)
            .ToListAsync(cancellationToken);

    public Task<List<Booking>> GetAvailableForProviderAsync(Guid providerId, CancellationToken cancellationToken = default) =>
        dbContext.Bookings
            .Include(x => x.Applications)
            .Where(x =>
                x.CustomerId != providerId &&
                (x.Status == BookingStatus.Pending || x.Status == BookingStatus.AwaitingCustomerSelection))
            .OrderByDescending(x => x.Date)
            .ToListAsync(cancellationToken);

    public Task<List<BookingApplication>> GetApplicationsForProviderAsync(Guid providerId, CancellationToken cancellationToken = default) =>
        dbContext.BookingApplications
            .Include(x => x.Booking)
            .Where(x => x.ProviderId == providerId && x.Booking.Status != BookingStatus.Cancelled)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

    public Task<List<BookingApplication>> GetApplicationsForBookingAsync(Guid bookingId, CancellationToken cancellationToken = default) =>
        dbContext.BookingApplications
            .Include(x => x.Provider)
            .ThenInclude(x => x.ServiceProviderProfile)
            .Where(x => x.BookingId == bookingId && x.Status != BookingApplicationStatus.Withdrawn)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

    public Task<bool> HasActiveApplicationAsync(Guid bookingId, Guid providerId, CancellationToken cancellationToken = default) =>
        dbContext.BookingApplications.AnyAsync(
            x =>
                x.BookingId == bookingId &&
                x.ProviderId == providerId &&
                x.Status != BookingApplicationStatus.Withdrawn,
            cancellationToken);

    public Task AddAsync(Booking booking, CancellationToken cancellationToken = default) => dbContext.Bookings.AddAsync(booking, cancellationToken).AsTask();

    public Task AddApplicationAsync(BookingApplication application, CancellationToken cancellationToken = default) =>
        dbContext.BookingApplications.AddAsync(application, cancellationToken).AsTask();

    public Task<bool> HasReviewAsync(Guid bookingId, CancellationToken cancellationToken = default) =>
        dbContext.Reviews.AnyAsync(x => x.BookingId == bookingId, cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) => dbContext.SaveChangesAsync(cancellationToken);
}
