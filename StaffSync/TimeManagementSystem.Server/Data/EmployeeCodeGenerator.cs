using TimeManagementSystem.Server.Data;

public static class EmployeeCodeGenerator
{
    private static readonly string EmployeeCodeKey = "EmployeeCodeCounter";

    public static string GenerateEmployeeCode(AppDbContext context)
    {
        // Locking to prevent concurrent updates leading to duplicate codes
        lock (EmployeeCodeKey)
        {
            // Retrieve the current counter value from the database
            var metadata = context.SystemMetadata
                .SingleOrDefault(sm => sm.Key == EmployeeCodeKey) ?? InitializeEmployeeCodeCounter(context);

            // Increment the counter
            metadata.Value++;
            context.SaveChanges();  // Save the incremented value back to the database

            // Generate the employee code using the counter, padding it with zeros
            string employeeCode = $"PAN-{metadata.Value:00000}";
            return employeeCode;
        }
    }

    private static SystemMetadata InitializeEmployeeCodeCounter(AppDbContext context)
    {
        // Initialize the counter in the database if it doesn't exist
        var newMetadata = new SystemMetadata { Key = EmployeeCodeKey, Value = 0 };
        context.SystemMetadata.Add(newMetadata);
        context.SaveChanges();
        return newMetadata;
    }
}
