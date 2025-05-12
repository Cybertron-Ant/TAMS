using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Data.Services;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Asn1.Ocsp;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using TimeManagementSystem.Server.Data;

namespace TimeManagementSystem.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaveTrackersController : ControllerBase
    {
        private readonly ILeaveTrackerService _service;
        private readonly AppDbContext _context;

        public LeaveTrackersController(ILeaveTrackerService service, AppDbContext context)
        {
            _service = service;
            _context = context;
        }

        [HttpGet("{employeeCode}")]
        public async Task<ActionResult<IEnumerable<LeaveTrackerDTO>>> GetByEmployeeCode(string employeeCode)
        {
            try
            {
                var records = await _service.GetByEmployeeCodeAsync(employeeCode);
                return Ok(records);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                // For any other exceptions, return a generic error response
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] LeaveTrackerDTO leaveTrackerDTO)
        {
            try
            {
                await _service.CreateAsync(leaveTrackerDTO);
                return CreatedAtAction(nameof(GetByEmployeeCode), new { employeeCode = leaveTrackerDTO.EmployeeCode }, leaveTrackerDTO);
            }
            catch (Exception ex)
            {
                // Handle the case where the employee doesn't exist or other exceptions
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LeaveTrackerDTO>>> GetAll()
        {
            try
            {
                var result = await _service.GetAllAsync();
                return Ok(result); // Return 200 OK with the result
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message); // Return 400 Bad Request with the error message
            }
        }

        [HttpGet("paginated")]
        public async Task<ActionResult<IEnumerable<LeaveTrackerDTO>>> getAllPaginated( int pageNumber = 1, int pageSize = 10, string employeeId = null)
        {
            try
            {
                var result = await _service.GetAllPaginated(pageNumber, pageSize, employeeId);
                return Ok(result); // Return 200 OK with the result
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message); // Return 400 Bad Request with the error message
            }
        }

        [HttpGet("List/{employeeCode}")]
        public async Task<ActionResult<IEnumerable<LeaveTrackerDTO>>> GetAllList(string employeeCode)
        {
            try
            {
                var result = await _service.GetAllListAsync(employeeCode);
                return Ok(result); // Return 200 OK with the result
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message); // Return 400 Bad Request with the error message
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.DeleteAsync(id);
                return NoContent(); // 204 No Content is typically returned for successful deletes
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message); // 404 Not Found if the item does not exist
            }
        }

        [HttpDelete("DeleteByEmployeeCode/{employeeCode}")]
        public async Task<IActionResult> DeleteByEmployeeCode(string employeeCode)
        {
            try
            {
                await _service.DeleteByEmployeeCodeAsync(employeeCode);
                return NoContent(); // 204 No Content is a typical response for a successful DELETE operation
            }
            catch (KeyNotFoundException ex)
            {
                // If no employee or tracker records are found for the given EmployeeCode
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                // For any other exceptions, return a generic error response
                return StatusCode(500, ex.Message);
            }
        }


        [HttpPut("UpdateByEmployeeCode/{employeeCode}/{id}")]
        public async Task<IActionResult> UpdateByEmployeeCode(string employeeCode, int id, [FromBody] LeaveTrackerDTO leaveTrackerDTO)
        {
            try
            {
                await _service.UpdateByEmployeeCodeAsync(employeeCode, id, leaveTrackerDTO);
                return NoContent(); // Indicate a successful update with no content to return
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message); // Specific record not found
            }
            catch (Exception ex)
            {
                return StatusCode(400, ex.Message); // Handle other exceptions
            }
        }

        [HttpGet("GetById/{id}")]
        public async Task<ActionResult<LeaveTrackerDTO>> GetByIdAsync(int id)
        {
            try
            {
                var result = await _service.GetByIdAsync(id);
                return result;
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }

        }

        [HttpGet("statistics/{employeeCode}")]
        public async Task<IActionResult> GetStatistics(string employeeCode)
        {
            try
            {
                var statistics = await _service.GetStatistics(employeeCode);
                return Ok(statistics);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
