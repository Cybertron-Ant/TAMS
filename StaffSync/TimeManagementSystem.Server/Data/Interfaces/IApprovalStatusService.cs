using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface IApprovalStatusService
    {
        Task<List<ApprovalStatusDTO>> GetAllAsync();
        Task<ApprovalStatusDTO> GetByIdAsync(int id);
        Task<ApprovalStatusDTO> CreateAsync(ApprovalStatusDTO attendance);
        Task UpdateAsync(int id, ApprovalStatusDTO attendance);
        Task DeleteAsync(int id);
    }
}
