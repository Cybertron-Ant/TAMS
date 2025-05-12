using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using TimeManagementSystem.Server.Data.Authorization;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data;
using Microsoft.IdentityModel.Tokens;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TimeManagementSystem.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [PermissionsAuthorize("TimeSheet")]
    public class TimeSheetController : ControllerBase
    {
        private readonly ITimeSheetService _timeSheetService;
        private readonly AppDbContext _context;
        private readonly ILogger<TimeSheetController> _logger;

        public TimeSheetController(ITimeSheetService timeSheetService, AppDbContext context, ILogger<TimeSheetController> logger)
        {
            _timeSheetService = timeSheetService;
            _context = context;
            _logger = logger;
        }
        [HttpGet("{employeeCode}/BreakId/{breakTypeId}")]
        public async Task<IActionResult> GetTimeSheetByBreakId(string employeeCode, int breakTypeId)
        {
            try
            {
                var timeSheet = await _timeSheetService.GetTimeSheetByIdAsync(employeeCode, breakTypeId);
                if (timeSheet == null) return NotFound($"No time sheet found with ID {breakTypeId} for employee with code: {employeeCode}");
                return Ok(timeSheet);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }


        [HttpGet("{employeeCode}/{id}")]
        public async Task<IActionResult> GetTimeSheet(string employeeCode, int id)
        {
            try
            {
                var timeSheet = await _timeSheetService.GetTimeSheetByIdAsync(employeeCode, id);
                if (timeSheet == null) return NotFound($"No time sheet found with ID {id} for employee with code: {employeeCode}");
                return Ok(timeSheet);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        

        [HttpPost("Create")]
        public async Task<IActionResult> CreateTimeSheet([FromBody] TimeSheetDTO timeSheetDto, [FromQuery] string employeeCode)
        {
            var user = HttpContext.User;
            var roles = user.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value);
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            _logger.LogInformation($"User ID: {userId}");
            _logger.LogInformation($"User Roles: {string.Join(", ", roles)}");

            if (string.IsNullOrEmpty(employeeCode) || timeSheetDto == null)
            {
                return BadRequest("Invalid input");
            }

            try
            {
                var (createdTimeSheetDto, message) = await _timeSheetService.CreateTimeSheetAsync(employeeCode, timeSheetDto);
                return Ok(new { TimeSheet = createdTimeSheetDto, Message = message });
            }
            catch (Exception ex)
            {
                // Log the exception details here
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("Update/{employeeCode}/{timeSheetId}")]
        public async Task<IActionResult> UpdateTimeSheet(string employeeCode, int timeSheetId, [FromBody] TimeSheetDTO timeSheetDto)
        {
            if (timeSheetDto == null)
            {
                return BadRequest("Invalid timesheet data.");
            }

            try
            {
                await _timeSheetService.UpdateTimeSheetAsync(employeeCode, timeSheetId, timeSheetDto);
                return Ok("Timesheet updated successfully.");
            }
            catch (Exception ex)
            {
                // Log the exception details here
                _logger.LogError(ex.Message);
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        [HttpDelete("{employeeCode}/{id}")]
        public async Task<IActionResult> DeleteTimeSheet(string employeeCode, int id)
        {
            try
            {
                await _timeSheetService.DeleteTimeSheetAsync(employeeCode, id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TimeSheetDTO>>> 
            GetAllTimeSheets(
             string employeeId = null,
             int breakType = 0,
             int breakDuration = 0,
             DateTime? startDate = null,
             DateTime? endDate = null,
             int pageNumber = 1,
             int pageSize = 10
            )
        {
            try
            {

                var response = await _timeSheetService.GetAllTimeSheetsFiltered(
                    employeeId,
                    breakType,
                    breakDuration,
                    startDate,
                    endDate,
                    pageNumber,
                    pageSize);

                    return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }


        [HttpGet("Aggregated")]
        public async Task<ActionResult<IEnumerable<object>>> 
            GetAggregatedTimesheetData(
             string employeeId = null,
             int breakType = 0,
             int breakDuration = 0,
             DateTime? startDate = null,
             DateTime? endDate = null,
             int pageNumber = 1,
             int pageSize = 10
            )
        {
            try
            {

                var response = await _timeSheetService.GetAggregatedUserTimesheetInfo(startDate, endDate, pageNumber, pageSize, employeeId);

                    return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("Aggregated/employee/{employeeCode}")]
        public async Task<ActionResult<IEnumerable<object>>>getEmployeeAggregatatedTimesheets(string employeeCode = "PAN-00001", [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                if (employeeCode == null)
                {
                    _logger.LogError("No employee code was passed to the api");
                    return BadRequest("Unable to fetch data, contact your admin");
                }

                var response = await _timeSheetService.GetAllAggregatedUserTimesheetByBreaks(startDate, endDate, employeeCode);


                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("List/{employeeCode}")]
        public async Task<ActionResult<IEnumerable<TimeSheetDTO>>> GetAllTimeSheetsList(string employeeCode)
        {
            try
            {
                var timeSheets = await _timeSheetService.GetAllTimeSheetsListAsync(employeeCode);
                return Ok(timeSheets);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        
        [HttpPost("{employeeCode}/PunchOut/{timeSheetId}")]
        public async Task<IActionResult> PunchOut(string employeeCode, int timeSheetId)
        {
            try
            {
                var result = await _timeSheetService.PunchOutAsync(employeeCode, timeSheetId);
                return Ok(new {timesheets = result.Item1.ToList(), Message = result.Item2});
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("Active/{employeeCode}")]
        public async Task<ActionResult<List<TimeSheetDTO>>> GetActiveTimesheets([FromQuery] int breakTypeId, string employeeCode)
        {
            var activeTimeSheet = await _context.TimeSheets
                .Include(ts => ts.Employee) // Ensure to include related entities as needed
                .Where(ts => (ts.Employee.EmployeeCode == employeeCode && ts.IsActive))
                //.Where(ts => breakTypeId != 0 ? ts.BreakTypeId == breakTypeId : true) // This adds extra condition if breakTypeId is passedIn
                .Select(ts => new TimeSheetDTO
                {
                    Id = ts.Id,
                    EmployeeCode = ts.Employee.EmployeeCode, // Assuming this is how you relate Employee to TimeSheet
                    PunchIn = ts.PunchIn,
                    PunchOut = ts.PunchOut,
                    BreakTypeId = ts.BreakTypeId,
                    Date = ts.Date,
                    IsActive = ts.IsActive,
                    // Include additional properties from your TimeSheetDTO here
                })
                .ToListAsync();

            if (activeTimeSheet.IsNullOrEmpty())
            {
                return Ok("Active timesheet not found for the given employee.");
            }

            return Ok(activeTimeSheet);
        }

        [HttpGet("EmployeeTimesheets/{employeeCode}")]
        public async Task<ActionResult<IEnumerable<TimeSheetDTO>>> GetTimeSheetsForEmployee(string employeeCode)
        {
            if (string.IsNullOrWhiteSpace(employeeCode))
            {
                return BadRequest("Employee code must be provided.");
            }

            var timeSheets = await _timeSheetService.GetTimeSheetsForEmployeeAsync(employeeCode);

            if (timeSheets == null || !timeSheets.Any())
            {
                return NotFound($"No timesheets found for employee code {employeeCode}.");
            }

            return Ok(timeSheets);
        }
    }
}
