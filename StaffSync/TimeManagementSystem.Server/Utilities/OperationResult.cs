using System;
namespace TimeManagementSystem.Server.Data.utlis
{
    public class OperationResult
    {
        public bool Success { get; set; }
        public IEnumerable<string> Errors { get; set; }

        public static OperationResult Ok()
        {
            return new OperationResult { Success = true };
        }

        public static OperationResult Fail(IEnumerable<string> errors)
        {
            return new OperationResult { Success = false, Errors = errors };
        }
    }
}

