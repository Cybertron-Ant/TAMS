using System;
using System.ComponentModel.DataAnnotations.Schema;
using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Models
{
    public class Attendance
    {
        public int Id { get; set; }
        public string? Type { get; set; } // e.g., "Authorized Absence", "Sick Leave"
                                          // Add additional fields as necessary
                                          // Navigation properties for related tables
        public virtual ICollection<LeaveTracker>? LeaveTrackers { get; set; }

    }
}

