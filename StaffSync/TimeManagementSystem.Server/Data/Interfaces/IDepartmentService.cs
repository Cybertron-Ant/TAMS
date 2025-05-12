using System;
using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface IDepartmentService
    {
        Task<IEnumerable<Department>> GetAllDepartmentsAsync();
        Task<Department> GetDepartmentByIdAsync(int departmentId);
        Task<Department> CreateDepartmentAsync(Department department);
        Task UpdateDepartmentAsync(Department department);
        Task DeleteDepartmentAsync(int departmentId);
    }
}

