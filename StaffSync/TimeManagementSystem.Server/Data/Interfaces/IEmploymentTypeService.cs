using System;
using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface IEmploymentTypeService
    {
        Task<IEnumerable<EmploymentType>> GetAllEmploymentTypesAsync();
        Task<EmploymentType> GetEmploymentTypeByIdAsync(int id);
        Task<EmploymentType> CreateEmploymentTypeAsync(EmploymentType employmentType);
        Task UpdateEmploymentTypeAsync(EmploymentType employmentType);
        Task DeleteEmploymentTypeAsync(int id);
    }
}

