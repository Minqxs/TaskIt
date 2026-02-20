using HomeTaskSA.Application.DTOs;
using HomeTaskSA.Application.Features.Providers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        var providerId = Guid.Parse(User.FindFirst("sub")!.Value);
        await providers.UpdateRateAsync(providerId, request, cancellationToken);
        return NoContent();
    }
}
