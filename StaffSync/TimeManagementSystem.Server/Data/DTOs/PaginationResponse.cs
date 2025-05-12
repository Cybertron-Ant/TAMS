using TimeManagementSystem.Server.Data.Interfaces;

namespace TimeManagementSystem.Server.Data.DTOs
{
    public class PaginationResponse<T>(int totalPage, IEnumerable<T> results, int totalRecords, int pageSize, int currentPage) : IPaginationResponse<T>
    {
        public int CurrentPage { get; set; } = currentPage;
        public IEnumerable<T> Results { get; set; } = results;
        public int PageSize { get; set; } = pageSize;
        public int TotalPages { get; set; } = totalPage;
        public int TotalRecords { get; set; } = totalRecords;
    }
}
