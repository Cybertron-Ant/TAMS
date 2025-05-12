using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Data.Services;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Mvc;

namespace TimeManagementSystem.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeePermissionsController : ControllerBase
    {
        private readonly IEmployeePermissionService _employeePermissionService;

        public EmployeePermissionsController(IEmployeePermissionService employeePermissionService)
        {
            _employeePermissionService = employeePermissionService;
        }

        // GET: api/employeepermissions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeePermissionDto>>> GetEmployeePermissions()
        {
            var employeePermissions = await _employeePermissionService.GetAllEmployeePermissions();
            return Ok(employeePermissions);
        }

        // GET: api/employeepermissions/5
        [HttpGet("{employeeId}")]
        public async Task<ActionResult<EmployeePermissionDto>> GetEmployeePermission(string employeeId)
        {
            var employeePermission = await _employeePermissionService.GetEmployeePermissionById(employeeId);
            if (employeePermission == null)
            {
                return NotFound();
            }
            return Ok(employeePermission);
        }

        // POST: api/employeepermissions
        [HttpPost]
        public async Task<ActionResult<EmployeePermissionDto>> CreateEmployeePermission(EmployeePermissionDto employeePermissionDto)
        {
            var createdEmployeePermission = await _employeePermissionService.CreateEmployeePermission(employeePermissionDto);
            return CreatedAtAction(nameof(GetEmployeePermission), new { employeeId = createdEmployeePermission.EmployeeId, permissionId = createdEmployeePermission.PermissionId }, createdEmployeePermission);
        }

        [HttpPost("CreateMultiple")]
        public async Task<ActionResult> CreateMultipleEmployeePermission(List<EmployeePermissionDto> employeePermissionDto)
        {
            var createdEmployeePermission = await _employeePermissionService.CreateMultipleEmployeePermissions(employeePermissionDto);
            return Ok(createdEmployeePermission);
        }

        // PUT: api/employeepermissions/5
        [HttpPut("{employeeId}/{permissionId}")]
        public async Task<IActionResult> UpdateEmployeePermission(string employeeId, int permissionId, EmployeePermissionDto employeePermissionDto)
        {
            if (employeeId != employeePermissionDto.EmployeeId || permissionId != employeePermissionDto.PermissionId)
            {
                return BadRequest();
            }
            var updatedEmployeePermission = await _employeePermissionService.UpdateEmployeePermission(employeePermissionDto);
            if (updatedEmployeePermission == null)
            {
                return NotFound();
            }
            return NoContent();
        }


        // DELETE: api/employeepermissions/5
        [HttpDelete("{employeeId}/{permissionId}")]
        public async Task<IActionResult> DeleteEmployeePermission(string employeeId, int permissionId)
        {
            var employeePermission = await _employeePermissionService.DeleteEmployeePermission(employeeId, permissionId);
            if (employeePermission == null)
            {
                return NotFound();
            }
            return NoContent();
        }

        [HttpGet("sync-permissions")]
        public async Task<IActionResult> SyncPermissions()
        {
            try
            {
                await _employeePermissionService.SyncEmployeePermissionsAsync();
                var response = new
                {
                    Message = "Employee permissions synchronized successfully.",
                    Errors = null as string[],
                    Data = null as object,
                };
                return Ok(response);
            }
            catch (Exception ex)
            {
                var response = new
                {
                    Message = "An error occurred while synchronizing employee permissions.",
                    Errors = new string[] { ex.Message },
                    Data = null as object,
                };
                return StatusCode(500, response); // Internal Server Error
            }
        }
    }
}