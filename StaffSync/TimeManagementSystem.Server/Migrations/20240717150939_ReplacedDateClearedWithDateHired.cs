using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeManagementSystem.Server.Migrations
{
    /// <inheritdoc />
    public partial class ReplacedDateClearedWithDateHired : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DateCleared",
                table: "AspNetUsers",
                newName: "DateHired");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DateHired",
                table: "AspNetUsers",
                newName: "DateCleared");
        }
    }
}
