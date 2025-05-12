using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data;
using Microsoft.IdentityModel.Tokens;

namespace TimeManagementSystem.Server.Data.Services
{
    public class LeaveBalanceDefaultService : ILeaveBalanceDefaultService
    {
        private readonly AppDbContext _context;

        public LeaveBalanceDefaultService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<LeaveBalanceDefault.DTO>> GetAllAsync()
        {
            return await _context.LeaveBalanceDefaults
                .Include(lbd => lbd.Attendance)
                .Select(lbd => new LeaveBalanceDefault.DTO
                {
                    Id = lbd.Id,
                    Balance = lbd.Balance,
                    Increment = lbd.Increment,
                    IncrementInterval = lbd.IncrementInterval,
                    AttendanceId = lbd.AttendanceId,
                    Attendance = lbd.Attendance.Type,
                })
                .ToListAsync();
        }

        public async Task<LeaveBalanceDefault.DTO> GetByIdAsync(int id)
        {
            return await _context.LeaveBalanceDefaults
            .Include(lbd => lbd.Attendance)
            .Select(a => new LeaveBalanceDefault.DTO
            {
                Id = a.Id,
                Balance = a.Balance,
                AttendanceId = a.AttendanceId,
                Increment = a.Increment,
                IncrementInterval = a.IncrementInterval,
                Attendance = a.Attendance.Type
            }).FirstAsync(a => a.Id == id);
        }

        public async Task<LeaveBalanceDefault> CreateAsync(LeaveBalanceDefault.DTO leaveBalanceDefault)
        {
            var record = new LeaveBalanceDefault
            {
                AttendanceId = leaveBalanceDefault.AttendanceId,
                Balance = leaveBalanceDefault.Balance,
                Increment = leaveBalanceDefault.Increment,
                IncrementInterval = leaveBalanceDefault.IncrementInterval,
            };

            //Make sure that when creating we dont set the attendance id to be the same as another record in the table
            var existinglbWithAttendanceType = _context.LeaveBalanceDefaults.Where(lb => lb.AttendanceId == record.AttendanceId).ToList();

            if (!existinglbWithAttendanceType.IsNullOrEmpty())
            {
                throw new Exception("A leave balance default already exists with that attendance");
            }

            // Add the new record to the context for tracking
            _context.LeaveBalanceDefaults.Add(record);

            // Save changes to the database
            await _context.SaveChangesAsync();

            // Return the newly created record
            return record;
        }


        public async Task UpdateAsync(int id, LeaveBalanceDefault.DTO leaveBalanceDefault)
        {

            //Nullish Coalescing basically finding record or throw error if it is not found.
            var existingLb = _context.LeaveBalanceDefaults.Where(lb => lb.Id == id).First() ?? throw new Exception("No Leave Balance Default matching that record");
            _context.Entry(existingLb).State = EntityState.Modified;
            var validAttendance = _context.Attendance.Where(a => a.Id == existingLb.AttendanceId).First() ?? throw new Exception("No atttendance record found when updating");

            //Make sure that when updating we dont set the attendance id to be the same as another record in the table
            var existinglbWithAttendanceType = _context.LeaveBalanceDefaults.Where(lb => lb.Id != existingLb.Id && lb.AttendanceId == existingLb.AttendanceId).ToList();

            if(!existinglbWithAttendanceType.IsNullOrEmpty())
            {
                throw new Exception("A leave balance default already exists with that attendance");
            }

            //update the properties of the record

            existingLb.AttendanceId = validAttendance.Id;
            existingLb.Increment = leaveBalanceDefault.Increment;
            existingLb.IncrementInterval = leaveBalanceDefault.IncrementInterval;
            existingLb.Balance = leaveBalanceDefault.Balance;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var leaveBalanceDefault = await _context.LeaveBalanceDefaults.FindAsync(id);
            if (leaveBalanceDefault != null)
            {
                _context.LeaveBalanceDefaults.Remove(leaveBalanceDefault);
                await _context.SaveChangesAsync();
            }
        }
    }
}
