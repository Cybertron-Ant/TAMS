using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Mvc;
using TimeManagementSystem.Server.Data;

namespace TimeManagementSystem.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuditTrailController : ControllerBase
    {
        private readonly IAuditTrailService _auditTrailService;
        private readonly AppDbContext _context;

        public AuditTrailController(AppDbContext context, IAuditTrailService auditTrailService){
            _context = context;
            _auditTrailService = auditTrailService;
        }

        // GET: api/AuditTrail
        [HttpGet]
        public ActionResult<IEnumerable<AuditTrail>> GetAuditTrails()
        {
            return _context.AuditTrails;
        }

        // GET: api/AuditTrail/5
        [HttpGet("{id}")]
        public ActionResult<AuditTrail> GetAuditTrail(int id)
        {
            var auditTrail = _context.AuditTrails.Find(id);

            if (auditTrail == null)
            {
                return NotFound();
            }

            return auditTrail;
        }

        // POST: api/AuditTrail
        [HttpPost]
        public IActionResult PostAuditTrail(AuditTrail auditTrail)
        {
            auditTrail.Timestamp = DateTime.Now;
            _context.AuditTrails.Add(auditTrail);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetAuditTrail), new { id = auditTrail.Id }, auditTrail);
        }

        // PUT: api/AuditTrail/5
        // [HttpPut("{id}")]
        // public IActionResult PutAuditTrail(int id, AuditTrail auditTrail)
        // {
        //     if (id != auditTrail.Id)
        //     {
        //         return BadRequest();
        //     }

        //     _context.Entry(auditTrail).State = EntityState.Modified;
        //     _context.SaveChanges();

        //     return NoContent();
        // }

        // DELETE: api/AuditTrail/5
        [HttpDelete("{id}")]
        public IActionResult DeleteAuditTrail(int id)
        {
            var auditTrail = _context.AuditTrails.Find(id);

            if (auditTrail == null)
            {
                return NotFound();
            }

            _context.AuditTrails.Remove(auditTrail);
            _context.SaveChanges();

            return NoContent();
        }
    }
}