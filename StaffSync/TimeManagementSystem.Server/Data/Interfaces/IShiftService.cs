using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface IShiftService
    {
        Task<List<Shift>> GetAllAsync();
        Task<Shift> GetByIdAsync(int id);
        Task<Shift> CreateAsync(Shift shift);
        Task UpdateAsync(int id, Shift shift);
        Task DeleteAsync(int id);
    }
}
