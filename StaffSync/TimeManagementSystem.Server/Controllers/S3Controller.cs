using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimeManagementSystem.Server.Data.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Net.Http.Headers;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TimeManagementSystem.Server.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class S3Controller : ControllerBase
    {
        private readonly IS3Service _s3Service;

        public S3Controller(IS3Service s3Service)
        {
            _s3Service = s3Service;
        }

        public class S3Resource(DateTime lastModified, long size, string previewUrl, string fileName)
        {
            public DateTime LastModified { get; set; } = lastModified;
            public long Size { get; set; } = size;
            public string PreviewUrl { get; set; } = previewUrl;

            public string FileName { get; set; } = fileName;
        }


        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var resources = await _s3Service.GetAllAsync();
            var _resources = new List<S3Resource>();
            var baseUrl = "http://13.229.55.229";

            foreach (var resource in resources)
            {
                string url = $"{baseUrl}/api/S3/preview/{Uri.EscapeDataString(resource.Key)}";
                _resources.Add(new S3Resource(resource.LastModified, resource.Size, url, resource.Key));
            }

            return Ok(_resources);
        }


        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is not selected");

            using (var stream = file.OpenReadStream())
            {
                var (message, previewUrl) = await _s3Service.UploadFileAsync(stream, file.FileName);
                return Ok(new { Message = message, PreviewUrl = previewUrl });
            }
        }


        [HttpDelete("delete/{fileName}")]
        public async Task<IActionResult> DeleteFile(string fileName)
        {
            await _s3Service.DeleteFileAsync(fileName);
            return Ok($"File deleted: {fileName}");
        }

        [HttpGet("preview/{fileName}")]
        public async Task<IActionResult> PreviewFile(string fileName)
        {
            var stream = await _s3Service.GetFileAsync(fileName);
            if (stream == null)
            {
                return NotFound();
            }

            // Determine the content type based on the file's extension
            var contentType = GetContentType(fileName);
            var contentDisposition = new ContentDispositionHeaderValue("inline") // Display inline instead of attachment
            {
                FileNameStar = fileName // FileNameStar is used for setting the filename in the Content-Disposition header
            };

            Response.Headers[HeaderNames.ContentDisposition] = contentDisposition.ToString();
            return File(stream, contentType);
        }

        private string GetContentType(string fileName)
        {
            // Use the FileExtensionContentTypeProvider to get the MIME type for a given file extension
            var provider = new FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(fileName, out var contentType))
            {
                contentType = "application/octet-stream"; // Default to a binary type
            }
            return contentType;
        }

        [HttpPut("update/{fileName}")]
        public async Task<IActionResult> UpdateFile(IFormFile file, string fileName)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is not selected");

            using (var stream = file.OpenReadStream())
            {
                var newFileName = Path.GetFileNameWithoutExtension(fileName) + "_updated" + Path.GetExtension(fileName);
                var result = await _s3Service.UpdateFileAsync(stream, fileName, newFileName);
                return Ok(result);
            }
        }
    }
}

