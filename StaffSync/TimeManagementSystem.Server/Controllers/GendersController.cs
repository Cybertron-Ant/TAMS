using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Mvc;
using TimeManagementSystem.Server.Data.Authorization;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TimeManagementSystem.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [PermissionsAuthorize("Genders")]

    public class GendersController : ControllerBase
    {
        private readonly IGenderService _genderService;

        public GendersController(IGenderService genderService)
        {
            _genderService = genderService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllGenders()
        {
            var genders = await _genderService.GetAllGendersAsync();
            return Ok(genders);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetGenderById(int id)
        {
            var gender = await _genderService.GetGenderByIdAsync(id);
            if (gender == null)
            {
                return NotFound();
            }
            return Ok(gender);
        }

        [HttpPost]
        public async Task<IActionResult> CreateGender([FromBody] Gender gender)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdGender = await _genderService.CreateGenderAsync(gender);
            return CreatedAtAction(nameof(GetGenderById), new { id = createdGender.GenderId }, createdGender);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGender(int id, [FromBody] Gender gender)
        {
            if (id != gender.GenderId)
            {
                return BadRequest();
            }

            await _genderService.UpdateGenderAsync(gender);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGender(int id)
        {
            await _genderService.DeleteGenderAsync(id);
            return NoContent();
        }
    }
}

