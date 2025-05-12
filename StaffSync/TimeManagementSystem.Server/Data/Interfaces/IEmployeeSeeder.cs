using TimeManagementSystem.Server.Data;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface IEmployeeSeeder
    {
        Task SeedAsync(AppDbContext dbContext, string filename);
    }
}
