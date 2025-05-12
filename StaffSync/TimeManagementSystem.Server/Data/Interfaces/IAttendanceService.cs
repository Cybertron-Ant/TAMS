using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface IAttendanceService
    {
        Task<List<AttendanceDTO>> GetAllAsync();
        Task<AttendanceDTO> GetByIdAsync(int id);
        Task<AttendanceDTO> CreateAsync(AttendanceDTO attendance);
        Task UpdateAsync(int id, AttendanceDTO attendance);
        Task DeleteAsync(int id);
    }
}
