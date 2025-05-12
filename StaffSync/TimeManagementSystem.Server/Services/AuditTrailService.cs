using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace TimeManagementSystem.Server.Data.Services
{
    public class AuditTrailService: IAuditTrailService
    {
        private readonly AppDbContext _context;
        public AuditTrailService(AppDbContext context)
        {
            _context = context;
        }
        public IEnumerable<AuditTrail> GetAuditTrails()
        {
            return _context.AuditTrails;
        }

        public AuditTrail GetAuditTrail(int id)
        {
            return _context.AuditTrails.Find(id);
        }

        public void CreateAuditTrail(AuditTrail auditTrail)
        {
            auditTrail.Timestamp = DateTime.Now;
            _context.AuditTrails.Add(auditTrail);
            _context.SaveChanges();
        }

        // public void UpdateAuditTrail(int id, AuditTrail auditTrail)
        // {
        //     if (id != auditTrail.Id)
        //     {
        //         throw new ArgumentException("Id mismatch");
        //     }

        //     _context.Entry(auditTrail).State = EntityState.Modified;
        //     _context.SaveChanges();
        // }

        public void DeleteAuditTrail(int id)
        {
            var auditTrail = _context.AuditTrails.Find(id);
            if (auditTrail != null)
            {
                _context.AuditTrails.Remove(auditTrail);
                _context.SaveChanges();
            }
        }
    }
}