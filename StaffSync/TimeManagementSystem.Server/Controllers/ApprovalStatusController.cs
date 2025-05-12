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
    public class ApprovalStatusController : ControllerBase
    {
        private readonly IApprovalStatusService _service;

        public ApprovalStatusController(IApprovalStatusService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApprovalStatusDTO>>> Get()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApprovalStatusDTO>> Get(int id)
        {
            var ApprovalStatus = await _service.GetByIdAsync(id);

            if (ApprovalStatus == null)
                return NotFound();

            return Ok(ApprovalStatus);
        }

        [HttpPost]
        public async Task<ActionResult<ApprovalStatusDTO>> Post([FromBody] ApprovalStatusDTO ApprovalStatus)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _service.CreateAsync(new ApprovalStatusDTO { Id = ApprovalStatus.Id, Type = ApprovalStatus.Type });
            return CreatedAtAction(nameof(Get), new { id = ApprovalStatus.Id }, ApprovalStatus);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] ApprovalStatusDTO ApprovalStatus)
        {
            if (id != ApprovalStatus.Id)
                return BadRequest();

            await _service.UpdateAsync(id, ApprovalStatus);
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

