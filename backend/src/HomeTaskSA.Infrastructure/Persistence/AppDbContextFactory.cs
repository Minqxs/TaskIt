using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System.Text.Json;

namespace HomeTaskSA.Infrastructure.Persistence;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var apiProjectPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../HomeTaskSA.API"));
        if (!Directory.Exists(apiProjectPath))
        {
            apiProjectPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "../HomeTaskSA.API"));
        }

        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? ReadConnectionString(Path.Combine(apiProjectPath, "appsettings.Development.json"))
            ?? ReadConnectionString(Path.Combine(apiProjectPath, "appsettings.json"))
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        return new AppDbContext(options);
    }

    private static string? ReadConnectionString(string path)
    {
        if (!File.Exists(path))
        {
            return null;
        }

        using var document = JsonDocument.Parse(File.ReadAllText(path));
        return document.RootElement
            .GetProperty("ConnectionStrings")
            .GetProperty("DefaultConnection")
            .GetString();
    }
}
