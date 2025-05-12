using System.IO;
using System.Reflection;
using TimeManagementSystem.Server.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using TimeManagementSystem.Server.Data;
using Microsoft.Identity.Client;
using System.Security.Cryptography.Xml;
using Microsoft.AspNetCore.Identity;
using TimeManagementSystem.Server.Data.Services;

namespace TimeManagementSystem.Server.Data
{
    public class DataInitializer
    {
        private readonly AppDbContext _context;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<Employee> _userManager;

        public DataInitializer(AppDbContext context, RoleManager<IdentityRole> roleManager, UserManager<Employee> userManager)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _context = context;
        }

        public async Task Initialize()
        {
            await SeedApprovalStatus();
            var leaveTypes = await SeedAttendance();
            await SeedAuthLevels();
            await SeedDepartment();
            await SeedEmployeeStatuses();
            await SeedEmploymentTypes();
            await SeedGender();
            var permissions = await SeedPermissions();
            await SeedLeaveBalanceDefaults(leaveTypes);
            await SeedMaritalStatuses();
            await SeedTeams();
            await SeedPositionCodes();
            await SeedRolePermissions(permissions);
            await SeedShifts();
            await CreateFirstSuperAdmin();
        }

        private async Task<List<Permissions>> SeedPermissions()
        {
            try
            {
                string[] permissions = {
                    "LeaveBalance",
                    "Account",
                    "ApprovalStatus",
                    "Attritions",
                    "S3",
                    "TimeSheet",
                    "Employees",
                    "Departments",
                    "MaritalStatus",
                    "Attendances",
                    "Team",
                    "EmailTemplates",
                    "EmploymentType",
                    "LeaveTrackers",
                    "Genders",
                    "EmployeeStatus",
                    "Permissions",
                    "PositionCodes",
                    "EmployeePermissions",
                    "LeaveBalances",
                    "AuditTrail",
                    "RolePermissions",
                    "LeaveBalanceDefaults",
                    "Shifts"
                };


                // Get existing permissions from the database
                var existingPermissions = _context.Permissions.Select(p => p.PermissionName).ToList();

                // Filter out existing permissions and create new ones
                var newPermissions = permissions.Where(p => !existingPermissions.Contains(p)).ToList();

                // Add new permissions to the database
                foreach (var permission in newPermissions)
                {
                    if (!_context.Permissions.Any(p => p.PermissionName == permission))
                    {
                        await _context.Permissions.AddAsync(new Permissions { PermissionName = permission });
                    }
                }

                if (newPermissions.Count > 0)
                {
                    await _context.SaveChangesAsync();
                    return [.. _context.Permissions];
                }
                return [.. _context.Permissions];
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to create permissions: {ex.Message}", ex);
            }
        
        }

