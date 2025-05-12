using System;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Models;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data;

namespace TimeManagementSystem.Server.Data.Services
{
    public class GenderService : IGenderService
    {
        private readonly AppDbContext _context;

        public GenderService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Gender>> GetAllGendersAsync()
        {
            return await _context.Genders.ToListAsync();
        }

        public async Task<Gender> GetGenderByIdAsync(int genderId)
        {
            return await _context.Genders.FindAsync(genderId);
        }

        public async Task<Gender> CreateGenderAsync(Gender gender)
        {
            _context.Genders.Add(gender);
            await _context.SaveChangesAsync();
            return gender;
        }

        public async Task UpdateGenderAsync(Gender gender)
        {
            _context.Entry(gender).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteGenderAsync(int genderId)
        {
            var gender = await _context.Genders.FindAsync(genderId);
            if (gender != null)
            {
                _context.Genders.Remove(gender);
                await _context.SaveChangesAsync();
            }
        }
    }
}

