using System;
using TimeManagementSystem.Server.Data.Intefaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data;
using TimeManagementSystem.Server.Data.utlis;

namespace TimeManagementSystem.Server.Data.Services
{
    public class PasswordManagementService : IPasswordManagementService
    {
        private readonly UserManager<Employee> _userManager;
        private readonly IEmailSender _emailSender;
        private readonly AppDbContext _context;
        private readonly ILogger<PasswordManagementService> _logger;

        public PasswordManagementService(UserManager<Employee> userManager, IEmailSender emailSender, AppDbContext context, ILogger<PasswordManagementService> logger)
        {
            _userManager = userManager;
            _emailSender = emailSender;
            _context = context;
            _logger = logger;
        }

        public async Task<OperationResult> ChangeUserPasswordAsync(string employeeCode, string currentPassword, string newPassword)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.EmployeeCode == employeeCode);
            if (user == null)
            {
                return OperationResult.Fail(new[] { "User not found." });
            }

            var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
            if (!result.Succeeded)
            {
                return OperationResult.Fail(result.Errors.Select(e => e.Description));
            }

            return OperationResult.Ok();
        }

        public async Task<OperationResult> RequestPasswordResetAsync(string email)
        {
            Employee? user = null;
            try
            {
                user = await _userManager.FindByEmailAsync(email);
            }
            catch (InvalidOperationException e)
            {

                return OperationResult.Fail([e.Message]);
            }

            if (user == null)
            {
                return OperationResult.Fail(["No user associated with email."]);
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            token = Base64Encode(token);
            var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL");
            // Construct password reset link (assuming you have a frontend route for this)
            var resetLink = $"{frontendUrl}/reset-password?token={token}&email={email}";

            await _emailSender.SendEmailAsync(email, "Reset Your Password", $"Please reset your password by clicking here: {resetLink}");

            return OperationResult.Ok();
        }

        public async Task<OperationResult> ResetPasswordAsync(string email, string token, string newPassword)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return OperationResult.Fail(["No user associated with email."]);
            }
            string _token = Base64Decode(token);
            var result = await _userManager.ResetPasswordAsync(user, _token, newPassword);
            if (!result.Succeeded)
            {
                return OperationResult.Fail(result.Errors.Select(e => e.Description));
            }

            return OperationResult.Ok();
        }

        public async Task<OperationResult> AdminResetUserPasswordAsync(string employeeCode, string newPassword)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.EmployeeCode == employeeCode);
            if (user == null)
            {
                return OperationResult.Fail(["User not found."]);
            }

            string token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
            if (!result.Succeeded)
            {
                return OperationResult.Fail(result.Errors.Select(e => e.Description));
            }

            return OperationResult.Ok();
        }

        public static string Base64Encode(string plainText)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
            return System.Convert.ToBase64String(plainTextBytes);
        }

        public static string Base64Decode(string base64EncodedData)
        {
            var base64EncodedBytes = System.Convert.FromBase64String(base64EncodedData);
            return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
        }
    }
}

