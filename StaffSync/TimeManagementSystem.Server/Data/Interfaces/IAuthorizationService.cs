using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface IAuthorizationService
    {
        Task<string?> CheckAuthorization(ClaimsPrincipal user);
    }
}