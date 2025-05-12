
using TimeManagementSystem.Server.Data.Interfaces;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TimeManagementSystem.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BreakTypeController : ControllerBase
    {
        private readonly IBreakTypeService _breakTypeService;

        public BreakTypeController(IBreakTypeService breakTypeService)
        {
            _breakTypeService = breakTypeService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BreakType>>> Get()
        {
            return Ok(await _breakTypeService.GetAllBreakTypeAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BreakType>> Get(int id)
        {
            var breakType = await _breakTypeService.GetBreakTypeByIdAsync(id);
            if (breakType == null) return NotFound();
            return Ok(breakType);
        }

        [HttpPost]
        public async Task<ActionResult<BreakType>> Post([FromBody] BreakType breakType)
        {
            var createdBreakType = await _breakTypeService.CreateBreakTypeAsync(breakType);
            return CreatedAtAction(nameof(Get), new { id = breakType.Id }, createdBreakType);
        }

        [HttpPost("validate")]
        public async Task<ActionResult<BreakType>> ValidateBreak([FromBody] BreakType breakType)
        {
            try
            {
                var isValidated = await _breakTypeService.AuthenticateBreakType(breakType);
                if (isValidated)
                {

                return Ok("Successfully Validated Breaktype");
                }
                else
                {
                    return BadRequest("Incorrect password, Unable to authorize");
                }
            }catch(Exception ex)
            {
                return StatusCode(500, new { data = "", message = "An error occured while validating break type", errors = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] BreakType breakType)
        {
            if (id != breakType.Id) return BadRequest();
            await _breakTypeService.UpdateBreakTypeAsync(id ,breakType);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _breakTypeService.DeleteBreakTypeAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { data = "", message = "An error occured while removing break type", errors = ex.Message });
            }
        }
    }

}

