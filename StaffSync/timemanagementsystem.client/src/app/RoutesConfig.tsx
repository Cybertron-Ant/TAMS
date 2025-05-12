import { Navigate } from "react-router-dom";
import ForgotPassword from "../AuthPages/ForgotPassword";
import Login from "../AuthPages/Login";
import ManualUpdatePassword from "../AuthPages/ManualUpdatePassword";
import MfaVerification from "../AuthPages/MfaVerification";
import ProtectedRoute from "../AuthPages/ProtectedRoute";
import Register from "../AuthPages/Register";
import ResendConfirmation from "../AuthPages/ResendConfirmationEmail";
import UpdatePassword from "../AuthPages/UpdatePassword";
import Layout from "../Components/Layout";
import MiscManagement from "../Pages/MiscManagement/MiscManagement";
import AWSS3 from "../Pages/AWSS3/AwsS3";
import AWSS3Detail from "../Pages/AWSS3/AwsS3Detail";
import AuditTrail from "../Pages/AuditTrail/AuditTrail";
import Dashboard from "../Pages/Dashboard/Dashboard";
import EmployeeProfile from "../Pages/Employee/EmployeeProfile";
import RequestHRDocument from "../Pages/Employee/RequestHRDocument";
import Settings from "../Pages/Settings";
import Users from "../Pages/Employee/Users";
import RestrictedPage from "../Pages/RestrictedPage";
import JobOfferTracker from "../Pages/JobOfferTracker/JobOfferTracker";
import ManageHRRequests from "../Pages/HR Admin/ManageHRRequests";
import HRMetricsDisplay from "../Pages/HR Admin/HRMetricsDisplay";
import PunchTimeSheet from "../Pages/HR Admin/PunchTimeSheet";
import RequestLeave from "../Pages/Employee/RequestLeave";
import ManageMove from "../Pages/HR Admin/ManageMove";
import ManageLeave from "../Pages/HR Admin/LeaveManagement/ManageLeave";
import RecruitmentTracker from "../Pages/Recruitement/RecruitmentTracker";
import RecruitmentTrackerDetail from "../Pages/Recruitement/RecruitmentTrackerDetail";
import ManageDisciplinary from "../Pages/Disciplinary/ManageDisciplinary";
import ViewDisciplinary from "../Pages/Disciplinary/ViewDisciplinary";
import RolePermissions from "../Pages/Permissions/RolePermissions";
import WorkResumptionTracterList from "../Pages/WorkResumptionTracker/WorkResumptionTracterList";
import TimeSheet from "../Pages/HR Admin/ManageTimeSheet";
import ManageTimeSheet from "../Pages/HR Admin/ManageTimeSheet";
import Permissions from "../Pages/Permissions/Permissions";
import TimeSheetForm from "../Pages/HR Admin/TimeSheetForm";
import ResetPassword from "../AuthPages/ResetPassword";
import { hasRoles } from "./roleManager";
import Roles from "../enums/Roles";

/**
 * @typedef {Object} RouteConfigItem
 * @param {string} path - The path of the route.
 * @param {any} element - The React element to be rendered for the route.
 * @param {any} layout - The layout to be used for the route.
 * @param {string} title - The title of the route.
 * @param {string} description - The description of the route.
 * @param {string[]} [permissions] - (Optional) If nothing is supplied the item won't be apart of the global list. The permissions required to display a route in the global search list.
 */
interface RouteConfigItem {
  path: string;
  element: any;
  layout: any;
  title: string;
  description: string;
  permissions?: string[];
}

// Misc
// AWS
// Register

