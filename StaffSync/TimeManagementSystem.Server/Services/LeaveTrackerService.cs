using System.Diagnostics;
using System.Globalization;
using System.Reflection;
using System.Security.Claims;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data;
using TimeManagementSystem.Server.Data.DTOs;
using Microsoft.AspNetCore.Http;


namespace TimeManagementSystem.Server.Data.Services
{
    public class LeaveTrackerService : ILeaveTrackerService

    {
        private readonly UserManager<Employee> _userManager;
        private readonly AppDbContext _context;
        private readonly IEmployeeService _employeeService;
        private readonly IHttpContextAccessor _httpContextAccessor;


        public LeaveTrackerService(UserManager<Employee> userManager, AppDbContext context, IEmployeeService employeeService, IHttpContextAccessor httpContextAccessor)
        {
            _userManager = userManager;
            _context = context;
            _employeeService = employeeService;
            _httpContextAccessor = httpContextAccessor;

        }

        public async Task<IEnumerable<LeaveTrackerDTO>> GetByEmployeeCodeAsync(string employeeCode)
        {
            // First, find the User (Employee) ID based on the EmployeeCode
            var userId = await _context.Users
                .Where(u => u.EmployeeCode == employeeCode)
                .Select(u => u.Id)
                .FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(userId))
            {
                throw new Exception($"No employee found with EmployeeCode {employeeCode}.");
            }

            // Then, retrieve LeaveTracker records that reference this User (Employee) ID
            var records = await _context.LeaveTracker
                .Where(s => s.UserId == userId) // Use UserId to match LeaveTracker with Employee
                .Select(s => new LeaveTrackerDTO
                {
                    // Map properties from LeaveTracker to LeaveTrackerDTO
                    Id = s.Id,
                    DateOfAbsence = s.DateOfAbsence,
                    Shift = s.Shift.Type,
                    ShiftId = s.ShiftId,
                    Attendance = s.Attendance.Type,
                    AttendanceId = s.AttendanceId,
                    ApprovalStatusId = s.ApprovalStatusId,
                    ApprovalStatus = s.ApprovalStatus.Type,
                    Reason = s.Reason,
                    ExpectedDateOfReturn = s.ExpectedDateOfReturn,
                    TimeOfNotice = s.TimeOfNotice,
                    SubmittedDocument = s.SubmittedDocument,
                    DocumentLink = s.DocumentLink,
                    Recommendation = s.Recommendation,
                    EmployeeCode = employeeCode,
                    FirstName = s.Employee.FirstName,
                    LastName = s.Employee.LastName,
                    LeaveBalance = _context.LeaveBalances
                            .Where(lb => lb.AttendanceId == s.Attendance.Id && lb.UserId == s.Employee.Id)
                            .Select(lb => lb.Balance)
                            .FirstOrDefault()
                })
                .ToListAsync();

            return records;
        }

        public async Task<LeaveTrackerDTO> GetByIdAsync(int id)
        {
            var record = await _context.LeaveTracker.Select(lt => new LeaveTrackerDTO
            {
                Id = lt.Id,
                DateOfAbsence = lt.DateOfAbsence,
                Shift = lt.Shift.Type,
                ShiftId = lt.ShiftId,
                Attendance = lt.Attendance.Type,
                AttendanceId = lt.Attendance.Id,
                Reason = lt.Reason,
                ExpectedDateOfReturn = lt.ExpectedDateOfReturn,
                TimeOfNotice = lt.TimeOfNotice,
                SubmittedDocument = lt.SubmittedDocument,
                DocumentLink = lt.DocumentLink,
                Recommendation = lt.Recommendation,
                EmployeeCode = lt.Employee.EmployeeCode,
                FirstName = lt.Employee.FirstName,
                LastName = lt.Employee.LastName,
                ApprovalStatus = lt.ApprovalStatus.Type,
                ApprovalStatusId = lt.ApprovalStatus.Id,
                LeaveBalance = _context.LeaveBalances
                            .Where(lb => lb.AttendanceId == lt.Attendance.Id && lb.UserId == lt.Employee.Id)
                            .Select(lb => lb.Balance)
                            .FirstOrDefault()
            }).FirstOrDefaultAsync(lt => lt.Id == id);

            return record;
        }

