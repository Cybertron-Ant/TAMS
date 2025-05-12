using System;
using TimeManagementSystem.Server.Data.DTOs;
using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface ITimeSheetService
    {
       
        Task<TimeSheetDTO> GetTimeSheetByIdAsync(string employeeCode, int id);
        //Task<TimeSheetDTO> GetTimesheetByBreakId(string employeeCode, int breakId);
        Task<(IEnumerable<TimeSheetDTO>, string)> CreateTimeSheetAsync(string employeeCode, TimeSheetDTO timeSheetDto);
        Task UpdateTimeSheetAsync(string employeeCode, int timeSheetId, TimeSheetDTO timeSheetDto);
        Task DeleteTimeSheetAsync(string employeeCode, int id);
        Task<IEnumerable<TimeSheetDTO>> GetAllTimeSheetsAsync();
        Task<PaginationResponse<object>> GetAggregatedUserTimesheetInfo(DateTime? startDate, DateTime? endDate, int pageNumber, int pageSize, string employeeId);

        Task<IEnumerable<object>> GetAllAggregatedUserTimesheetByBreaks(DateTime? startDate, DateTime? endDate, string employeeCode);
        Task<object> GetAllTimeSheetsFiltered(string employeeCode,
             int breakType,
             int breakDuration,
             DateTime? startDate,
             DateTime? endDate,
             int pageNumber,
             int pageSize);

        Task<IEnumerable<TimeSheetDTO>> GetAllTimeSheetsListAsync(string employeeCode);
        Task<(IEnumerable<TimeSheetDTO>, string)> PunchOutAsync(string employeeCode, int timeSheetId);
        Task<IEnumerable<TimeSheetDTO>> GetTimeSheetsForEmployeeAsync(string employeeCode);
    }

}

