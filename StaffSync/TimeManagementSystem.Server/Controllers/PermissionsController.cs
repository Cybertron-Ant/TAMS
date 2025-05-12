using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Data.Interfaces;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Mvc;
using TimeManagementSystem.Server.Data;

namespace TimeManagementSystem.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PermissionsController : ControllerBase
    {
        private readonly IPermissionService _permissionService;
        private readonly AppDbContext _context;

        public PermissionsController(IPermissionService permissionService)
        {
            _permissionService = permissionService;
        }

        // GET: api/permissions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Permissions>>> GetPermissions()
        {
            var permissions = await _permissionService.GetAllPermissions();
            return Ok(permissions);
        }

        // GET: api/permissions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Permissions>> GetPermission(int id)
        {
            var permission = await _permissionService.GetPermissionById(id);
            if (permission == null)
            {
                return NotFound();
            }
            return Ok(permission);
        }

        // POST: api/permissions
[HttpPost]
public async Task<ActionResult<Permissions>> CreatePermission(PermissionDto.CreatePermissionDto permissionDto)
{
    // Map the DTO to your entity
    var permission = new Permissions
    {
        PermissionId = permissionDto.PermissionId,
        PermissionName = permissionDto.PermissionName
    };

    // Call the service to create the permission
    var createdPermission = await _permissionService.CreatePermission(permission);

    // Return the created permission
    return CreatedAtAction(nameof(GetPermission), new { id = createdPermission.PermissionId }, createdPermission);
}



        // PUT: api/permissions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePermission(int id, Permissions permission)
        {
            if (id != permission.PermissionId)
            {
                return BadRequest();
            }
            var updatedPermission = await _permissionService.UpdatePermission(permission);
            if (updatedPermission == null)
            {
                return NotFound();
            }
            return NoContent();
        }

        // DELETE: api/permissions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePermission(int id)
        {
            var deletedPermission = await _permissionService.DeletePermission(id);
            if (deletedPermission == null)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}
