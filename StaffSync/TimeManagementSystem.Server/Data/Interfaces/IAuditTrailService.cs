using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimeManagementSystem.Server.Models;

namespace TimeManagementSystem.Server.Data.Intefaces
{
    public interface IAuditTrailService
    {
        IEnumerable<AuditTrail> GetAuditTrails();
        AuditTrail GetAuditTrail(int id);
        void CreateAuditTrail(AuditTrail auditTrail);
        // void UpdateAuditTrail(int id, AuditTrail auditTrail);
        void DeleteAuditTrail(int id);
    }
}