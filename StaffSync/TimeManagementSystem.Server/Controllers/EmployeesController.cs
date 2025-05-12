using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TimeManagementSystem.Server.Data;
using TimeManagementSystem.Server.Data.DTOs;

namespace TimeManagementSystem.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;
        private readonly UserManager<Employee> _userManager;
        private readonly IEmailSender _emailSender;
        private readonly AppDbContext _context;

        public EmployeesController(IEmployeeService employeeService, UserManager<Employee> userManager, IEmailSender emailSender, AppDbContext context)
        {
            _employeeService = employeeService;
            _userManager = userManager;
            _emailSender = emailSender;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<Employee>>> Get()
        {
            try
            {
                var employees = await _employeeService.GetAllEmployeesAsync();
                return Ok(employees);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("paginated")]
        public async Task<ActionResult<PaginationResponse<Employee>>> GetPaginatedEmployees(int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var employees = await _employeeService.GetAllEmployeesPaginatedAsync(pageNumber, pageSize);
                return Ok(employees);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("GetArchived")]
        public async Task<ActionResult<List<Employee>>> GetArchived()
        {
            ClaimsPrincipal user = HttpContext.User;
            if (!user.Identity.IsAuthenticated)
            {
                return BadRequest("User is not authenticated to make this request");
            }
            var employeeID = user.Identity.Name!; // asserting that this will be a string because if user is not authenticated it would fall in the if statement above
            var employees = await _employeeService.GetArchivedEmployeesByDepartment(employeeID);



            return Ok(employees);
        }

        [HttpGet("{employeeCode}")]
        public async Task<ActionResult<Employee>> Get(string employeeCode)
        {
            var employee = await _employeeService.GetEmployeeByIdAsync(employeeCode);

            if (employee == null)
            {
                return NotFound();
            }

            return employee;
        }

        //[HttpGet("populateEmployeeFromMasterList")]
        //public async Task<ActionResult<Employee>> PopulateEmployeeFromExcel(string filename)
        //{
        //    var extension = filename.Split(".").Last();
        //    if (extension.ToLower() != "xlsx")
        //    {
        //        return BadRequest("Incorrect file format. Ensure that the extension is xlsx");
        //    }
        //    else
        //    {
        //        try
        //        {
        //            var isSeeded = await _employeeService.PopulateDatabaseWithEmployeeMasterlist(filename);
        //            if (isSeeded)
        //            {
        //                return Ok("Employee Masterlist was seeded successfully");
        //            }
        //            return BadRequest("Wasn't able to seed data.");
        //        }
        //        catch (InvalidOperationException e)
        //        {
        //            return BadRequest("No file found with that name");
        //        }
        //        catch (Exception e)
        //        {
        //            return BadRequest("Something went wrong when seeding");
        //        }
        //    }

        //}

        [HttpPost]
        public async Task<IActionResult> Post(Employee employee)
        {
            await _employeeService.AddEmployeeAsync(employee);
            return CreatedAtAction(nameof(Get), new { employeeCode = employee.EmployeeCode }, employee);
        }

        [HttpGet("ReActivate/{employeeCode}")]
        public async Task<IActionResult> ReactivateEmployee(string employeeCode)
        {
            var employee = await _employeeService.GetEmployeeByIdAsync(employeeCode);
            if (employee.Active == false)
            {
                bool employeeEnabled = await _employeeService.EnableEmployeeAsync(employeeCode);
                // Enable the employee
                if (!employeeEnabled)
                {
                    return StatusCode(500, $"Error while attempting to re-activate employee with code {employeeCode}");
                }
            }
            else
            {
                return Ok($"Employee with code {employeeCode} is already activated");
            }

            return Ok("Employee re-activated successfully!");
        }

        //[HttpPost("Terminate")]
        //public async Task<IActionResult> TerminateEmployee([FromBody] AttritionDTO attrition)
        //{
        //    if (attrition.EmployeeCode == null) return StatusCode(400, $"No Employeecode was given");

        //    var employee = await _employeeService.GetEmployeeByIdAsync(attrition.EmployeeCode);
        //    if (employee.Active == true)
        //    {
        //        // fetch immediate supervisor
        //        var immediateSuperior = await _context.Users.Where(u => u.ImmediateSuperiorCode == employee.ImmediateSuperiorCode).FirstOrDefaultAsync();
        //        if (immediateSuperior == null) return StatusCode(404, $"Immediate Superior with code {employee.ImmediateSuperiorCode} not found");

        //        // set emailAddress for notification delivery
        //        var emailAddress = immediateSuperior.Email;

        //        if (string.IsNullOrEmpty(emailAddress))
        //        {
        //            var employeesWithRoles = await _userManager.Users
        //               .Where(u => u.Department.Name == employee.Department.Name)
        //               .Select(u => new EmployeeWithRoleDto
        //               {
        //                   EmployeeCode = u.EmployeeCode,
        //                   FirstName = u.FirstName,
        //                   LastName = u.LastName,
        //                   Email = u.Email,
        //                   Department = u.Department.Name,
        //                   Active = u.Active,
        //                   Role = _userManager.GetRolesAsync(u).Result.FirstOrDefault(),
        //                   PositionCodeName = u.PositionCode.Name,
        //                   GenderName = u.Gender.Name,
        //                   MaritalStatusName = u.MaritalStatus.Name,
        //                   TeamName = u.Team.Name,

        //                   //ModeOfSeparationName = u.ModeOfSeparation.Name,
        //                   LastLoginDate = u.LastLoginDate,
        //                   EmploymentTypeName = u.EmploymentType.Name,
        //                   EmployeeStatusName = u.Status.Name// Get the first role associated with the user
        //               })
        //               .ToListAsync();

        //            foreach (var item in employeesWithRoles)
        //            {
        //                if (string.IsNullOrEmpty(item.Role)) { break; }

        //                if (item.Role.Contains("admin", StringComparison.OrdinalIgnoreCase))
        //                {
        //                    emailAddress = item.Email;
        //                }
        //            }
        //        }

        //        if (!string.IsNullOrEmpty(emailAddress))
        //        {
        //            //send an email to the admins in the resigning employee's department
        //            string htmlMessage = $"<div><p>{employee.FirstName} {employee.LastName} has resigned, their last day of work is {attrition.LastDayOfWork} and their reason for resigning is \"{attrition.Reason}\"</p></div>";
        //            try
        //            {
        //                await _emailSender.SendEmailAsync(emailAddress, "Notification of Resignation", htmlMessage);
        //            }
        //            catch (Exception ex)
        //            {
        //                return StatusCode(500, $"An error occurred while sending the Resignation email. {emailAddress}");
        //            }
        //        }

        //        bool employeeDisabled = await _employeeService.DisableEmployeeAsync(attrition.EmployeeCode);

        //        // Disable the employee
        //        if (!employeeDisabled)
        //        {
        //            return StatusCode(500, $"Error while attempting to disable employee with code {attrition.EmployeeCode}");
        //        }
        //    }

        //    // Store the termination record in the Attritions Table
        //    bool terminationStored = await _employeeService.StoreTerminateRecordAsync(attrition.EmployeeCode, attrition);
        //    if (!terminationStored)
        //    {
        //        return StatusCode(500, $"Error while attempting to store the termination record!");
        //    }

        //    // Termination successfull
        //    return Ok("Employee terminated successfully!");
        //}

        [HttpPut("{employeeCode}")]
        public async Task<IActionResult> Put(string employeeCode, Employee employee, [FromQuery] string selectedRole)
        {
            if (employeeCode != employee.EmployeeCode)
            {
                return BadRequest("Employee code mismatch.");
            }

            try
            {
                await _employeeService.UpdateEmployeeAsync(employee, selectedRole);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while updating the employee: {ex.Message}");
            }
        }

        [HttpDelete("{employeeCode}")]
        public async Task<IActionResult> Delete(string employeeCode)
        {
            var employee = await _employeeService.GetEmployeeByIdAsync(employeeCode);
            if (employee == null)
            {
                return NotFound($"Employee with code {employeeCode} not found.");
            }

            bool deleted = await _employeeService.DeleteEmployeeAsync(employeeCode);
            if (!deleted)
            {
                return StatusCode(500, "An error occurred while deleting the employee.");
            }

            // Return a custom success message
            return Ok($"Employee with code {employeeCode} was successfully removed from the database and deleted.");
        }

        [HttpGet("WithRoles")]
        public async Task<ActionResult<List<EmployeeWithRoleDto>>> GetEmployeesWithRoles()
        {
            var employeesWithRoles = await _userManager.Users
                .Select(u => new EmployeeWithRoleDto
                {
                    EmployeeCode = u.EmployeeCode,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    Department = u.Department.Name,
                    Active = u.Active,
                    Role = _userManager.GetRolesAsync(u).Result.FirstOrDefault(),
                    PositionCodeName = u.PositionCode.Name,
                    GenderName = u.Gender.Name,
                    MaritalStatusName = u.MaritalStatus.Name,
                    TeamName = u.Team.Name,
                    //ModeOfSeparationName = u.ModeOfSeparation.Name,
                    LastLoginDate = u.LastLoginDate,
                    EmploymentTypeName = u.EmploymentType.Name,
                    EmployeeStatusName = u.Status.Name// Get the first role associated with the user
                })
                .ToListAsync();

            return employeesWithRoles;
        }

        [HttpGet("GetEmployeesCountByDepartment")]
        public async Task<IActionResult> GetEmployeesCountByDepartment()
        {
            var departmentEmployeeCounts = await _employeeService.GetEmployeesCountByDepartmentAsync();
            return Ok(departmentEmployeeCounts);
        }

        [HttpGet("GetEmployeesByDepartment")]
        public async Task<IActionResult> GetEmployeesByDepartment([FromQuery] string selectedDepartment)
        {
            ClaimsPrincipal user = HttpContext.User;
            if (!user.Identity.IsAuthenticated)
            {
                return BadRequest("User is not authenticated to make this request");
            }
            var employeeID = user.Identity.Name!; // asserting that this will be a string because if user is not authenticated it would fall in the if statement above
            var employees = await _employeeService.GetEmployeesByDepartment(employeeID);



            return Ok(employees);
        }

        [HttpGet("GetEmployees")]
        public async Task<IActionResult> GetEmployees()
        {
            ClaimsPrincipal user = HttpContext.User;
            if (!user.Identity.IsAuthenticated)
            {
                return BadRequest("User is not authenticated to make this request");
            }
            var employeeID = user.Identity.Name!; // asserting that this will be a string because if user is not authenticated it would fall in the if statement above
            var employees = await _employeeService.GetEmployeesAsync(employeeID);

            return Ok(employees);
        }

        public class MoveEmployeesRequest
        {
            public int CurrentDepartmentId { get; set; }
            public int NewDepartmentId { get; set; }
        }

        //    [HttpPost("MoveEmployeesDepartment")]
        //    public async Task<ActionResult> MoveEmployeesDepartment([FromBody] MoveEmployeesRequest request)
        //    {
        //        try
        //        {
        //            var moveHistoryRecord = await _context.SuspendedPullOutFloatings.Where((record) => record.NewDepartmentId == request.CurrentDepartmentId || record.CurrentDepartmentId == request.CurrentDepartmentId).ToListAsync();

        //            foreach (var record in moveHistoryRecord)
        //            {
        //                if (record.CurrentDepartmentId == request.CurrentDepartmentId)
        //                {
        //                    record.CurrentDepartmentId = request.NewDepartmentId;
        //                }

        //                if (record.NewDepartmentId == request.CurrentDepartmentId)
        //                {
        //                    record.NewDepartmentId = request.NewDepartmentId;
        //                }
        //            }

        //            // Save changes to the database
        //            await _context.SaveChangesAsync();
        //        }
        //        catch (Exception ex)
        //        {
        //            return StatusCode(500, new { data = "", message = "An error occured on our end updating the move employee history", errors = ex.Message });
        //        }

        //        try
        //        {
        //            var result = await _employeeService.MoveEmployeesDepartment(request.CurrentDepartmentId, request.NewDepartmentId);
        //            return Ok(new { data = "", message = $"Employees transfered successfully!", errors = "" });
        //        }
        //        catch (Exception ex)
        //        {
        //            return StatusCode(500, new { data = "", message = "An error occured on our end transfering employees", errors = ex.Message });
        //        }
        //    }
    }
}
