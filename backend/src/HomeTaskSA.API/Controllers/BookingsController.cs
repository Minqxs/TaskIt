using FluentValidation;
using HomeTaskSA.Application.DTOs;
using HomeTaskSA.Application.Features.Bookings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        await validator.ValidateAndThrowAsync(request, cancellationToken);
        return Ok(await bookings.CreateAsync(request, cancellationToken));
    }

    [HttpGet("{userId:guid}")]
    public async Task<ActionResult<List<BookingDto>>> GetByUserId(Guid userId, CancellationToken cancellationToken)
        => Ok(await bookings.GetByUserIdAsync(userId, cancellationToken));

    [Authorize(Roles = "ServiceProvider")]
    [HttpPut("{id:guid}/accept")]
    public async Task<IActionResult> Accept(Guid id, CancellationToken cancellationToken)
    {
        var providerId = Guid.Parse(User.FindFirst("sub")!.Value);
        await bookings.AcceptAsync(id, providerId, cancellationToken);
        return NoContent();
    }

    [Authorize(Roles = "ServiceProvider")]
    [HttpPut("{id:guid}/start")]
    public async Task<IActionResult> Start(Guid id, CancellationToken cancellationToken)
    {
        var providerId = Guid.Parse(User.FindFirst("sub")!.Value);
        await bookings.StartAsync(id, providerId, cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id, CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirst("sub")!.Value);
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
}
