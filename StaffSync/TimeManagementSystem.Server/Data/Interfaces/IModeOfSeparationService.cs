using System;
using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface IModeOfSeparationService
    {
        Task<IEnumerable<ModeOfSeparation>> GetAllAsync();
        Task<ModeOfSeparation> GetByIdAsync(int id);
        Task<ModeOfSeparation> CreateAsync(ModeOfSeparation modeOfSeparation);
        Task UpdateAsync(ModeOfSeparation modeOfSeparation);
        Task DeleteAsync(int id);
    }

}

