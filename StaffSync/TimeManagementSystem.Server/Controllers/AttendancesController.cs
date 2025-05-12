using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimeManagementSystem.Server.Data.Intefaces;
using Microsoft.AspNetCore.Mvc;
using TimeManagementSystem.Server.Models;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TimeManagementSystem.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttendancesController : ControllerBase
    {
        private readonly IAttendanceService _service;

        public AttendancesController(IAttendanceService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Attendance>>> Get()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Attendance>> Get(int id)
        {
            var attendance = await _service.GetByIdAsync(id);

            if (attendance == null)
                return NotFound();

            return Ok(attendance);
        }

        [HttpPost]
        public async Task<ActionResult<AttendanceDTO>> Post([FromBody] AttendanceDTO attendance)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            try
            {

            await _service.CreateAsync(new AttendanceDTO { Id = attendance.Id, Type = attendance.Type });
            return CreatedAtAction(nameof(Get), new { id = attendance.Id }, attendance);
            }catch(Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] AttendanceDTO attendance)
        {
            if (id != attendance.Id)
                return BadRequest();
            try
            {

            await _service.UpdateAsync(id, attendance);
            return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}

