using System;
using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface ITeamService
    {
        Task<IEnumerable<Team>> GetAllTeamsAsync();
        Task<Team> GetTeamByIdAsync(int id);
        Task<Team> CreateTeamAsync(Team team);
        Task UpdateTeamAsync(Team team);
        Task DeleteTeamAsync(int id);
    }
}

