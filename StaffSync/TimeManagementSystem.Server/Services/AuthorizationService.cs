using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using TimeManagementSystem.Server.Data.Intefaces;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data;

namespace TimeManagementSystem.Server.Data.Services
{
    public class AuthorizationService : IAuthorizationService
    {
        private readonly AppDbContext _context;

        public AuthorizationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<string?> CheckAuthorization(ClaimsPrincipal user)
        {
             // Get the authenticated user's identity
            if (user.Identity.IsAuthenticated)
            {
                // Get user's username (if available)
                string userName = user.Identity.Name;
                var roleId = await _context.UserRoles.FirstOrDefaultAsync(ur => ur.UserId == userName);
                var roleName = await _context.Roles.FirstOrDefaultAsync(r => r.Id == roleId.RoleId);
                string role = roleName.Name;

                // Return user information in the response
                return role;
            }
            else
            {
                return null; // Return 401 Unauthorized if user is not authenticated
            }
        }
    }
}