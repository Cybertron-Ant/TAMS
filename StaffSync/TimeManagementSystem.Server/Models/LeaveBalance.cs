using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;
using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Models
{
    public class LeaveBalance
    {
        public int Id { get; set; }
        public int Balance { get; set; }


        // Foreign Keys
        public int AttendanceId { get; set; }
        public string? UserId { get; set; }


        // Navigation properties
        [ForeignKey("AttendanceId")]
        public virtual Attendance? Attendance { get; set; }

        [ForeignKey("UserId")]
        public virtual Employee? Employee { get; set; }
    }
}

