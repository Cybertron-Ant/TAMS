using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface IPermissionService
    {
        Task<IEnumerable<Permissions>> GetAllPermissions();
        Task<Permissions> GetPermissionById(int id);
        Task <PermissionDto.CreatePermissionDto> CreatePermission(Permissions permission);
        Task<Permissions> UpdatePermission(Permissions permission);
        Task<Permissions> DeletePermission(int id);
    }
}