using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeManagementSystem.Server.Migrations
{
    /// <inheritdoc />
    public partial class RemovedUniqueFromLeaveBalanceCompositeKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LeaveBalances_AttendanceId_UserId",
                table: "LeaveBalances");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalances_AttendanceId_UserId",
                table: "LeaveBalances",
                columns: new[] { "AttendanceId", "UserId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LeaveBalances_AttendanceId_UserId",
                table: "LeaveBalances");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalances_AttendanceId_UserId",
                table: "LeaveBalances",
                columns: new[] { "AttendanceId", "UserId" },
                unique: true,
                filter: "[UserId] IS NOT NULL");
        
    }
    }
}
