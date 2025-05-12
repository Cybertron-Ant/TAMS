import { useNavigate } from "react-router-dom";

// Icon imports
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import MoveUpOutlinedIcon from "@mui/icons-material/MoveUpOutlined";
import PostAddOutlinedIcon from "@mui/icons-material/PostAddOutlined";
import PermissionManager from "../../app/PermissionManager ";
import { Employee } from "../../interfaces/Employee";

const EmDashboardComponent = () => {
  const navigate = useNavigate(); // Use useNavigate hook
  const employee: Employee = PermissionManager.EmployeeObj()
  const employeeSidebarItems = [
    {
      title: "Profile",
      navigate: `/employeeProfile/${employee?.employeeCode}`,
      Icon: AccountBoxIcon,
      permission: "Employees",
    },
    {
      title: "Leave Forms",
      navigate: "/sickcallout",
      Icon: FolderOpenIcon,
      permission: "LeaveTrackers",
    },
    {
      title: "My TimeSheets",
      navigate: "/managetimesheet",
      Icon: AccessTimeIcon,
      permission: "TimeSheet",
    },
    {
      title: "My Leaves",
      navigate: "/manageleave",
      Icon: FolderOpenIcon,
      permission: "LeaveTrackers",
    },
   
  ];

  const handleNavigation = (path) => {
    navigate(path); // Use navigate function to change route
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-6 p-6 bg-gray-100 w-screen">
      <div className="card-grid grid grid-cols-2 gap-6">
      {employeeSidebarItems.map((item) => (
        <button
          key={item.title}
          className="w-52 h-52 rounded-lg flex flex-col items-center justify-center p-4 hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-green-800 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 shadow-lg"
          onClick={() => handleNavigation(item.navigate)}
          aria-label={`Navigate to ${item.title}`}
          style={{
            backgroundColor: "#249ca7",
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
    </div>
  );
};

export default EmDashboardComponent;
