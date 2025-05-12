using System;
using System.ComponentModel.DataAnnotations;

namespace TimeManagementSystem.Server.Models
{
    public class ResetPasswordModel
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string Token { get; set; }

        [Required]
        [MinLength(6, ErrorMessage = "The new password must be at least 6 characters long.")]
        public string NewPassword { get; set; }
    }
}

