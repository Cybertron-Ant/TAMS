using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data;

namespace TimeManagementSystem.Server.Data.Services
{
    public class PermissionService : IPermissionService
    {
        private readonly AppDbContext _context;

        public PermissionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Permissions>> GetAllPermissions()
        {
            return await _context.Permissions.ToListAsync();
        }

        public async Task<Permissions> GetPermissionById(int id)
        {
            return await _context.Permissions.FindAsync(id);
        }

        public async Task<PermissionDto.CreatePermissionDto> CreatePermission(Permissions permission)
    {
        // Add the permission to the database
        _context.Permissions.Add(permission);
        await _context.SaveChangesAsync();

        // Map the Permissions object to a PermissionDto
        var permissionDto = new PermissionDto.CreatePermissionDto
        {
            PermissionId = permission.PermissionId,
            PermissionName = permission.PermissionName
            // Map other properties if needed
        };

        return permissionDto;
    }

        public async Task<Permissions> UpdatePermission(Permissions permission)
        {
            _context.Entry(permission).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PermissionExists(permission.PermissionId))
                {
                    return null;
                }
                else
                {
                    throw;
                }
            }
            return permission;
        }

        public async Task<Permissions> DeletePermission(int id)
        {
            var permission = await _context.Permissions.FindAsync(id);
            if (permission == null)
            {
                return null;
            }

            _context.Permissions.Remove(permission);
            await _context.SaveChangesAsync();

            return permission;
        }

        private bool PermissionExists(int id)
        {
            return _context.Permissions.Any(e => e.PermissionId == id);
        }
    }
}