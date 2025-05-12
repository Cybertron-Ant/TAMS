using System;
namespace TimeManagementSystem.Server.Models
{
    public class TimeSheetDTO
    {
        public int Id { get; set; }
        public string? EmployeeCode { get; set; } // Assuming you'll use EmployeeCode instead of UserId for simplicity
        public DateTime PunchIn { get; set; }
        public DateTime? PunchOut { get; set; }
        public decimal? CurrentHours { get; set; }
        public decimal? BreakDuration { get; set; }
        public bool IsActive { get; set; }      
        public DateTime Date { get; set; }
        public int BreakTypeId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }
}

