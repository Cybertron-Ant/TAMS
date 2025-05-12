using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data;
using Microsoft.IdentityModel.Tokens;

namespace TimeManagementSystem.Server.Data.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly AppDbContext _context;

        public AttendanceService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<AttendanceDTO>> GetAllAsync()
        {
            return await _context.Attendance.Select(a => new AttendanceDTO
            {
                Id = a.Id,
                Type = a.Type
            }).ToListAsync();
        }

        public async Task<AttendanceDTO> GetByIdAsync(int id)
        {
            var attendance = await _context.Attendance.FindAsync(id);

            if (attendance == null)
            {
                throw new Exception($"No attendance found with id {id}.");
            }

            return new AttendanceDTO { Id = attendance.Id, Type = attendance.Type };
        }

        public async Task<AttendanceDTO> CreateAsync(AttendanceDTO attendance)
        {
            //first check to see if the attendance type exists already in the db. 
            var exists = _context.Attendance.Where(a => a.Type == attendance.Type).ToList();
            if(!exists.IsNullOrEmpty())
            {
                throw new Exception("A record already exists with this information.");
            }

            _context.Attendance.Add(new Attendance { Id = attendance.Id, Type = attendance.Type });
            await _context.SaveChangesAsync();

            return attendance;
        }

        public async Task UpdateAsync(int id, AttendanceDTO attendance)
        {
            var record = _context.Attendance.Where(a=> a.Id == attendance.Id).First() ?? throw new Exception($"Unable to update Attendance with Id: {id}");
            var typeExists = _context.Attendance.Where(a => a.Type == attendance.Type && a.Id != attendance.Id).ToList();

            if(!typeExists.IsNullOrEmpty())
            {
                throw new Exception("This type is already present");
            }
            record.Type = attendance.Type;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var attendance = await _context.Attendance.FindAsync(id);
            if (attendance != null)
            {
                _context.Attendance.Remove(attendance);
                await _context.SaveChangesAsync();
            }
        }
    }
}
