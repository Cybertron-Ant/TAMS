using System;
namespace TimeManagementSystem.Server.Models
{
    public class DepartmentEmployeesDto
    {
        public string? DepartmentName { get; set; }
        public int EmployeeCount { get; set; }
        public List<EmployeeWithRoleDto>? Employees { get; set; }
    }
}

