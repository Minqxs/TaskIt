using HomeTaskSA.Application.DTOs;
using HomeTaskSA.Application.Features.Providers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HomeTaskSA.API.Controllers;

[ApiController]
[Route("api/providers")]
public class ProvidersController(ProviderService providers) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ProviderDto>>> Get(CancellationToken cancellationToken)
        => Ok(await providers.GetProvidersAsync(cancellationToken));

    [Authorize(Roles = "ServiceProvider")]
    [HttpPut("rate")]
    public async Task<IActionResult> PutRate([FromBody] UpdateRateRequest request, CancellationToken cancellationToken)
    {
        var providerId = GetUserId();
        await providers.UpdateRateAsync(providerId, request, cancellationToken);
        return NoContent();
    }

    private Guid GetUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? throw new InvalidOperationException("Authenticated user id is missing.");

        return Guid.Parse(userId);
    }
}
