import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Button, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Modal, Select, TextField } from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridToolbar,
} from "@mui/x-data-grid";
import moment from "moment-timezone";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PermissionManager from "../../app/PermissionManager ";
import { fetchWithAuth } from "../../app/fetchWrapper";
import { hasRoles } from "../../app/roleManager";
import Roles from "../../enums/Roles";
import MoveEmployeeForm from "./MoveEmployee";
import PunchTimeSheet from "./PunchTimeSheet";
import { toast } from "react-toastify";
import TimeSheetDetails from "./TimeSheetDetails";
import { BreakTime } from "../../interfaces/BreakTime";
import { calculateElapsedTime, formatDateToPanamaDateHTML } from "../../app/utils";
import LoadingButton from "../../Components/LoadingButton";
import { Pagination } from "../../interfaces/pagination";
import AggregatedTimesheet from "./Components/AggregatedTimesheet";

type Employee = {
  id: string;
  employeeCode: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  nameSuffix?: string;
  active: boolean;
  mobileNo?: string;
  immediateSuperior?: string;
  addressForeign?: string;
  birthDate: string;
  dateHired: string;
  dateSeparated?: string;
  employmentType?: string;
  gender?: string;
  maritalStatus?: string;
  email?: string;
  department?: string;
  dateCleared?: string;
  userName: string;
  role: string;
};





interface TimeSheetProps {
  employeeCode?: string; // Typing employeeCode as a string
}
interface FilterData{
  startDate: string;
  endDate: string;
  employeeId: string;
  breakType: number;
  pageSize: number;
  breakDuration:number;
  pageNumber:number;
}

