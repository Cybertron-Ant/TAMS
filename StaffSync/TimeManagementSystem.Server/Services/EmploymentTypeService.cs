using System;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data;

namespace TimeManagementSystem.Server.Data.Services
{
    public class EmploymentTypeService : IEmploymentTypeService
    {
        private readonly AppDbContext _context;

        public EmploymentTypeService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EmploymentType>> GetAllEmploymentTypesAsync()
        {
            return await _context.EmploymentTypes.ToListAsync();
        }

        public async Task<EmploymentType> GetEmploymentTypeByIdAsync(int id)
        {
            return await _context.EmploymentTypes.FindAsync(id);
        }

        public async Task<EmploymentType> CreateEmploymentTypeAsync(EmploymentType employmentType)
        {
            _context.EmploymentTypes.Add(employmentType);
            await _context.SaveChangesAsync();
            return employmentType;
        }

        public async Task UpdateEmploymentTypeAsync(EmploymentType employmentType)
        {
            _context.Entry(employmentType).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteEmploymentTypeAsync(int id)
        {
            var employmentType = await _context.EmploymentTypes.FindAsync(id);
            if (employmentType != null)
            {
                _context.EmploymentTypes.Remove(employmentType);
                await _context.SaveChangesAsync();
            }
        }
    }
}

