using System;
using Amazon.S3;
using Amazon.S3.Model;
using TimeManagementSystem.Server.Data.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace TimeManagementSystem.Server.Data.Services
{
    public class S3Service : IS3Service
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName = "agshrmsbckt01"; // Replace with your actual bucket name

        public S3Service(IAmazonS3 s3Client)
        {
            _s3Client = s3Client;
        }

        public async Task<List<S3Object>> GetAllAsync()
        {
            List<S3Object> allObjects = (await _s3Client.ListObjectsAsync(_bucketName)).S3Objects;

            return allObjects;
        }

        public async Task<(string Message, string PreviewUrl)> UploadFileAsync(Stream fileStream, string fileName)
        {
            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = fileName,
                InputStream = fileStream
            };

            var response = await _s3Client.PutObjectAsync(request);
            string baseUrl = "http://13.229.55.229";
            string previewUrl = $"{baseUrl}/api/S3/preview/{Uri.EscapeDataString(fileName)}";

            return ($"File uploaded: {fileName}", previewUrl);
        }


        public async Task DeleteFileAsync(string fileName)
        {
            var request = new DeleteObjectRequest
            {
                BucketName = _bucketName,
                Key = fileName
            };

            await _s3Client.DeleteObjectAsync(request);
        }

        public async Task<Stream> GetFileAsync(string fileName)
        {
            var request = new GetObjectRequest
            {
                BucketName = _bucketName,
                Key = fileName
            };

            var response = await _s3Client.GetObjectAsync(request);
            return response.ResponseStream;
        }

        public async Task<string> UpdateFileAsync(Stream fileStream, string fileName, string newFileName)
        {
            // To update a file, you can delete the existing file and upload the new file
            await DeleteFileAsync(fileName);
            await UploadFileAsync(fileStream, newFileName);
            return $"File updated: {newFileName}";
        }
    }

}

