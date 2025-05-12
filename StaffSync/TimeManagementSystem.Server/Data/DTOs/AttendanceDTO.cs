namespace TimeManagementSystem.Server.Models
{
    public class AttendanceDTO
    {
        public int Id { get; set; }
        public string? Type { get; set; } // e.g., "Authorized Absence", "Sick Leave"
    }
}

