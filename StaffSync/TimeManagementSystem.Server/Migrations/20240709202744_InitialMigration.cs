using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeManagementSystem.Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ApprovalStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Attendance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attendance", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditTrails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TableName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Changes = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditTrails", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuthLevel",
                columns: table => new
                {
                    AuthLevelId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AuthCode = table.Column<int>(type: "int", nullable: false),
                    AuthLevelName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuthLevel", x => x.AuthLevelId);
                });

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    DepartmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.DepartmentId);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeBreakTimes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StartTime = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EndTime = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeBreakTimes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeStatuses",
                columns: table => new
                {
                    EmployeeStatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeStatuses", x => x.EmployeeStatusId);
                });

            migrationBuilder.CreateTable(
                name: "EmploymentTypes",
                columns: table => new
                {
                    EmploymentTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmploymentTypes", x => x.EmploymentTypeId);
                });

            migrationBuilder.CreateTable(
                name: "Genders",
                columns: table => new
                {
                    GenderId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Genders", x => x.GenderId);
                });

            migrationBuilder.CreateTable(
                name: "MaritalStatuses",
                columns: table => new
                {
                    MaritalStatusId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaritalStatuses", x => x.MaritalStatusId);
                });

            migrationBuilder.CreateTable(
                name: "ModeOfSeparations",
                columns: table => new
                {
                    ModeOfSeparationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModeOfSeparations", x => x.ModeOfSeparationId);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    PermissionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PermissionName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.PermissionId);
                });

            migrationBuilder.CreateTable(
                name: "PositionCodes",
                columns: table => new
                {
                    PositionCodeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PositionCodes", x => x.PositionCodeId);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PermissionId = table.Column<int>(type: "int", nullable: false),
                    AuthLevelId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Shifts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shifts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SystemMetadata",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemMetadata", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Teams",
                columns: table => new
                {
                    TeamId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Teams", x => x.TeamId);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LeaveBalanceDefaults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Balance = table.Column<int>(type: "int", nullable: false),
                    Increment = table.Column<double>(type: "float", nullable: false),
                    IncrementInterval = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AttendanceId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveBalanceDefaults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeaveBalanceDefaults_Attendance_AttendanceId",
                        column: x => x.AttendanceId,
                        principalTable: "Attendance",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EmployeeCode = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MiddleName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NameSuffix = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Active = table.Column<bool>(type: "bit", nullable: false),
                    MobileNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImmediateSuperior = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddressForeign = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BirthDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateCleared = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmploymentTypeId = table.Column<int>(type: "int", nullable: false),
                    PositionCodeId = table.Column<int>(type: "int", nullable: false),
                    GenderId = table.Column<int>(type: "int", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    MaritalStatusId = table.Column<int>(type: "int", nullable: false),
                    TeamId = table.Column<int>(type: "int", nullable: false),
                    EmployeeStatusId = table.Column<int>(type: "int", nullable: false),
                    FirstLoginDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastLoginDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FirstBreakId = table.Column<int>(type: "int", nullable: false),
                    SecondBreakId = table.Column<int>(type: "int", nullable: false),
                    ImmediateSuperiorCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LunchPeriodId = table.Column<int>(type: "int", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUsers_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "DepartmentId");
                    table.ForeignKey(
                        name: "FK_AspNetUsers_EmployeeBreakTimes_FirstBreakId",
                        column: x => x.FirstBreakId,
                        principalTable: "EmployeeBreakTimes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AspNetUsers_EmployeeBreakTimes_LunchPeriodId",
                        column: x => x.LunchPeriodId,
                        principalTable: "EmployeeBreakTimes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AspNetUsers_EmployeeBreakTimes_SecondBreakId",
                        column: x => x.SecondBreakId,
                        principalTable: "EmployeeBreakTimes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AspNetUsers_EmployeeStatuses_EmployeeStatusId",
                        column: x => x.EmployeeStatusId,
                        principalTable: "EmployeeStatuses",
                        principalColumn: "EmployeeStatusId");
                    table.ForeignKey(
                        name: "FK_AspNetUsers_EmploymentTypes_EmploymentTypeId",
                        column: x => x.EmploymentTypeId,
                        principalTable: "EmploymentTypes",
                        principalColumn: "EmploymentTypeId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUsers_Genders_GenderId",
                        column: x => x.GenderId,
                        principalTable: "Genders",
                        principalColumn: "GenderId");
                    table.ForeignKey(
                        name: "FK_AspNetUsers_MaritalStatuses_MaritalStatusId",
                        column: x => x.MaritalStatusId,
                        principalTable: "MaritalStatuses",
                        principalColumn: "MaritalStatusId");
                    table.ForeignKey(
                        name: "FK_AspNetUsers_PositionCodes_PositionCodeId",
                        column: x => x.PositionCodeId,
                        principalTable: "PositionCodes",
                        principalColumn: "PositionCodeId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUsers_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "TeamId");
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EmployeePermissions",
                columns: table => new
                {
                    EmployeeId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PermissionId = table.Column<int>(type: "int", nullable: false),
                    AuthLevelId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeePermissions", x => new { x.EmployeeId, x.PermissionId, x.AuthLevelId });
                    table.ForeignKey(
                        name: "FK_EmployeePermissions_AspNetUsers_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EmployeePermissions_AuthLevel_AuthLevelId",
                        column: x => x.AuthLevelId,
                        principalTable: "AuthLevel",
                        principalColumn: "AuthLevelId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EmployeePermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "PermissionId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LeaveBalances",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Balance = table.Column<int>(type: "int", nullable: false),
                    AttendanceId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveBalances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeaveBalances_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeaveBalances_Attendance_AttendanceId",
                        column: x => x.AttendanceId,
                        principalTable: "Attendance",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LeaveTracker",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DateOfAbsence = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExpectedDateOfReturn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TimeOfNotice = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SubmittedDocument = table.Column<bool>(type: "bit", nullable: false),
                    DocumentLink = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Recommendation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ShiftId = table.Column<int>(type: "int", nullable: true),
                    AttendanceId = table.Column<int>(type: "int", nullable: false),
                    ApprovalStatusId = table.Column<int>(type: "int", nullable: true),
                    EmployeeId = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveTracker", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeaveTracker_ApprovalStatuses_ApprovalStatusId",
                        column: x => x.ApprovalStatusId,
                        principalTable: "ApprovalStatuses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_LeaveTracker_AspNetUsers_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_LeaveTracker_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_LeaveTracker_Attendance_AttendanceId",
                        column: x => x.AttendanceId,
                        principalTable: "Attendance",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeaveTracker_Shifts_ShiftId",
                        column: x => x.ShiftId,
                        principalTable: "Shifts",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TimeSheets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    FirstIn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FirstOut = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AssignedShift = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CurrentHours = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    LunchBreak = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BreakDuration = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DailyTotalHours = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    WeeklyHours = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TotalWeeklyHours = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    LunchBreakStart = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LunchBreakEnd = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    LunchBreakDuration = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimeSheets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TimeSheets_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_DepartmentId",
                table: "AspNetUsers",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_EmployeeCode",
                table: "AspNetUsers",
                column: "EmployeeCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_EmployeeStatusId",
                table: "AspNetUsers",
                column: "EmployeeStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_EmploymentTypeId",
                table: "AspNetUsers",
                column: "EmploymentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_FirstBreakId",
                table: "AspNetUsers",
                column: "FirstBreakId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_GenderId",
                table: "AspNetUsers",
                column: "GenderId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_LunchPeriodId",
                table: "AspNetUsers",
                column: "LunchPeriodId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_MaritalStatusId",
                table: "AspNetUsers",
                column: "MaritalStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_PositionCodeId",
                table: "AspNetUsers",
                column: "PositionCodeId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_SecondBreakId",
                table: "AspNetUsers",
                column: "SecondBreakId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_TeamId",
                table: "AspNetUsers",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeePermissions_AuthLevelId",
                table: "EmployeePermissions",
                column: "AuthLevelId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeePermissions_PermissionId",
                table: "EmployeePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalanceDefaults_AttendanceId",
                table: "LeaveBalanceDefaults",
                column: "AttendanceId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalances_AttendanceId",
                table: "LeaveBalances",
                column: "AttendanceId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalances_AttendanceId_UserId",
                table: "LeaveBalances",
                columns: new[] { "AttendanceId", "UserId" },
                unique: true,
                filter: "[UserId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalances_UserId",
                table: "LeaveBalances",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveTracker_ApprovalStatusId",
                table: "LeaveTracker",
                column: "ApprovalStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveTracker_AttendanceId",
                table: "LeaveTracker",
                column: "AttendanceId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveTracker_EmployeeId",
                table: "LeaveTracker",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveTracker_ShiftId",
                table: "LeaveTracker",
                column: "ShiftId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveTracker_UserId",
                table: "LeaveTracker",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeSheets_UserId",
                table: "TimeSheets",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "AuditTrails");

            migrationBuilder.DropTable(
                name: "EmployeePermissions");

            migrationBuilder.DropTable(
                name: "LeaveBalanceDefaults");

            migrationBuilder.DropTable(
                name: "LeaveBalances");

            migrationBuilder.DropTable(
                name: "LeaveTracker");

            migrationBuilder.DropTable(
                name: "ModeOfSeparations");

            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "SystemMetadata");

            migrationBuilder.DropTable(
                name: "TimeSheets");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "AuthLevel");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "ApprovalStatuses");

            migrationBuilder.DropTable(
                name: "Attendance");

            migrationBuilder.DropTable(
                name: "Shifts");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "Departments");

            migrationBuilder.DropTable(
                name: "EmployeeBreakTimes");

            migrationBuilder.DropTable(
                name: "EmployeeStatuses");

            migrationBuilder.DropTable(
                name: "EmploymentTypes");

            migrationBuilder.DropTable(
                name: "Genders");

            migrationBuilder.DropTable(
                name: "MaritalStatuses");

            migrationBuilder.DropTable(
                name: "PositionCodes");

            migrationBuilder.DropTable(
                name: "Teams");
        }
    }
}
