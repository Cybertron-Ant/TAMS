import { DataGrid, GridActionsCellItem, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { hasRoles } from "../../../app/roleManager";
import Roles from "../../../enums/Roles";
import TimeSheetDetails from "../TimeSheetDetails";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../../app/fetchWrapper";
import { toast } from "react-toastify";
import { formatDate } from "../../../app/utils";
import { Visibility } from "@mui/icons-material";
import { Pagination } from "../../../interfaces/pagination";
import AggregatedDetails from "./AggregatedDetails";

interface AggregatedTimesheet{
    employeeCode: string;
    firstName: string;
    lastName: string;
    startDate: string;
    endDate: string;
    totalWorkHours: number;
    totalLunchHours: number;
    totalBreakHours: number;
    totalClockHours: number;
}

const AggregatedTimesheet:React.FC<{
    startDate: string;
    endDate: string;
    employeeId: string;
    startFilter: boolean;
}>= ({startDate, endDate, employeeId, startFilter})=>{

const [pageSize, setPageSize] = useState<number>(10);
const [filteredRows, setFilterRows] = useState([]);
const [aggTimesheets, setAggTimesheets] = useState<AggregatedTimesheet[]>([]);
const [totalRecords, setTotalRecords] = useState(0);
const [loading, setLoading] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [filterForm, setFilterForm] = useState<any>({});
const [detailRecord, setDetailRecord] = useState(null);
const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

const handleDetailCloseModal = () => {
  setIsDetailModalOpen(false);
  setDetailRecord(null);
};

const handleView = (timeSheetData: TimeSheet) => {
    setDetailRecord(timeSheetData);
    setIsDetailModalOpen(true);
  };

   /**
   * This function builds a url given the baseUrl and the filter object
   * @param baseUrl This is the base URL that the query params will be added to 
   * @param filters This is the filterData object that has the queryparams we want to passover
   * @returns The final url that is built with the query params present
   */
   function buildUrlWithQueryParams(baseUrl: string, filters: Partial<{startDate:string, endDate:string, employeeId:string, pageSize:number, pageNumber:number}>): string {
    const queryParams: string[] = [];
  
    if (filters.startDate) {
      queryParams.push(`startDate=${encodeURIComponent(filters.startDate)}`);
    }
  
    if (filters.endDate) {
      queryParams.push(`endDate=${encodeURIComponent(filters.endDate)}`);
    }
  
    if (filters.employeeId) {
      queryParams.push(`employeeId=${encodeURIComponent(filters.employeeId)}`);
    }
    if (filters.pageSize !== undefined) {
      queryParams.push(`pageSize=${filters.pageSize}`);
    }
  
    if (filters.pageNumber !== undefined) {
      queryParams.push(`pageNumber=${filters.pageNumber}`);
    }
  
    if (queryParams.length > 0) {
      return `${baseUrl}?${queryParams.join("&")}`;
    }
  
    return baseUrl;
  }

const API_URL = import.meta.env.VITE_TMS_PROD;

useEffect(()=>{
    fetchAggregatedTimesheet();
}, [currentPage, pageSize, startFilter]);

const fetchAggregatedTimesheet = async()=>{
    try{
        setLoading(true);
        let url = buildUrlWithQueryParams(`${API_URL}/TimeSheet/Aggregated`, {startDate, endDate, employeeId, pageSize, pageNumber:currentPage});

        const response = await fetchWithAuth(url);
        if(response.ok){
            let data = await response.json() as Pagination<AggregatedTimesheet[]>;
            setAggTimesheets(data.results);
            setPageSize(data.pageSize);
            setCurrentPage(data.currentPage);
            setTotalRecords(data.totalRecords);
            setTotalPages(data.totalPages);
        }
        
    }catch(e){
        toast.error(e.message);
        console.error(e);
    }finally{
        setLoading(false)
    }
}



const columns: GridColDef[] = [
    { field: "employeeCode", headerName: "ID", flex: 1 },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
      valueFormatter: ({ value }) => formatDate(value),
    },
    {
      field: "endDate",
      headerName: "End Date",
      flex: 1,
      valueFormatter: ({ value }) => formatDate(value),
    },
    { field: "lastName", headerName: "Last Name", flex: 1 },
    { field: "firstName", headerName: "First Name", flex: 1 },
    
    { field: "totalBreakHours", headerName: "Total Break Hours", flex:1 ,valueFormatter: ({ value }) => Number(value).toFixed(2)},
    { field: "totalLunchHours", headerName: "Total Lunch Hours", flex:1 ,valueFormatter: ({ value }) => Number(value).toFixed(2)},
    { field: "totalClockHours", headerName: "Total Clock-In Hours", flex:1 ,valueFormatter: ({ value }) => Number(value).toFixed(2)},
    { field: "totalWorkHours", headerName: "Total Hours Clocked", flex:1 ,valueFormatter: ({ value }) => Number(value).toFixed(2)},
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <>
          
          <GridActionsCellItem
            icon={<Visibility />}
            label="View Details"
            onClick={() =>{
              const newTimeSheet:TimeSheet = params.row;
            //   newTimeSheet.breakType = formatBreakType(newTimeSheet.breakTypeId);
              handleView(newTimeSheet);
            }}
          />
        </>
      ),
    },
  ];
return (
    <>
  <DataGrid
    slots={
      hasRoles([
        Roles.SuperAdmin,
        Roles.HRMSAdmin,
        Roles.SrOperationsManager,
        Roles.HRManagerAdmin,
      ]) ? { toolbar: GridToolbar } : {}
    }
    rows={aggTimesheets}
    columns={columns}
    checkboxSelection
    disableRowSelectionOnClick
    sx={{
      "& .MuiDataGrid-columnHeaders": {
        backgroundColor: "#EDEDED",
        ".MuiDataGrid-columnHeaderTitle": {
          fontWeight: "bold",
        },
      },
    }}
    getRowId={(row) => row.employeeCode}

    initialState={{
        pagination: { paginationModel: { pageSize: pageSize},  },
    }}
    rowCount={totalRecords}

    paginationMode="server"
    pageSizeOptions={[ 10, 15, 20]}
    
    onPaginationModelChange={(model, details)=>{
      if(pageSize != model.pageSize){
        setPageSize(model.pageSize );
        // setFilterForm({...filterForm, pageSize: model.pageSize})

      }
      // model.page is zero-based so since pageNumber should startAt '1' I will compare the updated page with the pageNumber with subtraction of 1
      if(currentPage -1  != model.page){
        setCurrentPage(model.page+1);
        // setFilterForm({...filterForm, pageNumber: model.page + 1})
      }
      
      // When the count changes I need to fetch records and update the form size.
    }}
    loading={loading}
    disableColumnFilter
    
  />

  {detailRecord && (
    <AggregatedDetails
      open={isDetailModalOpen}
      onClose={handleDetailCloseModal}
      record={detailRecord}
    />
  )}
  </>
);
}

export default AggregatedTimesheet;