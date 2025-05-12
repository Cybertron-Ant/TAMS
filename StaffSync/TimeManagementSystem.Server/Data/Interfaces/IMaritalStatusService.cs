using System;
using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface IMaritalStatusService
    {
        Task<IEnumerable<MaritalStatus>> GetAllMaritalStatusesAsync();
        Task<MaritalStatus> GetMaritalStatusByIdAsync(int id);
        Task<MaritalStatus> CreateMaritalStatusAsync(MaritalStatus maritalStatus);
        Task UpdateMaritalStatusAsync(MaritalStatus maritalStatus);
        Task DeleteMaritalStatusAsync(int id);
    }
}

