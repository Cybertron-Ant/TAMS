using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimeManagementSystem.Server.Data.Authorization;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TimeManagementSystem.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [PermissionsAuthorize("Team")]

    public class TeamController : ControllerBase
    {
        private readonly ITeamService _service;

        public TeamController(ITeamService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Team>>> Get()
        {
            return Ok(await _service.GetAllTeamsAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Team>> Get(int id)
        {
            var team = await _service.GetTeamByIdAsync(id);

            if (team == null)
                return NotFound();

            return Ok(team);
        }

        [HttpPost]
        public async Task<ActionResult<Team>> Post([FromBody] Team team)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdTeam = await _service.CreateTeamAsync(team);
            return CreatedAtAction(nameof(Get), new { id = createdTeam.TeamId }, createdTeam);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] Team team)
        {
            if (id != team.TeamId)
                return BadRequest();

            await _service.UpdateTeamAsync(team);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _service.DeleteTeamAsync(id);
            return NoContent();
        }
    }
}

