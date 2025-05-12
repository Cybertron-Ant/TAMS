
namespace TimeManagementSystem.Server.Logging
{
    public class FileLogger: ILogger
    {
        protected readonly LoggingProvider _provider;
        private static readonly object _lock = new object(); // Lock object for synchronization

        public FileLogger(LoggingProvider provider)
        {
            _provider = provider;
        }

        public IDisposable? BeginScope<TState>(TState state) where TState : notnull
        {
            return null;
        }

        public bool IsEnabled(LogLevel logLevel)
        {
            return logLevel != LogLevel.None;
        }

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
        {
            // Where we customize where it should be outputted.
            if(!IsEnabled(logLevel))
            {
                return;
            }
            var fullFilePath = string.Format("{0}/{1}", _provider.Options.FolderPath, _provider.Options.FilePath.Replace("{date}", DateTime.UtcNow.ToString("yyyyMMdd")));

            var logRecord = string.Format("{0} {1} {2} {3}", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"), logLevel.ToString(), formatter(state, exception), (exception != null ? exception.StackTrace : ""));

            lock (_lock) // Ensure only one thread can access this block at a time
            {
                using (var streamWriter = new StreamWriter(fullFilePath, true))
                {
                    streamWriter.WriteLine(logRecord);
                }
            }
        }
    }
}
