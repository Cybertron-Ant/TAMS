using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TimeManagementSystem.Server.Models
{
    public class EmployeePermissionDto
    {
        public string EmployeeId { get; set; }
        public int PermissionId { get; set; }
        public int AuthLevelId { get; set; } 
    }

    public class PermissionNameDto
{
    public string PermissionName { get; set; }
}

}