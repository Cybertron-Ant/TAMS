using System.ComponentModel.DataAnnotations;

namespace TimeManagementSystem.Server.Models
{
    public class LoginModel
    {
        [Required]
        public string? UsernameOrEmail { get; set; } // Can be either username or email

        [Required]
        [DataType(DataType.Password)]
        public string? Password { get; set; }

        public bool RememberMe { get; set; }
    }


}
