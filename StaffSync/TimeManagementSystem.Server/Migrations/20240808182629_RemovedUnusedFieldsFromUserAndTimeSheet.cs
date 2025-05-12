using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeManagementSystem.Server.Migrations
{
    /// <inheritdoc />
    public partial class RemovedUnusedFieldsFromUserAndTimeSheet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FirstBreakId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LunchPeriodId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "SecondBreakId",
                table: "AspNetUsers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FirstBreakId",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "LunchPeriodId",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SecondBreakId",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
