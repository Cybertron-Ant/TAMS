using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TimeManagementSystem.Server.Models
{
    public class ApprovalStatus
    {
        public int Id { get; set; }
        public string? Type { get; set; }
    }
}

