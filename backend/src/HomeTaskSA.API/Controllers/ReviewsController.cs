using FluentValidation;
using HomeTaskSA.Application.DTOs;
using HomeTaskSA.Application.Features.Reviews;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeTaskSA.API.Controllers;

[ApiController]
[Route("api/reviews")]
[Authorize]
public class ReviewsController(ReviewService reviews) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateReviewRequest request,
        [FromServices] IValidator<CreateReviewRequest> validator,
        CancellationToken cancellationToken)
    {
        await validator.ValidateAndThrowAsync(request, cancellationToken);
        await reviews.AddReviewAsync(request, cancellationToken);
        return NoContent();
    }
}
