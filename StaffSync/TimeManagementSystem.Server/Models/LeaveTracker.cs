using System.ComponentModel.DataAnnotations.Schema;
using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Models
{
    public class LeaveTracker
    {
        public int Id { get; set; } // Primary Key
        public DateTime DateOfAbsence { get; set; }
        public string? Reason { get; set; }
        public DateTime ExpectedDateOfReturn { get; set; }
        public DateTime TimeOfNotice { get; set; }
        public bool SubmittedDocument { get; set; }
        public string? DocumentLink { get; set; }
        public string? Recommendation { get; set; }


        // Foreign Keys
        public string? UserId { get; set; }
        public int? ShiftId { get; set; }
        public int AttendanceId { get; set; }
        public int? ApprovalStatusId { get; set; }


        // Navigation Properties
        [ForeignKey("UserId")]
        public virtual Employee? Employee { get; set; }

        [ForeignKey("AttendanceId")]
        public virtual Attendance? Attendance { get; set; }

        [ForeignKey("ApprovalStatusId")]
        public virtual ApprovalStatus? ApprovalStatus { get; set; }

        [ForeignKey("ShiftId")]
        public virtual Shift? Shift { get; set; }
    }
}
