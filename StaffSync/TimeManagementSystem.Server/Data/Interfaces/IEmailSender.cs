using System;
namespace TimeManagementSystem.Server.Data.Intefaces
{
	public interface IEmailSender
	{
        Task SendEmailAsync(string email, string subject, string htmlMessage);
    }
}

