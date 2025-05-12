namespace TimeManagementSystem.Server.Logging
{
    public static class FileLoggerExtension
    {
        public static ILoggingBuilder AddFileLogger(this ILoggingBuilder builder, Action<FileLoggerOptions> configure) 
        { 
            builder.Services.AddSingleton<ILoggerProvider, LoggingProvider>();
            builder.Services.Configure(configure);
            return builder;
        }
    }
}
