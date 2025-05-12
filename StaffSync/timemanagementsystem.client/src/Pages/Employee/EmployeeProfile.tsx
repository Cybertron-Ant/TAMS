import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  Modal,
  InputAdornment,
  TextField,
  Avatar,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { GridColDef, GridActionsCellItem, DataGrid } from "@mui/x-data-grid";
import MoveEmployeeForm from "../HR Admin/MoveEmployee";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import Tabs from "../../Components/Tabs";
import WorkResumptionTracker from "../WorkResumptionTracker/WorkResumptionTracterList";
import ConfirmationModal from "../../Components/ConfirmationModal";
import TerminateEmployeeForm from "../../Components/TerminateEmployeeForm";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../../app/fetchWrapper";
import { HttpsRounded } from "@mui/icons-material";
import NoEncryptionRoundedIcon from "@mui/icons-material/NoEncryptionRounded";
import PermissionManager from "../../app/PermissionManager ";
import Register from "../../AuthPages/Register";
import { Employee } from "../../interfaces/Employee";
import { AttritionType } from "../../enums/AttritionType";
import { hasRoles } from "../../app/roleManager";
import Roles from "../../enums/Roles";

// Step 1: Define the Employee Type
interface EmploymentType {
  employmentTypeId: number;
  name: string;
}

interface PositionCode {
  positionCodeId: number;
  name: string;
  currentPositionSuspendedPullOutFloatings: any; // Adjust type as necessary
  newPositionSuspendedPullOutFloatings: any; // Adjust type as necessary
}

interface Gender {
  genderId: number;
  name: string;
}

interface Department {
  departmentId: number;
  name: string;
  currentDepartmentSuspendedPullOutFloatings: any; // Adjust type as necessary
  newDepartmentSuspendedPullOutFloatings: any; // Adjust type as necessary
}

interface MaritalStatus {
  maritalStatusId: number;
  name: string;
}

interface Team {
  teamId: number;
  name: string;
}

interface ModeOfSeparation {
  modeOfSeparationId: number;
  name: string;
}

interface Status {
  employeeStatusId: number;
  name: string;
}

type DepartmentMove = {
  from: string;
  to: string;
  dateMoved: string;
};

// Define your timesheet record type
interface Timesheets {
  id: string;
  date: string;
  firstIn: string;
  firstOut: string;
  employeeCode: string;

  shift: string;
  minuteToHour: string;
  break: string;
  weeklyHours: string;
}

