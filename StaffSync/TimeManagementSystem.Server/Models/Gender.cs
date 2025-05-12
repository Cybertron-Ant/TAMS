using System;
using System.ComponentModel.DataAnnotations;

namespace TimeManagementSystem.Server.Models
{
    public class Gender
    {
        [Key]
        public int GenderId { get; set; }
        public string? Name { get; set; }
    }
}

