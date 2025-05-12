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
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentsController : ControllerBase
    {
        private readonly IDepartmentService _departmentService;

        public DepartmentsController(IDepartmentService departmentService)
        {
            _departmentService = departmentService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Department>>> Get()
        {
            return Ok(await _departmentService.GetAllDepartmentsAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Department>> Get(int id)
        {
            var department = await _departmentService.GetDepartmentByIdAsync(id);
            if (department == null) return NotFound();
            return Ok(department);
        }

        [HttpPost]
        public async Task<ActionResult<Department>> Post([FromBody] Department department)
        {
            var createdDepartment = await _departmentService.CreateDepartmentAsync(department);
            return CreatedAtAction(nameof(Get), new { id = createdDepartment.DepartmentId }, createdDepartment);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Department department)
        {
            if (id != department.DepartmentId) return BadRequest();
            await _departmentService.UpdateDepartmentAsync(department);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _departmentService.DeleteDepartmentAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { data = "", message ="An error occured while removing department", errors = ex.Message });
            }
        }
    }

}