        private async Task SeedAuthLevels()
        {
            try
            {
                (string name, int number)[] initAuthLevel = {
                    ("Viewer", 1),
                    ("Editor", 2),
                    ("Manager", 3)
                };

                if (!_context.AuthLevel.Any())
                {
                    foreach (var authlevel in initAuthLevel)
                    {
                        await _context.AuthLevel.AddAsync(new AuthLevel { AuthCode = authlevel.number, AuthLevelName = authlevel.name });
                    }
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to create auth levels: {ex.Message}", ex);
            }
        }
        private async Task SeedApprovalStatus()
        {
            try
            {
                string[] approvalStatus = [
                    "Pending",
                    "Approved",
                    "Cancelled",
                    "Rejected",
                    "Expired"
                    ];

                if (!_context.ApprovalStatuses.Any())
                {
                    foreach (var status in approvalStatus)
                    {
                        await _context.ApprovalStatuses.AddAsync(new ApprovalStatus { Type = status });
                    }
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to create Approval Statuses: {ex.Message}", ex);
            }
        }

        private async Task<List<Attendance>> SeedAttendance()
        {
            try
            {
                string[] leaveTypes = [
                    "Sick",
                    "Vacation",
                    "Maternity",
                    "Paternity",
                    "Bereavement",
                    "Unpaid"
                    ];

                if (!_context.Attendance.Any())
                {
                    foreach (var leave in leaveTypes)
                    {
                        await _context.Attendance.AddAsync(new Attendance { Type = leave });
                    }
                    await _context.SaveChangesAsync();
                    return _context.Attendance.ToList();
                }
                else
                {
                    return [];
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to create Attendance Type: {ex.Message}", ex);
            }
        }

        private async Task SeedDepartment()
        {
            try
            {
                string[] departments = [
                    "Information Technology",
                    "Finance",
                    "Human Resource",
                    "Customer Service"
                    ];

                if (!_context.Departments.Any())
                {
                    foreach (var item in departments)
                    {
                        await _context.Departments.AddAsync(new Department { Name = item });
                    }
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to create Department Type: {ex.Message}", ex);
            }
        }

        private async Task SeedEmployeeStatuses()
        {
            try
            {
                string[] seedList = [
                    "Active",
                    "InActive",
                    
                    ];

                if (!_context.EmployeeStatuses.Any())
                {
                    foreach (var item in seedList)
                    {
                        await _context.EmployeeStatuses.AddAsync(new EmployeeStatus { Name = item });
                    }
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to create Employee Status Type: {ex.Message}", ex);
            }
        }

        private async Task SeedGender()
        {
            try
            {
                string[] seedList = [
                    "Male",
                    "Female",
                    ];

                if (!_context.Genders.Any())
                {
                    foreach (var item in seedList)
                    {
                        await _context.Genders.AddAsync(new Gender { Name = item });
                    }
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to create Gender: {ex.Message}", ex);
            }
        }


        private async Task SeedEmploymentTypes()
        {
            try
            {
                string[] seedList = [
                    "Regular",
                    "Trainee",
                    "Probation",
                    ];

                if (!_context.EmploymentTypes.Any())
                {
                    foreach (var item in seedList)
                    {
                        await _context.EmploymentTypes.AddAsync(new EmploymentType { Name = item });
                    }
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to create Employment Type: {ex.Message}", ex);
            }
        }

        private async Task SeedMaritalStatuses()
        {
            try
            {
                string[] seedList = [
                    "Single",
                    "Married",
                    ];

                if (!_context.MaritalStatuses.Any())
                {
                    foreach (var item in seedList)
                    {
                        await _context.MaritalStatuses.AddAsync(new MaritalStatus { Name = item });
                    }
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to create Marital Status: {ex.Message}", ex);
            }
        }

        private async Task SeedBreakTypes()
        {
            try
            {
                string[] seedList = [
                    "Single",
                    "Married",
                    ];

                if (!_context.MaritalStatuses.Any())
                {
                    foreach (var item in seedList)
                    {
                        await _context.MaritalStatuses.AddAsync(new MaritalStatus { Name = item });
                    }
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to create Marital Status: {ex.Message}", ex);
            }
        }

        private async Task SeedPositionCodes()
        {
            try
            {
                string[] seedList = [
                    "Accounting Assistant",
                    "Acctg. Jr. Supervisor",
                    "Admin Assistant",
                    "Call Transfer Agent",
                    "Cpd Generalist",
                    "Data Analyst",
                    "IT Admin"                  
                   ];

                if (!_context.PositionCodes.Any())
                {
                    foreach (var item in seedList)
                    {
                        await _context.PositionCodes.AddAsync(new PositionCode { Name = item });
                    }
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to create Position Code: {ex.Message}", ex);
            }
        }

        private async Task SeedShifts()
        {
            try
            {
                string[] seedList = [
                    "8:00 AM - 5:00 PM",
                    "9:00 AM - 6:00 PM",
                    "10:00 AM - 7:00 PM",
                   ];

                if (!_context.Shifts.Any())
                {
                    foreach (var item in seedList)
                    {
                        await _context.Shifts.AddAsync(new Shift { Type = item });
                    }
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to create Position Code: {ex.Message}", ex);
            }
        }
        public async Task SeedTeams()
        {
            try
            {
                // List of team names to be added to the database
                string[] initTeams = {
                    "QA & Compliance Team",
                    "Reporting Teams",
                    "Legal Teams",
                    "IT Department",
                    "Executive Team",
                    "Learning and Development"
                };

                // Check if the table is empty
                if (!_context.Teams.Any())
                {
                    foreach (var teamName in initTeams)
                    {
                        await _context.Teams.AddAsync(new Team { Name = teamName });
                    }
                    await _context.SaveChangesAsync(); // Save changes to the database
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to seed Teams: {ex.Message}", ex);
            }
        }


        public async Task SeedLeaveBalanceDefaults(List<Attendance> leaveTypes)
        {
            try
            {
                // Check if the table is empty
                if (!_context.LeaveBalanceDefaults.Any())
                {
                    foreach (var leaveType in leaveTypes)
                    {
                        await _context.LeaveBalanceDefaults.AddAsync(new LeaveBalanceDefault { AttendanceId = leaveType.Id, Balance=5, Increment = 0.5, IncrementInterval="22" });
                    }
                    await _context.SaveChangesAsync(); // Save changes to the database
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to seed Teams: {ex.Message}", ex);
            }
        }

        public async Task SeedRolePermissions(List<Permissions> permissions)
        {
            try
            {
                // Check if the table is empty
                if (!_context.RolePermissions.Any())
                {
                    // What this should do is to get the role for super admin then create a role permission for each permission with max auth level
                    var role = _roleManager.Roles.Where( ro => ro.Name == "Super Admin").FirstOrDefault(); 
                    foreach (var permission in permissions)
                    {
                        await _context.RolePermissions.AddAsync(new RolePermissions { RoleId = role?.Id, PermissionId = permission.PermissionId , AuthLevelId=3 });
                    }
                    await _context.SaveChangesAsync(); // Save changes to the database
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to seed Teams: {ex.Message}", ex);
            }
        }

        public async Task CreateFirstSuperAdmin()
        {
            if (!_context.Employees.Any())
            {
                var model = new RegisterModel
                {
                    FirstName = "Main",
                    LastName = "User",
                    MiddleName = "U",
                    Active = true,
                    DateHired = new DateTime(),
                    BirthDate = new DateTime(),
                    Email = "Danielmaybach@mailme.com",
                    MobileNo = "9876545548",
                    DepartmentId = 1,
                    EmployeeStatusId = 1,
                    EmploymentTypeId = 1,
                    GenderId = 1,
                    PositionCodeId = 1,
                    MaritalStatusId = 1,
                    SelectedRole = "Super Admin",
                    TeamId = 1,
                    Password = "Admin123#",
                    UserName = "main.user"

                };
                string employeeCode = EmployeeCodeGenerator.GenerateEmployeeCode(_context);

                var employmentType = model.EmploymentTypeId.HasValue
                              ? await _context.EmploymentTypes.FindAsync(model.EmploymentTypeId.Value)
                              : null;
                var gender = model.GenderId.HasValue
                             ? await _context.Genders.FindAsync(model.GenderId.Value)
                             : null;
                var maritalStatus = model.MaritalStatusId.HasValue
                                    ? await _context.MaritalStatuses.FindAsync(model.MaritalStatusId.Value)
                                    : null;
                var department = model.DepartmentId.HasValue
                         ? await _context.Departments.FindAsync(model.DepartmentId.Value)
                         : null;
                var positionCode = model.PositionCodeId.HasValue
                                   ? await _context.PositionCodes.FindAsync(model.PositionCodeId.Value)
                                   : null;
                var team = model.TeamId.HasValue
                           ? await _context.Teams.FindAsync(model.TeamId.Value)
                           : null;
                var modeOfSeparation = model.ModeOfSeparationId.HasValue
                                       ? await _context.ModeOfSeparations.FindAsync(model.ModeOfSeparationId.Value)
                                       : null;
                var employeeStatus = await _context.EmployeeStatuses.FindAsync(model.EmployeeStatusId);

                string email = string.IsNullOrWhiteSpace(model.Email)
           ? $"{model.FirstName}.{model.LastName}@tams.com".ToLower()
           : model.Email;



                var user = new Employee
                {
                    UserName = model.UserName,
                    Email = email,// Use Email from RegisterModel, or handle if not provided
                    EmailAddress = email,
                    PhoneNumber = model.MobileNo,
                    MobileNo = model.MobileNo,
                    EmployeeCode = employeeCode,
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    MiddleName = model.MiddleName,
                    NameSuffix = model.NameSuffix,
                    Active = model.Active,
                    AddressForeign = model.AddressForeign,
                    BirthDate = model.BirthDate,
                    Gender = gender,
                    MaritalStatus = maritalStatus,
                    EmployeeStatusId = employeeStatus.EmployeeStatusId,
                    EmploymentType = employmentType,
                    Department = department,
                    Team = team,
                    PositionCode = positionCode,
                    ImmediateSuperior = model.ImmediateSuperior,
                    // Additional properties as required from RegisterModel
                    ImmediateSuperiorCode = model.ImmediateSuperiorCode,

                };
                // Default password for all users
                //var password = model.Password != null ? model.Password : model.UserName.ToLower() + "@HRMS1";
                var password = model.Password;

                var result = await _userManager.CreateAsync(user, password);

                if (result.Succeeded)
                {
                    // Since email might not be necessary for manual registration, skip email confirmation
                    var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                    await _userManager.ConfirmEmailAsync(user, emailToken);

                    if (await _roleManager.RoleExistsAsync(model.SelectedRole))
                    {
                        await _userManager.AddToRoleAsync(user, model.SelectedRole);
                        var roleID = _context.UserRoles.First((ur) => ur.UserId == user.Id).RoleId;

                        // Gets the permissions and authlevel for a particular role. 
                        List<RolePermissions> rolePermissions = await _context.RolePermissions.Where((rp) => rp.RoleId == roleID).ToListAsync();

                        // Goes through the list of permissions designated by the user role then created the employee permissions
                        foreach (var rp in rolePermissions)
                        {
                            var entity = new EmployeePermissions
                            {
                                EmployeeId = user.Id,
                                PermissionId = rp.PermissionId,
                                AuthLevelId = rp.AuthLevelId
                            };

                            _context.EmployeePermissions.Add(entity);
                        }

                        //Create BreakTypes after user is created
                        var breakTypes = new List<String> {
                            "Clock In",  "Break", "Lunch"};
                        // This code block ensures that if there is a error saving we send a readable message.
                        foreach(var breakType in breakTypes)
                        {
                            var entity = new BreakType
                            {
                                Active = true,
                                CreatorId = _context.Employees.First().Id,
                                Name = breakType,
                                Password = null
                            };
                            _context.BreakTypes.Add(entity);

                        }

                        await _context.SaveChangesAsync();

                    }
                }
            }

        }
    }
}