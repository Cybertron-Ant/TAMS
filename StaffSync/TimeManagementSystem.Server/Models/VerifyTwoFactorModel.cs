using System;
namespace TimeManagementSystem.Server.Models
{
    public class VerifyTwoFactorModel
    {
        public required string UserId { get; set; }
        public required string Token { get; set; }
        public bool RememberMe { get; set; }
    }
}

