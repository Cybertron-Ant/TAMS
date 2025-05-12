namespace TimeManagementSystem.Server.Models
{
    public class EmployeeWithRoleDto
    {
        public string? EmployeeCode { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? Department { get; set; }
        public bool Active { get; set; }
        public string? Role { get; set; }
        public string? UserId { get; set; }
        public string? EmploymentTypeName { get; set; }
        public string? PositionCodeName { get; set; }
        public string? GenderName { get; set; }
        public string? DepartmentName { get; set; }

        public string? MaritalStatusName { get; set; }
       
        public string? TeamName { get; set; }
        public string? AttendanceStatusName { get; set; }
        public string? ModeOfSeparationName { get; set; }
        public string? EmployeeStatusName { get; set; }
        public DateTime? FirstLoginDate { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public DateTime? DateHired { get; set; }
        public List<string> EmployeePermissions { get; set; }

    }
}
