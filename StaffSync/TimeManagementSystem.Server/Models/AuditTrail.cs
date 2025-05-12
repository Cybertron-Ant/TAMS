using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TimeManagementSystem.Server.Models
{
    public class AuditTrail
    {
        public int Id { get; set; }
    public string TableName { get; set; }
    public string Action { get; set; }
    public string UserId { get; set; }
    public DateTime Timestamp { get; set; }
    public string Changes { get; set; }

    }
}