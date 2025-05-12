using System;
using System.ComponentModel.DataAnnotations;

namespace TimeManagementSystem.Server.Models
{
    public class EmploymentType
    {
        [Key]
        public int EmploymentTypeId { get; set; }
        public string? Name { get; set; }
    }
}

