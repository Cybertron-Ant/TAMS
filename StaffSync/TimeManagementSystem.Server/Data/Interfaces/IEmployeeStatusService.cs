using System;
using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface IEmployeeStatusService
    {
        Task<IEnumerable<EmployeeStatus>> GetAllEmployeeStatusesAsync();
        Task<EmployeeStatus> GetEmployeeStatusByIdAsync(int id);
        Task<EmployeeStatus> CreateEmployeeStatusAsync(EmployeeStatus employeeStatus);
        Task UpdateEmployeeStatusAsync(EmployeeStatus employeeStatus);
        Task DeleteEmployeeStatusAsync(int id);
    }
}

