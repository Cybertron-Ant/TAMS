using System;
using System.Security.Claims;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TimeManagementSystem.Server.Data;
using System.Reflection.Metadata.Ecma335;
using Microsoft.AspNetCore.Identity;
using TimeManagementSystem.Server.Data.DTOs;
using Microsoft.AspNetCore.Mvc.RazorPages;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace TimeManagementSystem.Server.Data.Services
{
    public class TimeSheetService : ITimeSheetService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmployeeService _employeeService;
        private readonly UserManager<Employee> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private TimeZoneInfo panamaZone = TimeZoneInfo.FindSystemTimeZoneById("America/Panama");


        public TimeSheetService(AppDbContext context, IHttpContextAccessor httpContextAccessor, IEmployeeService employeeService, UserManager<Employee> userManager, RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _employeeService = employeeService;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<TimeSheetDTO> GetTimesheetByBreakTypeId(string employeeCode, int breakTypeId)
        {
            try
            {
                var userId = await _context.Users
                    .Where(u => u.EmployeeCode == employeeCode)
                    .Select(u => u.Id)
                    .FirstOrDefaultAsync();

                if (userId == default)
                {
                    Console.WriteLine($"No user found with EmployeeCode: {employeeCode}"); // Replace with your logging mechanism
                    return null; // Consider your handling strategy (throw, return null, etc.)
                }
                var timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, panamaZone); ;
                var timeSheet = await _context.TimeSheets
                    .Include(t => t.Employee) // Ensuring the Employee navigation property is included.
                    .FirstOrDefaultAsync(t => t.BreakTypeId == breakTypeId && t.UserId == userId && t.Date == timeNow.Date);

                if (timeSheet == null)
                {
                    Console.WriteLine($"TimeSheet with ID {breakTypeId} for user ID {userId} not found."); // Replace with your logging mechanism
                    return null; // Consider your handling strategy (throw, return null, etc.)
                }

                // Example of mapping from TimeSheet entity to TimeSheetDTO.
                // Ensure all properties you wish to return are properly mapped.
                return new TimeSheetDTO
                {
                    Id = timeSheet.Id,
                    EmployeeCode = employeeCode, // Assuming EmployeeCode is needed but not stored directly in TimeSheet.
                    PunchIn = timeSheet.PunchIn,
                    PunchOut = timeSheet.PunchOut,
                    IsActive = timeSheet.IsActive,
                    Date = timeSheet.Date,
                    FirstName = timeSheet.Employee?.FirstName, // Assuming there's a navigation property to Employee
                    LastName = timeSheet.Employee?.LastName,
                };
            }
            catch (DbUpdateException dbEx)
            {
                // Specific handling for database update exceptions.
                Console.WriteLine($"A database update error occurred: {dbEx.Message}"); // Replace with your logging mechanism
                throw; // Optionally enrich exception before re-throwing or handle differently.
            }
            catch (Exception ex)
            {
                // General exception handling, potentially for logging unexpected exceptions.
                Console.WriteLine($"An error occurred: {ex.Message}"); // Replace with your logging mechanism
                throw; // Optionally enrich exception before re-throwing or handle differently.
            }
        }

        public async Task<TimeSheetDTO> GetTimeSheetByIdAsync(string employeeCode, int id)
        {
            try
            {
                var userId = await _context.Users
                    .Where(u => u.EmployeeCode == employeeCode)
                    .Select(u => u.Id)
                    .FirstOrDefaultAsync();

                if (userId == default)
                {
                    Console.WriteLine($"No user found with EmployeeCode: {employeeCode}"); // Replace with your logging mechanism
                    return null; // Consider your handling strategy (throw, return null, etc.)
                }

                var timeSheet = await _context.TimeSheets
                    .Include(t => t.Employee) // Ensuring the Employee navigation property is included.
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

                if (timeSheet == null)
                {
                    Console.WriteLine($"TimeSheet with ID {id} for user ID {userId} not found."); // Replace with your logging mechanism
                    return null; // Consider your handling strategy (throw, return null, etc.)
                }

                // Example of mapping from TimeSheet entity to TimeSheetDTO.
                // Ensure all properties you wish to return are properly mapped.
                return new TimeSheetDTO
                {
                    Id = timeSheet.Id,
                    EmployeeCode = employeeCode, // Assuming EmployeeCode is needed but not stored directly in TimeSheet.
                    PunchIn = timeSheet.PunchIn,
                    PunchOut = timeSheet.PunchOut,
                    IsActive = timeSheet.IsActive,
                    Date = timeSheet.Date,
                    FirstName = timeSheet.Employee?.FirstName, // Assuming there's a navigation property to Employee
                    LastName = timeSheet.Employee?.LastName,
                };
            }
            catch (DbUpdateException dbEx)
            {
                // Specific handling for database update exceptions.
                Console.WriteLine($"A database update error occurred: {dbEx.Message}"); // Replace with your logging mechanism
                throw; // Optionally enrich exception before re-throwing or handle differently.
            }
            catch (Exception ex)
            {
                // General exception handling, potentially for logging unexpected exceptions.
                Console.WriteLine($"An error occurred: {ex.Message}"); // Replace with your logging mechanism
                throw; // Optionally enrich exception before re-throwing or handle differently.
            }
        }

        public async Task<(IEnumerable<TimeSheetDTO>, string)> CreateTimeSheetAsync(string employeeCode, TimeSheetDTO timeSheetDto)
        {
            try
            {
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);
                if (employee == null)
                {
                    throw new Exception("Employee not found");
                }

                var timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, panamaZone);
                var newTimeSheet = new TimeSheet
                {
                    UserId = employee.Id,
                    PunchIn = timeNow,
                    Date = timeNow.Date,
                    IsActive = true,
                    BreakTypeId = timeSheetDto.BreakTypeId
                };


                // Main Clockin BreakTime Type for user will be the first ID in the breakTime table.
                //Gets all timesheets then find out if there are timesheets that are currently active.

                //Gets timesheets that are active and made today.
                var activeTimesheets = _context.TimeSheets.Where((ts) =>ts.IsActive && ts.Employee.EmployeeCode == employeeCode).ToList();
                if (activeTimesheets.IsNullOrEmpty() && timeSheetDto.BreakTypeId != 1)
                {
                    throw new Exception("Clock in before you can start a break");
                }
                var breakTimeType = _context.BreakTypes.Where((bt) => bt.Id == newTimeSheet.BreakTypeId).FirstOrDefault();


                foreach(var timesheet in activeTimesheets)
                {
                    if(newTimeSheet.BreakTypeId == timesheet.BreakTypeId)
                    {
                        //Show message user is clocked in to that breakType already
                        return (activeTimesheets.Select((ts) => new TimeSheetDTO
                        {
                            Id = ts.Id,
                            EmployeeCode = employeeCode,
                            PunchIn = ts.PunchIn,
                            Date = ts.Date,
                            IsActive = ts.IsActive,
                            BreakTypeId = ts.BreakTypeId
                        }), $"Already Active cannot punch in for {breakTimeType.Name}");
                    }
                }
                // gets user breaktype that is active and not the main clockin breakType.
                var anotherBreakActive = activeTimesheets.Where((ts) => ts.BreakTypeId != 1 && ts.Employee.EmployeeCode == employeeCode);
                if (!anotherBreakActive.IsNullOrEmpty())
                {
                    // Throw Error to say that you cannot create another break type unless the other active breaktype is closed. 
                    throw new Exception("Another break is active close that break before trying again");

                }

                _context.TimeSheets.Add(newTimeSheet);
                await _context.SaveChangesAsync();

                var timesheets = await _context.TimeSheets.Where((ts) => ts.IsActive && ts.Employee.EmployeeCode == employeeCode).Select((ts)=> new TimeSheetDTO
                {
                    Id = ts.Id,
                    EmployeeCode = ts.Employee.EmployeeCode,
                    PunchIn = ts.PunchIn,
                    Date = ts.Date,
                    IsActive = ts.IsActive,
                    BreakTypeId = ts.BreakTypeId
                }).ToListAsync();

                return (timesheets, "TimeSheet created successfully.");
            }
            catch (DbUpdateException ex)
            {
                // Log the detailed exception and inner exception to inspect the issue
                Console.WriteLine(ex.InnerException?.Message ?? ex.Message);
                throw; // Re-throw the exception or handle it as needed
            }
            catch (Exception ex)
            {
                // Handle other types of exceptions if necessary
                Console.WriteLine(ex.Message);
                throw;
            }
        }

        public async Task UpdateTimeSheetAsync(string employeeCode, int timeSheetId, TimeSheetDTO timeSheetDto)
        {
            var timeSheet = await _context.TimeSheets
                .Include(ts => ts.Employee)
                .FirstOrDefaultAsync(ts => ts.Id == timeSheetId && ts.Employee.EmployeeCode == employeeCode);

            if (timeSheet == null)
            {
                throw new Exception("TimeSheet not found for the given employee.");
            }
            // if these are not provided by the user then we should keep the values the same
            var punchIn = timeSheet.PunchIn;
            var punchOut = timeSheet.PunchOut;
            // Update the timesheet properties with the provided DTO

            // Ensure that the time that is passed over is in the right timezone
            if (timeSheetDto.PunchIn != null) 
            {

            punchIn = timeSheetDto.PunchIn;
           
            }
            if(timeSheetDto.PunchOut != null)
            {
                punchOut = timeSheetDto.PunchOut; 
            }
            // need to make sure that if we are making it active it should not use the previous punchout time 

            timeSheet.PunchIn =punchIn;
            timeSheet.PunchOut = (timeSheetDto.IsActive) ? null : punchOut;
            timeSheet.BreakTypeId = timeSheetDto.BreakTypeId;
            // ensure that if there is already two timesheets active we don't create another active one.

            var activeTimesheets = _context.TimeSheets.Where(ts => ts.IsActive && ts.Employee.EmployeeCode == employeeCode && ts.Id != timeSheet.Id).ToList();
            if(activeTimesheets.Count == 2 && timeSheetDto.IsActive)
            {
                throw new Exception("Another break is active close that break before trying again");
            }
            else
            {
                timeSheet.IsActive = timeSheetDto.IsActive;
            }


            // Ensure to map all other necessary fields from the DTO to the entity

            await _context.SaveChangesAsync();
        }

        public async Task DeleteTimeSheetAsync(string employeeCode, int id)
        {
            var userId = await _context.Users
                .Where(u => u.EmployeeCode == employeeCode)
                .Select(u => u.Id)
                .FirstOrDefaultAsync();

            var timeSheet = await _context.TimeSheets
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (timeSheet != null)
            {
                _context.TimeSheets.Remove(timeSheet);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<TimeSheetDTO>> GetAllTimeSheetsAsync()
        {
            var timeSheets = await _context.TimeSheets
                .Include(ts => ts.Employee) // Include Employee to access EmployeeCode
                .ToListAsync();

            var timeSheetDtos = timeSheets
                .Where(ts => ts.Employee != null)
                .Select(ts =>
                    {
                        return new TimeSheetDTO
                        {
                            Id = ts.Id,
                            EmployeeCode = ts.Employee.EmployeeCode,
                            PunchIn = ts.PunchIn,
                            PunchOut = ts.PunchOut,
                            Date = ts.Date,
                            FirstName = ts.Employee.FirstName,
                            LastName = ts.Employee.LastName,
                            IsActive = ts.IsActive,
                        };
                }).ToList();

            return timeSheetDtos;
        }


        public async Task<IEnumerable<TimeSheetDTO>> GetAllTimeSheetsListAsync(string employeeCode)
        {
            var userId = await _context.Employees.Where(e => e.EmployeeCode == employeeCode).Select(e => e.Id).FirstAsync();

            if (string.IsNullOrEmpty(userId))
            {
                return [];
            }

            var employees = await _employeeService.GetEmployeesAsync(userId);


            if (employees == null || !employees.Any())
            {
                return [];
            }

            var employeeIds = employees.Select(e => e.Id).ToList();

            var timeSheets = await _context.TimeSheets
               .Include(ts => ts.Employee) // Include Employee to access EmployeeCode
                .Where(s => employeeIds.Contains(s.Employee.Id))
               .ToListAsync();

            var timeSheetDtos = timeSheets.Select(ts => new TimeSheetDTO
            {
                Id = ts.Id,

                EmployeeCode = ts.Employee?.EmployeeCode, // Map EmployeeCode from the Employee entity
                PunchIn = ts.PunchIn,
                PunchOut = ts.PunchOut,
                Date = ts.Date,
                BreakTypeId = ts.BreakTypeId,
                FirstName = ts.Employee?.FirstName,
                LastName = ts.Employee.LastName,
                IsActive = ts.IsActive,
            });

            return timeSheetDtos;
        }

        public async Task<object> GetAllTimeSheetsFiltered(string employeeIdFromUser = null,
             int breakType = 0,
             int breakDuration = 0,
             DateTime? startDate = null,
             DateTime? endDate = null,
             int pageNumber = 1,
             int pageSize = 10)
        {

            var timeNow = TimeZoneInfo.ConvertTimeFromUtc(startDate ?? DateTime.UtcNow, panamaZone);  
            startDate ??= timeNow.Date; // if no startDate is passed in then we use today's date.

            // as a Employee I should only be able to see my timesheets for the day. 
            //TODO
            // Check User Role to see if they are an employee
            // If they are a employee then set the employee code as one of the filter properties.
            var employeeId = _httpContextAccessor.HttpContext.User.Identity.Name; // Should give me an ID of the user.
            var employee = _context.Employees.Where(e => e.Id == employeeId).First();

           

            var query = _context.TimeSheets.AsQueryable();

            if (employee == null)
            {
                throw  new Exception("Employee not retrieved correctly");
            }
            else
            {
                var roles = await _userManager.GetRolesAsync(employee);
                var userRole = roles.First();
                if (userRole == null)
                {
                    return new Exception("Employee does not have a role. Contact admin");
                }
                if (userRole == "Employee")
                {
                    query = query.Where(t => t.UserId == employeeId);

                }
                else
                {
                    if (!string.IsNullOrEmpty(employeeIdFromUser))
                    {
                        query = query.Where(t => t.UserId == employeeIdFromUser);
                    }

                }


            }



            //var roles = await _userManager.GetRolesAsync(employee);
            //employee.Role = roles.FirstOrDefault();



            if (breakType > 0)
            {
                query = query.Where(t => t.BreakTypeId == breakType);
            }



            if (startDate.HasValue)
            {
                query = query.Where(t => startDate.Value.Date.CompareTo(t.Date) <= 0);
            }
            if (breakDuration > 0)
            {

                // temp punchIn just in case punchIn is null
                var tempPunchOut = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, panamaZone);

                query = query.Where(t => 
    EF.Functions.DateDiffMinute(t.PunchIn, t.PunchOut ?? tempPunchOut) > breakDuration);
            }

            if (endDate.HasValue)
            {
                var timezoneEndDate = TimeZoneInfo.ConvertTimeFromUtc(endDate.Value, panamaZone);
                query = query.Where(t => timezoneEndDate.Date.CompareTo(t.Date) >= 0 );
            }

            

            // Pagination
            var totalRecords = query.Count();
            var totalPages = (int)Math.Ceiling((double)totalRecords / pageSize);

            var pagedResult = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(ts => new TimeSheetDTO
                {
                    Id = ts.Id,
                    EmployeeCode = ts.Employee.EmployeeCode, // Map EmployeeCode from the Employee entity
                    PunchIn = ts.PunchIn,
                    PunchOut = ts.PunchOut,
                    Date = ts.Date,
                    BreakTypeId = ts.BreakTypeId,
                    FirstName = ts.Employee.FirstName,
                    LastName = ts.Employee.LastName,
                    IsActive = ts.IsActive,
                })
                .ToList();

            var response = new
            {
                TotalRecords = totalRecords,
                TotalPages = totalPages,
                CurrentPage = pageNumber,
                PageSize = pageSize,
                Results = pagedResult
            };

            return response;
        }


        public async Task<(IEnumerable<TimeSheetDTO>, string)> PunchOutAsync(string employeeCode, int timeSheetId)
        {
            var timeSheets = new List<TimeSheetDTO> { };
            var message = "";

            var timeSheet = await _context.TimeSheets.Include(ts => ts.Employee)
                                                      .FirstOrDefaultAsync(ts => ts.Id == timeSheetId && ts.Employee.EmployeeCode == employeeCode);
            if (timeSheet == null)
            {
                throw new Exception("TimeSheet or Employee not found");
            }

            var timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, panamaZone); 
            timeSheet.PunchOut = timeNow;

            // Assuming CurrentHours is the total duration excluding breaks
            if (timeSheet.PunchIn != null)
            {
                var totalDuration = (timeSheet.PunchOut.Value - timeSheet.PunchIn).TotalHours;
                //var lunchBreakDuration = timeSheet.LunchBreakDuration;
                //timeSheet.CurrentHours = (decimal)(totalDuration - lunchBreakDuration);
            }
            timeSheet.IsActive = false;
            // If user is clocking out I want all the active breakTypes to be inactive as well.
            // instead of getting the active timesheets for the day I just got the ones that are active 
            if (timeSheet.BreakTypeId == 1) {
                // Fetch the timesheets to be updated
                var timesheets = await _context.TimeSheets
                    .Where(ts => ts.IsActive && ts.Id != timeSheet.Id && ts.Employee.EmployeeCode == employeeCode)
                    .ToListAsync();

                // Update the properties
                timesheets.ForEach(ts => {
                    ts.IsActive = false;
                    ts.PunchOut = timeNow;
                });

                message = "Clocking out, all breaks will be terminated";
            }
            else
            {
                timeSheets = _context.TimeSheets.Where((ts) => ts.IsActive && ts.Id != timeSheet.Id && ts.Employee.EmployeeCode == employeeCode).Select((ts) => new TimeSheetDTO
                {
                    Id = ts.Id,
                    EmployeeCode = ts.Employee.EmployeeCode, // Assuming EmployeeCode is needed but not stored directly in TimeSheet.
                    PunchIn = ts.PunchIn,
                    IsActive = ts.IsActive,
                    BreakTypeId = ts.BreakTypeId,
                    Date = ts.Date,
                    FirstName = ts.Employee.FirstName, // Assuming there's a navigation property to Employee
                    LastName = ts.Employee.LastName,


                }).ToList();
                message = "Successfully Punched out";
            }

            await _context.SaveChangesAsync();
            return (timeSheets, message);
        }

        public async Task<IEnumerable<TimeSheetDTO>> GetTimeSheetsForEmployeeAsync(string employeeCode)
        {
            var userId = await _context.Users
                .Where(u => u.EmployeeCode == employeeCode)
                .Select(u => u.Id)
                .FirstOrDefaultAsync();

            if (userId == default)
            {
                // Log or handle the case where the user is not found, if necessary
                return Enumerable.Empty<TimeSheetDTO>(); // Return an empty collection or null, based on your preference
            }

            var timeSheets = await _context.TimeSheets
                .Where(ts => ts.UserId == userId)
                .Include(ts => ts.Employee)
                .ToListAsync();

            var timeSheetDtos = timeSheets.Select(ts => new TimeSheetDTO
            {
                Id = ts.Id,
                EmployeeCode = ts.Employee.EmployeeCode, // Assuming EmployeeCode is a property of Employee
                PunchIn = ts.PunchIn,
                PunchOut = ts.PunchOut,
                BreakTypeId = ts.BreakTypeId,
                Date = ts.Date,
                IsActive = ts.IsActive,
                FirstName = ts.Employee.FirstName,
                LastName = ts.Employee.LastName,

                // Map any other properties you need
            }).ToList();

            return timeSheetDtos;
        }

        public async Task<PaginationResponse<object>> GetAggregatedUserTimesheetInfo(DateTime? startDate, DateTime? endDate, int pageNumber, int pageSize, string employeeIdFromUser)
        {
            startDate = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(startDate ?? DateTime.Now, "America/Panama"); 
            endDate = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(endDate ?? DateTime.Now, "America/Panama");
            var employeeId = _httpContextAccessor.HttpContext.User.Identity.Name; // Should give me an ID of the user.
            var employee = _context.Employees.Where(e => e.Id == employeeId).First();
            var query = _context.TimeSheets.AsQueryable();
            if (employee == null)
            {
                throw new Exception("Employee not retrieved correctly");
            }
            else
            {
                var roles = await _userManager.GetRolesAsync(employee);
                var userRole = roles.First();
                if (userRole == null)
                {
                    throw new Exception("Employee does not have a role. Contact admin");
                }
                if (userRole == "Employee")
                {
                    query = query.Where(t => t.UserId == employeeId);

                }
                else
                {
                    if (!string.IsNullOrEmpty(employeeIdFromUser))
                    {
                        query = query.Where(t => t.UserId == employeeIdFromUser);
                    }

                }


            }

            var aggSheets = query
            .Where(ts => ts.PunchOut.HasValue)
            .Where(ts => ts.Date.CompareTo(startDate.Value) >= 0 && ts.Date.CompareTo(endDate.Value) <= 0)
            .Join(
                _context.Employees,
                ts => ts.UserId,
                e => e.Id,
                (ts, e) => new
                {
                    e.EmployeeCode,
                    e.FirstName,
                    e.LastName,
                    ts.BreakTypeId,
                    PunchIn = ts.PunchIn,
                    PunchOut = ts.PunchOut
                }
            ).AsEnumerable()
            .GroupBy(
                x => new { x.EmployeeCode, x.FirstName, x.LastName }
            ).Select(g => new
            {
                g.Key.EmployeeCode,
                g.Key.FirstName,
                g.Key.LastName,
                TotalWorkHours = g.Sum(x => (x.PunchOut.Value - x.PunchIn).TotalMinutes) / 60.0,
                TotalLunchHours = g.Sum(x => x.BreakTypeId == 2 ? (x.PunchOut.Value - x.PunchIn).TotalMinutes : 0) / 60.0,
                TotalBreakHours = g.Sum(x => x.BreakTypeId == 3 ? (x.PunchOut.Value - x.PunchIn).TotalMinutes : 0) / 60.0,
                TotalClockHours = g.Sum(x => x.BreakTypeId == 1 ? (x.PunchOut.Value - x.PunchIn).TotalMinutes : 0) / 60.0,
                StartDate = startDate, // I just want the date and not the time
                EndDate = endDate,
            });
            var totalRecords = aggSheets.Count();
            var totalPages = (int)Math.Ceiling((double)totalRecords / pageSize);

            var pagedResult = aggSheets
            
            .OrderBy(x => x.EmployeeCode)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

            var response = new PaginationResponse<object>(totalPages, pagedResult, totalRecords, pageSize, pageNumber);


            return response;
        }

        public async Task<IEnumerable<object>> GetAllAggregatedUserTimesheetByBreaks(DateTime? startDate, DateTime? endDate, string employeeCode)
        {
            /*
             ensure that startDate and endDate has a value.
             search the db for timesheets that have been made between that duration
             group the timesheets by break times to get the total amount of time logged for each break type.

             
             
             */

            startDate = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(startDate ?? DateTime.Now.Date, "America/Panama");
            endDate = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(endDate ?? DateTime.Now, "America/Panama");
            var employeeId = _httpContextAccessor.HttpContext.User.Identity.Name; // Should give me an ID of the user.
            var employee = _context.Employees.Where(e => e.Id == employeeId).First();
            var confirmedEmployee = _context.Employees.Where(e => e.EmployeeCode == employeeCode).First();

            if(confirmedEmployee == null)
            {
                throw new Exception("Employeecode does not match any records");
            }

            var roles = await _userManager.GetRolesAsync(employee);
            var userRole = roles.First();
            if (userRole == null) // for whatever reason no role is attached. Throw an exception.
            {
                throw new Exception("Employee does not have a role. Contact admin");
            }
            if (userRole == "Employee") // if user is an Employee role then they should not be able to fetch aggregate time info
            {
                throw new Exception("User does not have the right permission to perform this action");
            }
            var timesheetAgg = _context.TimeSheets.
                Where(ts => ts.PunchOut.HasValue).
                Where(ts => ts.Date.CompareTo(startDate.Value) >= 0 && ts.Date.CompareTo(endDate.Value) <= 0 && ts.UserId == confirmedEmployee.Id).ToList();

            var aggData = timesheetAgg.
                Join(_context.Employees,
                      ts => ts.UserId,
                      e => e.Id,
                      (ts, e) => new { ts, e })
                .Join(_context.BreakTypes,
                      combined => combined.ts.BreakTypeId,
                      bt => bt.Id,
                      (combined, bt) => new { combined.ts, combined.e, bt })
                .GroupBy(g => new
                {
                    g.e.EmployeeCode,
                    g.e.FirstName,
                    g.e.LastName,
                    g.ts.BreakTypeId,
                    g.bt.Name
                })
                .Select(g => new
                {
                    EmployeeCode = g.Key.EmployeeCode,
                    FirstName = g.Key.FirstName,
                    LastName = g.Key.LastName,
                    BreakTypeId = g.Key.BreakTypeId,
                    BreakTypeName = g.Key.Name,
                    TotalLoggedHours = g.Sum(x => (x.ts.PunchOut.Value - x.ts.PunchIn).TotalSeconds) / 3600.0,
                    startDate,
                    endDate,
                })
                .OrderBy(r => r.FirstName)
                .ThenBy(r => r.BreakTypeId)
                .ToList();
            return aggData;
        }
    }

   
}

