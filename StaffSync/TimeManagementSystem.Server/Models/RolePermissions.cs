using System.ComponentModel.DataAnnotations;

namespace TimeManagementSystem.Server.Models
{
    // The idea for this table is to be used as a master table to tell the default permissions and authlevel for all roles 
    public class RolePermissions
    {
        [Key]
        public int Id { get; set; }

        public string RoleId { get; set; } = string.Empty;

        public int PermissionId { get; set; }

        public int AuthLevelId {  get; set; }

    }
}
