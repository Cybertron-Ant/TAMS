using TimeManagementSystem.Server.Data.Intefaces;
//using TimeManagementSystem.Server.Data.Seeders;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
//using NuGet.Protocol.Plugins;
using System.Data;
using System.Linq.Expressions;
using TimeManagementSystem.Server.Data;
using static Amazon.S3.Util.S3EventNotification;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using TimeManagementSystem.Server.Data.DTOs;

namespace TimeManagementSystem.Server.Data.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly AppDbContext _context;
        private readonly UserManager<Employee> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<IEmployeeService> _logger;

        public EmployeeService(AppDbContext context, UserManager<Employee> userManager, RoleManager<IdentityRole> roleManager, IWebHostEnvironment env, ILogger<IEmployeeService> logger)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
            _env = env;
            _logger = logger;
        }


        public async Task<List<Employee>> GetAllEmployeesAsync()
        {
            var employees = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.PositionCode)
                .Include(e => e.EmploymentType)
                .Include(e => e.Gender)
                .Include(e => e.MaritalStatus)
                .Include(e => e.Team)
                .Include(e => e.Status)
                .ToListAsync();

            foreach (var employee in employees)
            {
                var roles = await _userManager.GetRolesAsync(employee);
                employee.Role = roles.FirstOrDefault(); // Assign the role to the employee
            }

            return employees;
        }

        public async Task<PaginationResponse<Employee>> GetAllEmployeesPaginatedAsync(int pageNumber, int pageSize)
        {
            var employees = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.PositionCode)
                .Include(e => e.EmploymentType)
                .Include(e => e.Gender)
                .Include(e => e.MaritalStatus)
                .Include(e => e.Team)
                .Include(e => e.Status)
                .ToListAsync();

            foreach (var employee in employees)
            {
                var roles = await _userManager.GetRolesAsync(employee);
                employee.Role = roles.FirstOrDefault(); // Assign the role to the employee
            }


            // Pagination

            var totalRecords = employees.Count;
            var totalPages = (int)Math.Ceiling((double)totalRecords / pageSize);

            var pagedResult = employees
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            //var response = new PaginationResponse { TotalPages = totalPages, PageSize = pageSize, CurrentPage = pageNumber, Results = pagedResult };
            var response = new PaginationResponse<Employee>(totalPages, pagedResult, totalRecords, pageSize, pageNumber);

            return response;

        }

       

        public async Task<Employee> GetEmployeeByIdAsync(string employeeCode)
        {
            var employee = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.PositionCode)
                .Include(e => e.EmploymentType)
                .Include(e => e.Gender)
                .Include(e => e.MaritalStatus)
                .Include(e => e.Team)
                .Include(e => e.Status)
                //.Include(e => e.FirstBreak)
                //.Include(e => e.SecondBreak)
                //.Include(e => e.LunchPeriod)
                .FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);

            if (employee != null)
            {
                var roles = await _userManager.GetRolesAsync(employee);
                employee.Role = roles.FirstOrDefault(); // Assume one role per user for simplicity
            }

            return employee;
        }

        public async Task AddEmployeeAsync(Employee employee)
        {
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();
        }

        private async Task<bool> RemoveEmployeeFromAllRolesAsync(Employee existingEmployee)
        {
            var currentRoles = await _userManager.GetRolesAsync(existingEmployee);
            var removeResult = await _userManager.RemoveFromRolesAsync(existingEmployee, currentRoles);
            if (!removeResult.Succeeded)
            {
                var errors = string.Join(", ", removeResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to remove roles from user: {errors}");
            }
            return true;
        }

        private async Task<bool> RemoveEmployeePermissions(string employeeId)
        {
            var employeePermissions = await _context.EmployeePermissions
                .Where(ep => ep.EmployeeId == employeeId)
                .AsNoTracking()
                .ToListAsync();

            _context.EmployeePermissions.RemoveRange(employeePermissions);
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<bool> AssignRolePermissionsToEmployeeAsync(string employeeId)
        {
            // Ensure employee exists
            var existingEmployee = await _userManager.FindByIdAsync(employeeId);
            if (existingEmployee == null)
            {
                throw new ArgumentException("Employee not found.");
            }

            // Ensure employee has at least one role
            var roles = await _userManager.GetRolesAsync(existingEmployee);
            if (!roles.Any())
            {
                throw new InvalidOperationException("Employee does not have any roles.");
            }

            // Assuming only one role is assigned
            var roleName = roles.First();
            var role = await _roleManager.FindByNameAsync(roleName);
            if (role == null)
            {
                throw new InvalidOperationException("Role not found.");
            }

            // Fetch role permissions with AsNoTracking
            var rolePermissions = await _context.RolePermissions
                .AsNoTracking()
                .Where(rp => rp.RoleId == role.Id)
                .ToListAsync();

            // Fetch current employee permissions with AsNoTracking
            var currentPermissions = await _context.EmployeePermissions
                .Where(ep => ep.EmployeeId == employeeId)
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
                    p.EmployeeId == employeeId &&
                    p.PermissionId == rp.PermissionId &&
                    p.AuthLevelId == rp.AuthLevelId);

                if (existingPerm == null)
                {
                    var employeePerm = new EmployeePermissions
                    {
                        EmployeeId = employeeId,
                        AuthLevelId = rp.AuthLevelId,
                        PermissionId = rp.PermissionId,
                    };
                    newPermissions.Add(employeePerm);
                }
            }

            // Sort the new permissions by PermissionId
            newPermissions = newPermissions.OrderBy(p => p.PermissionId).ToList();

            // Check for any tracked duplicates and log them
            var trackedPermissions = _context.ChangeTracker.Entries<EmployeePermissions>()
                .Where(e => e.Entity.EmployeeId == employeeId)
                .ToList();

            if (trackedPermissions.Any())
            {
                foreach (var trackedEntity in trackedPermissions)
                {
                    var entity = trackedEntity.Entity;
                }
            }

            foreach (var trackedEntity in trackedPermissions)
            {
                _context.Entry(trackedEntity.Entity).State = EntityState.Detached;
            }

            // Add new permissions
            await _context.EmployeePermissions.AddRangeAsync(newPermissions);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task UpdateEmployeeAsync(Employee employee, string newRole = null)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Retrieve the employee from the context using the provided employee ID
                var existingEmployee = await _context.Employees.FindAsync(employee.Id);
                if (existingEmployee == null)
                {
                    throw new Exception("Employee not found");
                }

                // Update the employee properties
                _context.Entry(existingEmployee).CurrentValues.SetValues(employee);

                // Save changes to the context (but not yet committed to the database)
                await _context.SaveChangesAsync();

                // Handle role change update if a new role is provided
                if (!string.IsNullOrWhiteSpace(newRole))
                {
                    // Remove the employee from all current roles
                    var rolesRemoved = await RemoveEmployeeFromAllRolesAsync(existingEmployee);
                    if (!rolesRemoved)
                    {
                        throw new Exception("Failed to remove employee from current roles.");
                    }

                    // Remove the employee's current permissions
                    var permissionsRemoved = await RemoveEmployeePermissions(existingEmployee.Id);
                    if (!permissionsRemoved)
                    {
                        throw new Exception("Failed to remove employee permissions.");
                    }

                    // Add the employee to the new role
                    var addToRoleResult = await _userManager.AddToRoleAsync(existingEmployee, newRole);
                    if (!addToRoleResult.Succeeded)
                    {
                        throw new Exception($"Failed to add user to role: {string.Join(", ", addToRoleResult.Errors.Select(e => e.Description))}");
                    }

                    // Assign new role permissions to employee
                    var permissionsAssigned = await AssignRolePermissionsToEmployeeAsync(existingEmployee.Id);
                    if (!permissionsAssigned)
                    {
                        throw new Exception("Failed to assign new role permissions to employee.");
                    }
                }

                // Save all changes to the context
                await _context.SaveChangesAsync();

                // Commit the transaction (all changes are permanently saved)
                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                // Rollback the transaction in case of an error (all changes are undone)
                await transaction.RollbackAsync();

                // Log the exception if needed
                // _logger.LogError(ex, "An error occurred while updating the employee.");

                throw; // Rethrow the exception to be handled by the calling code
            }
        }

        public async Task UpdateEmployeeProfileAsync(string employeeCode, Employee employee)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    Employee? existingEmployee = await _context.Employees
                        .Where(e => e.EmployeeCode == employeeCode)
                        .FirstOrDefaultAsync();
                    if (existingEmployee == null)
                    {
                        throw new KeyNotFoundException($"Employee with code {employeeCode} could not be found!");
                    }

                    Console.WriteLine("Original Values:");
                    foreach (var property in typeof(Employee).GetProperties())
                    {
                        var originalValue = property.GetValue(existingEmployee);
                        Console.WriteLine($"{property.Name}: {originalValue}");
                    }

                    Console.WriteLine("\nNew Values:");
                    foreach (var property in typeof(Employee).GetProperties())
                    {
                        var newValue = property.GetValue(employee);
                        Console.WriteLine($"{property.Name}: {newValue}");
                    }

                    Console.WriteLine("\nUpdated Properties:");
                    foreach (var property in typeof(Employee).GetProperties())
                    {
                        var newValue = property.GetValue(employee);
                        if (newValue != null)
                        {
                            Console.WriteLine($"Updating {property.Name}: {newValue}");
                            property.SetValue(existingEmployee, newValue);
                        }
                    }

                    await _context.SaveChangesAsync();

                    // Commit the transaction
                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    // Roll back the transaction
                    await transaction.RollbackAsync();
                    // Log the exception or handle it as needed
                    Console.WriteLine($"Error: {ex.Message}");
                    throw; // Re-throw the exception to ensure it is not silently swallowed
                }
            }
        }

        public async Task<bool> DeleteEmployeeAsync(string employeeCode)
        {
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);
            if (employee == null)
            {
                return false;
            }

            _context.Employees.Remove(employee);
            int result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<List<EmployeeWithRoleDto>> GetEmployeesWithRolesAsync()
        {
            var employeesWithRoles = await _userManager.Users
            .Include(user => user.Department) // Ensure you have navigation properties
            .Include(user => user.PositionCode) // Ensure you have navigation properties
            .Include(user => user.EmploymentType)
            .Include(user => user.Gender)
            .Include(user => user.MaritalStatus)
            .Include(user => user.Team)
            .Include(user => user.Status)
            //.Include(user => user.FirstBreak)
            //.Include(user => user.SecondBreak)
            //.Include(user => user.LunchPeriod)
            .Select(user => new EmployeeWithRoleDto
            {
                EmployeeCode = user.EmployeeCode,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Department = user.Department.Name, // Assuming Department has a Name property
                PositionCodeName = user.PositionCode.Name, // Assuming PositionCode has a Name property
                Active = user.Active, // Assuming you have an Active property
                GenderName = user.Gender.Name,
                TeamName = user.Team.Name,
                EmployeeStatusName = user.Status.Name,
                EmploymentTypeName = user.EmploymentType.Name,
                MaritalStatusName = user.MaritalStatus.Name,
                LastLoginDate = user.LastLoginDate,

                Role = _userManager.GetRolesAsync(user).Result.FirstOrDefault() // Get the first role associated with the user
                // You might want to handle roles asynchronously or outside the LINQ query to avoid blocking calls
            })
            .ToListAsync();

            return employeesWithRoles;
        }

        public async Task UpdateEmployeeWithRolesAsync(Employee employee, string newRole)
        {
            // First, update the employee details in the database.
            _context.Entry(employee).State = EntityState.Modified;

            // Get current roles of the employee to manage updating roles appropriately.
            var currentRoles = await _userManager.GetRolesAsync(employee);

            // Remove all roles currently assigned to the employee.
            if (currentRoles.Any())
            {
                await _userManager.RemoveFromRolesAsync(employee, currentRoles);
            }

            // Check if the new role provided is not empty and assign it to the employee.
            if (!string.IsNullOrWhiteSpace(newRole))
            {
                // Check if the role exists, if not, create it.
                if (!await _roleManager.RoleExistsAsync(newRole))
                {
                    await _roleManager.CreateAsync(new IdentityRole(newRole));
                }

                // Add the new role to the employee
                var addToRoleResult = await _userManager.AddToRoleAsync(employee, newRole);
                if (!addToRoleResult.Succeeded)
                {
                    // Optionally handle errors, like logging or throwing an exception
                    throw new Exception("Failed to add user to role.");
                }
            }

            // Commit the changes to the database context for the employee update and role assignment.
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DisableEmployeeAsync(string employeeCode)
        {
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);

            if (employee == null) return false;

            // Set employee account to inactive
            employee.Active = false;

            int result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> EnableEmployeeAsync(string employeeCode)
        {
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);
            if (employee == null) return false;

            // Set employee account to active
            employee.Active = true;

            int result = await _context.SaveChangesAsync();
            return result > 0;
        }

        //public async Task<bool> StoreTerminateRecordAsync(string employeeCode, AttritionDTO attrition)
        //{
        //    var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);

        //    if (employee == null) return false;

        //    var attr = new Attrition
        //    {
        //        UserId = employee.Id,
        //        DAEffDate = attrition.DAEffDate,
        //        LastDayOfWork = attrition.LastDayOfWork,
        //        ModeOfSeparationId = attrition.ModeOfSeparationId,
        //        Reason = attrition.Reason,
        //    };

        //    await _context.Attritions.AddAsync(attr);

        //    int result = await _context.SaveChangesAsync();
        //    return result > 0;
        //}

        //public async Task<List<DepartmentEmployeesDto>> GetEmployeesCountByDepartmentAsync()
        //{
        //    return await _context.Employees
        //                         .Include(e => e.Department)
        //                         .GroupBy(e => e.Department.Name)
        //                         .Select(group => new DepartmentEmployeesDto
        //                         {
        //                             DepartmentName = group.Key,
        //                             EmployeeCount = group.Count()
        //                         })
        //                         .ToListAsync();
        //}

        public async Task<PaginationResponse<EmployeeWithRoleDto>> GetEmployeesPaginated(int pageSize, int pageNumber, bool withRole)
        {

            // Pagination


            var employeesWithRoles = await _userManager.Users
            .Include(user => user.Department) // Ensure you have navigation properties
            .Include(user => user.PositionCode) // Ensure you have navigation properties
            .Include(user => user.EmploymentType)
            .Include(user => user.Gender)
            .Include(user => user.MaritalStatus)
            .Include(user => user.Team)
            .Include(user => user.Status).ToListAsync();

            var totalRecords = employeesWithRoles.Count;
            var totalPages = (int)Math.Ceiling((double)totalRecords / pageSize);

            var pagedResult = employeesWithRoles
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(user => new EmployeeWithRoleDto
                {
                    EmployeeCode = user.EmployeeCode,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Department = user.Department.Name, // Assuming Department has a Name property
                    PositionCodeName = user.PositionCode.Name, // Assuming PositionCode has a Name property
                    Active = user.Active, // Assuming you have an Active property
                    GenderName = user.Gender.Name,
                    TeamName = user.Team.Name,
                    EmployeeStatusName = user.Status.Name,
                    EmploymentTypeName = user.EmploymentType.Name,
                    MaritalStatusName = user.MaritalStatus.Name,
                    LastLoginDate = user.LastLoginDate,

                    Role = _userManager.GetRolesAsync(user).Result.FirstOrDefault() // Get the first role associated with the user
                    // You might want to handle roles asynchronously or outside the LINQ query to avoid blocking calls
                })
                .ToList();
            //var response = new PaginationResponse { TotalPages = totalPages, PageSize = pageSize, CurrentPage = pageNumber, Results = pagedResult };
             var response = new PaginationResponse<EmployeeWithRoleDto>(totalPages ,pagedResult, totalRecords, pageSize, pageNumber);

            return response;

        }

        public async Task<List<Employee>> GetEmployeesByDepartment(string employeeID)
        {
            //var roleID = _context.UserRoles.FirstOrDefault((ur) => ur.UserId == employeeID)?.RoleId;
            var user = _userManager.Users.First(u => u.Id == employeeID);

            var userRole = _userManager.GetRolesAsync(user).Result.FirstOrDefault(); // Get the first role associated with the user

            List<Employee> employees = new List<Employee> { };

            if (userRole.ToLower().Contains("manager") || userRole.ToLower().Contains("director"))
            {
                employees = await _context.Employees
               .Include(e => e.Department)
               .Include(e => e.PositionCode)
               .Include(e => e.EmploymentType)
               .Include(e => e.Gender)
               .Include(e => e.MaritalStatus)
               .Include(e => e.Team)
               .Include(e => e.Status)
               //.Include(e => e.FirstBreak)
               //.Include(e => e.SecondBreak)
               //.Include(e => e.LunchPeriod)
               .Where((e) => e.DepartmentId == user.DepartmentId && e.Active != false)
                .ToListAsync();
            }
            else if (userRole.ToLower().Contains("super"))
            {
                employees = await _context.Employees
               .Include(e => e.Department)
               .Include(e => e.PositionCode)
               .Include(e => e.EmploymentType)
               .Include(e => e.Gender)
               .Include(e => e.MaritalStatus)
               .Include(e => e.Team)
               .Include(e => e.Status)
               //.Include(e => e.FirstBreak)
               //.Include(e => e.SecondBreak)
               //.Include(e => e.LunchPeriod)
               .Where(e => e.Active != false).ToListAsync();

            }
            else
            {
                employees = await _context.Employees
               .Include(e => e.Department)
               .Include(e => e.PositionCode)
               .Include(e => e.EmploymentType)
               .Include(e => e.Gender)
               .Include(e => e.MaritalStatus)
               .Include(e => e.Team)
               //.Include(e => e.FirstBreak)
               //.Include(e => e.SecondBreak)
               //.Include(e => e.LunchPeriod)
               .Include(e => e.Status).Where(e => e.Id == employeeID && e.Active != false).ToListAsync();
            }

            foreach (var employee in employees)
            {
                var roles = await _userManager.GetRolesAsync(employee);
                employee.Role = roles.FirstOrDefault(); // Assign the role to the employee
            }

            return employees;
        }

        public async Task<List<Employee>> GetArchivedEmployeesByDepartment(string employeeID)
        {
            var roleID = _context.UserRoles.First((ur) => ur.UserId == employeeID).RoleId;
            var user = _userManager.Users.First(u => u.Id == employeeID);

            var userRole = _userManager.GetRolesAsync(user).Result.FirstOrDefault(); // Get the first role associated with the user

            List<Employee> employees = new List<Employee> { };

            if (userRole.ToLower().Contains("manager") || userRole.ToLower().Contains("director"))
            {
                employees = await _context.Employees
               .Include(e => e.Department)
               .Include(e => e.PositionCode)
               .Include(e => e.EmploymentType)
               .Include(e => e.Gender)
               .Include(e => e.MaritalStatus)
               .Include(e => e.Team)
               .Include(e => e.Status)
               //.Include(e => e.FirstBreak)
               //.Include(e => e.SecondBreak)
               //.Include(e => e.LunchPeriod)
               .Where((e) => e.DepartmentId == user.DepartmentId && e.Active == false)
                .ToListAsync();
            }
            else if (userRole.ToLower().Contains("super"))
            {
                employees = await _context.Employees
               .Include(e => e.Department)
               .Include(e => e.PositionCode)
               .Include(e => e.EmploymentType)
               .Include(e => e.Gender)
               .Include(e => e.MaritalStatus)
               .Include(e => e.Team)
               .Include(e => e.Status)
               //.Include(e => e.FirstBreak)
               //.Include(e => e.SecondBreak)
               //.Include(e => e.LunchPeriod)
               .Where((e) => e.Active == false)
                .ToListAsync();

            }
            else
            {
                employees = await _context.Employees
               .Include(e => e.Department)
               .Include(e => e.PositionCode)
               .Include(e => e.EmploymentType)
               .Include(e => e.Gender)
               .Include(e => e.MaritalStatus)
               .Include(e => e.Team)
               //.Include(e => e.FirstBreak)
               //.Include(e => e.SecondBreak)
               //.Include(e => e.LunchPeriod)
               .Include(e => e.Status).Where((e) => e.DepartmentId == user.DepartmentId && e.Active == false).ToListAsync();
            }

            foreach (var employee in employees)
            {
                var roles = await _userManager.GetRolesAsync(employee);
                employee.Role = roles.FirstOrDefault(); // Assign the role to the employee
            }

            return employees;
        }

        public async Task<bool> MoveEmployeesDepartment(int currentDepartmentId, int newDepartmentId)
        {
            try
            {
                var employees = await _context.Employees
                                              .Where(e => e.DepartmentId == currentDepartmentId)
                                              .ToListAsync();

                foreach (var employee in employees)
                {
                    employee.DepartmentId = newDepartmentId;
                }

                // Save changes to the database
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }


        public async Task<List<Employee>> GetEmployeesAsync(string employeeId)
        {
            var user = await _userManager.Users
                .Include(e => e.Department)
                .Include(e => e.PositionCode)
                .Include(e => e.EmploymentType)
                .Include(e => e.Gender)
                .Include(e => e.MaritalStatus)
                .Include(e => e.Team)
                .Include(e => e.Status)
                .FirstOrDefaultAsync(u => u.Id == employeeId);

            if (user == null)
            {
                _logger.LogError($"Employee with User Id {employeeId} was not found!");
                return new List<Employee>();
            }

            var userRole = (await _userManager.GetRolesAsync(user)).First(); // Get the first role associated with the user
            var positionName = user.PositionCode?.Name.ToLower() ?? string.Empty;

            List<Employee> employees = [];

            // Check role first
            switch (userRole.ToLower())
            {
                case var role when IsRoleMatch(role,
                        "super admin",
                        "hrms admin",
                        "sr. operations manager",
                        "hr manager admin"
                    ):
                    employees = await GetAllActiveEmployeesAsync();
                    break;

                case var role when IsRoleMatch(role, "operations manager", "sr. manager"):
                    employees = await GetOperationsManagerVisibleEmployeesAsync();
                    break;

                case var role when IsRoleMatch(role, "sr. team leader", "sr. supervisor", "sr. manager"):
                    employees = await GetTeamLeaderVisibleEmployeesAsync(user.TeamId, isSenior: true);
                    break;

                case var role when IsRoleMatch(role, "team leader", "it manager admin", "manager", "supervisor"):
                    employees = await GetTeamLeaderVisibleEmployeesAsync(user.TeamId, isSenior: false);
                    break;

                case var role when IsRoleMatch(role, "employee"):
                    employees = await GetActiveEmployeeByIdAsync(employeeId);
                    break;

                default:
                    switch (positionName.ToLower())
                    {
                        case var position when IsRoleMatch(position, "senior hr specialist", "director", "executive", "senior operations manager"):
                            employees = await GetAllActiveEmployeesAsync();
                            break;

                        default:
                            employees = await GetActiveEmployeeByIdAsync(employeeId);
                            break;
                    }
                    break;
            }

            foreach (var employee in employees)
            {
                var roles = await _userManager.GetRolesAsync(employee);
                employee.Role = roles.FirstOrDefault(); // Assign the role to the employee
            }

            return employees;
        }

        bool IsRoleMatch(string role, params string[] keywords)
        {
            foreach (var keyword in keywords)
            {
                if (role.Contains(keyword))
                {
                    return true;
                }
            }
            return false;
        }

        private async Task<List<Employee>> GetAllActiveEmployeesAsync()
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.PositionCode)
                .Include(e => e.EmploymentType)
                .Include(e => e.Gender)
                .Include(e => e.MaritalStatus)
                .Include(e => e.Team)
                .Include(e => e.Status)
                //.Include(e => e.FirstBreak)
                //.Include(e => e.SecondBreak)
                //.Include(e => e.LunchPeriod)
                .Where(e => e.Active != false)
                .ToListAsync();
        }

        private async Task<List<Employee>> GetOperationsManagerVisibleEmployeesAsync()
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.PositionCode)
                .Include(e => e.EmploymentType)
                .Include(e => e.Gender)
                .Include(e => e.MaritalStatus)
                .Include(e => e.Team)
                .Include(e => e.Status)
                //.Include(e => e.FirstBreak)
                //.Include(e => e.SecondBreak)
                //.Include(e => e.LunchPeriod)
                .Where(e => e.Active
                            && !e.PositionCode.Name.ToLower().Contains("senior operations manager")
                            && !e.PositionCode.Name.ToLower().Contains("operations manager")
                            && e.Department.Name.ToLower().Contains("operations"))
                .ToListAsync();
        }

        private async Task<List<Employee>> GetTeamLeaderVisibleEmployeesAsync(int teamId, bool isSenior)
        {
            var query = _context.Employees
                .Include(e => e.Department)
                .Include(e => e.PositionCode)
                .Include(e => e.EmploymentType)
                .Include(e => e.Gender)
                .Include(e => e.MaritalStatus)
                .Include(e => e.Team)
                .Include(e => e.Status)
                //.Include(e => e.FirstBreak)
                //.Include(e => e.SecondBreak)
                //.Include(e => e.LunchPeriod)
                .Where(e => e.Active && e.Team.TeamId == teamId && e.Department.Name.ToLower().Contains("operations"));

            if (isSenior)
            {
                var includedKeywords = new List<string> { "team leader", "sr. team leader" };
                var excludedKeywords = new List<string> { "admin", "manager", "senior", "director", "executive" };

                query = query.Where(e => includedKeywords.Any(keyword => e.PositionCode.Name.ToLower().Contains(keyword))
                                        && !excludedKeywords.Any(keyword => e.PositionCode.Name.ToLower().Contains(keyword)));
            }
            else
            {
                var excludedKeywords = new List<string> { "team leader", "admin", "manager", "senior", "director", "executive" };
                query = query.Where(e => !excludedKeywords.Any(keyword => e.PositionCode.Name.ToLower().Contains(keyword)));
            }

            return await query.ToListAsync();
        }

        private async Task<List<Employee>> GetActiveEmployeeByIdAsync(string employeeID)
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.PositionCode)
                .Include(e => e.EmploymentType)
                .Include(e => e.Gender)
                .Include(e => e.MaritalStatus)
                .Include(e => e.Team)
                .Include(e => e.Status)
                //.Include(e => e.FirstBreak)
                //.Include(e => e.SecondBreak)
                //.Include(e => e.LunchPeriod)
                .Where(e => e.Id == employeeID && e.Active != false)
                .ToListAsync();
        }

        public Task<List<DepartmentEmployeesDto>> GetEmployeesCountByDepartmentAsync()
        {
            throw new NotImplementedException();
        }

        public Task<bool> PopulateDatabaseWithEmployeeMasterlist(string filename)
        {
            throw new NotImplementedException();
        }

    }
}