const EmployeeProfile = () => {
  // Step 2: Set Initial State with Correct Type
  const [viewedEmployee, setViewedEmployee] = useState<Employee | null>(null);

  const { employeeCode } = useParams<{ employeeCode: string }>();

  const loggedInEmployee = PermissionManager.EmployeeObj();

  const [departmentMoves, setDepartmentMoves] = useState<DepartmentMove[]>([]);
  //   const { employeeId } = useParams();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openMoveModal, setOpenMoveModal] = useState<boolean>(false);
  const [openNTEModal, setOpenNTEModal] = useState<boolean>(false);
  const [openNODModal, setOpenNODModal] = useState<boolean>(false);
  const [openWrtModal, setWrtModal] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [openTerminateModal, setOpenTerminateModal] = useState<boolean>(false);
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [attritionType, setAttritionType] = useState<AttritionType>(
    AttritionType.Termination
  );
  const API_URL = import.meta.env.VITE_TMS_PROD;

  const [showMfaModal, setShowMfaModal] = useState<boolean>(false);
  const [mfaLoading, setMfaLoading] = useState<boolean>(false);
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] =
    useState<boolean>(false);
  const navigate = useNavigate();
  const employeeObj = PermissionManager.EmployeeObj();
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const response = await fetchWithAuth(
          `${API_URL}/Employees/${employeeCode}`
        );
        if (!response.ok) throw new Error("Failed to fetch employee details.");
        const data: Employee = await response.json(); // Ensure the response matches the Employee type
        setViewedEmployee(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    if (employeeCode) {
      fetchEmployeeDetails();
    }
  }, [employeeCode]);

  const rows: Timesheets[] = [];

  const columns: GridColDef[] = [
    { field: "employeeCode", headerName: "Employee Code", flex: 1 },

    { field: "firstIn", headerName: "First In", flex: 1 },
    { field: "firstOut", headerName: "First Out", flex: 1 },
    { field: "shift", headerName: "Assigned Shift", flex: 1 },
    { field: "minuteToHour", headerName: "Current Hours", flex: 1 },
    {
      field: "break",
      headerName: "Break",
      flex: 1,
    },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "weeklyHours", headerName: "Weekly Hours", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 250,
      renderCell: (params) => (
        <>
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleEdit(params.row.employeeCode)}
          />
          <GridActionsCellItem
            icon={<BlockIcon />}
            label="Disable"
            onClick={() => handleDisable(params.row.employeeCode)}
          />
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDelete(params.row.employeeCode)}
          />
        </>
      ),
    },
  ];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchText(event.target.value);

  const filteredTimesheets = rows.filter((row) => {
    return row.date.toLowerCase().includes(searchText.toLowerCase());
  });
  // Handlers for actions
  const handleEdit = (employeeCode: string) => {
    /* Implement edit functionality */
  };
  const handleDisable = (employeeCode: string) => {
    /* Implement disable functionality */
  };
  const handleDelete = (employeeCode: string) => {
    /* Implement delete functionality */
  };
  const handleMove = (employeeCode: string) => {
    console.log("Moving", employeeCode);
    // Implement move functionality here
  };

  const handleOpenTerminateModal = (mode: AttritionType) => {
    setAttritionType(mode);
    setOpenTerminateModal(true);
  };

  const handleChildModalChanges = (openModal: boolean) => {
    setOpenTerminateModal(openModal);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleReactivateEmployee = async (employeeCode?: string) => {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/Employees/ReActivate/${employeeCode}`
      );

      if (!response.ok) {
        throw new Error("Failed to re-activate employee");
      }

      toast.success("Employee Re-Activated!");
    } catch (error) {
      toast.error("Error re-activating employee!");
      console.error("Error e-activating employee:", error);
    }
  };

  const handleCloseWrtModal = () => {
    setWrtModal(false);
  };

  const handleCloseMoveModal = () => {
    setOpenMoveModal(false);
  };

  const handleCloseNTEModal = () => {
    setOpenNTEModal(false);
  };

  const handleCloseNODModal = () => {
    setOpenNODModal(false);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const handleOpenEditModal = () => {
    setOpenEditModal(true);
  };

  const handleUpdatePassword = () => {
    navigate(`/admin/update-password/${viewedEmployee.employeeCode}`);
  };

  const handleEnableMFA = async () => {
    setMfaLoading(true);

    try {
      const response = await fetch(`${API_URL}/Account/enable-mfa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeCode), // This will ensure the string is correctly enclosed in double quotes
      });
      if (!response.ok) throw new Error("Failed to enable MFA.");

      // Enabled Successfully
      toast.success("MFA is now enabled for your account");

      // Update the UI
      const updatedEmployee = {
        ...(viewedEmployee as Employee),
        twoFactorEnabled: true,
      };
      setViewedEmployee(updatedEmployee);
    } catch (error: unknown) {
      console.error("An unexpected error occurred", error);
    } finally {
      setShowMfaModal(false);
      setMfaLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleDisableMFA = async () => {
    setMfaLoading(true);

    try {
      const response = await fetch(`${API_URL}/Account/disable-mfa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeCode), // This will ensure the string is correctly enclosed in double quotes
      });
      if (!response.ok) throw new Error("Failed to disable MFA.");

      // Disabled Successfully
      toast.success("MFA is now disabled for your account");

      // Update the UI
      const updatedEmployee = {
        ...(viewedEmployee as Employee),
        twoFactorEnabled: false,
      };
      setViewedEmployee(updatedEmployee);
    } catch (error: unknown) {
      return console.error("An unexpected error occurred", error);
    } finally {
      setShowMfaModal(false);
      setMfaLoading(false);
    }
  };

  const isOwnProfile =
    loggedInEmployee &&
    viewedEmployee &&
    loggedInEmployee.employeeCode === viewedEmployee.employeeCode;

  return (
    <>
      <div className="mb-4">
        <div className="text-3xl text-neutral-800 font-bold mt-2">
          Employee -{" "}
          {viewedEmployee
            ? `${viewedEmployee.firstName} ${viewedEmployee.lastName}`
            : "Loading..."}
        </div>
        <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
          <span className="opacity-60">Dashboard</span>
          <span className="opacity-60">/</span>
          <span>Employees</span>
          <span className="opacity-60">/</span>
          <span>Employee Profile</span>
        </div>
      </div>
      <div className="flex gap-4">
        {/* Employee details section */}

        <div className="flex flex-col w-full  bg-white rounded-lg shadow divide-y divide-gray-200">
          <div className="flex flex-col p-8">
            <div className="flex items-center space-x-6 mb-4">
              <Avatar sx={{ width: 100, height: 100 }}>
                {viewedEmployee
                  ? getInitials(
                      `${viewedEmployee.firstName} ${viewedEmployee.lastName}`
                    )
                  : "A"}
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {viewedEmployee ? (
                    <div>
                      {viewedEmployee.firstName} {viewedEmployee.lastName}
                    </div>
                  ) : (
                    "Loading..."
                  )}
                </h2>
                <p className="text-sm font-medium text-gray-500">
                  {viewedEmployee
                    ? `${viewedEmployee.role?.toUpperCase()} `
                    : "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  {viewedEmployee
                    ? `${viewedEmployee.department.name} `
                    : "Loading..."}
                </p>
                <p className="text-sm text-gray-500">
                  {viewedEmployee
                    ? `${viewedEmployee.positionCode.name} `
                    : "Loading..."}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <section className="grid gap-y-4">
                <div>
                  <span className="text-gray-900 font-semibold">
                    Employee Code:
                  </span>
                  <span className="ml-2 text-gray-600">
                    {viewedEmployee
                      ? `${viewedEmployee.employeeCode} `
                      : "Loading..."}
                  </span>
                </div>

                {/* <div>
                  <span className="text-gray-900 font-semibold">
                    Date Joined:
                  </span>
                  <span className="ml-2 text-gray-600">
                    {viewedEmployee
                      ? `${formatDate(viewedEmployee.dateHired)} `
                      : "Loading..."}
                  </span>
                </div>

                <div>
                  <span className="text-gray-900 font-semibold">Birthday:</span>
                  <span className="ml-2 text-gray-600">
                    {viewedEmployee
                      ? `${formatDate(viewedEmployee.birthDate)} `
                      : "Loading..."}
                  </span>
                </div> */}

                <div>
                  <span className="text-gray-900 font-semibold">Gender:</span>
                  <span className="ml-2 text-gray-600">
                    {viewedEmployee
                      ? `${viewedEmployee.gender.name}`
                      : "Loading..."}
                  </span>
                </div>
              </section>

              <section className="grid grid-rows gap-y-4">
                <div>
                  <span className="text-gray-900 font-semibold">Phone:</span>
                  <span className="ml-2 text-gray-600">
                    {viewedEmployee
                      ? `${viewedEmployee.mobileNo} `
                      : "Loading..."}
                  </span>
                </div>

                <div>
                  <span className="text-gray-900 font-semibold">Email:</span>
                  <span className="ml-2 text-gray-600">
                    {viewedEmployee ? `${viewedEmployee.email} ` : "Loading..."}
                  </span>
                </div>

                <div>
                  <span className="text-gray-900 font-semibold">Team:</span>
                  <span className="ml-2 text-gray-600">
                    {viewedEmployee
                      ? `${viewedEmployee.team.name} `
                      : "Loading..."}
                  </span>
                </div>

                <div>
                  <span className="text-gray-900 font-semibold">Address:</span>
                  <span className="ml-2 text-gray-600">
                    {viewedEmployee
                      ? `${viewedEmployee.addressForeign} ${viewedEmployee.location}`
                      : "Loading..."}
                  </span>
                </div>

                <div>
                  <span className="text-gray-900 font-semibold">
                    Reports To:
                  </span>
                  <span className="ml-2 text-gray-600">
                    {viewedEmployee
                      ? `${viewedEmployee.immediateSuperior}`
                      : "Loading..."}
                  </span>
                </div>
              </section>
            </div>
          </div>
         
          <div className="flex space-x-4 p-8 bg-gray-50 rounded-b-lg">
            {hasRoles([
              Roles.SuperAdmin,
              Roles.HRMSAdmin,
              Roles.SrOperationsManager,
              Roles.HRManagerAdmin,
            ]) && (
              <>
                <button
                  onClick={() => setShowUpdatePasswordModal(true)}
                  className="p-4 text-sm font-semibold text-white transition-colors bg-teal-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 hover:bg-teal-700"
                >
                  Manual Password Update (Admin)
                </button>
              

                {/* hide for everyone until we have confirmation to enable it for all employees */}
                {employeeObj.employeeCode == employeeCode && (
                  <div>
                    <button
                      className="bg-amber-500 focus:ring-amber-500 hover:bg-amber-600 flex-1 p-4 text-sm font-semibold text-white  rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                      onClick={handleOpenEditModal}
                    >
                      Edit Profile
                    </button>
                  </div>
                )}

               
              </>
            )}
          </div>
        </div>
      </div>

      <Box marginTop={2}>
        <Grid container spacing={2}>
          {/* Top Action Buttons */}

          {/* Timesheet and Actions */}
          <Grid item xs={12}>
            <Tabs employeeCode={employeeCode!} />
          </Grid>
          <Grid item xs={12}>
            <div>
              <Modal
                open={openMoveModal}
                onClose={handleCloseMoveModal}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
                className="modal m-10"
              >
                <div className="modal-content rounded-md bg-white p-10">
                  <h2 id="modal-title">Move Employee</h2>

                  <MoveEmployeeForm onClose={handleCloseMoveModal} />
                </div>
              </Modal>
              <Modal
                open={openWrtModal}
                onClose={handleCloseWrtModal}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
                className="modal m-10"
              >
                <div className="modal-content rounded-md bg-white p-10">
                  <WorkResumptionTracker />
                </div>
              </Modal>

              
            </div>
          </Grid>
          <Modal
            open={openEditModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            onClose={handleCloseEditModal}
          >
            <div className="modal-content rounded-md bg-white p-10">
              <h2 id="modal-title">Edit Employee</h2>
              <Register
                onClose={handleCloseEditModal}
                record={viewedEmployee}
                editMode={true}
              />
            </div>
          </Modal>

          {/* Bottom Sections */}
        </Grid>
      </Box>

      {/* Termination Confirm Modal */}
      <ConfirmationModal
        open={openTerminateModal}
        onClose={() => setOpenTerminateModal(false)}
        onConfirm={() => {}}
        title={
          attritionType == AttritionType.Resignation
            ? "Submit Resignation"
            : "Terminate Employee"
        }
        confirmButtonColor="error"
        confirmButtonText={
          attritionType == AttritionType.Resignation
            ? "Yes, Resign"
            : "Yes, Terminate"
        }
        cancelButtonText="No, Cancel"
        noActions={true}
        content={
          <TerminateEmployeeForm
            employeeCode={employeeCode}
            attritionType={attritionType}
            sendModalCloseRequest={handleChildModalChanges}
          />
        }
      />

      {/* Toggle MFA Confirm Modal */}
      <ConfirmationModal
        title="Toggle MFA Settings"
        content="Are you sure you want to update MFA settings?"
        confirmButtonText="Toggle MFA"
        cancelButtonText="Close"
        open={showMfaModal}
        onConfirm={() =>
          viewedEmployee && viewedEmployee.twoFactorEnabled
            ? handleDisableMFA()
            : handleEnableMFA()
        }
        onClose={() => setShowMfaModal(false)}
      />

      {/* Update Password Confirm Modal */}
      <ConfirmationModal
        title="Manual Password Update"
        content="Are you sure you want to manually update this user's password?"
        confirmButtonText="Update Password"
        cancelButtonText="Close"
        open={showUpdatePasswordModal}
        onConfirm={handleUpdatePassword}
        onClose={() => setShowUpdatePasswordModal(false)}
      />
    </>
  );
};

export default EmployeeProfile;
