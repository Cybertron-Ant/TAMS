using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;
using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Models
{
    public class LeaveBalanceDefault
    {
        public int Id { get; set; }
        public int Balance { get; set; }
        public double Increment { get; set; }
        public string IncrementInterval { get; set; }


        // Foreign Keys
        public int AttendanceId { get; set; }


        // Navigation Properties
        [ForeignKey("AttendanceId")]
        public virtual Attendance? Attendance { get; set; }


        // Data Transfer Object
        public class DTO
        {
            public int Id { get; set; }
            public int Balance { get; set; }
            public double Increment { get; set; }
            public string IncrementInterval { get; set; }
            public int AttendanceId { get; set; }
            public string? Attendance { get; set; }
        }

    }
}

