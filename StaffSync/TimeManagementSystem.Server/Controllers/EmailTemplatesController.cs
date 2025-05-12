namespace TimeManagementSystem.Server.Controllers
{
    public class EmailTemplatesController
    {

        public static string GetMFAEmailTeamplate(string employeeCode, string mfaCode, string loginLink)
        {
            // Read HTML email template content from file
            string templatePath = "Views/Emails/MFALogin.html"; // Path to your HTML email template file
            string emailTemplate = File.ReadAllText(templatePath);

            // Replace placeholders with actual values
            emailTemplate = emailTemplate.Replace("{{EMPLOYEE_CODE}}", employeeCode)
                                         .Replace("{{MFA_CODE}}", mfaCode)
                                         .Replace("{{LOGIN_LINK}}", loginLink);
            return emailTemplate;
        }
    }
}
