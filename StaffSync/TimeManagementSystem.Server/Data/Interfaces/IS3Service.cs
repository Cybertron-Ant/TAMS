using Amazon.S3.Model;
using System;
namespace TimeManagementSystem.Server.Data.Interfaces
{
    public interface IS3Service
    {
        Task<List<S3Object>> GetAllAsync();
        Task<(string Message, string PreviewUrl)> UploadFileAsync(Stream fileStream, string fileName);
        Task DeleteFileAsync(string fileName);
        Task<Stream> GetFileAsync(string fileName);
        Task<string> UpdateFileAsync(Stream fileStream, string fileName, string newFileName);
    }
}

