using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeManagementSystem.Server.Migrations
{
    /// <inheritdoc />
    public partial class RemovedHasPasswordFromBreakType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HasPassword",
                table: "BreakTypes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasPassword",
                table: "BreakTypes",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
