using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Models;
using TimeManagementSystem.Server.Data.Intefaces;
using Microsoft.AspNetCore.Mvc;
using TimeManagementSystem.Server.Data;

namespace TimeManagementSystem.Server.Data.Services
{
    public class EmployeePermissionService : IEmployeePermissionService
    {
        private readonly AppDbContext _context;

        public EmployeePermissionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EmployeePermissionDto>> GetAllEmployeePermissions()
        {
            var employeePermissions = await _context.EmployeePermissions.ToListAsync();
            return employeePermissions.Select(ep => new EmployeePermissionDto
            {
                EmployeeId = ep.EmployeeId,
                PermissionId = ep.PermissionId,
                AuthLevelId = ep.AuthLevelId
            });
        }

        public async Task<List<EmployeePermissionDto>> GetEmployeePermissionById(string employeeId)
        {
            var employeePermissions = await _context.EmployeePermissions
                .Where(ep => ep.EmployeeId == employeeId)
                .Select(ep => new EmployeePermissionDto
                {
                    EmployeeId = ep.EmployeeId,
                    PermissionId = ep.PermissionId,
                    AuthLevelId = ep.AuthLevelId
                })
                .ToListAsync();

            return employeePermissions;
        }

        public async Task<EmployeePermissionDto> CreateEmployeePermission(EmployeePermissionDto employeePermissionDto)
        {
            var employeePermission = new EmployeePermissions
            {
                EmployeeId = employeePermissionDto.EmployeeId,
                PermissionId = employeePermissionDto.PermissionId,
                AuthLevelId = employeePermissionDto.AuthLevelId
            };
            _context.EmployeePermissions.Add(employeePermission);
            await _context.SaveChangesAsync();
            return employeePermissionDto;
        }

        public async Task<List<EmployeePermissionDto>> CreateMultipleEmployeePermissions(List<EmployeePermissionDto> requests)
        {
            // var results = new List<EmployeePermissionDto>();

            foreach (var dto in requests)
            {
                var entity = new EmployeePermissions
                {
                    EmployeeId = dto.EmployeeId,
                    PermissionId = dto.PermissionId,
                    AuthLevelId = dto.AuthLevelId
                };

                _context.EmployeePermissions.Add(entity);
            }
            await _context.SaveChangesAsync();

            return requests;


        }

        public async Task<EmployeePermissionDto> UpdateEmployeePermission(EmployeePermissionDto employeePermissionDto)
        {
            var existingEmployeePermission = await _context.EmployeePermissions
                .FirstOrDefaultAsync(ep => ep.EmployeeId == employeePermissionDto.EmployeeId && ep.PermissionId == employeePermissionDto.PermissionId);

            if (existingEmployeePermission == null)
                return null;

            // Detach the existing entity from the context
            _context.Entry(existingEmployeePermission).State = EntityState.Detached;

            // Update the detached entity with the new values
            existingEmployeePermission.AuthLevelId = employeePermissionDto.AuthLevelId;

            // Re-attach the updated entity to the context
            _context.Update(existingEmployeePermission);

            // Save changes
            await _context.SaveChangesAsync();

            return employeePermissionDto;
        }


        //public async Task SyncEmployeePermissionsAsync()
        //{
        //    // Get all user roles
        //    var userRoles = await _context.UserRoles.ToListAsync();

        //    // Iterate through each user role
        //    foreach (var userRole in userRoles)
        //    {
        //        // Get the role permissions for the current role
        //        var rolePermissions = await _context.RolePermissions
        //            .Where(rp => rp.RoleId == userRole.RoleId)
        //            .ToListAsync();

        //        // Get the existing employee permissions for the current employee
        //        var employeePermissions = await _context.EmployeePermissions
        //            .Where(ep => ep.EmployeeId == userRole.UserId)
        //            .ToListAsync();

