using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeManagementSystem.Server.Migrations
{
    /// <inheritdoc />
    public partial class RemovedForiegnKeyConstraintFromBreakTimes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_EmployeeBreakTimes_FirstBreakId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_EmployeeBreakTimes_LunchPeriodId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_EmployeeBreakTimes_SecondBreakId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_FirstBreakId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_LunchPeriodId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_SecondBreakId",
                table: "AspNetUsers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_FirstBreakId",
                table: "AspNetUsers",
                column: "FirstBreakId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_LunchPeriodId",
                table: "AspNetUsers",
                column: "LunchPeriodId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_SecondBreakId",
                table: "AspNetUsers",
                column: "SecondBreakId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_EmployeeBreakTimes_FirstBreakId",
                table: "AspNetUsers",
                column: "FirstBreakId",
                principalTable: "EmployeeBreakTimes",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_EmployeeBreakTimes_LunchPeriodId",
                table: "AspNetUsers",
                column: "LunchPeriodId",
                principalTable: "EmployeeBreakTimes",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_EmployeeBreakTimes_SecondBreakId",
                table: "AspNetUsers",
                column: "SecondBreakId",
                principalTable: "EmployeeBreakTimes",
                principalColumn: "Id");
        }
    }
}
