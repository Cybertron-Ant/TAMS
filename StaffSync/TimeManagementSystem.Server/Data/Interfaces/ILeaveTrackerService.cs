using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Mvc;
using static TimeManagementSystem.Server.Data.Services.LeaveTrackerService;
using TimeManagementSystem.Server.Data.DTOs;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface ILeaveTrackerService
    {
        Task<IEnumerable<LeaveTrackerDTO>> GetByEmployeeCodeAsync(string employeeCode);
        Task<LeaveTrackerDTO> GetByIdAsync(int id);
        Task<IEnumerable<LeaveTrackerDTO>> GetLeavesWithinTimeframeAsync(DateTime startDate, DateTime endDate);
        Task CreateAsync(LeaveTrackerDTO leaveTrackerDto);
        Task<IEnumerable<LeaveTrackerDTO>> GetAllAsync();
        Task<IEnumerable<LeaveTrackerDTO>> GetAllListAsync(string employeeCode);
        Task<PaginationResponse<LeaveTrackerDTO>> GetAllPaginated(int pageNumber, int pageSize, string employeeIdForFilter);
        Task DeleteAsync(int trackerId);
        Task DeleteByEmployeeCodeAsync(string employeeCode);
        Task<AttendanceCountsResponse> GetStatistics(string employeeCode);
        Task UpdateByEmployeeCodeAsync(string employeeCode, int id, LeaveTrackerDTO leaveTrackerDto);
    }
}
