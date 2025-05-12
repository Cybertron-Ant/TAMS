using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TimeManagementSystem.Server.Models
{
    public class EmployeePermissions
    {
        public string EmployeeId { get; set; }
        public Employee Employee { get; set; }

        public int PermissionId { get; set; }
        public Permissions Permission { get; set; }

        public int AuthLevelId { get; set; }
        public AuthLevel AuthLevel { get; set; }
        
    }
}