using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeManagementSystem.Server.Migrations
{
    /// <inheritdoc />
    public partial class RemovedAttendanceIdUniquePropFromLeaveBalance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.DropIndex(
            name: "IX_LeaveBalances_AttendanceId",
            table: "LeaveBalances");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
            name: "IX_LeaveBalances_AttendanceId",
            table: "LeaveBalances",
            column: "AttendanceId",
            unique: true);
        }
    }
}