        public async Task CreateAsync(LeaveTrackerDTO leaveTrackerDto)
        {
            // query the approval status id for "pending" else set to "0"
            var approvalStatusId = await _context.ApprovalStatuses
                .Where(a => a.Type.ToLower() == "pending")
                .Select(a => a.Id)
                .FirstOrDefaultAsync();

            if (approvalStatusId == 0)
            {
                // No approval status with type "Pending" found, using the first approval status found
                var firstApprovalStatusId = await _context.ApprovalStatuses
                    .OrderBy(a => a.Id)
                    .Select(a => a.Id)
                    .FirstOrDefaultAsync();

                Console.WriteLine("Unable to find an approval status called 'Pending'. Using the first approval status found.");
                approvalStatusId = firstApprovalStatusId;
            }

            // query the user's id using the employeeCode
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.EmployeeCode == leaveTrackerDto.EmployeeCode);

            if (user == null)
            {
                throw new Exception($"Employee with code {leaveTrackerDto.EmployeeCode} not found.");
            }

            // query the user's remaining leave balance for the leave type being requested
            var remainingLeaveBalance = await _context.LeaveBalances
                    .Where(lt => lt.AttendanceId == leaveTrackerDto.AttendanceId && lt.UserId == user.Id)
                    .FirstOrDefaultAsync();

            // check if the remaining leave balance record exists, if it doens't we create it
            if (remainingLeaveBalance == null)
            {
                var leaveBalanceDefault = await _context.LeaveBalanceDefaults
                        .Where(lbd => lbd.AttendanceId == leaveTrackerDto.AttendanceId)
                        .Include(lbd => lbd.Attendance)
                        .FirstOrDefaultAsync();

                if (leaveBalanceDefault == null) throw new Exception($"Unable to find the default leave balance for {leaveBalanceDefault.Attendance.Type}");

                var record = new LeaveBalance
                {
                    UserId = user.Id,
                    AttendanceId = leaveTrackerDto.AttendanceId,
                    Balance = leaveBalanceDefault.Balance
                };

                // add the record to ef core context
                await _context.LeaveBalances.AddAsync(record);


                // save inserted record
                await _context.SaveChangesAsync();

                // fetch the remaining leave balance after creation
                remainingLeaveBalance = record;
            }

            // check if the remaining leave balance is less than or equal to  0
            else if (remainingLeaveBalance.Balance <= 0)

                {
                    throw new Exception($"You have reached the maximum request for this leave type.");
                }
            

            // get the total leaves requested in days
            var requestedLeaveDays = GetWorkingDaysCount(leaveTrackerDto.DateOfAbsence, leaveTrackerDto.ExpectedDateOfReturn);

            // check if the user has the amount of days requested
            if (requestedLeaveDays > remainingLeaveBalance.Balance)
            {
                throw new Exception($"You are requesting more days than your available balance");
            }

            // map properties to be inserted in the database
            var tracker = new LeaveTracker
            {
                UserId = user.Id,
                DateOfAbsence = leaveTrackerDto.DateOfAbsence,
                AttendanceId = leaveTrackerDto.AttendanceId,
                ShiftId = leaveTrackerDto.ShiftId,
                Reason = leaveTrackerDto.Reason,
                ExpectedDateOfReturn = leaveTrackerDto.ExpectedDateOfReturn,
                TimeOfNotice = DateTime.Now.Date,
                SubmittedDocument = leaveTrackerDto.SubmittedDocument,
                DocumentLink = leaveTrackerDto.DocumentLink,
                Recommendation = leaveTrackerDto.Recommendation,
                ApprovalStatusId = approvalStatusId,
            };



            // add record to the context before saving
            await _context.LeaveTracker.AddAsync(tracker);

