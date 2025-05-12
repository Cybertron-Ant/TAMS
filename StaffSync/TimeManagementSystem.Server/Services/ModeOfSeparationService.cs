using System;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data;

namespace TimeManagementSystem.Server.Data.Services
{
    public class ModeOfSeparationService : IModeOfSeparationService
    {
        private readonly AppDbContext _context;

        public ModeOfSeparationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ModeOfSeparation>> GetAllAsync()
        {
            return await _context.ModeOfSeparations.ToListAsync();
        }

        public async Task<ModeOfSeparation> GetByIdAsync(int id)
        {
            return await _context.ModeOfSeparations.FindAsync(id);
        }

        public async Task<ModeOfSeparation> CreateAsync(ModeOfSeparation modeOfSeparation)
        {
            _context.ModeOfSeparations.Add(modeOfSeparation);
            await _context.SaveChangesAsync();
            return modeOfSeparation;
        }

        public async Task UpdateAsync(ModeOfSeparation modeOfSeparation)
        {
            _context.Entry(modeOfSeparation).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var modeOfSeparation = await _context.ModeOfSeparations.FindAsync(id);
            if (modeOfSeparation != null)
            {
                _context.ModeOfSeparations.Remove(modeOfSeparation);
                await _context.SaveChangesAsync();
            }
        }
    }

}

