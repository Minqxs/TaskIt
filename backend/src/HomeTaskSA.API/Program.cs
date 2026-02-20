using System.Text;
using FluentValidation;
using HomeTaskSA.Application.DTOs;
using HomeTaskSA.Application.Features.Auth;
using HomeTaskSA.Application.Features.Bookings;
using HomeTaskSA.Application.Features.Providers;
using HomeTaskSA.Application.Features.Reviews;
using HomeTaskSA.Infrastructure;
using HomeTaskSA.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ProviderService>();
builder.Services.AddScoped<BookingService>();
builder.Services.AddScoped<ReviewService>();

builder.Services.AddScoped<IValidator<RegisterRequest>, RegisterRequestValidator>();
builder.Services.AddScoped<IValidator<OAuthLoginRequest>, OAuthLoginRequestValidator>();
builder.Services.AddScoped<IValidator<LoginRequest>, LoginRequestValidator>();
builder.Services.AddScoped<IValidator<CreateBookingRequest>, CreateBookingRequestValidator>();
builder.Services.AddScoped<IValidator<CreateReviewRequest>, CreateReviewRequestValidator>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.EnsureCreated();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
