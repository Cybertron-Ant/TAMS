using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data;

namespace TimeManagementSystem.Server.Data.Services
{
    public class LeaveBalanceService : ILeaveBalanceService
    {
        private readonly AppDbContext _context;

        public LeaveBalanceService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<LeaveBalanceDTO>> GetAllAsync()
        {
            return await _context.LeaveBalances
            .Include(lb => lb.Employee)
            .Select(a => new LeaveBalanceDTO
            {
                Id = a.Id,
                EmployeeCode = a.Employee.EmployeeCode,
                Balance = a.Balance,
                AttendanceId = a.Attendance.Id,
                Attendance = a.Attendance.Type
            }).ToListAsync();
        }

        public async Task<LeaveBalanceDTO> GetByIdAsync(int id)
        {
            return await _context.LeaveBalances
            .Include(lb => lb.Employee)
            .Select(a => new LeaveBalanceDTO
            {
                Id = a.Id,
                EmployeeCode = a.Employee.EmployeeCode,
                Balance = a.Balance,
                AttendanceId = a.Attendance.Id,
                Attendance = a.Attendance.Type
            }).FirstAsync(a => a.Id == id);
        }

        public async Task<List<LeaveBalanceDTO>> GetByEmployeeCodeAsync(string employeeCode)
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

            // Then, retrieve LeaveBalances records that reference this User (Employee) ID
            var records = await _context.LeaveBalances
                .Where(a => a.UserId == userId)
                .Include(lb => lb.Employee)
                .Select(s => new LeaveBalanceDTO
                {
                    // Map properties from Entity to EntityDTO
                    Id = s.Id,
                    EmployeeCode = employeeCode,
                    Balance = s.Balance,
                    AttendanceId = s.Attendance.Id,
                })
                .ToListAsync();

            return records;
        }

        public async Task<LeaveBalanceDTO> CreateAsync(LeaveBalanceDTO leaveBalance)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.EmployeeCode == leaveBalance.EmployeeCode);

            if (user == null)
            {
                throw new Exception("Employee not found.");
            }

            var newLeaveBal = new LeaveBalance
            {
                UserId = user.Id,
                AttendanceId = leaveBalance.AttendanceId,
                Balance = leaveBalance.Balance,
            };

            var item = _context.LeaveBalances.Add(newLeaveBal);
            await _context.SaveChangesAsync();

            // Map the newLeaveBal entity to LeaveBalanceDTO and return it
            var leaveBalanceDTO = new LeaveBalanceDTO
            {
                Id = newLeaveBal.Id,
                EmployeeCode = newLeaveBal.Employee.EmployeeCode,
                AttendanceId = newLeaveBal.AttendanceId,
                Balance = newLeaveBal.Balance,
            };

            return leaveBalanceDTO;
        }

        public async Task UpdateAsync(int id, LeaveBalanceDTO leaveBalance)
        {
            _context.Entry(leaveBalance).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var leaveBalance = await _context.LeaveBalances.FindAsync(id);
            if (leaveBalance != null)
            {
                _context.LeaveBalances.Remove(leaveBalance);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<LeaveBalanceDTO>> GetLeaveBalances(string employeeCode)
        {
            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);

            if (employee == null)
            {
                // Handle case where employee is not found for the given employee code
                throw new Exception($"Employee with code {employeeCode} not found!");
            }

            var employeeId = employee.Id;

            var allAttendances = await _context.Attendance
                .Select(a => new
                {
                    AttendanceId = a.Id,
                    AttendanceType = a.Type
                })
                .ToListAsync();

            var leaveBalances = await _context.LeaveBalances
                .Include(lb => lb.Attendance)
                .Where(lb => lb.UserId == employeeId)
                .Select(lb => new LeaveBalanceDTO
                {
                    EmployeeCode = employeeCode,
                    AttendanceId = lb.AttendanceId,
                    Attendance = lb.Attendance.Type,
                    Balance = lb.Balance
                })
                .ToListAsync();

            var leaveBalanceDefaults = await _context.LeaveBalanceDefaults.ToListAsync();

            // Merge the leave balances with all attendance types, replacing existing balances
            var mergedAttendances = allAttendances.Select(a =>
            {
                var balance = leaveBalances.FirstOrDefault(lb => lb.AttendanceId == a.AttendanceId)?.Balance
                    ?? leaveBalanceDefaults.FirstOrDefault(lbd => lbd.AttendanceId == a.AttendanceId)?.Balance
                    ?? 0; // Default to 0 if no balance is found

                return new LeaveBalanceDTO
                {
                    EmployeeCode = employeeCode,
                    AttendanceId = a.AttendanceId,
                    Attendance = a.AttendanceType,
                    Balance = balance
                };
            }).ToList();

            return mergedAttendances;
        }

    }
}
