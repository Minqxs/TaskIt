using HomeTaskSA.Domain.Entities;
using HomeTaskSA.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HomeTaskSA.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<ServiceProviderProfile> ServiceProviderProfiles => Set<ServiceProviderProfile>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.Role).HasConversion<string>();
        });

        modelBuilder.Entity<ServiceProviderProfile>(entity =>
        {
            entity.HasKey(x => x.UserId);
            entity.HasOne(x => x.User)
                .WithOne(u => u.ServiceProviderProfile)
                .HasForeignKey<ServiceProviderProfile>(x => x.UserId);
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Status).HasConversion<string>();
            entity.Property(x => x.PaymentStatus).HasConversion<string>();
            entity.HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.ServiceProvider).WithMany().HasForeignKey(x => x.ServiceProviderId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasOne(x => x.Booking)
                .WithOne(x => x.Review)
                .HasForeignKey<Review>(x => x.BookingId);
        });

        var customerId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var providerId = Guid.Parse("22222222-2222-2222-2222-222222222222");

        modelBuilder.Entity<User>().HasData(
            new User { Id = customerId, Email = "customer@hometask.sa", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), Role = UserRole.Customer },
            new User { Id = providerId, Email = "provider@hometask.sa", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), Role = UserRole.ServiceProvider }
        );

        modelBuilder.Entity<ServiceProviderProfile>().HasData(
            new ServiceProviderProfile { UserId = providerId, HourlyRate = 120m, IsVerified = false }
        );
    }
}