const RoutesConfig = (employeeObj: { [K: string]: any }): RouteConfigItem[] => {
  return employeeObj
    ? [
        {
          path: "/login",
          element: <Login />,
          layout: "",
          title: "Login",
          description: "Login Page",
        },
        {
          path: "/forgot-password",
          element: <ForgotPassword />,
          layout: "",
          title: "Forgot Password",
          description: "Reset your password if you forgot it",
        },
        {
          path: "/reset-password",
          element: <ResetPassword />,
          layout: "",
          title: "Reset Password",
          description: "Reset your password if you forgot it",
        },
        {
          path: "/resendemail",
          element: <ResendConfirmation />,
          layout: "",
          title: "Resend Email Confirmation",
          description: "Resend the confirmation email",
        },
        {
          path: "/login-mfa",
          element: <MfaVerification />,
          layout: "",
          title: "Multi-factor Authentication",
          description: "Verify your identity with MFA",
        },
        {
          path: "/login-mfa/:empCode",
          element: <MfaVerification />,
          layout: "",
          title: "Multi-factor Authentication",
          description: "Verify your identity with MFA for specific employee",
        },
        {
          path: "/update-password",
          element: (
            <ProtectedRoute permissionsRequired={["Employees"]}>
              <UpdatePassword />
            </ProtectedRoute>
          ),
          layout: "",
          title: "Update Password",
          description: "Change your current password",
          permissions: ["Employees"],
        },
        {
          path: "/admin/update-password/:employeeCode",
          element: (
            <ProtectedRoute permissionsRequired={["Employees"]}>
              <ManualUpdatePassword />
            </ProtectedRoute>
          ),
          layout: "",
          title: "Admin Update Password",
          description: "Admin page to update user passwords manually",
        },
        {
          path: "/register",
          element: (
            <ProtectedRoute permissionsRequired={["Account"]}>
              <Register onClose={() => {}} />
            </ProtectedRoute>
          ),
          layout: <Layout />,
          title: "Register",
          description: "Create a new account",
        },
        {
          path: "/dashboard",
          element: (
            <ProtectedRoute permissionsRequired={["Employees"]}>
              <Dashboard />
            </ProtectedRoute>
          ),
          layout: <Layout />,
          title: "Dashboard",
          description: "View your dashboard",
          permissions: ["Employees"],
        },
        {
          path: "/manageemployee",
          element: employeeObj.employeePermissions.includes("Employees") ? (
            <ProtectedRoute permissionsRequired={["Employees"]}>
              <Users />
            </ProtectedRoute>
          ) : (
            <RestrictedPage />
          ),
          layout: <Layout />,
          title: "Manage Employees",
          description: "Manage employee records and details",
          permissions: ["Employees"],
        },
        {
          path: `/employeeProfile/:employeeCode`,
          element: (
            <ProtectedRoute permissionsRequired={["Employees"]}>
              <EmployeeProfile />
            </ProtectedRoute>
          ),
          layout: <Layout />,
          title: "Employee Profile",
          description: "View or update employee profiles",
        },
        {
          path: "/hrrequests",
          element: (
            <ProtectedRoute permissionsRequired={["HRRequest"]}>
              <RequestHRDocument />
            </ProtectedRoute>
          ),
          layout: <Layout />,
          title: "HR Requests",
          description: "View HR Requests",
          permissions: ["HRRequest"],
        },
        {
          path: "/managerequests",
          element: employeeObj.employeePermissions.includes("Employees") ? (
            <ProtectedRoute permissionsRequired={["HRRequest"]}>
              <ManageHRRequests employeeCode={employeeObj.employeeCode} />
            </ProtectedRoute>
          ) : (
            <RestrictedPage />
          ),
          layout: <Layout />,
          title: "Manage HR Requests",
          description: "Access to Manage HR Requests",
          permissions: ["HRRequest"],
        },
        {
          path: "/edit-hr-request",
          element: employeeObj.employeePermissions.includes("Employees") ? (
            <ProtectedRoute permissionsRequired={["HRRequest"]}>
              <RequestHRDocument title="Edit HR Request" />
            </ProtectedRoute>
          ) : (
            <RestrictedPage />
          ),
        layout: <Layout />,
          title: "Edit HR Request",
          description: "Edit an existing HR request",
          permissions: ["HRRequest"],
        },
        {
          path: "/view-hr-request",
          element: employeeObj.employeePermissions.includes("Employees") ? (
            <ProtectedRoute permissionsRequired={["HRRequest"]}>
              <RequestHRDocument title="View HR Request" />
            </ProtectedRoute>
          ) : (
            <RestrictedPage />
          ),
          layout: <Layout />,
          title: "View HR Request",
          description: "View details of an HR request",
          permissions: ["HRRequest"],
        },
      
        {
          path: "/punchtimesheetform",
          element: employeeObj.employeePermissions.includes("Employees") ? (
            <ProtectedRoute permissionsRequired={["TimeSheet"]}>
              <PunchTimeSheet />
            </ProtectedRoute>
          ) : (
            <RestrictedPage />
          ),
          layout: <Layout />,
          title: "Punch Time Sheet",
          description: "Access to punch time sheet form",
          permissions: ["TimeSheet"],
        },
        {
          path: "/sickcallout",
          element: (
            <ProtectedRoute permissionsRequired={["LeaveTrackers"]}>
              <RequestLeave />
            </ProtectedRoute>
          ),
          layout: <Layout />,
          title: "Request Leave",
          description: "Request Leave",
          permissions: ["LeaveTrackers"],
        },
        {
          path: "/manageleave",
          element: employeeObj.employeePermissions.includes("LeaveTrackers") ? (
            <ProtectedRoute permissionsRequired={["Employees"]}>
              {hasRoles([
                Roles.SuperAdmin,
                Roles.HRMSAdmin,
                Roles.HRManagerAdmin,
                Roles.SrOperationsManager,
              ]) ? (
                <ManageLeave />
              ) : (
                <ManageLeave employeeCode={employeeObj.employeeCode} />
              )}
            </ProtectedRoute>
          ) : (
            <RestrictedPage />
          ),
          layout: <Layout />,
          title: "Manage Leave",
          description: "Manage leave for specific employee",
          permissions: ["Employees"],
        },
       
        {
          path: "/auditTrails",
          element: (
            <ProtectedRoute permissionsRequired={["AuditTrail"]}>
              <AuditTrail />
            </ProtectedRoute>
          ),
          layout: <Layout />,
          title: "Audit Trails",
          description: "Audit Trails Overview",
          permissions: ["AuditTrail"],
        },
        
        {
          path: "/rolepermissions",
          element: (
            <ProtectedRoute permissionsRequired={["RolePermissions"]}>
              <RolePermissions />
            </ProtectedRoute>
          ),
          layout: <Layout />,
          title: "Role Permissions",
          description: "Access Role Permissions",
          permissions: ["RolePermissions"],
        },

        {
          path: "/miscmanagement",
          element: (
            <ProtectedRoute permissionsRequired={["Employees"]}>
              {hasRoles([
                Roles.SuperAdmin,
                Roles.HRMSAdmin,
                Roles.HRManagerAdmin,
                Roles.SrOperationsManager,
              ]) ? (
                <MiscManagement />
              ) : (
                <RestrictedPage />
              )}
            </ProtectedRoute>
          ),
          // <MiscManagement />
          layout: <Layout />,
          title: "Misc Management",
          description: "Access Misc Management",
        },
        {
          path: "/aws-s3",
          element: (
            <ProtectedRoute permissionsRequired={["S3"]}>
              {hasRoles([
                Roles.SuperAdmin,
                Roles.HRMSAdmin,
                Roles.HRManagerAdmin,
                Roles.SrOperationsManager,
              ]) ? (
                <AWSS3 />
              ) : (
                <RestrictedPage />
              )}
            </ProtectedRoute>
          ),
          layout: <Layout />,
          title: "S3",
          description: "Access AWS S3",
        },
        {
          path: "/aws-s3/:fileName",
          element: (
            <ProtectedRoute permissionsRequired={["S3"]}>
              {hasRoles([
                Roles.SuperAdmin,
                Roles.HRMSAdmin,
                Roles.HRManagerAdmin,
                Roles.SrOperationsManager,
              ]) ? (
                <RestrictedPage />
              ) : (
                <AWSS3Detail />
              )}
            </ProtectedRoute>
          ),
          layout: <Layout />,
          title: "S3 file",
          description: "Access AWS S3 file",
        },
        {
          path: "/managetimesheet",
          element: (
            <ProtectedRoute permissionsRequired={["TimeSheet"]}>
              {hasRoles([
                Roles.SuperAdmin,
                Roles.HRMSAdmin,
                Roles.HRManagerAdmin,
                Roles.SrOperationsManager,
              ]) ? (
                <TimeSheet employeeCode={employeeObj.employeeCode} />
              ) : (
                <ManageTimeSheet />
              )}
            </ProtectedRoute>
          ),
          layout: <Layout />,
          title: "Manage Time Sheet",
          description: "Oversee and edit time sheets",
          permissions: ["TimeSheet"],
        },
        {
          path: "/settings",
          element: (
            <ProtectedRoute permissionsRequired={["Account"]}>
              {hasRoles([
                Roles.SuperAdmin,
                Roles.HRMSAdmin,
                Roles.HRManagerAdmin,
                Roles.SrOperationsManager,
              ]) ? (
                <Settings />
              ) : (
                <RestrictedPage />
              )}
            </ProtectedRoute>
          ),
          layout: <Layout />,
          title: "Manage Time Sheet",
          description: "Oversee and edit time sheets",
        },
        {
          path: "/edittimesheet",
          element: (
            <ProtectedRoute permissionsRequired={["TimeSheet"]}>
              <TimeSheetForm />
            </ProtectedRoute>
          ),
          layout: <Layout />,
          title: "Edit Time Sheet",
          description: "edit time sheets",
        },
        {
          path: "/permissions",
          element: (
            <ProtectedRoute permissionsRequired={["Permissions"]}>
              <Permissions />
            </ProtectedRoute>
          ),
          layout: <Layout />,
          title: "Permissions",
          description: "Oversee and edit Permissions",
          permissions: ["Permissions"],
        },
        {
          path: "/*",
          element: <Navigate to="/dashboard" />,
          layout: <Layout />,
          title: "Redirect to Dashboard",
          description: "Navigating to dashboard as default route",
        },
      ]
      : [
        {
          path: "/login",
          element: <Login />,
          layout: "",
          title: "Login",
          description: "Login Page",
        },
        {
          path: "/*",
          element: <Navigate to="/login" />,
          layout: <Layout />,
          title: "Redirect to Dashboard",
          description: "Navigating to dashboard as default route",
        },
        // {
        //   path: "/forgot-password",
        //   element: <ForgotPassword />,
        //   layout: "",
        //   title: "Forgot Password",
        //   description: "Reset your password if you forgot it",
        // },
        // {
        //   path: "/reset-password",
        //   element: <ResetPassword />,
        //   layout: "",
        //   title: "Reset Password",
        //   description: "Reset your password if you forgot it",
        // },
        // {
        //   path: "/resendemail",
        //   element: <ResendConfirmation />,
        //   layout: "",
        //   title: "Resend Email Confirmation",
        //   description: "Resend the confirmation email",
        // },
        // {
        //   path: "/login-mfa",
        //   element: <MfaVerification />,
        //   layout: "",
        //   title: "Multi-factor Authentication",
        //   description: "Verify your identity with MFA",
        // },
        // {
        //   path: "/login-mfa/:empCode",
        //   element: <MfaVerification />,
        //   layout: "",
        //   title: "Multi-factor Authentication",
        //   description: "Verify your identity with MFA for specific employee",
        // },
      ];
};

export { RoutesConfig };
