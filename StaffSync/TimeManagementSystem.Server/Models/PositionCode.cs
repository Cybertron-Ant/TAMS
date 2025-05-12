using System;
using System.ComponentModel.DataAnnotations;

namespace TimeManagementSystem.Server.Models
{
    public class PositionCode
    {
        [Key]
        public int PositionCodeId { get; set; }
        public string? Name { get; set; }

        // Navigation properties
        //public ICollection<SuspendedPullOutFloating>? CurrentPositionSuspendedPullOutFloatings { get; set; }
        //public ICollection<SuspendedPullOutFloating>? NewPositionSuspendedPullOutFloatings { get; set; }

    }
}