const TimeSheet: React.FC<TimeSheetProps> = ({ employeeCode }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openMoveModal, setOpenMoveModal] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [timeSheets, setTimeSheets] = useState<TimeSheet[]>([]);
  const [breakTimeTypes, setBreakTimeTypes] = useState<BreakTime[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [filterLoader, setFilterLoader] = useState<boolean>(false);
  const [clearFilter, setClearFilter] = useState<boolean>(false);
  const [startFilter, setStartFilter] = useState(false);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [showAggregation, setShowAggregation] = useState(false);
  const [totalRecords, setTotalRecords] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const MAX_WORK_HOURS = 8;
  const initialFilterForm: FilterData = {
    startDate: formatDateToPanamaDateHTML(new Date().toISOString()),
    endDate: "",
    employeeId: "",
    breakType: null, // Assuming 0 is the default or "Select A Break" option
    breakDuration:0,
    pageSize: 10, // Or any default value
    pageNumber: 1, // Or any default value
  };
  
  const [filterForm, setFilterForm] = useState<Partial<FilterData>>(initialFilterForm)
  const [currentPage, setCurrentPage] = useState<number>(initialFilterForm.pageNumber);
  const [pageSize, setPageSize] = useState<number>(initialFilterForm.pageSize);
  const pathRegex = /^\/employeeProfile/;

  const [isProfilePage, setIsProfilePage] = useState<boolean>(pathRegex.test(location.pathname));
  const API_URL = import.meta.env.VITE_TMS_PROD;

  const parseResponse = async (response: Response) => {
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    const text = await response.text();
    return text.includes("success")
      ? { success: true, message: text }
      : { success: false, message: text };
  };

  /**
   * This function builds a url given the baseUrl and the filter object
   * @param baseUrl This is the base URL that the query params will be added to 
   * @param filters This is the filterData object that has the queryparams we want to passover
   * @returns The final url that is built with the query params present
   */
  function buildUrlWithQueryParams(baseUrl: string, filters: Partial<FilterData>): string {
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
    if (filters.breakType !== undefined && filters.breakType !== null ) {
      queryParams.push(`breakType=${filters.breakType}`);
    }
    if (filters.breakDuration !== undefined) {
      queryParams.push(`breakDuration=${filters.breakDuration}`);
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


  const fetchTimeSheets = async () => {
    setLoading(true);
    let url = buildUrlWithQueryParams(`${API_URL}/TimeSheet`, filterForm as FilterData);
    if (employeeCode && isProfilePage) {
      setFilterForm({...filterForm, employeeId : employee.userId}) // ensure that the employee id is set when its profile page
    }

    try {
      const response = await fetchWithAuth(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch time sheets. Status: ${response.status}`
        );
      }
      const data: Pagination<TimeSheet[]> = await response.json();
      setTimeSheets(data.results);
      setTotalRecords(data.totalRecords)
      setFilterLoader(false);
      setClearFilter(false);
      setLoading(false)

    } catch (error) {
      console.error("Failed to fetch time sheets", error);
      setFilterLoader(false);
      setClearFilter(false);
      setLoading(false)

    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/Employees`);
      const data = await response.json();
      setAllEmployees(data);
    } catch (error) {
      setAllEmployees(allEmployees ?? []);
      console.error("Error fetching employees:", error);
    }
  };

  const fetchBreakTimeTypes = () => {
    fetchWithAuth(
      `${API_URL}/BreakType`
    )
      .then(parseResponse)
      .then((data) => {
        if (data.success === false) {
          console.error("Error fetching Break Types:", data.message);
          setBreakTimeTypes(null);
        } else {
          setBreakTimeTypes(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching active timesheet:", error);
        setBreakTimeTypes(null);
      });
  };
  // This should only fetch when page loads or re-renders

  useEffect(()=>{
    fetchBreakTimeTypes();
    fetchEmployees();
  },[]);

  useEffect(() => {
    fetchTimeSheets();
  }, [employeeCode, clearFilter, pageSize, currentPage]);


  const employee = PermissionManager.EmployeeObj();

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = moment.tz(dateTimeString, "America/Panama");
    return date.format("hh:mm A");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = moment.tz(dateString, "America/Panama");
    return date.format("MMMM D, YYYY");
  };

  const formatHours = (decimalHours) => {
    if (isNaN(decimalHours)) return "";

    // Convert the hours to an absolute number to ensure proper calculation
    const absoluteHours = Math.abs(decimalHours);
    const hours = Math.floor(absoluteHours);
    const minutes = Math.round((absoluteHours - hours) * 60);

    return `${hours} hours, ${minutes} minutes`;
  };

  const formatBreakType = (breakTypeId: number) => {
    const breakTime = breakTimeTypes.filter((breakTime)=>breakTime.id == breakTypeId)[0];
    return breakTime?.name;
  };




  const columns: GridColDef[] = [
    { field: "employeeCode", headerName: "ID", flex: 1.5 },
    {
      field: "date",
      headerName: "Date",
      flex: 2,
      valueFormatter: ({ value }) => formatDate(value),
    },
    { field: "lastName", headerName: "Last Name", flex: 2 },
    { field: "firstName", headerName: "First Name", flex: 2 },
    {
      field: "punchIn",
      headerName: "Punch In",
      flex: 1.5,
      valueFormatter: ({ value }) => formatTime(value),
    },
    {
      field: "punchOut",
      headerName: "Punch Out",
      flex: 1.5,
      valueFormatter: ({ value }) => formatTime(value),
    },
    // { field: "assignedShift", headerName: "Assigned Shift", flex:1 },
    {
      field: "currentHours",
      headerName: "Current Hours",
      flex: 2,

      valueGetter: (params) => {
      return calculateElapsedTime(params.row.punchIn, params.row.punchOut);
    },
    },
    {
      field: "breakTypeId",
      headerName: "Break Type",
      flex: 2,
      valueFormatter: ({ value }) => formatBreakType(value),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 2,
      renderCell: (params) => (
        <>
          {hasRoles([
            Roles.SuperAdmin,
            Roles.HRMSAdmin,
            Roles.HRManagerAdmin,
            Roles.SrOperationsManager,
          ]) && (
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              onClick={() => handleEdit(params.row)}
            />
          )}
          <GridActionsCellItem
            icon={<VisibilityIcon />}
            label="View Details"
            onClick={() =>{
              const newTimeSheet:TimeSheet = params.row;
              newTimeSheet.breakType = formatBreakType(newTimeSheet.breakTypeId);
              handleView(newTimeSheet);
            }}
          />
        </>
      ),
    },
  ];

  // Handlers for actions
  const handleEdit = (timeSheetData: TimeSheet) => {
    navigate("/edittimesheet", { state: { timeSheetData } });
  };


  const handleClearFilter = (): Promise<void> => {
    return new Promise<void>((resolve) => {
      setFilterForm(initialFilterForm);
      setCurrentPage(initialFilterForm.pageNumber)
      setClearFilter(true);
      setStartFilter(!startFilter); //The value stored here is not needed we just need the state to be updated so we can cause an effect in the aggregated timesheet component
      setTimeout(() => {
        resolve();
      }, 0);
    });
  };
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

  const handleCloseModal = () => {
    setOpenModal(false);
    fetchTimeSheets();
  };

  const handleCloseMoveModal = () => {
    setOpenMoveModal(false);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchText(event.target.value);

  const filteredRows = timeSheets?.filter((row) => {
    const firstNameLower = row.firstName ? row.firstName.toLowerCase() : "";
    const lastNameLower = row.lastName ? row.lastName.toLowerCase() : "";
    const date = formatDate(row.date).toLowerCase();
    return (
      firstNameLower.includes(searchText.toLowerCase()) ||
      lastNameLower.includes(searchText.toLowerCase()) ||
      date.includes(searchText.toLowerCase())
    );
  });

  // This effect should run and 
  useEffect(() => {
    const intervalId = setInterval(() => {
      let calcHours = timeSheets.reduce((accum, currTimesheet, index)=>{
        if(currTimesheet.breakTypeId === 1){ // clock in id
          return accum + calculateTotal(currTimesheet, currTimesheet.breakTypeId)
        }
        return accum;
    }, 0);
      let calcLunch = timeSheets.reduce((accum, currTimesheet, index)=>{
        if(currTimesheet.breakTypeId === 3){ // lunch
          return accum + calculateTotal(currTimesheet, currTimesheet.breakTypeId)
        }
        return accum;
    }, 0);
      let calcTotalHours = (calcHours - calcLunch) / 3600;
      if(calcTotalHours > MAX_WORK_HOURS){ // 
        setTotalHours(MAX_WORK_HOURS);
        setOvertimeHours(calcTotalHours - MAX_WORK_HOURS);
      }else{

        setTotalHours(parseFloat((calcTotalHours).toFixed(1)));
      }

      // setElapsedTimes(newElapsedTimes);
      
    }, 1000);
    return () => clearInterval(intervalId);
  },[timeSheets])

  const calculateTotal = (timesheet:TimeSheet, breakTypeId: number ) =>{
    const {punchIn, punchOut} = timesheet;
    if (!punchIn){
      return 0;
    };

    const punchInDate = moment.tz(punchIn, "America/Panama");
    const punchOutDate = (punchOut) ? moment.tz(punchOut,"America/Panama") : moment.tz("America/Panama");;
  
    const elapsedTime = punchOutDate.diff(punchInDate, "seconds");

    return elapsedTime;
  }


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value, type } = event.target;
    setFilterForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : type === "checkbox" ? event.target.checked : value,

    }));

  };
  const handleInputChange = (name, value) => {
    setFilterForm((prev) => ({ ...prev, [name]: value }));
  };
  
  return (
    <>
      <div className="mb-4">
        <div className="text-3xl text-neutral-800 font-bold mt-2">
          TimeSheet Mangement
        </div>
        <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
          <span className="opacity-60">Dashboard</span>
          <span className="opacity-60">/</span>
          <span>Timesheet</span>
        </div>
      </div>
      <div className="p-4 bg-white flex flex-col rounded-md">
        { hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin]) && ( <form className="filterForm" >
                <Grid container spacing={2}>
                  <Grid item xs={2}>
                    <FormControl fullWidth>
                      <TextField
                        variant="outlined"
                        label="Start Date"
                        name = "startDate"
                        type="date"
                        value={formatDateToPanamaDateHTML(filterForm.startDate)}
                        onChange={handleChange}
                        placeholder="Start Date"
                        size="small"
                      />
                    </FormControl>
                    
                  </Grid>
                  <Grid item xs={2}>
                    <FormControl fullWidth>
                      <TextField
                        variant="outlined"
                        name = "endDate"
                        label="End Date"
                        type="date"
                        value={formatDateToPanamaDateHTML(filterForm.endDate)}
                        onChange={handleChange}
                        size="small"
                        inputProps={{
                          min: formatDateToPanamaDateHTML(filterForm.startDate)
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl fullWidth>
                      <TextField
                        select
                        value={filterForm.breakType ?? initialFilterForm.breakType}
                        label="Break Type"
                        size="small"
                        onChange={(e)=>handleInputChange("breakType", e.target.value)}
                      >
                        {breakTimeTypes.map((breakType) => (
                          <MenuItem
                            key={breakType.id?.toString()}
                            value={breakType.id?.toString()}
                          >
                            {breakType.name}
                          </MenuItem>
                        ))}
                        
                      </TextField>
                    </FormControl>
                </Grid>
                  <Grid item xs={2}>
                  <TextField
                      variant="outlined"
                      name="breakDuration"
                      label="Break Duration"  // Move the label here
                      type="text"
                      value={filterForm.breakDuration}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: <InputAdornment position="start">Minutes</InputAdornment>,
                      }}
                      size="small"
                    />
                     
                </Grid>
                  <Grid item xs={3}>
                    <FormControl fullWidth>
                      <TextField
                        select
                        value={filterForm.employeeId ?? initialFilterForm.employeeId}
                        size="small"
                        onChange={(e) => handleInputChange("employeeId", e.target.value)}
                        label="Select Employee"
                        disabled={!hasRoles([Roles.SuperAdmin, Roles.SrOperationsManager, Roles.HRMSAdmin, Roles.HRManagerAdmin]) || isProfilePage}
                      >
                        {allEmployees?.map((employee) => (
                          <MenuItem key={employee.id} value={employee.id}>
                            {employee.firstName} {employee.lastName}
                          </MenuItem>
                        ))}
                      </TextField>
                    </FormControl>
                </Grid>
                </Grid>
                <Grid container className="my-2 flex gap-2 justify-between">
                  <LoadingButton color="success" onClick={()=>{
                    setStartFilter(true)
                    return fetchTimeSheets();
                  }}
              variant="contained">
              
                Filter
                </LoadingButton>
                  <LoadingButton color="error"
              variant="contained" onClick={handleClearFilter}>Clear Filter</LoadingButton>
              </Grid>
          </form>)}
         
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            mt: 2
          }}
        >
          <TextField
            variant="outlined"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search…"
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {!hasRoles([
            Roles.SuperAdmin,
            Roles.SrOperationsManager,
            Roles.HRMSAdmin,
            Roles.HRManagerAdmin,
          ]) && (
            <div className="timesheet_data flex gap-8">
              <div className="total_time_group flex gap-2 items-center">
                <p className="font-semibold text-lg">Total Hours: </p>
                <p>{totalHours}</p>
              </div>
              <div className="total_time_group flex gap-2 items-center">
                <p className="font-semibold text-lg">OverTime Hours: </p>
                <p>{overtimeHours}</p>
              </div>
            </div>
          )}
          {hasRoles([
            Roles.SuperAdmin,
            Roles.SrOperationsManager,
            Roles.HRMSAdmin,
            Roles.HRManagerAdmin,
          ]) && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
              }}
            >
              
              <Button
                variant="contained"
                onClick={() => setShowAggregation(!showAggregation)}
                sx={{
                  backgroundColor: showAggregation ?  "#E76818" : "#FFCD29",
                  color: "black",
                  "&:hover": {
                    backgroundColor: '#F19A20'
                  },
                }}
              >
              { showAggregation ? "Timesheet View" : "Aggregated View"  }           
              </Button>
            </Box>
          )}
        </Box>
        <Modal
          open={openMoveModal}
          onClose={handleCloseMoveModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          className="modal m-10"
        >
          <div className="modal-content bg-white p-10 rounded-md overflow-clip w-[50%] mx-auto my-auto">
            <h2 id="modal-title">Move Employee</h2>
            <MoveEmployeeForm />
          </div>
        </Modal>
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          className="modal m-10"
        >
          <div className="modal-content bg-white p-10 rounded-md overflow-clip w-[50%] mx-auto my-auto">
            <PunchTimeSheet handleCloseModal={handleCloseModal} />
          </div>
        </Modal>
        { !showAggregation && <Box sx={{ minHeight: "600px", height: "600px", width: "100%" }}>
  
          <DataGrid
            slots={
              hasRoles([
                Roles.SuperAdmin,
                Roles.HRMSAdmin,
                Roles.SrOperationsManager,
                Roles.HRManagerAdmin,
              ]) ? { toolbar: GridToolbar } : {}
            }
            rows={filteredRows ?? []}
            columns={columns ?? []}
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

            initialState={{
                pagination: { paginationModel: { pageSize: filterForm.pageSize},  },
            }}
            rowCount={totalRecords}

            paginationMode="server"
            pageSizeOptions={[ 10, 15, 20]}
            
            onPaginationModelChange={(model, details)=>{
              if(filterForm.pageSize != model.pageSize){
                setPageSize(model.pageSize );
                setFilterForm({...filterForm, pageSize: model.pageSize})

              }
              // model.page is zero-based so since pageNumber should startAt '1' I will compare the updated page with the pageNumber with subtraction of 1
              if(filterForm.pageNumber -1  != model.page){
                setCurrentPage(model.page+1);
                setFilterForm({...filterForm, pageNumber: model.page + 1})
              }
              
              // When the count changes I need to fetch records and update the form size.
            }}
            loading={loading}
            disableColumnFilter
            
          />
        
          {detailRecord && (
            <TimeSheetDetails
              open={isDetailModalOpen}
              onClose={handleDetailCloseModal}
                record={detailRecord}
            />
          )}
        </Box>}
        {showAggregation && <Box sx={{ minHeight: "600px", height: "600px", width: "100%" }}>
            <AggregatedTimesheet startDate={filterForm.startDate} endDate={filterForm.endDate} employeeId={filterForm.employeeId} startFilter={startFilter}/>

        </Box>
        }
        
      </div>
    </>
  );
};

export default TimeSheet;


