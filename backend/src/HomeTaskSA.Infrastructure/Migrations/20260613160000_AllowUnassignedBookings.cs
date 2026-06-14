using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeTaskSA.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AllowUnassignedBookings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Users_ServiceProviderId",
                table: "Bookings");

            migrationBuilder.AlterColumn<Guid>(
                name: "ServiceProviderId",
                table: "Bookings",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Users_ServiceProviderId",
                table: "Bookings",
                column: "ServiceProviderId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "Bookings"
                SET "ServiceProviderId" = '22222222-2222-2222-2222-222222222222'
                WHERE "ServiceProviderId" IS NULL;
                """);

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Users_ServiceProviderId",
                table: "Bookings");

            migrationBuilder.AlterColumn<Guid>(
                name: "ServiceProviderId",
                table: "Bookings",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Users_ServiceProviderId",
                table: "Bookings",
                column: "ServiceProviderId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
