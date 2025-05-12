using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Authorization
{
    public class PermissionsAuthorizeAttribute : AuthorizeAttribute, IAsyncAuthorizationFilter
    {
        private readonly string _permission;

        public PermissionsAuthorizeAttribute(string permission)
        {
            _permission = permission;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var httpMethod = context.HttpContext.Request.Method;
            try
            {
                var dbContext = (AppDbContext)context.HttpContext.RequestServices.GetService(typeof(AppDbContext));

                var userId = context?.HttpContext?.User?.Identity?.Name;
                var roleAuth = new RoleAuth();
                string role = await roleAuth.GetRoleNameForUser(userId, dbContext);

                // if (string.IsNullOrEmpty(role))
                // {
                //     context.Result = new ForbidResult();
                //     return;
                // }

                var hasPermission = await UserHasPermission(userId, dbContext, context);
                if (!hasPermission)
                {
                    context.Result = new ForbidResult();
                    return;
                }

                var userAuthLevel = await UserHasAuthLevel(userId, dbContext);

                switch (userAuthLevel.AuthCode)
                {
                    case 1 when httpMethod == "GET":
                    case 2 when httpMethod == "GET" || httpMethod == "POST" || httpMethod == "PUT":
                    case 3 when httpMethod == "GET" || httpMethod == "POST" || httpMethod == "PUT" || httpMethod == "DELETE":
                        return; // Return if the conditions are met
                    default:
                        context.Result = new ForbidResult(); // Forbid access if none of the cases match
                        break; // Ensure to break out of the switch statement after setting the result
                }


            }
            catch (Exception ex)
            {
                // Log the exception for troubleshooting
                // logger.LogError(ex, "An error occurred during authorization.");

                // Optionally, handle specific exception types differently
                if (ex is UnauthorizedAccessException)
                {
                    context.Result = new ForbidResult(); // Return a forbid result for unauthorized access
                }
                else
                {
                    // Return a generic internal server error result
                    context.Result = new StatusCodeResult(500); // Internal Server Error
                }
            }

        }

        private async Task<bool> UserHasPermission(string userId, AppDbContext dbContext, AuthorizationFilterContext context)
        {
            var httpMethod = context.HttpContext.Request.Method;

            var userPermissions = await dbContext.EmployeePermissions
                .AnyAsync(ep => ep.EmployeeId == userId && ep.Permission.PermissionName == _permission);
            return userPermissions;
        }

        private async Task<AuthLevel> UserHasAuthLevel(string userId, AppDbContext dbContext)
        {
            var userPermission = await dbContext.EmployeePermissions
            .FirstOrDefaultAsync(al => al.EmployeeId == userId && al.Permission.PermissionName == _permission);

            var userAuthLevel = await dbContext.AuthLevel
            .FirstOrDefaultAsync(al => al.AuthLevelId == userPermission.AuthLevelId);

            // return an invalid AuthLevel so that the function can return forbidden for the response
            var invalidAuthLevel = new AuthLevel { AuthCode = 0 };

            return userAuthLevel ?? invalidAuthLevel;
        }
    }
}
