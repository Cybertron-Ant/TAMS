using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
//using TimeManagementSystem.Server.Data.Authorization;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Mvc;
using TimeManagementSystem.Server.Data.Authorization;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TimeManagementSytem.Server.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    [PermissionsAuthorize("EmployeeStatus")]
    public class EmployeeStatusController : ControllerBase
    {
        private readonly IEmployeeStatusService _service;

        public EmployeeStatusController(IEmployeeStatusService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeStatus>>> Get()
        {
            return Ok(await _service.GetAllEmployeeStatusesAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeStatus>> Get(int id)
        {
            var employeeStatus = await _service.GetEmployeeStatusByIdAsync(id);

            if (employeeStatus == null)
                return NotFound();

            return Ok(employeeStatus);
        }

        [HttpPost]
        public async Task<ActionResult<EmployeeStatus>> Post([FromBody] EmployeeStatus employeeStatus)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdEmployeeStatus = await _service.CreateEmployeeStatusAsync(employeeStatus);
            return CreatedAtAction(nameof(Get), new { id = createdEmployeeStatus.EmployeeStatusId }, createdEmployeeStatus);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] EmployeeStatus employeeStatus)
        {
            if (id != employeeStatus.EmployeeStatusId)
                return BadRequest();

            await _service.UpdateEmployeeStatusAsync(employeeStatus);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _service.DeleteEmployeeStatusAsync(id);
            return NoContent();
        }
    }
}

