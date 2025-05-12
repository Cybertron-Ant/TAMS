using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeManagementSystem.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddedCreatorOnBreakTypeAndRemovedCurrentHoursFromTimesheet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.DropColumn(
                name: "BreakDuration",
                table: "TimeSheets");

            migrationBuilder.DropColumn(
                name: "CurrentHours",
                table: "TimeSheets");

            migrationBuilder.AddColumn<string>(
                name: "CreatorId",
                table: "BreakTypes",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CreatorNotes",
                table: "BreakTypes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
            migrationBuilder.Sql(@"
            DECLARE @SuperAdminId NVARCHAR(450);

            -- Find the first Super Admin ID
            SELECT TOP 1 @SuperAdminId = u.Id
            FROM AspNetUsers u
            INNER JOIN AspNetUserRoles ur ON u.Id = ur.UserId
            INNER JOIN AspNetRoles r ON ur.RoleId = r.Id
            WHERE r.Name = 'Super Admin'
            ORDER BY u.Id;

            -- Update the BreakTypes table
            UPDATE BreakTypes
            SET CreatorId = @SuperAdminId
            WHERE CreatorId IS NULL OR CreatorId = '';
        ");

            migrationBuilder.CreateIndex(
                name: "IX_BreakTypes_CreatorId",
                table: "BreakTypes",
                column: "CreatorId");

            migrationBuilder.AddForeignKey(
                name: "FK_BreakTypes_AspNetUsers_CreatorId",
                table: "BreakTypes",
                column: "CreatorId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            
        }


        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BreakTypes_AspNetUsers_CreatorId",
                table: "BreakTypes");

            migrationBuilder.DropIndex(
                name: "IX_BreakTypes_CreatorId",
                table: "BreakTypes");

            migrationBuilder.DropColumn(
                name: "CreatorId",
                table: "BreakTypes");

            migrationBuilder.DropColumn(
                name: "CreatorNotes",
                table: "BreakTypes");

            migrationBuilder.AddColumn<decimal>(
                name: "BreakDuration",
                table: "TimeSheets",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CurrentHours",
                table: "TimeSheets",
                type: "decimal(18,2)",
                nullable: true);
        }
    }
}
