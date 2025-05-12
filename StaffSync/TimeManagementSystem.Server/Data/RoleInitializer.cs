using Microsoft.AspNetCore.Identity;

namespace TimeManagementSystem.Server.Data
{
    public class RoleInitializer
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            string[] roleNames = { "HR Manager Admin", "Employee", "It Manager Admin", "HRMS Admin", "Super Admin" };
            foreach (var roleName in roleNames)
            {
                var roleExist = await roleManager.RoleExistsAsync(roleName);
                if (!roleExist)
                {
                    // Create the roles and seed them to the database
                    var roleResult = await roleManager.CreateAsync(new IdentityRole(roleName));
                    if (!roleResult.Succeeded)
                    {
                        // Handle creation error
                        throw new Exception($"Failed to create role {roleName}");
                    }
                }
            }
        }
    }

}
