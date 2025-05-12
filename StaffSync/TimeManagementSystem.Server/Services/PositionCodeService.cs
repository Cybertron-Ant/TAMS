using System;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data;

namespace TimeManagementSystem.Server.Data.Services
{
    public class PositionCodeService : IPositionCodeService
    {
        private readonly AppDbContext _context;

        public PositionCodeService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PositionCode>> GetAllPositionCodesAsync()
        {
            return await _context.PositionCodes.ToListAsync();
        }

        public async Task<PositionCode> GetPositionCodeByIdAsync(int positionCodeId)
        {
            return await _context.PositionCodes.FindAsync(positionCodeId);
        }

        public async Task<PositionCode> CreatePositionCodeAsync(PositionCode positionCode)
        {
            _context.PositionCodes.Add(positionCode);
            await _context.SaveChangesAsync();
            return positionCode;
        }

        public async Task UpdatePositionCodeAsync(PositionCode positionCode)
        {
            _context.Entry(positionCode).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeletePositionCodeAsync(int positionCodeId)
        {
            var positionCode = await _context.PositionCodes.FindAsync(positionCodeId);
            if (positionCode != null)
            {
                _context.PositionCodes.Remove(positionCode);
                await _context.SaveChangesAsync();
            }
        }
    }

}

