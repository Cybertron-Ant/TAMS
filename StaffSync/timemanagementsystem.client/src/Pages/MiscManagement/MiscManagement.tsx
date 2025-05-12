import React, { useState } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BusinessIcon from "@mui/icons-material/Business";
import BadgeIcon from "@mui/icons-material/Badge";
import WcIcon from "@mui/icons-material/Wc";
import Groups2Icon from "@mui/icons-material/Groups2";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import GroupIcon from "@mui/icons-material/Group";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import ControlCameraIcon from "@mui/icons-material/ControlCamera";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import ResourceManagement from "./Components/ResourceManagement";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";

const API_URL = import.meta.env.VITE_TMS_PROD;
// Configuration mapping for each management option
const resourceConfigurations = {
  "Manage Attendance": {
    resourceName: "Attendance",
    fetchUrl: `${API_URL}/Attendances`,
    createUrl: `${API_URL}/Attendances`,
    updateUrl: `${API_URL}/Attendances/:id`,
    deleteUrlTemplate: `${API_URL}/Attendances/:id`,
  },
  "Manage Departments": {
    resourceName: "Department",
    fetchUrl: `${API_URL}/Departments`,
    createUrl: `${API_URL}/Departments`,
    updateUrl: `${API_URL}/Departments/:id`,
    deleteUrlTemplate: `${API_URL}/Departments/:id`,
  },
  "Manage Employment Types": {
    resourceName: "EmploymentType",
    fetchUrl: `${API_URL}/EmploymentType`,
    createUrl: `${API_URL}/EmploymentType`,
    updateUrl: `${API_URL}/EmploymentType/:id`,
    deleteUrlTemplate: `${API_URL}/EmploymentType/:id`,
  },
  "Manage Genders": {
    resourceName: "Gender",
    fetchUrl: `${API_URL}/Genders`,
    createUrl: `${API_URL}/Genders`,
    updateUrl: `${API_URL}/Genders/:id`,
    deleteUrlTemplate: `${API_URL}/Genders/:id`,
  },
  "Manage Teams": {
    resourceName: "Team",
    fetchUrl: `${API_URL}/Team`,
    createUrl: `${API_URL}/Team`,
    updateUrl: `${API_URL}/Team/:id`,
    deleteUrlTemplate: `${API_URL}/Team/:id`,
  },
  "Manage Leave Balance Defaults": {
    resourceName: "LeaveBalanceDefaults",
    fetchUrl: `${API_URL}/LeaveBalanceDefaults`,
    createUrl: `${API_URL}/LeaveBalanceDefaults`,
    updateUrl: `${API_URL}/LeaveBalanceDefaults/:id`,
    deleteUrlTemplate: `${API_URL}/LeaveBalanceDefaults/:id`,
  },
  "Manage Marital Status": {
    resourceName: "MaritalStatus",
    fetchUrl: `${API_URL}/MaritalStatus`,
    createUrl: `${API_URL}/MaritalStatus`,
    updateUrl: `${API_URL}/MaritalStatus/:id`,
    deleteUrlTemplate: `${API_URL}/MaritalStatus/:id`,
  },
  "Manage Break Types": {
    resourceName: "BreakType",
    fetchUrl: `${API_URL}/BreakType`,
    createUrl: `${API_URL}/BreakType`,
    updateUrl: `${API_URL}/BreakType/:id`,
    deleteUrlTemplate: `${API_URL}/BreakType/:id`,
  },
  "Manage Positions": {
    resourceName: "Position",
    fetchUrl: `${API_URL}/PositionCodes`,
    createUrl: `${API_URL}/PositionCodes`,
    updateUrl: `${API_URL}/PositionCodes/:id`,
    deleteUrlTemplate: `${API_URL}/PositionCodes/:id`,
  },

  // Add more configurations as needed
};

const MiscManagement = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [isResourceVisible, setIsResourceVisible] = useState(true);

  const managementOptions = [
    { name: "Manage Attendance", Icon: AccessTimeIcon },
    { name: "Manage Departments", Icon: BusinessIcon },
    { name: "Manage Employment Types", Icon: BadgeIcon },
    { name: "Manage Genders", Icon: WcIcon },
    { name: "Manage Teams", Icon: Groups2Icon },
    { name: "Manage Leave Balance Defaults", Icon: ExitToAppIcon },
    { name: "Manage Marital Status", Icon: GroupIcon },
    { name: "Manage Break Types", Icon: IndeterminateCheckBoxIcon },
    { name: "Manage Positions", Icon: ControlCameraIcon },
    // Add more options as needed
  ];

  const handleOptionClick = (optionName) => {
    setSelectedOption(optionName);
    setIsResourceVisible(true);
  };

  const handleCloseResource = () => {
    setIsResourceVisible(false);
  };

  // Render the ResourceManagement component based on the selected option
  const renderResourceManagement = () => {
    const config = resourceConfigurations[selectedOption];
    if (config && isResourceVisible) {
      return (
        <div className="pb-10">
          <ResourceManagement
            resourceName={config.resourceName}
            fetchUrl={config.fetchUrl}
            createUrl={config.createUrl}
            updateUrl={config.updateUrl}
            deleteUrlTemplate={config.deleteUrlTemplate}
            onClose={handleCloseResource}
          />
        </div>
      );
    }

    // Return a default view or null if no option is selected or if the option doesn't match
    return null;
  };

  return (
    <>
      <div className="mb-4">
        <div className="text-3xl text-neutral-800 font-bold mt-2">
          Miscellaneous Management
        </div>
        <div className="inline-flex items-center gap-1 text-base text-neutral-800 font-normal leading-loose">
          <span className="opacity-60">Dashboard</span>
          <span className="opacity-60">/</span>
          <span>miscellaneous</span>
        </div>
      </div>
      {renderResourceManagement()}
      <div className="flex flex-wrap gap-4 justify-center p-5 bg-white h-full rounded-lg">
        {managementOptions.map((option, index) => (
          <div
            key={index}
            className="w-1/5 flex flex-col justify-center items-center bg-blue-100 text-gray-700 px-4 py-2 rounded-md border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={() => handleOptionClick(option.name)}
          >
            <option.Icon className="mb-2 text-blue-500" fontSize="large" />
            <span className="text-sm font-medium hover:text-blue-600 transition-colors duration-300">
              {option.name}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default MiscManagement;
