using TimeManagementSystem.Server.Data.Intefaces;
using MailKit.Net.Smtp;
using MimeKit;

namespace TimeManagementSystem.Server.Data.Services
{
    public class EmailSender : IEmailSender
    {
        public async Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            var emailMessage = new MimeMessage();
            emailMessage.From.Add(new MailboxAddress("HRMS", "humanrmsystem@gmail.com"));
            emailMessage.To.Add(new MailboxAddress("", email));
            emailMessage.Subject = subject;
            emailMessage.Body = new TextPart("html") { Text = htmlMessage };

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync("smtp.gmail.com", 587, MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync("humanrmsystem@gmail.com", "ksmg ssbf ykqk vtrn");
                await client.SendAsync(emailMessage);
                await client.DisconnectAsync(true);
            }
        }
    }
}