        //        // Sync the permissions
        //        foreach (var rolePermission in rolePermissions)
        //        {
        //            // Check if the employee already has this permission
        //            var existingPermission = employeePermissions
        //                .FirstOrDefault(ep => ep.PermissionId == rolePermission.PermissionId);

        //            if (existingPermission != null)
        //            {
        //                // Update the AuthLevelId if it is different
        //                if (existingPermission.AuthLevelId != rolePermission.AuthLevelId)
        //                {
        //                    existingPermission.AuthLevelId = rolePermission.AuthLevelId;
        //                    _context.EmployeePermissions.Update(existingPermission);
        //                }
        //            }
        //            else
        //            {
        //                // Add new permission
        //                var newPermission = new EmployeePermissions
        //                {
        //                    EmployeeId = userRole.UserId,
        //                    PermissionId = rolePermission.PermissionId,
        //                    AuthLevelId = rolePermission.AuthLevelId
        //                };
        //                _context.EmployeePermissions.Add(newPermission);
        //            }
        //        }
        //    }

        //    // Save changes to the database
        //    await _context.SaveChangesAsync();
        //}

        public async Task SyncEmployeePermissionsAsync()
        {
            // Get all user roles
            var userRoles = await _context.UserRoles.ToListAsync();

            // Iterate through each user role
            foreach (var userRole in userRoles)
            {
                // Get the role permissions for the current role with AsNoTracking to avoid tracking conflicts
                var rolePermissions = await _context.RolePermissions
                    .AsNoTracking()
                    .Where(rp => rp.RoleId == userRole.RoleId)
                    .ToListAsync();

                // Get the existing employee permissions for the current employee with AsNoTracking
                var currentPermissions = await _context.EmployeePermissions
                    .Where(ep => ep.EmployeeId == userRole.UserId)
                    .AsNoTracking()
                    .ToListAsync();

                // Remove current permissions
                _context.EmployeePermissions.RemoveRange(currentPermissions);
                await _context.SaveChangesAsync();

                // Prepare new permissions and skip duplicates
                var newPermissions = new List<EmployeePermissions>();
                foreach (var rp in rolePermissions)
                {
                    var existingPerm = newPermissions.FirstOrDefault(p =>
                        p.EmployeeId == userRole.UserId &&
                        p.PermissionId == rp.PermissionId &&
                        p.AuthLevelId == rp.AuthLevelId);

                    if (existingPerm == null)
                    {
                        var employeePerm = new EmployeePermissions
                        {
                            EmployeeId = userRole.UserId,
                            AuthLevelId = rp.AuthLevelId,
                            PermissionId = rp.PermissionId,
                        };
                        newPermissions.Add(employeePerm);
                    }
                }

                // Sort the new permissions by PermissionId
                newPermissions = newPermissions.OrderBy(p => p.PermissionId).ToList();

                // Check for any tracked duplicates and detach them
                var trackedPermissions = _context.ChangeTracker.Entries<EmployeePermissions>()
                    .Where(e => e.Entity.EmployeeId == userRole.UserId)
                    .ToList();

                foreach (var trackedEntity in trackedPermissions)
                {
                    _context.Entry(trackedEntity.Entity).State = EntityState.Detached;
                }

                // Add new permissions
                await _context.EmployeePermissions.AddRangeAsync(newPermissions);
                await _context.SaveChangesAsync();
            }
        }


        public async Task<EmployeePermissionDto> DeleteEmployeePermission(string employeeId, int permissionId)
        {
            var employeePermission = await _context.EmployeePermissions.FirstOrDefaultAsync(ep => ep.EmployeeId == employeeId && ep.PermissionId == permissionId);
            if (employeePermission == null)
                return null;

            _context.EmployeePermissions.Remove(employeePermission);
            await _context.SaveChangesAsync();
            return new EmployeePermissionDto
            {
                EmployeeId = employeePermission.EmployeeId,
                PermissionId = employeePermission.PermissionId,
                AuthLevelId = employeePermission.AuthLevelId
            };
        }


    }
}
