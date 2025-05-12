import React from "react";
import { useNavigate } from "react-router-dom";

// Icon imports
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PostAddOutlinedIcon from "@mui/icons-material/PostAddOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import MoveUpOutlinedIcon from "@mui/icons-material/MoveUpOutlined";
import SecurityIcon from "@mui/icons-material/Security";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupIcon from "@mui/icons-material/Group";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { Employee } from "../../interfaces/Employee";

const ItDashboardComponent = () => {
  const navigate = useNavigate(); // Use useNavigate hook
  const employee = useSelector((state: RootState) => {
    if (!!sessionStorage.getItem("employee")) {
      return JSON.parse(
        atob(sessionStorage.getItem("employee") as string)
      ) as Employee;
    } else {
      console.error("Unable to find logged in user information");
    }
  });
  const itemployeeSidebarItems = [
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
      title: "Misc Management",
      navigate: "/miscmanagement",
      Icon: MiscellaneousServicesIcon,
      permission: "Employees",
    },
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
      title: "Requests Forms",
      navigate: "/hrrequests",
      Icon: PostAddOutlinedIcon,
      permission: "HRRequest",
    },
    // {
    //   title: "My TimeSheets",
    //   navigate: "/managetimesheet",
    //   Icon: AccessTimeIcon,
    //   permission: "TimeSheet",
    // },
    {
      title: "My Requests",
      navigate: "/managerequests",
      Icon: PostAddOutlinedIcon,
      permission: "HRRequest",
    },
    {
      title: "My Leaves",
      navigate: "/manageleave",
      Icon: FolderOpenIcon,
      permission: "LeaveTrackers",
    },
    {
      title: "My Disciplinary Actions",
      navigate: "/managedisciplinary",
      Icon: GavelOutlinedIcon,
      permission: "DisciplinaryTrackers",
    },
    {
      title: "My History",
      navigate: "/managemoves",
      Icon: MoveUpOutlinedIcon,
      permission: "SuspendedPullOutFloating",
    },
    {
      title: "AWS S3",
      navigate: "/aws-s3",
      Icon: SecurityIcon,
      permission: "S3",
    },
    {
      title: "Permissions",
      navigate: "/Permissions",
      Icon: SecurityIcon,
      permission: "Permissions",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path); // Use navigate function to change route
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-6 p-6 bg-gray-100">
      {itemployeeSidebarItems.map((item) => (
        <button
          key={item.title}
          className="w-52 h-52 rounded-lg flex flex-col items-center justify-center p-4 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-800 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 shadow-lg"
          onClick={() => handleNavigation(item.navigate)}
          aria-label={`Navigate to ${item.title}`}
          style={{
            backgroundColor: "#ffa64d",
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

export default ItDashboardComponent;
