using System;
namespace TimeManagementSystem.Server.Models
{
    public class MfaVerificationModel
    {
        public string? EmployeeCode { get; set; }
        public string? Code { get; set; }
        public bool RememberMe { get; set; }
    }
}

