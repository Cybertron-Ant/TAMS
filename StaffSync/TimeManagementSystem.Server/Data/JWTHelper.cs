using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace TimeManagementSystem.Server.Data
{
    public class JWTHelper
    {
        public static string GenerateJwtToken(string userId, string jwtIssuerKey)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtIssuerKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "https://localhost:7167",
                audience: "https://localhost:7167/api",
                claims: new[] { new Claim(ClaimTypes.Name, userId) },
                expires: DateTime.UtcNow.AddHours(24), // Token expiration time
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }


    }
}
