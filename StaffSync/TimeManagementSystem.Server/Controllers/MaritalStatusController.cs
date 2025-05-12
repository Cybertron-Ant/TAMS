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
    public class MaritalStatusController : ControllerBase
    {
        private readonly IMaritalStatusService _service;

        public MaritalStatusController(IMaritalStatusService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MaritalStatus>>> Get()
        {
            return Ok(await _service.GetAllMaritalStatusesAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MaritalStatus>> Get(int id)
        {
            var maritalStatus = await _service.GetMaritalStatusByIdAsync(id);

            if (maritalStatus == null)
                return NotFound();

            return Ok(maritalStatus);
        }

        [HttpPost]
        public async Task<ActionResult<MaritalStatus>> Post([FromBody] MaritalStatus maritalStatus)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdMaritalStatus = await _service.CreateMaritalStatusAsync(maritalStatus);
            return CreatedAtAction(nameof(Get), new { id = createdMaritalStatus.MaritalStatusId }, createdMaritalStatus);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] MaritalStatus maritalStatus)
        {
            if (id != maritalStatus.MaritalStatusId)
                return BadRequest();

            await _service.UpdateMaritalStatusAsync(maritalStatus);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _service.DeleteMaritalStatusAsync(id);
            return NoContent();
        }
    }
}

