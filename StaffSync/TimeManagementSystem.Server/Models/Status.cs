using System;
using System.ComponentModel.DataAnnotations;

namespace TimeManagementSystem.Server.Models
{
    public class EmployeeStatus
    {
        [Key]
        public int EmployeeStatusId { get; set; }
        public string? Name { get; set; }
    }
}

