import React, { useState } from "react";
import TimeSheet from "../Pages/HR Admin/ManageTimeSheet";
import ManageLeave from "../Pages/HR Admin/LeaveManagement/ManageLeave";
import EmployeeHistory from "../Pages/Employee/EmployeeHistory";
import ManageDisciplinary from "../Pages/Disciplinary/ManageDisciplinary";
import LeaveBalances from "./LeaveBalances";
import ManageMove from "../Pages/HR Admin/ManageMove";

interface TabContentProps {
  content: JSX.Element;
}

const TabContent: React.FC<TabContentProps> = ({ content }) => {
  return (
    <div className="mt-5 p-5 bg-gray-100 rounded-lg w-full">{content}</div>
  );
};

interface TabsComponentProps {
  employeeCode: string;
}

const TabsComponent: React.FC<TabsComponentProps> = ({ employeeCode }) => {
  const tabContent = {
    timeManagement: (
      <div>
        {/* <h3 className="text-lg font-semibold">Time Management</h3>
        <p>Details about managing your time effectively.</p> */}
        <TimeSheet employeeCode={employeeCode} />
      </div>
    ),
    leaveManagement: (
      <div>
        {/* <h3 className="text-lg font-semibold">Sick Leaves</h3>
        <p>Information on sick leave policies and procedures.</p> */}
        <ManageLeave employeeCode={employeeCode} />
      </div>
    ),

    employeeHistory: (
      <div>
        {/* <h3 className="text-lg font-semibold">Sick Leaves</h3>
        <p>Information on sick leave policies and procedures.</p> */}
        <ManageMove employeeCode={employeeCode} />
      </div>
    ),

    disciplinaryActions: (
      <div>
        <ManageDisciplinary employeeCode={employeeCode} />
      </div>
    ),
    leaveBalances: (
      <div>
        <LeaveBalances employeeCode={employeeCode} />
      </div>
    ),
  };

  type TabKey = keyof typeof tabContent;

  const tabs = [
    { name: "Time Management", key: "timeManagement" },
    { name: "Leave Management", key: "leaveManagement" },
    { name: "Leave Balances", key: "leaveBalances" },
  ];

  const [activeTab, setActiveTab] = useState<TabKey>("timeManagement");

  return (
    <div>
      <div className="w-full h-20 px-7 py-5 bg-white rounded-lg flex justify-start items-center gap-5">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className="flex-col justify-center items-center gap-1 inline-flex cursor-pointer"
            onClick={() => setActiveTab(tab.key as TabKey)}
          >
            <div
              className={`text-lg font-bold ${
                tab.key === activeTab ? "text-blue-600" : "text-neutral-800"
              } ${
                tab.key !== activeTab ? "text-blue-600" : ""
              }`}
            >
              {tab.name}
            </div>
            <div
              className={`self-stretch w-full mt-1 h-1 rounded-lg ${
                tab.key === activeTab ? "bg-blue-600" : "bg-transparent"
              }`}
            />
          </div>
        ))}
      </div>

      <TabContent content={tabContent[activeTab]} />
    </div>
  );
};

export default TabsComponent;
