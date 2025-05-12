using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TimeManagementSystem.Server.Data.Interfaces;
using TimeManagementSystem.Server.Models;
using TimeManagementSystem.Server.Services;

namespace TimeManagementSystem.Server.Data.Services
{
    public class BreakTypeService : IBreakTypeService
    {
        private readonly AppDbContext _context;
        public BreakTypeService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<bool> CreateBreakTypeAsync(BreakType breakType)
        {
            var existedBreakType = _context.BreakTypes.Any(bt => bt.Name == breakType.Name);
            var passwordHasherService = new PasswordHasherService();
            if(existedBreakType)
            {
                throw new Exception("BreakType already exist");
            }
            else
            {
                if (!breakType.Password.IsNullOrEmpty())
                {
                    breakType.Password = passwordHasherService.HashPassword(breakType.Password!);
                }
                await _context.BreakTypes.AddAsync(breakType);
                await _context.SaveChangesAsync();
                return true;
            }
        }

        public async Task<bool> AuthenticateBreakType(BreakType breakType)
        {
            var existedBreakType = await _context.BreakTypes.Where(bt => bt.Id == breakType.Id).FirstOrDefaultAsync();
            var passwordHasherService = new PasswordHasherService();
            if (existedBreakType == null)
            {
                throw new Exception("No break type exists with this id");
            }
            return passwordHasherService.VerifyPassword(existedBreakType.Password!, breakType.Password!);
        }

        public async Task<bool> DeleteBreakTypeAsync(int id)
        {
            var breakType = await _context.BreakTypes.FindAsync(id);
            if (breakType != null)
            {
                _context.BreakTypes.Remove(breakType);
                await _context.SaveChangesAsync();
                return true;
            }
            else
            {
                throw new Exception("No Breaks exist with this information");
            }
        }

        public async Task<List<BreakType>> GetAllBreakTypeAsync()
        {
            return await _context.BreakTypes.ToListAsync();
        }

        public async Task<BreakType> GetBreakTypeByIdAsync(int id)
        {
            var passwordHasherService = new PasswordHasherService();

            return await _context.BreakTypes.FindAsync(id);
        }

        public async Task UpdateBreakTypeAsync(int id, BreakType breakType)
        {
            var oldbreakType = _context.BreakTypes.Where(bt => bt.Id == id).First();
            //Ensure that we are not creating a break type with the same name as one in the database
            var existedBreakTypes = _context.BreakTypes.Where(bt => bt.Id != id && bt.Name == breakType.Name).ToList();

            if (oldbreakType == null)
            {
                throw new Exception("BreakType does not exist");
            }

            var passwordHasherService = new PasswordHasherService();

            if (!existedBreakTypes.IsNullOrEmpty())
            {
                throw new Exception("BreakType already exist");
            }
            // if the value of password is not the same as the value in the field and is not empy then its new and should be hashed.
            if (oldbreakType.Password != breakType.Password && !breakType.Password.IsNullOrEmpty())
            {
                oldbreakType.Password = passwordHasherService.HashPassword(breakType.Password!);
            }
            else if(oldbreakType.Password != breakType.Password)
            {
                oldbreakType.Password = null;
            }
            oldbreakType.Name = breakType.Name;
            oldbreakType.CreatorNotes = breakType.CreatorNotes;
            oldbreakType.Active = breakType.Active;

            _context.Entry(oldbreakType).State = EntityState.Modified;

            await _context.SaveChangesAsync();
        }
    }
}
