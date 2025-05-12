using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data;

namespace TimeManagementSystem.Server.Data.Services
{
    public class ShiftService : IShiftService
    {
        private readonly AppDbContext _context;

        public ShiftService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Shift>> GetAllAsync()
        {
            return await _context.Shifts.Select(a => new Shift
            {
                Id = a.Id,
                Type = a.Type
            }).ToListAsync();
        }

        public async Task<Shift> GetByIdAsync(int id)
        {
            var shift = await _context.Shifts.FindAsync(id);

            if (shift == null)
            {
                throw new Exception($"No shift found with id {id}.");
            }

            return new Shift { Id = shift.Id, Type = shift.Type };
        }

        public async Task<Shift> CreateAsync(Shift shift)
        {
            _context.Shifts.Add(new Shift { Id = shift.Id, Type = shift.Type });
            await _context.SaveChangesAsync();

            return shift;
        }

        public async Task UpdateAsync(int id, Shift shift)
        {
            var record = await _context.Shifts.FindAsync(id);

            if (record == null)
            {
                throw new Exception($"Unable to update Shift with Id: {id}");
            }

            record.Type = shift.Type;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var shift = await _context.Shifts.FindAsync(id);
            if (shift != null)
            {
                _context.Shifts.Remove(shift);
                await _context.SaveChangesAsync();
            }
        }
    }
}
