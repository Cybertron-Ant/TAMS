using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data;

namespace TimeManagementSystem.Server.Data.Services
{
    public class RoleAuth
    {
        public async Task<string> GetRoleNameForUser(string userId, AppDbContext context)
        {
            var userRole = await context.UserRoles
                .Where(ur => ur.UserId == userId)
                .FirstOrDefaultAsync();

            if (userRole != null)
            {
                var roleName = await context.Roles
                    .Where(r => r.Id == userRole.RoleId)
                    .Select(r => r.Name)
                    .FirstOrDefaultAsync();

                return roleName;
            }

            return null; // or whatever default value you prefer if the user doesn't have a role
        }
    }
}