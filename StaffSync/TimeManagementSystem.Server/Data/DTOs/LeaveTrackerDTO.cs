using System;
namespace TimeManagementSystem.Server.Models
{
    public class LeaveTrackerDTO
    {
        public int Id { get; set; }
        public string? Attendance { get; set; }
        public int AttendanceId { get; set; }
        public DateTime DateOfAbsence { get; set; }
        public string? Shift { get; set; }
        public int? ShiftId { get; set; }
        public string? Reason { get; set; }
        public DateTime ExpectedDateOfReturn { get; set; }
        public DateTime? TimeOfNotice { get; set; }
        public bool SubmittedDocument { get; set; }
        public string? DocumentLink { get; set; }
        public string? Recommendation { get; set; }
        public string? EmployeeCode { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? ApprovalStatus { get; set; }
        public int? ApprovalStatusId { get; set; }
        public int? LeaveBalance { get; set; }
    }
}

