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
    public class PositionCodesController : ControllerBase
    {
        private readonly IPositionCodeService _positionCodeService;

        public PositionCodesController(IPositionCodeService positionCodeService)
        {
            _positionCodeService = positionCodeService;
        }

        // GET: api/PositionCodes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PositionCode>>> GetAllPositionCodes()
        {
            return Ok(await _positionCodeService.GetAllPositionCodesAsync());
        }

        // GET: api/PositionCodes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PositionCode>> GetPositionCode(int id)
        {
            var positionCode = await _positionCodeService.GetPositionCodeByIdAsync(id);

            if (positionCode == null)
            {
                return NotFound();
            }

            return positionCode;
        }

        // POST: api/PositionCodes
        [HttpPost]
        public async Task<ActionResult<PositionCode>> CreatePositionCode(PositionCode positionCode)
        {
            var createdPositionCode = await _positionCodeService.CreatePositionCodeAsync(positionCode);
            return CreatedAtAction(nameof(GetPositionCode), new { id = createdPositionCode.PositionCodeId }, createdPositionCode);
        }

        // PUT: api/PositionCodes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePositionCode(int id, PositionCode positionCode)
        {
            if (id != positionCode.PositionCodeId)
            {
                return BadRequest();
            }

            try
            {
                await _positionCodeService.UpdatePositionCodeAsync(positionCode);
            }
            catch
            {
                // Handle the case where the positionCode doesn't exist.
                return NotFound();
            }

            return NoContent();
        }

        // DELETE: api/PositionCodes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePositionCode(int id)
        {
            var positionCode = await _positionCodeService.GetPositionCodeByIdAsync(id);
            if (positionCode == null)
            {
                return NotFound();
            }

            await _positionCodeService.DeletePositionCodeAsync(id);

            return NoContent();
        }
    }
}

