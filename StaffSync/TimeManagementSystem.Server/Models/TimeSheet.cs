using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TimeManagementSystem.Server.Models
{
    public class TimeSheet
    {
        public int Id { get; set; }
        public string? UserId { get; set; }
        public DateTime PunchIn { get; set; }
        public DateTime? PunchOut { get; set; }
        public int BreakTypeId { get; set; }
        public DateTime Date { get; set; }
        public bool IsActive { get; set; }
        // Additional fields
        [ForeignKey("UserId")]
        public virtual Employee? Employee { get; set; }
        public virtual BreakType? BreakType { get; set; }

    }
}

