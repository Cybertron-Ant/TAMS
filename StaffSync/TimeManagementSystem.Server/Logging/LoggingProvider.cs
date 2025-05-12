using Microsoft.Extensions.Options;

namespace TimeManagementSystem.Server.Logging
{
    [ProviderAlias("LogFile")]
    public class LoggingProvider:ILoggerProvider
    {
        public readonly FileLoggerOptions Options;

        public LoggingProvider(IOptions<FileLoggerOptions> _options) {
            Options = _options.Value;

            if (!Directory.Exists(Options.FolderPath))
            {
                Directory.CreateDirectory(Options.FolderPath);
            }
        }

        public ILogger CreateLogger(string categoryName)
        {
            return new FileLogger(this);
        }

        public void Dispose()
        {
            //throw new NotImplementedException();
        }
    }
}
