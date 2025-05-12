using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace TimeManagementSystem.Server.Models
{
    public class LeaveBalanceDTO
    {
        public int Id { get; set; }
        public int Balance { get; set; }
        public int AttendanceId { get; set; }
        public string? EmployeeCode { get; set; }
        public string? Attendance { get; set; }
    }
}

