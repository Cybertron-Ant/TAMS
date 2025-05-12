using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Mvc;
using TimeManagementSystem.Server.Data;

namespace TimeManagementSystem.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolePermissionsController : ControllerBase
    {
        private readonly IRolePermissionsService _rolePermissionService;
        private readonly AppDbContext _context;

        public RolePermissionsController(IRolePermissionsService permissionService, AppDbContext context)
        {
            _context = context;
            _rolePermissionService = permissionService;
        }

        // GET: api/rolePermissions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Permissions>>> GetRolePermissions()
        {
            var permissions = await _rolePermissionService.GetAllRolePermissions();
            return Ok(permissions);
        }

        // GET: api/rolePermissions/5
        [HttpGet("{roleId}")]
        public async Task<ActionResult<List<RolePermissions>>> GetRolePermissionsByRole(string roleId)
        {
            var rolePermissions = await _rolePermissionService.GetRolePermissionsByRoleId(roleId);
            if (rolePermissions == null)
            {
                return NotFound();
            }
            return Ok(rolePermissions);
        }

        // POST: api/permissions
        [HttpPost]
        public  ActionResult<Permissions> CreateRolePermissions(List<RolePermissions> permissionDto)
        {
        
            // Call the service to create the permission
            var createdPermission = _rolePermissionService.CreateRolePermissions(permissionDto);

            if (!createdPermission)
            {
                return BadRequest("Unable to create Permissions for the role");
            }

            // Return the created permission
            return Ok("Successfully created role permissions");
        }



        // PUT: api/rolepermissions/5
        [HttpPut("{roleId}")]
        public async Task<IActionResult> UpdateRolePermission(string roleId, List<RolePermissions> rolePermissions)
        {
            var updatedPermission = await _rolePermissionService.UpdateRolePermission(rolePermissions, roleId);
            if (updatedPermission != true)
            {
                return NotFound();
            }
            return Ok("Successfully updated role permissions");
        }

        // DELETE: api/rolepermission/{role-uuid}/5
        [HttpDelete("{roleId}/{permissionId}")]
        public async Task<IActionResult> DeleteSinglePermission(string roleId, int permissionId)
        {
            var deletedPermission = await _rolePermissionService.DeleteSingleRolePermission(roleId, permissionId);
            if (deletedPermission != true)
            {
                return NotFound();
            }
            return Ok("Successfully deleted role permission");

        }
        
        // DELETE: api/rolepermission/{role-uuid}/5
        [HttpDelete("{roleId}")]
        public async Task<IActionResult> DeleteAllRolePermissionsForRole(string roleId)
        {
            var deletedPermission = await _rolePermissionService.DeleteRolePermissions(roleId);
            if (deletedPermission != true)
            {
                return NotFound();
            }
            return Ok("Successfully deleted role permission");

        }
        // Get: api/rolepermission/seedRolePermissions
        [HttpGet("seedRolePermissons")]
        public async Task<IActionResult> SeedAllRolePermissions()
        {
            var isSeeded = await _rolePermissionService.SeedRolePermissions();
            if (isSeeded != true)
            {
                return StatusCode(500);
            }


            return Ok("Successfully seeded all Role permissions");
        } 
    }
}
