using System;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data;

namespace TimeManagementSystem.Server.Data.Services
{
    public class MaritalStatusService : IMaritalStatusService
    {
        private readonly AppDbContext _context;

        public MaritalStatusService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MaritalStatus>> GetAllMaritalStatusesAsync()
        {
            return await _context.MaritalStatuses.ToListAsync();
        }

        public async Task<MaritalStatus> GetMaritalStatusByIdAsync(int id)
        {
            return await _context.MaritalStatuses.FindAsync(id);
        }

        public async Task<MaritalStatus> CreateMaritalStatusAsync(MaritalStatus maritalStatus)
        {
            _context.MaritalStatuses.Add(maritalStatus);
            await _context.SaveChangesAsync();
            return maritalStatus;
        }

        public async Task UpdateMaritalStatusAsync(MaritalStatus maritalStatus)
        {
            _context.Entry(maritalStatus).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteMaritalStatusAsync(int id)
        {
            var maritalStatus = await _context.MaritalStatuses.FindAsync(id);
            if (maritalStatus != null)
            {
                _context.MaritalStatuses.Remove(maritalStatus);
                await _context.SaveChangesAsync();
            }
        }
    }
}

