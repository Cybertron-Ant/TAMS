using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeManagementSystem.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddedBreakTimeForTimesheet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssignedShift",
                table: "TimeSheets");

            migrationBuilder.DropColumn(
                name: "FirstOut",
                table: "TimeSheets");

            migrationBuilder.DropColumn(
                name: "LunchBreak",
                table: "TimeSheets");

            migrationBuilder.DropColumn(
                name: "LunchBreakDuration",
                table: "TimeSheets");

            migrationBuilder.DropColumn(
                name: "LunchBreakEnd",
                table: "TimeSheets");

            migrationBuilder.DropColumn(
                name: "TotalWeeklyHours",
                table: "TimeSheets");

            migrationBuilder.DropColumn(
                name: "WeeklyHours",
                table: "TimeSheets");

            migrationBuilder.RenameColumn(
                name: "LunchBreakStart",
                table: "TimeSheets",
                newName: "PunchOut");

            migrationBuilder.RenameColumn(
                name: "FirstIn",
                table: "TimeSheets",
                newName: "PunchIn");

            migrationBuilder.AddColumn<int>(
                name: "BreakTypeId",
                table: "TimeSheets",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "BreakTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HasPassword = table.Column<bool>(type: "bit", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BreakTypes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TimeSheets_BreakTypeId",
                table: "TimeSheets",
                column: "BreakTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_TimeSheets_BreakTypes_BreakTypeId",
                table: "TimeSheets",
                column: "BreakTypeId",
                principalTable: "BreakTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TimeSheets_BreakTypes_BreakTypeId",
                table: "TimeSheets");

            migrationBuilder.DropTable(
                name: "BreakTypes");

            migrationBuilder.DropIndex(
                name: "IX_TimeSheets_BreakTypeId",
                table: "TimeSheets");

            migrationBuilder.DropColumn(
                name: "BreakTypeId",
                table: "TimeSheets");

            migrationBuilder.RenameColumn(
                name: "PunchOut",
                table: "TimeSheets",
                newName: "LunchBreakStart");

            migrationBuilder.RenameColumn(
                name: "PunchIn",
                table: "TimeSheets",
                newName: "FirstIn");

            migrationBuilder.AddColumn<string>(
                name: "AssignedShift",
                table: "TimeSheets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FirstOut",
                table: "TimeSheets",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LunchBreak",
                table: "TimeSheets",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "LunchBreakDuration",
                table: "TimeSheets",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LunchBreakEnd",
                table: "TimeSheets",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalWeeklyHours",
                table: "TimeSheets",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "WeeklyHours",
                table: "TimeSheets",
                type: "decimal(18,2)",
                nullable: true);
        }
    }
}
