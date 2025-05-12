using Amazon.S3.Model;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data;

namespace TimeManagementSystem.Server.Data.Services
{
    public class RolePermissionsService(AppDbContext context, UserManager<Employee> userManager, RoleManager<IdentityRole> roleManager) : IRolePermissionsService
    {
        private readonly AppDbContext _context = context;
        private readonly UserManager<Employee> _userManager = userManager;
        private readonly RoleManager<IdentityRole> _roleManager = roleManager;

        bool IRolePermissionsService.CreateRolePermissions(List<RolePermissions> rolePermissions)
        {
            // Here I am adding all role permissions passed to a list of rolePermissions for a particular role
            try
            {
                // Can use this endpoint to add a single permission to the role permission record
                _context.RolePermissions.AddRange(rolePermissions);
                _context.SaveChanges();
                return true;
            }
            catch (Exception e)
            {
                return false;
            }

        }

        async Task<bool> IRolePermissionsService.DeleteRolePermissions(string roleId)
        {
            try
            {
                var recordsToDelete = await _context.RolePermissions.Where((rp) => rp.RoleId == roleId).ToListAsync();
                _context.RolePermissions.RemoveRange(recordsToDelete);
                _context.SaveChanges();

                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }
        async Task<bool> IRolePermissionsService.DeleteSingleRolePermission(string roleId, int permissionId)
        {
            try
            {
                var recordToDelete = await _context.RolePermissions.FirstAsync((rp) => (rp.RoleId == roleId) && (rp.PermissionId == permissionId));
                _context.RolePermissions.Remove(recordToDelete);
                _context.SaveChanges();

                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        async Task<IEnumerable<RolePermissions>> IRolePermissionsService.GetAllRolePermissions()
        {
            return await _context.RolePermissions.ToListAsync();
        }

        async Task<List<RolePermissions>> IRolePermissionsService.GetRolePermissionsByRoleId(string roleId)
        {
            return await _context.RolePermissions.Where((rp) => rp.RoleId == roleId).ToListAsync();
        }

        async Task<bool> IRolePermissionsService.SeedRolePermissions()
        {
            /*
                Get all permissions in the database.
                For each role in the table I want to find

            */
            // Get permissions, role and authLevel list.
            var permissions = _context.Permissions.ToList();
            var roles = _context.UserRoles.ToList();
            var employeeRole = await _roleManager.FindByNameAsync("Employee");
            var hrmsAdminRole = await _roleManager.FindByNameAsync("HRMS Admin");
            var superAdminRole = await _roleManager.FindByNameAsync("Super Admin");
            var itManagerAdminRole = await _roleManager.FindByNameAsync("It Manager Admin");
            var hrManagerAdminRole = await _roleManager.FindByNameAsync("HR Manager Admin");
            var hrManagerRole = await _roleManager.FindByNameAsync("HR Manager");
            var adminRole = await _roleManager.FindByNameAsync("Admin");
            var talentAquisitionSpecialistRole = await _roleManager.FindByNameAsync("Talent Acquisition Specialist");
            var itTeamRole = await _roleManager.FindByNameAsync("It Team");
            var performanceManagerAdminRole = await _roleManager.FindByNameAsync("Performance Manager Admin");
            var dataAnalystRole = await _roleManager.FindByNameAsync("Data Analyst");

            if (employeeRole == null || hrmsAdminRole == null || superAdminRole == null ||
                itManagerAdminRole == null || hrManagerAdminRole == null || hrManagerRole == null ||
                adminRole == null || talentAquisitionSpecialistRole == null || itTeamRole == null ||
                performanceManagerAdminRole == null || dataAnalystRole == null)
            {
                return false;
            }

            var authLevel = _context.AuthLevel.ToList();
            List<RolePermissions> recordsToDelete = _context.RolePermissions.ToList();

            List<RolePermissions> employeeRolePermissions = new List<RolePermissions>{
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "account").PermissionId,
                        AuthLevelId = 1,
                        RoleId = employeeRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "modeofseparations").PermissionId,
                        AuthLevelId = 2,
                        RoleId = employeeRole.Id
                   },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "timesheet").PermissionId,
                        AuthLevelId = 2,
                        RoleId = employeeRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employees").PermissionId,
                        AuthLevelId = 3,
                        RoleId = employeeRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "suspendedpulloutfloatings").PermissionId,
                        AuthLevelId = 1,
                        RoleId = employeeRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "leavetrackers").PermissionId,
                        AuthLevelId = 1,
                        RoleId = employeeRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "leavebalances").PermissionId,
                        AuthLevelId = 1,
                        RoleId = employeeRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "disciplinarytrackers").PermissionId,
                        AuthLevelId = 3,
                        RoleId = employeeRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "typehrrequest").PermissionId,
                        AuthLevelId = 2,
                        RoleId = employeeRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "noticetoexplain").PermissionId,
                        AuthLevelId = 2,
                        RoleId = employeeRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "s3").PermissionId,
                        AuthLevelId = 2,
                        RoleId = employeeRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "hrrequest").PermissionId,
                        AuthLevelId = 2,
                        RoleId = employeeRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "attendances").PermissionId,
                        AuthLevelId = 1,
                        RoleId = employeeRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "attritions").PermissionId,
                        AuthLevelId = 1,
                        RoleId = employeeRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "genders").PermissionId,
                        AuthLevelId = 1,
                        RoleId = employeeRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "team").PermissionId,
                        AuthLevelId = 1,
                        RoleId = employeeRole.Id
                    },
                    new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employmenttype").PermissionId,
                        AuthLevelId = 1,
                        RoleId = employeeRole.Id
                    },
                    new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "departments").PermissionId,
                        AuthLevelId = 1,
                        RoleId = employeeRole.Id
                    },
                };
            List<RolePermissions> hrmsAdminRolePermissions = new List<RolePermissions>{
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "account").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "modeofseparations").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                   },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employees").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "suspendedpulloutfloating").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "leavetrackers").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "positioncodes").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "leavebalances").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },

                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "departments").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "typehrrequest").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "attendances").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employmenttype").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "genders").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "approvalstatus").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "s3").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "hrrequest").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "maritalstatus").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "hrmetrics").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "team").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "permissions").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employeepermissions").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrmsAdminRole.Id
                    },

                };
            List<RolePermissions> itMangerAdminRolePermissions = new List<RolePermissions>{
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "account").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "modeofseparations").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                   },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "employees").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "suspendedpulloutfloating").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "leavetrackers").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "positioncodes").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "leavebalances").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },

                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "departments").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "typehrrequest").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "attendances").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "employmenttype").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "genders").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "approvalstatus").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "s3").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "hrrequest").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "maritalstatus").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "hrrequest").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "team").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "permissions").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "employeepermissions").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itManagerAdminRole.Id
                    },

                };
            List<RolePermissions> hrManagerAdminRolePermissions = new List<RolePermissions>{
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "account").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "modeofseparations").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                   },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "employees").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "suspendedpulloutfloating").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "leavetrackers").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "positioncodes").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "leavebalances").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },

                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "departments").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "typehrrequest").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "attendances").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "employmenttype").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "genders").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "approvalstatus").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "s3").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "hrrequest").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "maritalstatus").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "hrrequest").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "team").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "permissions").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.Find((p)=> p.PermissionName.ToLower() == "employeepermissions").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerAdminRole.Id
                    },

                };
            List<RolePermissions> superAdminRolePermissions = permissions.Select((permission) =>
            {
                return new RolePermissions
                {
                    PermissionId = permission.PermissionId,
                    RoleId = superAdminRole.Id,
                    AuthLevelId = authLevel.Find((al) => al.AuthLevelId == 3).AuthLevelId
                };
            }).ToList();
            List<RolePermissions> dataAnalystRolePermissions = new List<RolePermissions>{
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "account").PermissionId,
                        AuthLevelId = 1,
                        RoleId = dataAnalystRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "modeofseparations").PermissionId,
                        AuthLevelId = 2,
                        RoleId = dataAnalystRole.Id
                   },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "timesheet").PermissionId,
                        AuthLevelId = 2,
                        RoleId = dataAnalystRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employees").PermissionId,
                        AuthLevelId = 3,
                        RoleId = dataAnalystRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "suspendedpulloutfloatings").PermissionId,
                        AuthLevelId = 1,
                        RoleId = dataAnalystRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "leavetrackers").PermissionId,
                        AuthLevelId = 1,
                        RoleId = dataAnalystRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "leavebalances").PermissionId,
                        AuthLevelId = 1,
                        RoleId = dataAnalystRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "disciplinarytrackers").PermissionId,
                        AuthLevelId = 3,
                        RoleId = dataAnalystRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "typehrrequest").PermissionId,
                        AuthLevelId = 2,
                        RoleId = dataAnalystRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "noticetoexplain").PermissionId,
                        AuthLevelId = 2,
                        RoleId = dataAnalystRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "s3").PermissionId,
                        AuthLevelId = 2,
                        RoleId = dataAnalystRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "hrrequest").PermissionId,
                        AuthLevelId = 2,
                        RoleId = dataAnalystRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "attendances").PermissionId,
                        AuthLevelId = 1,
                        RoleId = dataAnalystRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "attritions").PermissionId,
                        AuthLevelId = 1,
                        RoleId = dataAnalystRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "genders").PermissionId,
                        AuthLevelId = 1,
                        RoleId = dataAnalystRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "team").PermissionId,
                        AuthLevelId = 1,
                        RoleId = dataAnalystRole.Id
                    },
                    new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employmenttype").PermissionId,
                        AuthLevelId = 1,
                        RoleId = dataAnalystRole.Id
                    },
                    new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "departments").PermissionId,
                        AuthLevelId = 1,
                        RoleId = dataAnalystRole.Id
                    },
                     new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "hrmetrics").PermissionId,
                        AuthLevelId = 2,
                        RoleId = dataAnalystRole.Id
                    },
                };
            List<RolePermissions> adminRolePermissions = new List<RolePermissions>{
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "account").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "modeofseparations").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                   },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employees").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "suspendedpulloutfloating").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "leavetrackers").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "positioncodes").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "leavebalances").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },

                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "departments").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "typehrrequest").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "attendances").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employmenttype").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "genders").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "approvalstatus").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "s3").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "hrrequest").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "maritalstatus").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "hrmetrics").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "team").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "permissions").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employeepermissions").PermissionId,
                        AuthLevelId = 3,
                        RoleId = adminRole.Id
                    },

                };
            List<RolePermissions> hrManagerRolePermissions = new List<RolePermissions>{
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "account").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "modeofseparations").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                   },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employees").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "suspendedpulloutfloating").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "leavetrackers").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "positioncodes").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "leavebalances").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },

                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "departments").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "typehrrequest").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "attendances").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employmenttype").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "genders").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "approvalstatus").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "s3").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "hrrequest").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "maritalstatus").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "hrmetrics").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "team").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "permissions").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employeepermissions").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "recruitmenttrackers").PermissionId,
                        AuthLevelId = 3,
                        RoleId = hrManagerRole.Id
                    },
                };
            List<RolePermissions> talentAquisitionSpecialistRolePermissions = new List<RolePermissions>{
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "account").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "modeofseparations").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                   },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employees").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "suspendedpulloutfloating").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "leavetrackers").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "positioncodes").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "leavebalances").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },

                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "departments").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "typehrrequest").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "attendances").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employmenttype").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "genders").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "approvalstatus").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "s3").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "hrrequest").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "maritalstatus").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "hrmetrics").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "team").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "permissions").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employeepermissions").PermissionId,
                        AuthLevelId = 3,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "recruitmenttrackers").PermissionId,
                        AuthLevelId = 2,
                        RoleId = talentAquisitionSpecialistRole.Id
                    },
                };
            List<RolePermissions> itTeamRolePermissions = new List<RolePermissions>{
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "account").PermissionId,
                        AuthLevelId = 1,
                        RoleId = itTeamRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "modeofseparations").PermissionId,
                        AuthLevelId = 2,
                        RoleId = itTeamRole.Id
                   },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "timesheet").PermissionId,
                        AuthLevelId = 2,
                        RoleId = itTeamRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employees").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itTeamRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "suspendedpulloutfloatings").PermissionId,
                        AuthLevelId = 1,
                        RoleId = itTeamRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "leavetrackers").PermissionId,
                        AuthLevelId = 1,
                        RoleId = itTeamRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "leavebalances").PermissionId,
                        AuthLevelId = 1,
                        RoleId = itTeamRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "disciplinarytrackers").PermissionId,
                        AuthLevelId = 3,
                        RoleId = itTeamRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "typehrrequest").PermissionId,
                        AuthLevelId = 2,
                        RoleId = itTeamRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "noticetoexplain").PermissionId,
                        AuthLevelId = 2,
                        RoleId = itTeamRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "s3").PermissionId,
                        AuthLevelId = 2,
                        RoleId = itTeamRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "hrrequest").PermissionId,
                        AuthLevelId = 2,
                        RoleId = itTeamRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "attendances").PermissionId,
                        AuthLevelId = 1,
                        RoleId = itTeamRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "attritions").PermissionId,
                        AuthLevelId = 1,
                        RoleId = itTeamRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "genders").PermissionId,
                        AuthLevelId = 1,
                        RoleId = itTeamRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "team").PermissionId,
                        AuthLevelId = 1,
                        RoleId = itTeamRole.Id
                    },
                    new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employmenttype").PermissionId,
                        AuthLevelId = 1,
                        RoleId = itTeamRole.Id
                    },
                    new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "departments").PermissionId,
                        AuthLevelId = 1,
                        RoleId = itTeamRole.Id
                    },
                };
            List<RolePermissions> performanceManagerAdminRolePermissions = new List<RolePermissions>{
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "account").PermissionId,
                        AuthLevelId = 1,
                        RoleId = performanceManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "modeofseparations").PermissionId,
                        AuthLevelId = 2,
                        RoleId = performanceManagerAdminRole.Id
                   },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "timesheet").PermissionId,
                        AuthLevelId = 2,
                        RoleId = performanceManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employees").PermissionId,
                        AuthLevelId = 3,
                        RoleId = performanceManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "suspendedpulloutfloatings").PermissionId,
                        AuthLevelId = 1,
                        RoleId = performanceManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "leavetrackers").PermissionId,
                        AuthLevelId = 1,
                        RoleId = performanceManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "leavebalances").PermissionId,
                        AuthLevelId = 1,
                        RoleId = performanceManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "disciplinarytrackers").PermissionId,
                        AuthLevelId = 3,
                        RoleId = performanceManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "typehrrequest").PermissionId,
                        AuthLevelId = 2,
                        RoleId = performanceManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "noticetoexplain").PermissionId,
                        AuthLevelId = 2,
                        RoleId = performanceManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "s3").PermissionId,
                        AuthLevelId = 2,
                        RoleId = performanceManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "hrrequest").PermissionId,
                        AuthLevelId = 2,
                        RoleId = performanceManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "attendances").PermissionId,
                        AuthLevelId = 1,
                        RoleId = performanceManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "attritions").PermissionId,
                        AuthLevelId = 1,
                        RoleId = performanceManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "genders").PermissionId,
                        AuthLevelId = 1,
                        RoleId = performanceManagerAdminRole.Id
                    },
                   new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "team").PermissionId,
                        AuthLevelId = 1,
                        RoleId = performanceManagerAdminRole.Id
                    },
                    new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "employmenttype").PermissionId,
                        AuthLevelId = 1,
                        RoleId = performanceManagerAdminRole.Id
                    },
                    new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "departments").PermissionId,
                        AuthLevelId = 1,
                        RoleId = performanceManagerAdminRole.Id
                    },
                     new RolePermissions{
                        PermissionId = permissions.FirstOrDefault((p)=> p.PermissionName.ToLower() == "hrmetrics").PermissionId,
                        AuthLevelId = 3,
                        RoleId = performanceManagerAdminRole.Id
                    },
                };

            List<RolePermissions> allRolePermissions = employeeRolePermissions
                .Concat(hrManagerAdminRolePermissions)
                .Concat(hrmsAdminRolePermissions)
                .Concat(itMangerAdminRolePermissions)
                .Concat(superAdminRolePermissions)
                .Concat(adminRolePermissions)
                .Concat(dataAnalystRolePermissions)
                .Concat(hrManagerRolePermissions)
                .Concat(talentAquisitionSpecialistRolePermissions)
                .Concat(itTeamRolePermissions)
                .Concat(performanceManagerAdminRolePermissions)
                .ToList();


            try
            {
                _context.RolePermissions.RemoveRange(recordsToDelete);
                _context.RolePermissions.AddRange(allRolePermissions);
                await _context.SaveChangesAsync();
                return true;

            }
            catch (Exception e)
            {
                return false;
            }
        }

        async Task<bool> IRolePermissionsService.UpdateRolePermission(List<RolePermissions> rolePermissions, string roleId)
        {

            //From the list of permissions passed. Append the list of permissions to the permissions for that role/.

            try
            {
                var newList = new List<RolePermissions>();
                var allRolePermissions = await _context.RolePermissions.Where((rp) => (rp.RoleId == roleId)).ToListAsync();
                rolePermissions.ForEach((rp) =>
                {
                    var permissionExists = allRolePermissions.Find(rtd => rtd.PermissionId == rp.PermissionId);

                    if (permissionExists != null)
                    {
                        _context.RolePermissions.Add(rp);
                    }
                    else
                    {
                        _context.RolePermissions.Update(rp);
                    }

                });
                _context.SaveChanges();

                return true;
            }
            catch (Exception e)
            {
                return false;
            }

        }
        async Task<bool> IRolePermissionsService.UpdateSingleRolePermission(RolePermissions rolePermission, string roleId)
        {

            //From the list of permissions passed. Append the list of permissions to the permissions for that role/.

            try
            {
                var findPermission = await _context.RolePermissions.Where((rp) => (rp.PermissionId == rolePermission.PermissionId)).ToListAsync();

                _context.RolePermissions.Update(rolePermission);
                _context.SaveChanges();

                return true;
            }
            catch (Exception e)
            {
                return false;
            }

        }
    }
}
