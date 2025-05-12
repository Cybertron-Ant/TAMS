using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface ILeaveBalanceDefaultService
    {
        Task<List<LeaveBalanceDefault.DTO>> GetAllAsync();
        Task<LeaveBalanceDefault.DTO> GetByIdAsync(int id);
        Task<LeaveBalanceDefault> CreateAsync(LeaveBalanceDefault.DTO leaveBalanceDefault);
        Task UpdateAsync(int id, LeaveBalanceDefault.DTO leaveBalanceDefault);
        Task DeleteAsync(int id);
    }
}
