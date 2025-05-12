using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface ILeaveBalanceService
    {
        Task<List<LeaveBalanceDTO>> GetAllAsync();
        Task<List<LeaveBalanceDTO>> GetLeaveBalances(string employeeCode);
        Task<List<LeaveBalanceDTO>> GetByEmployeeCodeAsync(string employeeCode);
        Task<LeaveBalanceDTO> GetByIdAsync(int id);
        Task<LeaveBalanceDTO> CreateAsync(LeaveBalanceDTO leaveBalance);
        Task UpdateAsync(int id, LeaveBalanceDTO leaveBalance);
        Task DeleteAsync(int id);
    }
}
