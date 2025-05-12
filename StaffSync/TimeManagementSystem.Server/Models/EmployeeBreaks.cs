using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace TimeManagementSystem.Server.Models
{
    public class EmployeeBreakTime
    {
        public int Id { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
    }
}
