using System;

using System.ComponentModel.DataAnnotations;
namespace TimeManagementSystem.Server.Models
{
	public class ChangePasswordByEmployeeCodeModel
	{
        [Required]
        public string EmployeeCode { get; set; }

        [Required]
        public string CurrentPassword { get; set; }

        [Required]
        public string NewPassword { get; set; }
    }
}

