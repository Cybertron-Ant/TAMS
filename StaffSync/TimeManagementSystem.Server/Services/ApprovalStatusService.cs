using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace TimeManagementSystem.Server.Data.Services
{
    public class ApprovalStatusService : IApprovalStatusService
    {
        private readonly AppDbContext _context;

        public ApprovalStatusService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ApprovalStatusDTO>> GetAllAsync()
        {
            return await _context.ApprovalStatuses.Select(a => new ApprovalStatusDTO
            {
                Id = a.Id,
                Type = a.Type
            }).ToListAsync();
        }

        public async Task<ApprovalStatusDTO> GetByIdAsync(int id)
        {
            var attendance = await _context.ApprovalStatuses.FindAsync(id);

            if (attendance == null)
            {
                throw new Exception($"No attendance found with id {id}.");
            }

            return new ApprovalStatusDTO { Id = attendance.Id, Type = attendance.Type };
        }

        public async Task<ApprovalStatusDTO> CreateAsync(ApprovalStatusDTO attendance)
        {
            _context.ApprovalStatuses.Add(new ApprovalStatus { Id = attendance.Id, Type = attendance.Type });
            await _context.SaveChangesAsync();

            return attendance;
        }

        public async Task UpdateAsync(int id, ApprovalStatusDTO attendance)
        {
            var record = await _context.ApprovalStatuses.FindAsync(id);

            if (record == null)
            {
                throw new Exception($"Unable to update ApprovalStatuses with Id: {id}");
            }

            record.Type = attendance.Type;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var attendance = await _context.ApprovalStatuses.FindAsync(id);
            if (attendance != null)
            {
                _context.ApprovalStatuses.Remove(attendance);
                await _context.SaveChangesAsync();
            }
        }
    }
}
