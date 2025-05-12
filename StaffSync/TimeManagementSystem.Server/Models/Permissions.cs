using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace TimeManagementSystem.Server.Models
{
    public class Permissions
    {
        public int PermissionId { get; set; }
        public string PermissionName { get; set; } = string.Empty;
        public virtual ICollection<EmployeePermissions> EmployeePermissions { get; set; }
    }
}