using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Interfaces
{
    public interface IBreakTypeService
    {
        Task<List<BreakType>> GetAllBreakTypeAsync();
        Task<BreakType> GetBreakTypeByIdAsync(int id);
        Task<bool> CreateBreakTypeAsync(BreakType breakType);
            
        Task<bool> AuthenticateBreakType(BreakType breakType);
        Task UpdateBreakTypeAsync(int id, BreakType breakType);
        Task<bool> DeleteBreakTypeAsync(int id);
    }
}
