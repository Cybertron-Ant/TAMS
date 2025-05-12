using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface IRolePermissionsService
    {
        Task<IEnumerable<RolePermissions>> GetAllRolePermissions();
        bool CreateRolePermissions(List<RolePermissions> rolePermissions);

        Task<List<RolePermissions>> GetRolePermissionsByRoleId(string roleId);
        Task<bool> UpdateRolePermission(List<RolePermissions> rolePermissions, string roleId);
        Task<bool> UpdateSingleRolePermission(RolePermissions rolePermissions, string roleId);
        Task<bool> DeleteRolePermissions(string roleId);
        Task<bool> DeleteSingleRolePermission(string roleId, int rolePermissonId);

        Task<bool> SeedRolePermissions();
    }
}
