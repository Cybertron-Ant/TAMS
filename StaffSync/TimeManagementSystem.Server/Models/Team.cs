using System;
using System.ComponentModel.DataAnnotations;

namespace TimeManagementSystem.Server.Models
{
    public class Team
    {
        [Key]
        public int TeamId { get; set; }
        public string? Name { get; set; }
    }
}

