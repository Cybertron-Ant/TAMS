using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TimeManagementSystem.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmploymentTypeController : ControllerBase
    {
        private readonly IEmploymentTypeService _service;

        public EmploymentTypeController(IEmploymentTypeService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmploymentType>>> Get()
        {
            return Ok(await _service.GetAllEmploymentTypesAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EmploymentType>> Get(int id)
        {
            var employmentType = await _service.GetEmploymentTypeByIdAsync(id);

            if (employmentType == null)
                return NotFound();

            return Ok(employmentType);
        }

        [HttpPost]
        public async Task<ActionResult<EmploymentType>> Post([FromBody] EmploymentType employmentType)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdEmploymentType = await _service.CreateEmploymentTypeAsync(employmentType);
            return CreatedAtAction(nameof(Get), new { id = createdEmploymentType.EmploymentTypeId }, createdEmploymentType);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] EmploymentType employmentType)
        {
            if (id != employmentType.EmploymentTypeId)
                return BadRequest();

            await _service.UpdateEmploymentTypeAsync(employmentType);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _service.DeleteEmploymentTypeAsync(id);
            return NoContent();
        }
    }
}

