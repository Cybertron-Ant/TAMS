using System;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data;

namespace TimeManagementSystem.Server.Data.Services
{
    public class EmployeeStatusService : IEmployeeStatusService
    {
        private readonly AppDbContext _context;

        public EmployeeStatusService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EmployeeStatus>> GetAllEmployeeStatusesAsync()
        {
            return await _context.EmployeeStatuses.ToListAsync();
        }

        public async Task<EmployeeStatus> GetEmployeeStatusByIdAsync(int id)
        {
            return await _context.EmployeeStatuses.FindAsync(id);
        }

        public async Task<EmployeeStatus> CreateEmployeeStatusAsync(EmployeeStatus employeeStatus)
        {
            _context.EmployeeStatuses.Add(employeeStatus);
            await _context.SaveChangesAsync();
            return employeeStatus;
        }

        public async Task UpdateEmployeeStatusAsync(EmployeeStatus employeeStatus)
        {
            _context.Entry(employeeStatus).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteEmployeeStatusAsync(int id)
        {
            var employeeStatus = await _context.EmployeeStatuses.FindAsync(id);
            if (employeeStatus != null)
            {
                _context.EmployeeStatuses.Remove(employeeStatus);
                await _context.SaveChangesAsync();
            }
        }
    }
}

