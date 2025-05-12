using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Threading.Tasks;
namespace TimeManagementSystem.Server.Logging
{
    public class RequestLogger
    {

        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLogger> _logger;

        public RequestLogger(RequestDelegate next, ILogger<RequestLogger> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();
            var requestType = context.Request.Method;
            var requestPath = context.Request.Path;

            _logger.LogInformation($"Received {requestType} request for {requestPath}");

            await _next(context);

            stopwatch.Stop();
            var duration = stopwatch.ElapsedMilliseconds;

            _logger.LogInformation($"Completed {requestType} request for {requestPath} in {duration} ms");
        }
    }


}
