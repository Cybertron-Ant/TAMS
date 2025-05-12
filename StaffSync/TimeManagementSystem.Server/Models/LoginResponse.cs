using System;
using TimeManagementSystem.Server.Data.Services;

namespace TimeManagementSystem.Server.Models
{
    public class LoginResponse
    {
        public string? Message { get; set; }
        public string? AuthToken { get; set; }
        public EmployeeWithRoleDto? Employee { get; set; }
    }

}

