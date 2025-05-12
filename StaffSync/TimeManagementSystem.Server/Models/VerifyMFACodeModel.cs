using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TimeManagementSystem.Server.Models
{
    public class VerifyMFACodeModel
    {
        public required string UserId { get; set; }
        public required string Token { get; set; }
    }
}