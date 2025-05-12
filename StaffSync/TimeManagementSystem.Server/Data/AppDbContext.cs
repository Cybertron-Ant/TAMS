using System.Data;
using System.Text;

using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data
{
    public class AppDbContext : IdentityDbContext<Employee>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        public AppDbContext(DbContextOptions<AppDbContext> options, IHttpContextAccessor httpContextAccessor)
           : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<LeaveTracker> LeaveTracker { get; set; }
        public DbSet<Attendance> Attendance { get; set; }


        public DbSet<EmploymentType> EmploymentTypes { get; set; }
        public DbSet<PositionCode> PositionCodes { get; set; }
        public DbSet<Gender> Genders { get; set; }
        public DbSet<MaritalStatus> MaritalStatuses { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<TimeSheet> TimeSheets { get; set; }
        public DbSet<BreakType> BreakTypes { get; set; }

        public DbSet<EmployeeBreakTime> EmployeeBreakTimes { get; set; }
        //public DbSet<AttendanceStatus> AttendanceStatuses { get; set; }
        //public DbSet<EmployeeAttendance> EmployeeAttendances { get; set; }
        public DbSet<ModeOfSeparation> ModeOfSeparations { get; set; }
        public DbSet<EmployeeStatus> EmployeeStatuses { get; set; }
        public DbSet<ApprovalStatus> ApprovalStatuses { get; set; }
        public DbSet<LeaveBalance> LeaveBalances { get; set; }

        public DbSet<Permissions> Permissions { get; set; }
        public DbSet<EmployeePermissions> EmployeePermissions { get; set; }
        public DbSet<AuthLevel> AuthLevel { get; set; }
        public DbSet<SystemMetadata> SystemMetadata { get; set; }
        public DbSet<AuditTrail> AuditTrails { get; set; }

        public DbSet<RolePermissions> RolePermissions { get; set; }

        public DbSet<Shift> Shifts { get; set; }
        public DbSet<LeaveBalanceDefault> LeaveBalanceDefaults { get; set; }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            List<AuditTrail> auditEntries = new List<AuditTrail>();
            string userId = _httpContextAccessor.HttpContext?.User?.Identity?.Name ?? "Anonymous";

            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.State == EntityState.Added || entry.State == EntityState.Modified || entry.State == EntityState.Deleted)
                {
                    AuditTrail auditEntry = new AuditTrail
                    {
                        TableName = entry.Entity.GetType().Name,
                        Action = entry.State.ToString(),
                        UserId = userId,
                        Timestamp = DateTime.Now,
                        Changes = GetChanges(entry)
                    };

                    // Only add the audit entry if there are changes to log
                    if (!string.IsNullOrEmpty(auditEntry.Changes))
                    {
                        auditEntries.Add(auditEntry);
                    }
                }
            }

            // Assuming AuditTrails is a DbSet in your context
            foreach (var auditEntry in auditEntries)
            {
                AuditTrails.Add(auditEntry);
            }

            // Save changes in the database
            return await base.SaveChangesAsync(cancellationToken);
        }

        private string GetChanges(EntityEntry entry)
        {
            var changes = new StringBuilder();
            // Ensuring we are only comparing entities that have been modified
            if (entry.State == EntityState.Modified || entry.State == EntityState.Added || entry.State == EntityState.Deleted)
            {
                var originalValues = entry.GetDatabaseValues(); // Fetch fresh original values from database
                var currentValues = entry.CurrentValues;


                foreach (var property in currentValues.Properties)
                {
                    //Skip ConcurrencyStamp
                    if (property.Name == "ConcurrencyStamp")
                    {
                        continue;
                    }
                    var original = originalValues?[property];
                    var current = currentValues[property];



                    // Check for null on both sides to avoid NullReferenceException
                    if (original == null && current != null ||
                        original != null && current == null ||
                        original != null && !original.Equals(current))
                    {
                        var originalValue = original?.ToString() ?? "null"; // Handling null original values
                        var currentValue = current?.ToString() ?? "null";   // Handling null current values
                        changes.AppendLine($"{property.Name}: {originalValue} => {currentValue}");
                    }
                }
            }
            return changes.ToString();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Employee>(entity =>
            {
                entity.HasIndex(e => e.EmployeeCode).IsUnique();

                // Make the Email field optional
                entity.Property(e => e.Email).IsRequired(false);

                // Add other configurations for the Employee entity here
            });


           
            // Leave Tracker
            modelBuilder.Entity<LeaveTracker>()
                .HasOne<Employee>(s => s.Employee) // Use ApplicationUser or whatever your extended IdentityUser class is
                .WithMany() // If there's no collection property in ApplicationUser to link back, otherwise specify it here
                .HasForeignKey(s => s.UserId);

            modelBuilder.Entity<LeaveTracker>()
                .HasOne(lt => lt.Attendance) // One Attendance is associated with many LeaveTrackers
                .WithMany(a => a.LeaveTrackers) // Each Attendance can have multiple LeaveTrackers
                .HasForeignKey(lt => lt.AttendanceId);


            modelBuilder.Entity<LeaveTracker>()
                .HasOne(lt => lt.ApprovalStatus)
                .WithMany()
                .HasForeignKey(lt => lt.ApprovalStatusId);

           

            //Permissions
            modelBuilder.Entity<Permissions>()
                .HasKey(p => p.PermissionId);

            // Junction table for many-to-many relationship between Employee and Permission
            modelBuilder.Entity<EmployeePermissions>()
        .HasKey(ep => new { ep.EmployeeId, ep.PermissionId, ep.AuthLevelId });

            modelBuilder.Entity<EmployeePermissions>()
                .HasOne(ep => ep.Employee)
                .WithMany(e => e.EmployeePermissions)
                .HasForeignKey(ep => ep.EmployeeId);

            modelBuilder.Entity<EmployeePermissions>()
                .HasOne(ep => ep.Permission)
                .WithMany(p => p.EmployeePermissions)
                .HasForeignKey(ep => ep.PermissionId);

            modelBuilder.Entity<EmployeePermissions>()
                .HasOne(ep => ep.AuthLevel)
                .WithMany(al => al.EmployeePermissions)
                .HasForeignKey(ep => ep.AuthLevelId);



            // Leave Balances
            modelBuilder.Entity<LeaveBalance>()
                .HasOne(lb => lb.Attendance)
                .WithOne()
                .HasForeignKey<LeaveBalance>(lb => lb.AttendanceId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<LeaveBalance>()
                .HasOne(lb => lb.Employee)
                .WithMany(e => e.LeaveBalances)
                .HasForeignKey(lb => lb.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Composite Unique Key: Ensures only one entry per leave type for each employee in Leave Balances table
            modelBuilder.Entity<LeaveBalance>()
                .HasIndex(lb => new { lb.AttendanceId, lb.UserId });
                // .IsUnique(); // Have some issues storing leave balance because it is assuming that attendanceId is unique

            modelBuilder.Entity<LeaveTracker>()
               .HasOne(lt => lt.Attendance) // One Attendance is associated with many LeaveTrackers
               .WithMany(a => a.LeaveTrackers) // Each Attendance can have multiple LeaveTrackers
               .HasForeignKey(lt => lt.AttendanceId);


            

            modelBuilder.Entity<Employee>()
                 .HasOne<EmploymentType>(e => e.EmploymentType)
                 .WithMany()
                 .HasForeignKey(e => e.EmploymentTypeId)
                 .IsRequired(); // Assuming this is required, adjust as necessary

            // Configure PositionCode relationship
            modelBuilder.Entity<Employee>()
                .HasOne<PositionCode>(e => e.PositionCode)
                .WithMany()
                .HasForeignKey(e => e.PositionCodeId)
                .IsRequired(); // Assuming this is required, adjust as necessary


            // Configure Gender relationship
            modelBuilder.Entity<Employee>()
                .HasOne<Gender>(e => e.Gender)
                .WithMany()
                .HasForeignKey(e => e.GenderId)
                .IsRequired().OnDelete(DeleteBehavior.NoAction);
             // Assuming this is required, adjust as necessary

            // Configure MaritalStatus relationship
            modelBuilder.Entity<Employee>()
                .HasOne<MaritalStatus>(e => e.MaritalStatus)
                .WithMany()
                .HasForeignKey(e => e.MaritalStatusId)
                .IsRequired().OnDelete(DeleteBehavior.NoAction); // Assuming this is required, adjust as necessary


            // Configure Department relationship (making nullable if needed)
            modelBuilder.Entity<Employee>()
                .HasOne<Department>(e => e.Department)
                .WithMany()
                .HasForeignKey(e => e.DepartmentId)
                .IsRequired(true)
                .OnDelete(DeleteBehavior.NoAction);// Change to .IsRequired(false) if this can be null


            // Configure Team relationship
            modelBuilder.Entity<Employee>()
                .HasOne<Team>(e => e.Team)
                .WithMany()
                .HasForeignKey(e => e.TeamId)
                .IsRequired().OnDelete(DeleteBehavior.NoAction);
             // Assuming this is required, adjust as necessary


            // Configure EmployeeStatus relationship
            modelBuilder.Entity<Employee>()
                .HasOne<EmployeeStatus>(e => e.Status)
                .WithMany()
                .HasForeignKey(e => e.EmployeeStatusId)
                .IsRequired().OnDelete(DeleteBehavior.NoAction);
            ;

            modelBuilder.Entity<BreakType>()
            .HasOne<Employee>(bt => bt.Creator)
            .WithMany()
            .HasForeignKey(bt => bt.CreatorId);
            

            modelBuilder.Entity<Employee>()
                .HasMany(e => e.TimeSheets)
                .WithOne(t => t.Employee)
                .HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.NoAction);
            


            modelBuilder.Entity<TimeSheet>()
                .HasOne<BreakType>(ts => ts.BreakType)
                .WithMany()
                .HasForeignKey(ts => ts.BreakTypeId);
                //.WithOne(ts => ts.)

    




        }
    }
}
