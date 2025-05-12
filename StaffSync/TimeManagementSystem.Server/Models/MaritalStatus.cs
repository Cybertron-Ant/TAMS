using System;
using System.ComponentModel.DataAnnotations;

namespace TimeManagementSystem.Server.Models
{
    public class MaritalStatus
    {
        [Key]
        public int MaritalStatusId { get; set; }
        public string? Name { get; set; }
    }
}

