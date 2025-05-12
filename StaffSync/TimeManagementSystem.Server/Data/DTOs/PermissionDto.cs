using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TimeManagementSystem.Server.Models
{
    public class PermissionDto
    {
        public class CreatePermissionDto
        {
            public int PermissionId { get; set; }
            public string PermissionName { get; set; }
            public ICollection<EmployeePermissionDto>? EmployeePermissions { get; set; }
        }
    }
}