using System;
using System.ComponentModel.DataAnnotations;

namespace TimeManagementSystem.Server.Models
{
	public class PasswordManualResetRequest
	{
        [Required]
        public string UserId { get; set; }

        [Required]
        [MinLength(6, ErrorMessage = "The new password must be at least 6 characters long.")]
        public string NewPassword { get; set; }
    }
}

