export interface Pagination<T>{
    totalRecords : number,
    totalPages: number,
    currentPage: number,
    pageSize: number,
    results: T,
} 