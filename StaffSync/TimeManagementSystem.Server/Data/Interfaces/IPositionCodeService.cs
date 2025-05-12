using System;
using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface IPositionCodeService
    {
        Task<IEnumerable<PositionCode>> GetAllPositionCodesAsync();
        Task<PositionCode> GetPositionCodeByIdAsync(int positionCodeId);
        Task<PositionCode> CreatePositionCodeAsync(PositionCode positionCode);
        Task UpdatePositionCodeAsync(PositionCode positionCode);
        Task DeletePositionCodeAsync(int positionCodeId);
    }
}

