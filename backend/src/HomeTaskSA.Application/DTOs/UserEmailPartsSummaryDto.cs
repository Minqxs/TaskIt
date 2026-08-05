using HomeTaskSA.Domain.Entities;

namespace HomeTaskSA.Application.DTOs;

public record UserEmailPartsSummaryDto(
    Guid UserId,
    string Email,
    string EmailLocalPart,
    string EmailDomain)
{
    public static UserEmailPartsSummaryDto FromUser(User user)
    {
        ArgumentNullException.ThrowIfNull(user);

        return new UserEmailPartsSummaryDto(user.Id, user.Email, user.EmailLocalPart, user.EmailDomain);
    }
}
