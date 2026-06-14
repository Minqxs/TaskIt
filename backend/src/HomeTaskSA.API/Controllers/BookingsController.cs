using FluentValidation;
using HomeTaskSA.Application.DTOs;
using HomeTaskSA.Application.Features.Bookings;
using HomeTaskSA.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HomeTaskSA.API.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize]
public class BookingsController(BookingService bookings) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<BookingDto>> Create(
        [FromBody] CreateBookingRequest request,
        [FromServices] IValidator<CreateBookingRequest> validator,
        CancellationToken cancellationToken)
    {
        var customerId = GetCurrentUserId();
        var requestForCurrentCustomer = request with { CustomerId = customerId };

        await validator.ValidateAndThrowAsync(requestForCurrentCustomer, cancellationToken);
        return Ok(await bookings.CreateAsync(requestForCurrentCustomer, cancellationToken));
    }

    [HttpGet("me")]
    public async Task<ActionResult<List<BookingDto>>> GetMine(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var role = GetCurrentUserRole();
        return Ok(await bookings.GetForCurrentUserAsync(userId, role, cancellationToken));
    }

    [HttpGet("{userId:guid}")]
    public async Task<ActionResult<List<BookingDto>>> GetByUserId(Guid userId, CancellationToken cancellationToken)
        => Ok(await bookings.GetByUserIdAsync(userId, cancellationToken));

    [Authorize(Roles = "Customer")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BookingDto>> Update(
        Guid id,
        [FromBody] UpdateBookingRequest request,
        [FromServices] IValidator<UpdateBookingRequest> validator,
        CancellationToken cancellationToken)
    {
        await validator.ValidateAndThrowAsync(request, cancellationToken);
        return Ok(await bookings.UpdateByCustomerAsync(id, GetCurrentUserId(), request, cancellationToken));
    }

    [Authorize(Roles = "Customer")]
    [HttpPut("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken cancellationToken)
    {
        await bookings.CancelByCustomerAsync(id, GetCurrentUserId(), cancellationToken);
        return NoContent();
    }

    [Authorize(Roles = "ServiceProvider")]
    [HttpPut("{id:guid}/accept")]
    public async Task<IActionResult> Accept(Guid id, CancellationToken cancellationToken)
    {
        var providerId = GetCurrentUserId();
        await bookings.AcceptAsync(id, providerId, cancellationToken);
        return NoContent();
    }

    [Authorize(Roles = "ServiceProvider")]
    [HttpPut("{id:guid}/start")]
    public async Task<IActionResult> Start(Guid id, CancellationToken cancellationToken)
    {
        var providerId = GetCurrentUserId();
        await bookings.StartAsync(id, providerId, cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

        if (role == "ServiceProvider")
        {
            await bookings.MarkCompletedByProviderAsync(id, userId, cancellationToken);
        }
        else
        {
            await bookings.ConfirmCompletionByCustomerAsync(id, userId, cancellationToken);
        }

        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? throw new InvalidOperationException("Authenticated user id is missing.");

        return Guid.Parse(userId);
    }

    private UserRole GetCurrentUserRole()
    {
        var role = User.FindFirstValue(ClaimTypes.Role)
            ?? throw new InvalidOperationException("Authenticated role is missing.");

        return Enum.Parse<UserRole>(role);
    }
}
