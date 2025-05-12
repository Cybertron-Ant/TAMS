using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TimeManagementSystem.Server.Models
{
    public class AuthLevel
    {
        public int AuthLevelId { get; set; }
        public int AuthCode {get; set;}
        public string AuthLevelName { get; set; } = string.Empty;
        public ICollection<EmployeePermissions> EmployeePermissions { get; set; }
    }
}