            // Save changes to the database to get the newly created tracker ID
            await _context.SaveChangesAsync();
        }

        //public async Task<IEnumerable<LeaveTrackerDTO>> GetAllAsync()
        //{

        //    return await _context.LeaveTracker
        //        .Select(s => new LeaveTrackerDTO
        //        {
        //            // Map properties from LeaveTracker to LeaveTrackerDTO
        //            Id = s.Id,
        //            DateOfAbsence = s.DateOfAbsence,
        //            Shift = s.Shift.Type,
        //            ShiftId = s.ShiftId,
        //            Attendance = s.Attendance.Type,
        //            AttendanceId = s.Attendance.Id,
        //            Reason = s.Reason,
        //            ExpectedDateOfReturn = s.ExpectedDateOfReturn,
        //            TimeOfNotice = s.TimeOfNotice,
        //            SubmittedDocument = s.SubmittedDocument,
        //            DocumentLink = s.DocumentLink,
        //            Recommendation = s.Recommendation,
        //            EmployeeCode = s.Employee.EmployeeCode,
        //            FirstName = s.Employee.FirstName,
        //            LastName = s.Employee.LastName,
        //            ApprovalStatus = s.ApprovalStatus.Type,
        //            ApprovalStatusId = s.ApprovalStatus.Id,
        //            LeaveBalance = _context.LeaveBalances
        //                    .Where(lb => lb.AttendanceId == s.Attendance.Id && lb.UserId == s.Employee.Id)
        //                    .Select(lb => lb.Balance)
        //                    .FirstOrDefault()
        //        })
        //        .ToListAsync();
        //}

        //public async Task<IEnumerable<LeaveTrackerDTO>> GetAllAsync()
        //{
        //    var userId = "AGS-0003";
        //    if (string.IsNullOrEmpty(userId))
        //    {
        //        return Enumerable.Empty<LeaveTrackerDTO>();
        //    }

        //    var employees = await _employeeService.GetEmployeesAsync(userId);

        //    if (employees == null || !employees.Any())
        //    {
        //        return Enumerable.Empty<LeaveTrackerDTO>();
        //    }

        //    var employeeIds = employees.Select(e => e.Id).ToList();

        //    return await _context.LeaveTracker
        //        .Where(s => employeeIds.Contains(s.Employee.Id))
        //        .Select(s => new LeaveTrackerDTO
        //        {
        //            // Map properties from LeaveTracker to LeaveTrackerDTO
        //            Id = s.Id,
        //            DateOfAbsence = s.DateOfAbsence,
        //            Shift = s.Shift.Type,
        //            ShiftId = s.ShiftId,
        //            Attendance = s.Attendance.Type,
        //            AttendanceId = s.Attendance.Id,
        //            Reason = s.Reason,
        //            ExpectedDateOfReturn = s.ExpectedDateOfReturn,
        //            TimeOfNotice = s.TimeOfNotice,
        //            SubmittedDocument = s.SubmittedDocument,
        //            DocumentLink = s.DocumentLink,
        //            Recommendation = s.Recommendation,
        //            EmployeeCode = s.Employee.EmployeeCode,
        //            FirstName = s.Employee.FirstName,
        //            LastName = s.Employee.LastName,
        //            ApprovalStatus = s.ApprovalStatus.Type,
        //            ApprovalStatusId = s.ApprovalStatus.Id,
        //            LeaveBalance = _context.LeaveBalances
        //                .Where(lb => lb.AttendanceId == s.Attendance.Id && lb.UserId == s.Employee.Id)
        //                .Select(lb => lb.Balance)
        //                .FirstOrDefault()
        //        })
        //        .ToListAsync();
        //}

        public async Task<IEnumerable<LeaveTrackerDTO>> GetAllListAsync(string employeeCode)
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

            return await _context.LeaveTracker
                .Where(s => employeeIds.Contains(s.Employee.Id))
                .Select(s => new LeaveTrackerDTO
                {
                    Id = s.Id,
                    DateOfAbsence = s.DateOfAbsence,
                    Shift = s.Shift.Type,
                    ShiftId = s.ShiftId,
                    Attendance = s.Attendance.Type,
                    AttendanceId = s.Attendance.Id,
                    Reason = s.Reason,
                    ExpectedDateOfReturn = s.ExpectedDateOfReturn,
                    TimeOfNotice = s.TimeOfNotice,
                    SubmittedDocument = s.SubmittedDocument,
                    DocumentLink = s.DocumentLink,
                    Recommendation = s.Recommendation,
                    EmployeeCode = s.Employee.EmployeeCode,
                    FirstName = s.Employee.FirstName,
                    LastName = s.Employee.LastName,
                    ApprovalStatus = s.ApprovalStatus.Type,
                    ApprovalStatusId = s.ApprovalStatus.Id,
                    LeaveBalance = _context.LeaveBalances
                        .Where(lb => lb.AttendanceId == s.Attendance.Id && lb.UserId == s.Employee.Id)
                        .Select(lb => lb.Balance)
                        .FirstOrDefault()
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<LeaveTrackerDTO>> GetAllAsync()
        {
            return await _context.LeaveTracker
                .Select(s => new LeaveTrackerDTO
                {
                    Id = s.Id,
                    DateOfAbsence = s.DateOfAbsence,
                    Shift = s.Shift.Type,
                    ShiftId = s.ShiftId,
                    Attendance = s.Attendance.Type,
                    AttendanceId = s.Attendance.Id,
                    Reason = s.Reason,
                    ExpectedDateOfReturn = s.ExpectedDateOfReturn,
                    TimeOfNotice = s.TimeOfNotice,
                    SubmittedDocument = s.SubmittedDocument,
                    DocumentLink = s.DocumentLink,
                    Recommendation = s.Recommendation,
                    EmployeeCode = s.Employee.EmployeeCode,
                    FirstName = s.Employee.FirstName,
                    LastName = s.Employee.LastName,
                    ApprovalStatus = s.ApprovalStatus.Type,
                    ApprovalStatusId = s.ApprovalStatus.Id,
                    LeaveBalance = _context.LeaveBalances
                        .Where(lb => lb.AttendanceId == s.Attendance.Id && lb.UserId == s.Employee.Id)
                        .Select(lb => lb.Balance)
                        .FirstOrDefault()
                })
                .ToListAsync();
        }

        public async Task DeleteAsync(int trackerId)
        {
            var tracker = await _context.LeaveTracker.FindAsync(trackerId);
            if (tracker == null)
            {
                throw new KeyNotFoundException($"LeaveTracker with the ID {trackerId} was not found.");
            }

            // Remove the tracker record
            _context.LeaveTracker.Remove(tracker);

            // Save changes to delete the tracker record
            await _context.SaveChangesAsync();

            // Count records in the leave tracker table that have the same AttendanceId and UserId as the current one
            var leaveTrackerRecordCount = await _context.LeaveTracker
                .CountAsync(lb => lb.AttendanceId == tracker.AttendanceId && lb.UserId == tracker.UserId);

            if (leaveTrackerRecordCount == 0)
            {
                // If no more records in LeaveTracker with the same UserID and AttendanceId,
                // check if there's a corresponding record in LeaveBalances and delete it
                var leaveBalanceToDelete = await _context.LeaveBalances
                    .FirstOrDefaultAsync(lb => lb.AttendanceId == tracker.AttendanceId && lb.UserId == tracker.UserId);

                if (leaveBalanceToDelete != null)
                {
                    _context.LeaveBalances.Remove(leaveBalanceToDelete);
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task DeleteByEmployeeCodeAsync(string employeeCode)
        {
            // Find the user ID associated with the given EmployeeCode
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.EmployeeCode == employeeCode);

            if (user == null)
            {
                throw new KeyNotFoundException($"No employee found with EmployeeCode {employeeCode}.");
            }

            // Find all LeaveTracker records associated with this UserId
            var trackers = await _context.LeaveTracker
                .Where(s => s.UserId == user.Id)
                .ToListAsync();

            if (trackers.Count == 0)
            {
                // Optionally handle the case where no trackers are found for the user
                throw new KeyNotFoundException($"No LeaveTracker records found for EmployeeCode {employeeCode}.");
            }

            // Remove all found trackers
            _context.LeaveTracker.RemoveRange(trackers);

            // Save changes to delete the trackers
            await _context.SaveChangesAsync();

            // Count remaining trackers with the same AttendanceId and UserId
            var remainingTrackerCount = await _context.LeaveTracker
                .CountAsync(s => s.UserId == user.Id);

            if (remainingTrackerCount == 0)
            {
                // If no more trackers left for the user, delete the corresponding LeaveBalances records
                var leaveBalancesToDelete = await _context.LeaveBalances
                    .Where(lb => lb.UserId == user.Id)
                    .ToListAsync();

                if (leaveBalancesToDelete.Count > 0)
                {
                    // Remove all found LeaveBalances records
                    _context.LeaveBalances.RemoveRange(leaveBalancesToDelete);
                    await _context.SaveChangesAsync();
                }
            }
        }

        public async Task UpdateByEmployeeCodeAsync(string employeeCode, int id, LeaveTrackerDTO leaveTrackerDto)
        {
            var employee = await _context.Users.FirstOrDefaultAsync(u => u.EmployeeCode == employeeCode);
            if (employee == null)
            {
                throw new Exception($"No employee found with EmployeeCode {employeeCode}.");
            }

            var tracker = await _context.LeaveTracker
                .Include(lt => lt.ApprovalStatus)
                .FirstOrDefaultAsync(s => s.Id == id && s.Employee.EmployeeCode == employeeCode);
            if (tracker == null)
            {
                throw new Exception($"No LeaveTracker record found with ID {id} for EmployeeCode {employeeCode}.");
            }

            var previousStatusId = tracker.ApprovalStatusId;

            // Update the LeaveTracker properties including the ApprovalStatusId using the provided LeaveTrackerDTO
            tracker.ApprovalStatusId = leaveTrackerDto.ApprovalStatusId;
            tracker.AttendanceId = leaveTrackerDto.AttendanceId;
            tracker.ShiftId = leaveTrackerDto.ShiftId;
            UpdateEntityPropertyIfNotNullOrEmpty(tracker, nameof(leaveTrackerDto.Shift), leaveTrackerDto.Shift);
            UpdateEntityPropertyIfNotNullOrEmpty(tracker, nameof(leaveTrackerDto.DocumentLink), leaveTrackerDto.DocumentLink);
            UpdateEntityPropertyIfNotNullOrEmpty(tracker, nameof(leaveTrackerDto.DateOfAbsence), leaveTrackerDto.DateOfAbsence);
            UpdateEntityPropertyIfNotNullOrEmpty(tracker, nameof(leaveTrackerDto.ExpectedDateOfReturn), leaveTrackerDto.ExpectedDateOfReturn);
            UpdateEntityPropertyIfNotNullOrEmpty(tracker, nameof(leaveTrackerDto.Reason), leaveTrackerDto.Reason);
            UpdateEntityPropertyIfNotNullOrEmpty(tracker, nameof(leaveTrackerDto.Recommendation), leaveTrackerDto.Recommendation);

            // Get the ID of the "Approved" status dynamically
            var approvedStatusId = await _context.ApprovalStatuses
                .Where(s => s.Type.ToLower() == "approved")
                .Select(s => s.Id)
                .FirstOrDefaultAsync();

            // Calculate the requested leave days
            var requestedLeaveDays = GetWorkingDaysCount(leaveTrackerDto.DateOfAbsence, leaveTrackerDto.ExpectedDateOfReturn);

            // Check if the new status is "Approved"
            if (leaveTrackerDto.ApprovalStatusId == approvedStatusId)
            {
                // Query the user's remaining leave balance for the leave type being requested
                var remainingLeaveBalance = await _context.LeaveBalances
                    .FirstOrDefaultAsync(lb => lb.AttendanceId == leaveTrackerDto.AttendanceId && lb.UserId == employee.Id);

                if (requestedLeaveDays > remainingLeaveBalance?.Balance)
                {
                    throw new Exception($"Requested leave days ({requestedLeaveDays}) exceed your remaining balance ({remainingLeaveBalance?.Balance}).");
                }

                // Subtract the requested days from the remaining balance
                remainingLeaveBalance.Balance -= requestedLeaveDays;
            }
            else if (previousStatusId == approvedStatusId)
            {
                // Query the user's remaining leave balance for the leave type being requested
                var remainingLeaveBalance = await _context.LeaveBalances
                    .FirstOrDefaultAsync(lb => lb.AttendanceId == leaveTrackerDto.AttendanceId && lb.UserId == employee.Id);

                // Add the requested days to the remaining balance
                remainingLeaveBalance.Balance += requestedLeaveDays;
            }

            // Save changes to update the LeaveTracker record
            await _context.SaveChangesAsync();
        }

        private void UpdateEntityPropertyIfNotNullOrEmpty<TEntity>(TEntity entity, string propertyName, object value)
        {
            var propertyInfo = entity.GetType().GetProperty(propertyName);
            if (propertyInfo != null && value != null && !string.IsNullOrEmpty(value.ToString()))
            {
                propertyInfo.SetValue(entity, value);
            }
        }

        private static int GetWorkingDaysCount(DateTime startDate, DateTime endDate)
        {
            int count = 0;
            DateTime currentDate = startDate;

            // Iterate through each day between start and end dates
            while (currentDate < endDate)
            {

                // Check if the current day is a weekday (Monday-Saturday)
                if (currentDate.DayOfWeek != DayOfWeek.Sunday)
                {
                    count++;
                }

                // Move to the next day
                currentDate = currentDate.AddDays(1);
            }

            return count;
        }

        public async Task<IEnumerable<LeaveTrackerDTO>> GetLeavesWithinTimeframeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.LeaveTracker
                .Where(lt => lt.DateOfAbsence >= startDate && lt.DateOfAbsence <= endDate)
                .Select(lt => new LeaveTrackerDTO
                {
                    Id = lt.Id,
                    DateOfAbsence = lt.DateOfAbsence,
                    Shift = lt.Shift.Type,
                    ShiftId = lt.ShiftId,
                    Attendance = lt.Attendance.Type,
                    AttendanceId = lt.AttendanceId,
                    Reason = lt.Reason,
                    ExpectedDateOfReturn = lt.ExpectedDateOfReturn,
                    TimeOfNotice = lt.TimeOfNotice,
                    SubmittedDocument = lt.SubmittedDocument,
                    DocumentLink = lt.DocumentLink,
                    Recommendation = lt.Recommendation,
                    EmployeeCode = lt.Employee.EmployeeCode,
                    FirstName = lt.Employee.FirstName,
                    LastName = lt.Employee.LastName,
                    ApprovalStatus = lt.ApprovalStatus.Type,
                    ApprovalStatusId = lt.ApprovalStatus.Id,
                    LeaveBalance = _context.LeaveBalances
                        .Where(lb => lb.AttendanceId == lt.Attendance.Id && lb.UserId == lt.Employee.Id)
                        .Select(lb => lb.Balance)
                        .FirstOrDefault()
                })
                .ToListAsync();
        }

        public class AttendanceCountsResponse
        {
            public int PendingCount { get; set; }
            public int ApprovedCount { get; set; }
        }

        public async Task<AttendanceCountsResponse> GetStatistics(string employeeCode)
        {
            // Retrieve the userId for the specified employeeCode
            var userId = await _context.Users
                .Where(u => u.EmployeeCode == employeeCode)
                .Select(u => u.Id)
                .FirstOrDefaultAsync();

            if (userId == null)
            {
                throw new KeyNotFoundException("Invalid employee code.");
            }

            var pendingCount = await _context.LeaveTracker
                .Where(lt => lt.UserId == userId &&
                              lt.ApprovalStatus != null && lt.ApprovalStatus.Type != null &&
                              lt.ApprovalStatus.Type.Equals("Pending"))
                .Select(lt => lt.Attendance.Type)
                .CountAsync();

            var approvedCount = await _context.LeaveTracker
                .Where(lt => lt.UserId == userId &&
                              lt.ApprovalStatus != null && lt.ApprovalStatus.Type != null &&
                              lt.ApprovalStatus.Type.Equals("Approved"))
                .Select(lt => lt.Attendance.Type)
                .CountAsync();

            return new AttendanceCountsResponse { PendingCount = pendingCount, ApprovedCount = approvedCount };
        }

        public async Task<PaginationResponse<LeaveTrackerDTO>> GetAllPaginated(int pageNumber, int pageSize, string employeeIdForFilter)
        {
            var employeeId = _httpContextAccessor.HttpContext.User.Identity.Name; // Should give me an ID of the user.
            var employee = _context.Employees.Where(e => e.Id == employeeId).First();

            var query = _context.LeaveTracker.AsQueryable();

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
                    if (!string.IsNullOrEmpty(employeeIdForFilter))
                    {
                        query = query.Where(leave => leave.UserId == employeeIdForFilter);
                    }

                }


            }


            var allLeaves =  query.Select(s => new LeaveTrackerDTO
                {
                    Id = s.Id,
                    DateOfAbsence = s.DateOfAbsence,
                    Shift = s.Shift.Type,
                    ShiftId = s.ShiftId,
                    Attendance = s.Attendance.Type,
                    AttendanceId = s.Attendance.Id,
                    Reason = s.Reason,
                    ExpectedDateOfReturn = s.ExpectedDateOfReturn,
                    TimeOfNotice = s.TimeOfNotice,
                    SubmittedDocument = s.SubmittedDocument,
                    DocumentLink = s.DocumentLink,
                    Recommendation = s.Recommendation,
                    EmployeeCode = s.Employee.EmployeeCode,
                    FirstName = s.Employee.FirstName,
                    LastName = s.Employee.LastName,
                    ApprovalStatus = s.ApprovalStatus.Type,
                    ApprovalStatusId = s.ApprovalStatus.Id,
                    LeaveBalance = _context.LeaveBalances
                        .Where(lb => lb.AttendanceId == s.Attendance.Id && lb.UserId == s.Employee.Id)
                        .Select(lb => lb.Balance)
                        .FirstOrDefault()
                })
                .ToList();
            // Pagination

            var totalRecords = allLeaves.Count;
            var totalPages = (int)Math.Ceiling((double)totalRecords / pageSize);

            var pagedResult = allLeaves
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            //var response = new PaginationResponse { TotalPages = totalPages, PageSize = pageSize, CurrentPage = pageNumber, Results = pagedResult };
            var response = new PaginationResponse<LeaveTrackerDTO>(totalPages, pagedResult, totalRecords, pageSize, pageNumber);

            return response;

        }
    }
}
