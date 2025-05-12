using System;
using TimeManagementSystem.Server.Data.utlis;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface IPasswordManagementService
    {
        Task<OperationResult> ChangeUserPasswordAsync(string employeeCode, string currentPassword, string newPassword);
        Task<OperationResult> RequestPasswordResetAsync(string email);
        Task<OperationResult> ResetPasswordAsync(string email, string token, string newPassword);
        Task<OperationResult> AdminResetUserPasswordAsync(string employeeCode, string newPassword);
    }
}

