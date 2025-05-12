namespace TimeManagementSystem.Server.Data.Interfaces
{
    public interface IPaginationResponse<T>
    {
        int TotalPages { get; set; }
        int TotalRecords { get; set; }
        int CurrentPage { get; set; }
        IEnumerable<T> Results { get; set; }
        int PageSize { get; set; }

    }
}
