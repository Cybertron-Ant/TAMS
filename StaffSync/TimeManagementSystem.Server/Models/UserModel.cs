using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("Masterlist")]
public class Employee : IdentityUser
{

    public string EmployeeCode { get; set; }

    public string LastName { get; set; }
    public string FirstName { get; set; }
    public string MiddleName { get; set; }
    public string? NameSuffix { get; set; }
    public bool Active { get; set; }
    public string MobileNo { get; set; }
    public string? ImmediateSuperior { get; set; }
    public string? AddressForeign { get; set; }
    public DateTime BirthDate { get; set; }

    public string EmailAddress { get; set; }
    public string? Location { get; set; }
    public DateTime? DateHired { get; set; }

    public int EmploymentTypeId { get; set; }
    public virtual EmploymentType EmploymentType { get; set; }

    public int PositionCodeId { get; set; }
    public virtual PositionCode PositionCode { get; set; }

    public int GenderId { get; set; }
    public virtual Gender Gender { get; set; }

    public int DepartmentId { get; set; }
    public virtual Department Department { get; set; }



    public int MaritalStatusId { get; set; }
    public virtual MaritalStatus MaritalStatus { get; set; }



    public int TeamId { get; set; }
    public virtual Team Team { get; set; }


    public int EmployeeStatusId { get; set; }
    public virtual EmployeeStatus Status { get; set; }

    public DateTime? FirstLoginDate { get; set; }
    public DateTime? LastLoginDate { get; set; }

    public string? ImmediateSuperiorCode { get; set; } = string.Empty;

    [NotMapped] // This attribute prevents EF Core from trying to map this property to the database.
    public string? Role { get; set; }

    // Navigation properties for related tables
    public virtual ICollection<LeaveTracker>? LeaveTrackers { get; set; }
    public virtual ICollection<TimeSheet>? TimeSheets { get; set; }
    public virtual ICollection<LeaveBalance>? LeaveBalances { get; set; }
    public virtual ICollection<EmployeePermissions>? EmployeePermissions { get; set; }
}
