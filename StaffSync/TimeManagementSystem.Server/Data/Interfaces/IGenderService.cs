using System;
using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface IGenderService
    {
        Task<IEnumerable<Gender>> GetAllGendersAsync();
        Task<Gender> GetGenderByIdAsync(int genderId);
        Task<Gender> CreateGenderAsync(Gender gender);
        Task UpdateGenderAsync(Gender gender);
        Task DeleteGenderAsync(int genderId);
    }
}

