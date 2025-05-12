using System.ComponentModel.DataAnnotations;

namespace TimeManagementSystem.Server.Models
{
    public class BreakType
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        public string CreatorId { get; set; } = string.Empty;
        public string? CreatorNotes { get; set; } = string.Empty;
        public string? Password { get; set; } = string.Empty;
        public bool Active { get; set; }
        public virtual Employee? Creator { get; set; }

    }
}
