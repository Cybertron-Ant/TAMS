using TimeManagementSystem.Server.Data.Authorization;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace TimeManagementSystem.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [PermissionsAuthorize("LeaveBalances")]

    public class LeaveBalancesController : ControllerBase
    {
        private readonly ILeaveBalanceService _service;

        public LeaveBalancesController(ILeaveBalanceService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<LeaveBalanceDTO>>> GetAll()
        {
            return await _service.GetAllAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LeaveBalanceDTO>> Get(int id)
        {
            var leaveBalance = await _service.GetByIdAsync(id);
            if (leaveBalance == null)
            {
                return NotFound();
            }
            return leaveBalance;
        }

        [HttpGet("GetByEmployeeCode/{employeeCode}")]
        public async Task<ActionResult<List<LeaveBalanceDTO>>> GetByEmployeeCode(string employeeCode)
        {
            var leaveBalances = await _service.GetByEmployeeCodeAsync(employeeCode);
            if (leaveBalances.Count <= 0)
            {
                return NotFound();
            }
            return leaveBalances;
        }

        [HttpPost]
        public async Task<IActionResult> Create(LeaveBalanceDTO leaveBalance)
        {
            await _service.CreateAsync(leaveBalance);
            return CreatedAtAction(nameof(Get), new { id = leaveBalance.Id }, leaveBalance);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, LeaveBalanceDTO leaveBalance)
        {
            if (id != leaveBalance.Id)
            {
                return BadRequest();
            }

            await _service.UpdateAsync(id, leaveBalance);
            return NoContent();
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

        [HttpGet("GetLeaveBalances/{employeeCode}")]
        public async Task<ActionResult<IEnumerable<LeaveBalanceDTO>>> GetLeaveBalances(string employeeCode)
        {
            var employeeLeaveBalances = await _service.GetLeaveBalances(employeeCode);
            if (employeeLeaveBalances == null)
            {
                return NotFound();
            }

            return employeeLeaveBalances;
        }
    }
}
