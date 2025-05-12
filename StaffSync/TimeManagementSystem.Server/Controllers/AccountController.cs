using System.ComponentModel.DataAnnotations;
using System.Net;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Data.Services;
using TimeManagementSystem.Server.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;
using TimeManagementSystem.Server.Data;
using TimeManagementSystem.Server.Controllers;


namespace TimeManagementSytem.Server.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<Employee> _userManager;
        private readonly SignInManager<Employee> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IEmailSender _emailSender;
        private readonly ILogger<AccountController> _logger;
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IPasswordManagementService _passwordManagementService;

        public AccountController(
            IConfiguration configuration,
            UserManager<Employee> userManager,
            SignInManager<Employee> signInManager,
            RoleManager<IdentityRole> roleManager, IEmailSender emailSender, ILogger<AccountController> logger, AppDbContext context, IPasswordManagementService passwordManagementService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _emailSender = emailSender;
            _logger = logger;
            _context = context;
            _configuration = configuration;
            _passwordManagementService = passwordManagementService;
        }






        [HttpPost("register-manual")]
        public async Task<IActionResult> RegisterUserManual([FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
            {
                foreach (var key in ModelState.Keys)
                {
                    var error = ModelState[key].Errors.First();

                    if (error != null)
                    {
                        ModelState.AddModelError(key, error.ErrorMessage);
                    }
                }

                return BadRequest(ModelState);
            }

            string employeeCode = EmployeeCodeGenerator.GenerateEmployeeCode(_context);

            var employmentType = model.EmploymentTypeId.HasValue
                          ? await _context.EmploymentTypes.FindAsync(model.EmploymentTypeId.Value)
                          : null;
            var gender = model.GenderId.HasValue
                         ? await _context.Genders.FindAsync(model.GenderId.Value)
                         : null;
            var maritalStatus = model.MaritalStatusId.HasValue
                                ? await _context.MaritalStatuses.FindAsync(model.MaritalStatusId.Value)
                                : null;
            var department = model.DepartmentId.HasValue
                     ? await _context.Departments.FindAsync(model.DepartmentId.Value)
                     : null;
            var positionCode = model.PositionCodeId.HasValue
                               ? await _context.PositionCodes.FindAsync(model.PositionCodeId.Value)
                               : null;
            var team = model.TeamId.HasValue
                       ? await _context.Teams.FindAsync(model.TeamId.Value)
                       : null;
            var modeOfSeparation = model.ModeOfSeparationId.HasValue
                                   ? await _context.ModeOfSeparations.FindAsync(model.ModeOfSeparationId.Value)
                                   : null;
            var employeeStatus = await _context.EmployeeStatuses.FindAsync(model.EmployeeStatusId);

            string email = string.IsNullOrWhiteSpace(model.Email)
       ? $"{model.FirstName}.{model.LastName}@tams.com".ToLower()
       : model.Email;

            // Validate reference entities exist
            if (employmentType == null || gender == null || maritalStatus == null)
            {
                ModelState.AddModelError(string.Empty, "One or more of the specified types (EmploymentType, Gender, MaritalStatus) does not exist.");
                return BadRequest(ModelState);
            }


            var user = new Employee
            {
                UserName = model.UserName,
                Email = email,// Use Email from RegisterModel, or handle if not provided
                EmailAddress = email,
                PhoneNumber = model.MobileNo,
                MobileNo = model.MobileNo,
                EmployeeCode = employeeCode,
                FirstName = model.FirstName,
                LastName = model.LastName,
                MiddleName = model.MiddleName,
                NameSuffix = model.NameSuffix,
                Active = model.Active,
                AddressForeign = model.AddressForeign,
                BirthDate = model.BirthDate,
                DateHired = model.DateHired,
                Gender = gender,
                MaritalStatus = maritalStatus,
                EmployeeStatusId = employeeStatus.EmployeeStatusId,
                EmploymentType = employmentType,
                Department = department,
                Team = team,
                PositionCode = positionCode,
                ImmediateSuperior = model.ImmediateSuperior,
                // Additional properties as required from RegisterModel
                ImmediateSuperiorCode = model.ImmediateSuperiorCode,

            };
            // Default password for all users
            //var password = model.Password != null ? model.Password : model.UserName.ToLower() + "@HRMS1";
            var password = model.Password;

            var result = await _userManager.CreateAsync(user, password);

            if (result.Succeeded)
            {
                // Since email might not be necessary for manual registration, skip email confirmation
                var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                await _userManager.ConfirmEmailAsync(user, emailToken);

                if (await _roleManager.RoleExistsAsync(model.SelectedRole))
                {
                    await _userManager.AddToRoleAsync(user, model.SelectedRole);
                    var roleID = _context.UserRoles.First((ur) => ur.UserId == user.Id).RoleId;

                    // Gets the permissions and authlevel for a particular role. 
                    List<RolePermissions> rolePermissions = await _context.RolePermissions.Where((rp) => rp.RoleId == roleID).ToListAsync();

                    // Goes through the list of permissions designated by the user role then created the employee permissions
                    foreach (var rp in rolePermissions)
                    {
                        var entity = new EmployeePermissions
                        {
                            EmployeeId = user.Id,
                            PermissionId = rp.PermissionId,
                            AuthLevelId = rp.AuthLevelId
                        };

                        _context.EmployeePermissions.Add(entity);
                    }
                    // This code block ensures that if there is a error saving we send a readable message.
                    try
                    {

                        await _context.SaveChangesAsync();
                    }
                    catch (Exception e)
                    {
                        return Ok(new { message = "User registered successfully but permissions is not attached. Please Add permission" });

                    }
                }
                else
                {
                    // Handle the case where the selected role does not exist
                    ModelState.AddModelError(string.Empty, $"Role {model.SelectedRole} does not exist.");
                    return BadRequest(ModelState);
                }

                // Optional: Sign in the user immediately or return a success response
                return Ok(new { message = "User registered successfully and activated." });
            }
            else
            {

                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }


                // Handle the invalid model state, perhaps return a view with error messages

                return BadRequest(ModelState);
            }
        }

        [HttpGet("confirmemail")]
        public async Task<IActionResult> ConfirmEmail(string userId, string code)
        {
            if (userId == null || code == null)
            {
                return BadRequest("A user ID and code must be provided for email confirmation.");
            }
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound($"Unable to load user with ID '{userId}'.");
            }
            var result = await _userManager.ConfirmEmailAsync(user, code);
            if (result.Succeeded)
            {
                return Ok("Email confirmed successfully.");
            }
            return BadRequest("Error confirming your email.");
        }

        [HttpPost("resend-confirmation-email")]
        public async Task<IActionResult> ResendConfirmationEmail([FromBody] ResendEmailRequest model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                // Consider how to handle this case. It might be better not to reveal whether an email is registered.
                return NotFound("User not found.");
            }

            if (await _userManager.IsEmailConfirmedAsync(user))
            {
                // No need to resend email if it's already confirmed
                return StatusCode(StatusCodes.Status409Conflict, "Email is already confirmed.");
            }

            var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var callbackUrl = Url.Action("ConfirmEmail", "Account", new { userId = user.Id, code = code }, protocol: HttpContext.Request.Scheme);

            await _emailSender.SendEmailAsync(model.Email, "Confirm your email", $"Please confirm your account by clicking this link: <a href='{callbackUrl}'>link</a>");

            return Ok("Confirmation email has been resent.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Employee user = null;

            // Determine if the input is an email
            if (new EmailAddressAttribute().IsValid(model.UsernameOrEmail))
            {
                user = await _userManager.FindByEmailAsync(model.UsernameOrEmail);
            }
            else
            {
                user = await _userManager.FindByNameAsync(model.UsernameOrEmail);
            }

            if (user == null)
            {
                return BadRequest("Invalid login attempt.");
            }

            if (!await _userManager.IsEmailConfirmedAsync(user))
            {
                // Consider your application's requirements: you might want to allow login without confirmed email
                // If so, remove or modify this check as appropriate
                return BadRequest("You must confirm your email before you can log in.");
            }


            // This ensures that we check for 2FA without directly signing in the user.
            var passwordCheckResult = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!passwordCheckResult.Succeeded)
            {
                return BadRequest("Invalid login attempt.");
            }

            var syncRole = _userManager.GetRolesAsync(user).Result.FirstOrDefault();

            // Fetch additional employee information and roles
            var employeeWithRoles = await _userManager.Users
                .Where(u => u.Id == user.Id)
                .Select(u => new EmployeeWithRoleDto
                {
                    EmployeeCode = u.EmployeeCode,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    Department = u.Department.Name,
                    Active = u.Active,
                    Role = syncRole,
                    UserId = u.Id,
                    GenderName = u.Gender.Name,
                    MaritalStatusName = u.MaritalStatus.Name,
                    TeamName = u.Team.Name,
                    //ModeOfSeparationName = u.ModeOfSeparation.Name,
                    EmploymentTypeName = u.EmploymentType.Name,
                    EmployeeStatusName = u.Status.Name,
                    FirstLoginDate = u.FirstLoginDate,
                    LastLoginDate = u.LastLoginDate,
                    EmployeePermissions = u.EmployeePermissions
                
                    .Select(ep => ep.Permission.PermissionName)
                    .ToList()

                })
                .FirstOrDefaultAsync();

            // Generate Auth Token
            var authToken = JWTHelper.GenerateJwtToken(user.Id, _configuration["JWT:IssuerSigningKey"]);

            if (await _userManager.GetTwoFactorEnabledAsync(user))
            {
                var token = await _userManager.GenerateTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider);
                await Send2FACodeByEmail(user.Email, token, user.EmployeeCode);
                return Ok(new { Action = "login-mfa", UserId = user.Id, Message = "2FA verification required", AuthToken = authToken, employee = employeeWithRoles });
            }

            var signInResult = await _signInManager.PasswordSignInAsync(user, model.Password, model.RememberMe, lockoutOnFailure: true);
            if (signInResult.Succeeded)
            {
                // Check if user is not terminated
                if (user.Active == false)
                {
                    return StatusCode(403, new LoginResponse { Message = "Your account is disabled. Please contact support for assistance.", Employee = null });
                }


                user.LastLoginDate = DateTime.UtcNow;
                var updateResult = await _userManager.UpdateAsync(user);

                if (user.FirstLoginDate == null)
                {
                    user.FirstLoginDate = DateTime.UtcNow;
                    await _userManager.UpdateAsync(user);
                }



                var response = new LoginResponse
                {
                    Message = "Login successful",
                    AuthToken = authToken,
                    Employee = employeeWithRoles,
                };

                return Ok(response);

            }
            else if (signInResult.IsLockedOut)
            {
                return BadRequest("User account is locked out.");
            }
            else
            {
                return BadRequest("Invalid login attempt.");
            }
        }

        [HttpPost("enable-mfa")]
        public async Task<IActionResult> EnableMfa([FromBody] string employeeCode)
        {
            var user = await _userManager.Users.SingleOrDefaultAsync(u => u.EmployeeCode == employeeCode);
            if (user == null) return NotFound("User not found.");

            // Check if MFA is already enabled
            if (user.TwoFactorEnabled)
            {
                return BadRequest("MFA is already enabled for this user.");
            }

            var token = await _userManager.GenerateTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider);
            var emailContent = $"Hello {user.UserName} you have enabled MFA,\n\n" +
                                  $"Your Employee Code is: {employeeCode}\n" +
                                  $"Your MFA verification code is: {token}\n\n" +
                                  "Please use this code to complete your MFA verification process.";
            var email = await _userManager.GetEmailAsync(user);

            // Send token via email
            await _emailSender.SendEmailAsync(email, "MFA Verification Code", $"Enabled two factor authentication: {emailContent}");

            // Actually enable MFA for the user
            var setTwoFactorResult = await _userManager.SetTwoFactorEnabledAsync(user, true);
            if (!setTwoFactorResult.Succeeded)
            {
                return StatusCode(500, "Failed to enable MFA for user.");
            }

            return Ok("MFA setup token sent to email. MFA has been enabled.");
        }

        [HttpPost("disable-mfa")]
        public async Task<IActionResult> DisableMfa([FromBody] string employeeCode)
        {
            var user = await _context.Employees.SingleOrDefaultAsync(u => u.EmployeeCode == employeeCode);
            if (user == null) return NotFound($"User with code {employeeCode} not found.");

            // Check if MFA is already disabled
            if (user.TwoFactorEnabled == false)
            {
                return StatusCode(StatusCodes.Status409Conflict, "MFA is already disabled for this user.");
            }

            var emailContent = $"Hello {user.UserName} MFA has been disabled on your account";

            // Actually disable MFA for the user
            user.TwoFactorEnabled = false;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                return StatusCode(500, "Failed to disable MFA for user.");
            }

            // Send security update via email
            await _emailSender.SendEmailAsync(user.Email, "MFA Security Update", $"Disabled two factor authentication: {emailContent}");

            return Ok("MFA security update sent to email. MFA has been disabled.");
        }

        [HttpPost("verify-mfa")]
        public async Task<IActionResult> VerifyTwoFactor([FromBody] VerifyTwoFactorModel model)
        {
            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null)
            {
                return BadRequest("Invalid request.");
            }

            var isTokenValid = await _userManager.VerifyTwoFactorTokenAsync(
                user,
                TokenOptions.DefaultEmailProvider,
                model.Token);

            if (!isTokenValid)
            {
                return BadRequest("Invalid token.");
            }

            // Optionally, sign in the user if 2FA verification is successful
            await _signInManager.SignInAsync(user, isPersistent: model.RememberMe);

            // Generate Auth Token
            var authToken = JWTHelper.GenerateJwtToken(user.Id, _configuration["JWT:IssuerSigningKey"]);

            return Ok(new { Message = "2FA verification successful, user logged in.", AuthToken = authToken });
        }

        [HttpPost("verify-mfa-code")]
        public async Task<IActionResult> VerifyMFACode([FromBody] VerifyMFACodeModel model)
        {
            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null)
            {
                // Return a structured JSON response for error
                return BadRequest(new { Message = "Invalid request. UserNotFound", ErrorCode = 404 });
            }

            var isTokenValid = await _userManager.VerifyTwoFactorTokenAsync(
                user,
                TokenOptions.DefaultEmailProvider,
                model.Token);

            if (!isTokenValid)
            {
                // Return a structured JSON response for error
                return BadRequest(new { Message = "Invalid token.", ErrorCode = 401 });
            }

            // Return a structured JSON response for success
            return Ok(new { Message = "2FA verification successful", });
        }

        [HttpPost("send-mfa-code")]
        public async Task<IActionResult> SendMfaCode([FromBody] UserRequestModel model)
        {
            var users = await _context.Users
                          .Where(u => u.Email == model.Email)
                          .ToListAsync();
            if (users == null || users.Count == 0)
            {

                return NotFound("User not found.");
            }
            else if (users.Count > 1)
            {
                // Handle the scenario where more than one user has the same email
                // You can return an error or log a warning depending on your case
                return BadRequest("Multiple users found with the same email.");
            }
            var user = users.First();

            var token = await _userManager.GenerateTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider);
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest("Failed to generate MFA token.");
            }

            await Send2FACodeByEmail(user.Email, token, user.EmployeeCode);

            return Ok(new { Message = "MFA Token Sent" });
        }

        private async Task Send2FACodeByEmail(string email, string token, string employeeCode)
        {
            var subject = "Your Two-Factor Authentication Code";
            var content = EmailTemplatesController.GetMFAEmailTeamplate(employeeCode, token, $"https://localhost:5173/login-mfa/{employeeCode}");

            // Use your email service to send the email
            await _emailSender.SendEmailAsync(email, subject, content);
        }

        [HttpPost("resend-mfa")]
        public async Task<IActionResult> ResendMfaVerificationCode([FromBody] string employeeCode)
        {
            var user = await _userManager.Users.SingleOrDefaultAsync(u => u.EmployeeCode == employeeCode);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Ensure MFA is already enabled for the user
            if (!user.TwoFactorEnabled)
            {
                return BadRequest("MFA is not enabled for this user. Please enable MFA first.");
            }

            // Generate a new two-factor authentication token
            var token = await _userManager.GenerateTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider);
            var email = await _userManager.GetEmailAsync(user);

            // Attempt to send the token and employee code via email
            try
            {
                var emailContent = $"Hello {user.UserName},\n\n" +
                                   $"Your Employee Code is: {employeeCode}\n" +
                                   $"Your new MFA verification code is: {token}\n\n" +
                                   "Please use this code to complete your MFA verification process.";

                await _emailSender.SendEmailAsync(email, "MFA Verification Code", emailContent);
                return Ok("New MFA verification code and Employee Code sent to email.");
            }
            catch (Exception ex)
            {
                // Log the exception and return an error message
                _logger.LogError($"Error sending MFA code for {employeeCode}: {ex.Message}");
                return StatusCode(500, "An error occurred while sending the MFA verification code.");
            }
        }

        [HttpPost("login-mfa")]
        public async Task<IActionResult> VerifyLoginMfa([FromBody] MfaLoginModel model)
        {
            var user = await _userManager.Users.SingleOrDefaultAsync(u => u.EmployeeCode == model.EmployeeCode);
            if (user == null) return BadRequest("User not found");

            var isTokenValid = await _userManager.VerifyTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider, model.Token);
            if (!isTokenValid) return StatusCode((int)HttpStatusCode.BadRequest, new { Message = "Invalid MFA token" });

            // Manually sign in the user
            await _signInManager.SignInAsync(user, isPersistent: false);
            var employeeWithRoles = await _userManager.Users
                   .Where(u => u.Id == user.Id)
                   .Select(u => new EmployeeWithRoleDto
                   {
                       EmployeeCode = u.EmployeeCode,
                       FirstName = u.FirstName,
                       LastName = u.LastName,
                       Email = u.Email,
                       Department = u.Department.Name,
                       Active = u.Active,
                       Role = _userManager.GetRolesAsync(u).Result.FirstOrDefault(),
                       UserId = u.Id,
                       PositionCodeName = u.PositionCode.Name,
                       GenderName = u.Gender.Name,
                       MaritalStatusName = u.MaritalStatus.Name,
                       TeamName = u.Team.Name,
                       //ModeOfSeparationName = u.ModeOfSeparation.Name,
                       EmploymentTypeName = u.EmploymentType.Name,
                       EmployeeStatusName = u.Status.Name,
                       FirstLoginDate = u.FirstLoginDate,
                       LastLoginDate = u.LastLoginDate,
                   })
                   .FirstOrDefaultAsync();
            user.LastLoginDate = DateTime.UtcNow;

            if (user.FirstLoginDate == null)
            {
                user.FirstLoginDate = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);
            }

            // Generate Auth Token
            var authToken = JWTHelper.GenerateJwtToken(user.Id, _configuration["JWT:IssuerSigningKey"]);


            var response = new LoginResponse
            {
                Message = "MFA verification successful and logged in",
                Employee = employeeWithRoles,
                AuthToken = authToken
            };

            return Ok(response);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok(new { message = "Logout successful" });
        }

        // [Authorize]
        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _roleManager.Roles.ToListAsync();
            return Ok(roles);
        }

        // [Authorize]
        [HttpGet("ByRole/{roleName}")]
        public async Task<IActionResult> GetEmployeesByRole(string roleName)
        {
            var role = await _roleManager.FindByNameAsync(roleName);
            if (role == null)
            {
                return NotFound($"Role '{roleName}' not found.");
            }

            var usersInRole = await _userManager.GetUsersInRoleAsync(roleName);
            // Optionally, transform usersInRole to a DTO to avoid exposing sensitive details
            return Ok(usersInRole);
        }

        [HttpGet("login-status")]
        public async Task<IActionResult> GetLoginStatus()
        {
            try
            {
                if (User.Identity.IsAuthenticated)
                {
                    // User is authenticated (logged in)
                    return Ok(new { IsAuthenticated = true, Message = "User is authenticated." });
                }
                else
                {
                    // User is not authenticated (not logged in)
                    return Unauthorized(new { IsAuthenticated = false, Message = "User is not authenticated." });
                }
            }
            catch (Exception ex)
            {
                // Handle any exceptions that might occur during the process
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("information")]
        public async Task<IActionResult> GetAccountInformation(string employeeCode)
        {
            try
            {
                // Get the logged-in user's info
                var user = await _context.Users.Where(e => e.EmployeeCode == employeeCode).FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound("User not found.");
                }

                // Fetch additional employee information and roles
                var employeeWithRoles = await _userManager.Users
                    .Where(u => u.Id == user.Id)
                    .Select(u => new EmployeeWithRoleDto
                    {
                        EmployeeCode = u.EmployeeCode,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        Email = u.Email,
                        Department = u.Department.Name,
                        Active = u.Active,
                        Role = _userManager.GetRolesAsync(u).Result.FirstOrDefault(),
                        UserId = u.Id,
                        GenderName = u.Gender.Name,
                        MaritalStatusName = u.MaritalStatus.Name,
                        TeamName = u.Team.Name,
                        //ModeOfSeparationName = u.ModeOfSeparation.Name,
                        EmploymentTypeName = u.EmploymentType.Name,
                        EmployeeStatusName = u.Status.Name,
                        FirstLoginDate = u.FirstLoginDate,
                        LastLoginDate = u.LastLoginDate,
                        EmployeePermissions = u.EmployeePermissions
                        .Select(ep => ep.Permission.PermissionName)
                        .ToList()
                    })
                    .FirstOrDefaultAsync();

                return Ok(new { message = "Account information retreived successfully", data = employeeWithRoles, errors = "" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occured while retreiving account information", data = "", errors = ex.Message });
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordByEmployeeCodeModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _passwordManagementService.ChangeUserPasswordAsync(model.EmployeeCode, model.CurrentPassword, model.NewPassword);

            if (!result.Success)
            {
                return BadRequest(result.Errors);
            }

            return Ok("Password successfully changed.");
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] PasswordResetRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Please check the requirements for this endpoint.", errors = ModelState, data = "" });
            }

            var result = await _passwordManagementService.RequestPasswordResetAsync(model.Email);

            if (!result.Success)
            {
                return BadRequest(new { message = "An error occured while requesting a password reset request.", errors = result.Errors, data = "" });
            }

            return Ok(new { messasge = "Password reset link has been sent to your email.", errors = "", data = "" });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _passwordManagementService.ResetPasswordAsync(model.Email, model.Token, model.NewPassword);

            if (!result.Success)
            {
                return BadRequest(result.Errors);
            }

            return Ok("Password has been successfully reset.");
        }

        [HttpPost("manual-reset-password")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> ManualResetPassword([FromBody] PasswordManualResetRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _passwordManagementService.AdminResetUserPasswordAsync(model.UserId, model.NewPassword);

            if (!result.Success)
            {
                return BadRequest(result.Errors);
            }

            return Ok("Password has been reset successfully.");
        }

        [NonAction]
        public ModelStateDictionary translateModelState(ModelStateDictionary modelState)
        {
            foreach (var key in modelState.Keys)
            {
                var error = ModelState[key].Errors.First();

                if (error != null)
                {
                    ModelState.AddModelError(key, error.ErrorMessage);
                }
            }

            return ModelState;
        }

    }
}
