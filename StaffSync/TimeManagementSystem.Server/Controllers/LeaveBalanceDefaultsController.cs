using TimeManagementSystem.Server.Data.Authorization;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Amazon.Runtime.Internal;

namespace TimeManagementSystem.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [PermissionsAuthorize("LeaveBalanceDefaults")]

    public class LeaveBalanceDefaultsController : ControllerBase
    {
        private readonly ILeaveBalanceDefaultService _service;
        private readonly IAttendanceService _attendanceService;

        public LeaveBalanceDefaultsController(ILeaveBalanceDefaultService service, IAttendanceService attendanceService )
        {
            _service = service;
            _attendanceService = attendanceService;
        }

        [HttpGet]
        public async Task<ActionResult<List<LeaveBalanceDefault.DTO>>> GetAll()
        {
            try
            {
                var leaveBalanceDefaults = await _service.GetAllAsync();
                var attendances = await _attendanceService.GetAllAsync();
                var result = new
                {
                    leaveBalanceDefaults,
                    attendances
                };
                return Ok(result);

            }
            catch (Exception)
            {
                // Return a user-friendly error message
                return BadRequest("An error occurred while fetching all leave balances. Please try again later.");
            }
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<LeaveBalanceDefault.DTO>> Get(int id)
        {
            var leaveBalance = await _service.GetByIdAsync(id);
            if (leaveBalance == null)
            {
                return NotFound();
            }

            return Ok(leaveBalance);
        }

        [HttpPost]
        public async Task<IActionResult> Create(LeaveBalanceDefault.DTO leaveBalance)
        {
            try
            {
                await _service.CreateAsync(leaveBalance);
                return CreatedAtAction(nameof(Get), new { id = leaveBalance.Id }, leaveBalance);
            }
            catch (Exception ex)
            {
                // Return a user-friendly error message
                return BadRequest("An error occurred while creating the leave balance. Please try again later.");
            }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, LeaveBalanceDefault.DTO leaveBalance)
        {
            if (id != leaveBalance.Id)
            {
                return BadRequest();
            }
            try
            {

                await _service.UpdateAsync(id, leaveBalance);
                return NoContent();
            }
            catch (Exception e)
            {
                return StatusCode(500, new { Message = e.Message });
            }

        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var leaveBalance = await _service.GetByIdAsync(id);
            if (leaveBalance == null)
            {
                return NotFound();
            }

            await _service.DeleteAsync(id);
            return NoContent();
        }

    }
}
