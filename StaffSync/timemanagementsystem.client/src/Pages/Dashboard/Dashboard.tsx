import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import { useEffect, useState } from "react";
import DashboardCard from "../../Components/DashboardCards";
import { LeaveRequest } from "../../Components/LeaveRequests";
import PermissionManager from "../../app/PermissionManager ";
import { fetchWithAuth } from "../../app/fetchWrapper";
import { useSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import EmDashboardComponent from "../Employee/EmployeeDashboard";
import HSDashboardComponent from "../HR Admin/HRManagerDashboard";
import ItDashboardComponent from "../ITManagerAdmin/ItManagerDashboard";
import ILeaveTracker from "../HR Admin/LeaveManagement/interfaces/ILeaveTracker";

const Dashboard = () => {
  const employee = useSelector((state: RootState) => state.auth.employee);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalEmployeesLeave, setTotalEmployeesLeave] = useState(0);
  const API_URL = import.meta.env.VITE_TMS_PROD;
  const [leaves, setLeaves] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    fetchWithAuth(`${API_URL}/Employees`)
      .then((response) => response.json())
      .then((data) => setTotalEmployees(data.length))
      .catch((error) => console.error("Error fetching data: ", error));
  }, []);

  useEffect(() => {
    fetchWithAuth(`${API_URL}/LeaveTrackers`)
      .then((response) => response.json())
      .then((data) => {
        setTotalEmployeesLeave(data.filter((leaveRequest:ILeaveTracker)=> leaveRequest.approvalStatus == "Approved").length)
      })
        
      .catch((error) => console.error("Error fetching data: ", error));
  }, []);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/LeaveTrackers`);
        if (!response.ok) {
          throw new Error(`Failed to fetch leaves: ${response.statusText}`);
        }
        const data = await response.json();
        setLeaves(data);
      } catch (error) {
        console.error("Error fetching leaves data:", error);
      }
    };

    fetchLeaves();
  }, []);

  const userPermissions = PermissionManager.PermissionManager();
  const employeeCode = PermissionManager.EmployeeCode();
  const employeeObj = PermissionManager.EmployeeObj();

  useEffect(() => {
    const fetchPendingLeaves = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/LeaveTrackers`);
        if (!response.ok) {
          throw new Error(`Failed to fetch leaves: ${response.statusText}`);
        }
        const data = await response.json();

        const pendingLeaves = data
          .filter((leave) => leave.approvalStatus.toLowerCase() === "Pending".toLowerCase())
          .map((leave) => ({
            id: leave.id,
            employeeName: `${leave.firstName} ${leave.lastName}`,
            leaveType: leave.attendance,
            dateOfAbsence: formatDate(leave.dateOfAbsence), // Use formatDate for a readable format
            expectedReturnDate: formatDate(leave.expectedDateOfReturn), // Use formatDate
            status: leave.approvalStatus,
          }));

        setPendingLeaves(pendingLeaves);
      } catch (error) {
        console.error("Error fetching pending leaves:", error);
      }
    };

    fetchPendingLeaves();
  }, [API_URL]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })} at ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;
  };

  return (
    <>
      <div className="mb-4">
        <div className="text-3xl text-neutral-800 font-bold mt-2">Overview</div>
        <div className="mb-4">
          <div className="flex flex-col">
            <div className="text-base text-neutral-800 font-normal leading-loose opacity-80">
              Welcome back, {employee?.firstName} {employee?.lastName}
            </div>
            <div className="text-sm text-neutral-600 font-normal leading-loose">
              Last Login:{" "}
              {employee?.lastLoginDate
                ? formatDateTime(employee.lastLoginDate)
                : "Not available"}
            </div>
          </div>
        </div>
      </div>
      {employeeObj.role !== "Employee" &&
        employeeObj.role !== "It Manager Admin" && (
          <div className="flex flex-wrap justify-start gap-5">
            <DashboardCard
              title="Total Employees"
              value={totalEmployees.toString()}
              color="amber"
              icon={<PeopleAltOutlinedIcon style={{ color: "white" }} />}
              dropdownIcon={<ArrowDropDownIcon style={{ color: "white" }} />}
              // Optionally, include an icon prop
            />
            {/* <DashboardCard
          title="Total Projects"
          value="7"
          color="amber"
          // Optionally, include an icon prop
        /> */}
            <DashboardCard
              title="Total Employees on Leave"
              value={totalEmployeesLeave.toString()}
              color="amber"
              // Optionally, include an icon prop
            />

            {/* <DashboardCard
              title="Interview Scheduled"
              value="10"
              color="amber"
              // Optionally, include an icon prop
            /> */}
            {/* Add more DashboardCard components as needed */}
          </div>
        )}
            {/* <HolidayComponent/> */}

      <div className="flex flex-wrap -mx-2 pt-5">
        {/* <div className="w-full md:w-1/3 px-2 mb-4">
          <ApplicationsToReview applications={applications} />
        </div> */}
        {/* {employeeObj.role !== "Employee" &&
          employeeObj.role !== "It Manager Admin" && (
            <div className="w-full md:w-1/3 px-2 mb-4">
              <LeavesToApprove leaves={approvedLeaves} />
            </div>
          )} */}
        {/* <div className="w-full md:w-1/3 px-2 mb-4">
          <UpcomingHolidays holidays={holidays} />
        </div> */}
        {/* {employeeObj.role !== "Employee" &&
          employeeObj.role !== "It Manager Admin" && (
            <div className="w-full md:w-1/3 px-2 mb-4">
              <HRRequestsCom />
            </div>
          )} */}

        {/* <div className="w-full md:w-1/3 px-2 mb-4">
          <PunchTimeSheet />
        </div> */}
        {employeeObj.role === "Employee" ? (
          <EmDashboardComponent />
        ) : employeeObj.role === "It Manager Admin" ? (
          <ItDashboardComponent />
        ) : employeeObj.role === "Super Admin" ||
          employeeObj.role === "HR Manager Admin" ? (
          <HSDashboardComponent />
        ) : null}

        {/* <div className="w-full  px-2 mb-4"> */}
        {/* <LeaveRequests
            requests={pendingLeaves}
            onStatusChange={handleStatusChange}
          /> */}
        {/* <ManageLeave employeeCode={employeeCode} /> */}
        {/* </div> */}
        {/* {userPermissions.includes("DisciplinaryTrackers") ? ( */}
        {/* <div className="w-full  px-2 mb-4"> */}
        {/* <DisciplinaryActions
              actions={disciplinaryActions}
              onTakeAction={function (actionId: number): void {
                throw new Error("Function not implemented.");
              }}
            /> */}
        {/* <ManageDisciplinary employeeCode={employeeCode} /> */}
        {/* </div> */}
        {/* ) : ( */}
        {/* "" */}
        {/* )} */}
      </div>
    </>
  );
};
export default Dashboard;
