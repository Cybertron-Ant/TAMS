using System;
using System.ComponentModel.DataAnnotations;

namespace TimeManagementSystem.Server.Models
{
    public class PasswordResetRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}

