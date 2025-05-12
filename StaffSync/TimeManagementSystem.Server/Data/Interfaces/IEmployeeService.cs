using TimeManagementSystem.Server.Data.Services;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Mvc;
using TimeManagementSystem.Server.Data.DTOs;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface IEmployeeService
    {
        Task<List<Employee>> GetAllEmployeesAsync();
        Task<PaginationResponse<Employee>> GetAllEmployeesPaginatedAsync(int pageNumber, int pageSize);
        Task<Employee> GetEmployeeByIdAsync(string employeeCode);
        Task AddEmployeeAsync(Employee employee);
        Task UpdateEmployeeAsync(Employee employee, string newRole = null);
        Task UpdateEmployeeProfileAsync(string employeeCode, Employee employee);
        Task UpdateEmployeeWithRolesAsync(Employee employee, string newRole);
        Task<bool> DeleteEmployeeAsync(string employeeCode);
        Task<List<EmployeeWithRoleDto>> GetEmployeesWithRolesAsync();
        Task<bool> DisableEmployeeAsync(string employeeCode);
        Task<bool> EnableEmployeeAsync(string employeeCode);
        Task<List<DepartmentEmployeesDto>> GetEmployeesCountByDepartmentAsync();
        //Task<bool> PopulateDatabaseWithEmployeeMasterlist(string filename);
        Task<List<Employee>> GetEmployeesByDepartment(string employeeID);
        Task<List<Employee>> GetEmployeesAsync(string employeeID);
        Task<List<Employee>> GetArchivedEmployeesByDepartment(string employeeID);
        Task<bool> MoveEmployeesDepartment(int currentDepartmentId, int newDepartmentId);
    }
}
