import AccountBoxIcon from "@mui/icons-material/AccountBox";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EqualizerOutlinedIcon from "@mui/icons-material/EqualizerOutlined";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import GroupIcon from "@mui/icons-material/Group";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import MoveUpOutlinedIcon from "@mui/icons-material/MoveUpOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PostAddOutlinedIcon from "@mui/icons-material/PostAddOutlined";
import SecurityIcon from "@mui/icons-material/Security";
import WorkIcon from "@mui/icons-material/Work";
import { useNavigate } from "react-router-dom";
import PermissionManager from "../../app/PermissionManager ";

const HSDashboardComponent = () => {
  const navigate = useNavigate(); // Use useNavigate hook
  const employee = PermissionManager.EmployeeObj();
  const HSemployeeSidebarItems = [
    {
      title: "Register",
      navigate: "/register",
      Icon: PersonAddIcon,
      permission: "Account",
    },
    {
      title: "Employees",
      navigate: "/manageemployee",
      Icon: GroupIcon,
      permission: "Employees",
    },
    {
      title: "Profile",
      navigate: `/employeeProfile/${employee?.employeeCode}`,
      Icon: AccountBoxIcon,
      permission: "Employees",
    },
    {
      title: "Leave Management",
      navigate: "/manageleave",
      Icon: FolderOpenIcon,
      permission: "LeaveTrackers",
    },
    {
      title: "Misc Management",
      navigate: "/miscmanagement",
      Icon: MiscellaneousServicesIcon,
      permission: "Employees",
    },
    // {
    //   title: "Job Offer Tracker",
    //   navigate: "/joboffertracker",
    //   Icon: WorkIcon,
    //   permission: "JobOfferTrackers",
    // },
    {
      title: "Permissions",
      navigate: "/Permissions",
      Icon: SecurityIcon,
      permission: "Permissions",
    },
    {
      title: "Role Permissions",
      navigate: "/rolepermissions",
      Icon: AdminPanelSettingsIcon,
      permission: "Permissions",
    },
    {
      title: "AWS S3",
      navigate: "/aws-s3",
      Icon: SecurityIcon,
      permission: "S3",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path); // Use navigate function to change route
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-6 p-6 bg-gray-100">
      {HSemployeeSidebarItems.map((item) => (
        <button
          key={item.title}

          className="w-52 h-52 rounded-lg flex flex-col items-center justify-center p-4 hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-green-800 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 shadow-lg"
          onClick={() => handleNavigation(item.navigate)}
          aria-label={`Navigate to ${item.title}`}
          style={{
            backgroundColor: "#e76818",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <item.Icon className="text-white text-4xl mb-2" />
          <span className="text-white font-semibold text-base">
            {item.title}
          </span>
        </button>
      ))}
    </div>
  );
};

export default HSDashboardComponent;
