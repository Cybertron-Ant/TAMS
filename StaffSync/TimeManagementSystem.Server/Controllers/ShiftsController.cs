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
    public class ShiftsController : ControllerBase
    {
        private readonly IShiftService _service;

        public ShiftsController(IShiftService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Shift>>> Get()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Shift>> Get(int id)
        {
            var shift = await _service.GetByIdAsync(id);

            if (shift == null)
                return NotFound();

            return Ok(shift);
        }

        [HttpPost]
        public async Task<ActionResult<Shift>> Post([FromBody] Shift shift)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _service.CreateAsync(new Shift { Id = shift.Id, Type = shift.Type });
            return CreatedAtAction(nameof(Get), new { id = shift.Id }, shift);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] Shift shift)
        {
            if (id != shift.Id)
                return BadRequest();

            await _service.UpdateAsync(id, shift);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}

