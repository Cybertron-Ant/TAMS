using TimeManagementSystem.Server.Data;
using TimeManagementSystem.Server.Data.Intefaces;
using TimeManagementSystem.Server.Data.Interfaces;
using TimeManagementSystem.Server.Data.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Amazon.S3;
using TimeManagementSystem.Server.Logging;
using Microsoft.Extensions.Logging;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

// Add services to the container.
builder.Services.AddHttpContextAccessor();
builder.Services.AddDefaultAWSOptions(builder.Configuration.GetAWSOptions());
builder.Services.AddAWSService<IAmazonS3>();
builder.Services.AddScoped<IS3Service, S3Service>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddTransient<IEmailSender, EmailSender>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IPositionCodeService, PositionCodeService>();
builder.Services.AddScoped<IGenderService, GenderService>();
builder.Services.AddScoped<IEmploymentTypeService, EmploymentTypeService>();
builder.Services.AddScoped<IMaritalStatusService, MaritalStatusService>();
builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<IEmployeeStatusService, EmployeeStatusService>();
builder.Services.AddScoped<ITimeSheetService, TimeSheetService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<IApprovalStatusService, ApprovalStatusService>();
builder.Services.AddScoped<ILeaveBalanceService, LeaveBalanceService>();
builder.Services.AddScoped<ILeaveTrackerService, LeaveTrackerService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<IRolePermissionsService, RolePermissionsService>();
builder.Services.AddScoped<IBreakTypeService, BreakTypeService>();
builder.Services.AddScoped<IEmployeePermissionService, EmployeePermissionService>();
// builder.Services.AddScoped<PermissionsAuthorizeAttribute>();
builder.Services.AddScoped<IPasswordManagementService, PasswordManagementService>();
builder.Services.AddScoped<IAuditTrailService, AuditTrailService>();
builder.Services.AddScoped<IShiftService, ShiftService>();
builder.Services.AddScoped<ILeaveBalanceDefaultService, LeaveBalanceDefaultService>();
builder.Services.AddScoped<DataInitializer>();
builder.Services.AddHttpClient();

// Add the DbContext and specify the use of SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Identity services and specify the DbContext
builder.Services.AddIdentity<Employee, IdentityRole>()
.AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
// Configure Swagger with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "Bearer",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            Array.Empty<string>()
        }
    });
});

// Add custom file logger
builder.Logging.AddFileLogger(options =>
{
    builder.Configuration.GetSection("Logging").GetSection("LogFile").GetSection("Options").Bind(options); // Binds the options from the app settings to the options for the file logger

});
// JWT Authentication
string jwtIssuerKey = builder.Configuration["JWT:IssuerSigningKey"];


// In Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
         builder => builder.WithOrigins("https://localhost:5173") // URL of your React app
                            .AllowAnyMethod()
                            .AllowAnyHeader());
});
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = "https://localhost:7167",
        ValidAudience = "https://localhost:7167/api",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtIssuerKey)),
        ClockSkew = TimeSpan.Zero // Optional: adjust token expiration tolerance
    };
});


// This can be disabled to use routes un-authenticated in the development environment
builder.Services.AddControllers(options =>
{
    var policy = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .Build();

    options.Filters.Add(new AuthorizeFilter(policy));
});

var app = builder.Build();

app.UseMiddleware<RequestLogger>();
// Initialize roles
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        await RoleInitializer.Initialize(services);
    }
    catch (Exception exception)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(exception, "An error occurred while creating roles.");
    }
}

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dataInitializer = services.GetRequiredService<DataInitializer>();
        await dataInitializer.Initialize();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}


app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowSpecificOrigin");

app.UseHttpsRedirection();

 //Add the authentication and authorization middleware
app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
