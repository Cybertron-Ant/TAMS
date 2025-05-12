using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Mvc;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface IEmployeePermissionService
    {
        Task<IEnumerable<EmployeePermissionDto>> GetAllEmployeePermissions();
        Task<List<EmployeePermissionDto>> GetEmployeePermissionById(string employeeId);
        Task<List<EmployeePermissionDto>> CreateMultipleEmployeePermissions(List<EmployeePermissionDto> requests);
        Task<EmployeePermissionDto> CreateEmployeePermission(EmployeePermissionDto employeePermissionDto);
        Task<EmployeePermissionDto> UpdateEmployeePermission(EmployeePermissionDto employeePermissionDto);
        Task SyncEmployeePermissionsAsync();
        Task<EmployeePermissionDto> DeleteEmployeePermission(string employeeId, int permissionId);
    }
}