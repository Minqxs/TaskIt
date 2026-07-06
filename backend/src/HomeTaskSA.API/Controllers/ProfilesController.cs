using HomeTaskSA.Application.DTOs;
using HomeTaskSA.Application.Features.Profiles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HomeTaskSA.API.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
public class ProfilesController(ProfileService profiles) : ControllerBase
{
    [Authorize(Roles = "Customer")]
    [HttpGet("customer")]
    public async Task<ActionResult<CustomerProfileDto>> GetCustomer(CancellationToken cancellationToken)
        => Ok(await profiles.GetCustomerProfileAsync(GetUserId(), cancellationToken));

    [Authorize(Roles = "Customer")]
    [HttpPut("customer")]
    public async Task<ActionResult<CustomerProfileDto>> PutCustomer(
        [FromBody] UpdateCustomerProfileRequest request,
        CancellationToken cancellationToken)
        => Ok(await profiles.UpdateCustomerProfileAsync(GetUserId(), request, cancellationToken));

    [Authorize(Roles = "ServiceProvider")]
    [HttpGet("provider")]
    public async Task<ActionResult<ServiceProviderProfileDto>> GetProvider(CancellationToken cancellationToken)
        => Ok(await profiles.GetProviderProfileAsync(GetUserId(), cancellationToken));

    [Authorize(Roles = "ServiceProvider")]
    [HttpPut("provider")]
    public async Task<ActionResult<ServiceProviderProfileDto>> PutProvider(
        [FromBody] UpdateServiceProviderProfileRequest request,
        CancellationToken cancellationToken)
        => Ok(await profiles.UpdateProviderProfileAsync(GetUserId(), request, cancellationToken));

    private Guid GetUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? throw new InvalidOperationException("Authenticated user id is missing.");

        return Guid.Parse(userId);
    }
}
