using System;
using System.ComponentModel.DataAnnotations;

namespace TimeManagementSystem.Server.Models
{
    public class Department
    {
        [Key]
        public int DepartmentId { get; set; }
        public string? Name { get; set; }

    }
}

