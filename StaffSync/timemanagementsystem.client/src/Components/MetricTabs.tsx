import React, { useState } from "react";
import AbsenteeismRates from "../Pages/HRMetrics/AbsenteeismRates";
import AttritionRate from "../Pages/HRMetrics/AttritionRate";
import Headcounts from "../Pages/HRMetrics/Headcounts";

const MetricTabs: React.FC = () => {
  // Define the list of tabs and the corresponding components they should render.
  const tabs = [
    { name: "Absenteeism Rates", component: <AbsenteeismRates /> },
    { name: "Headcounts", component: <Headcounts /> },
    { name: "Attrition Rate", component: <AttritionRate /> },
  ];

  // State to keep track of the currently active tab.
  const [activeTab, setActiveTab] = useState<number>(0);

  // Function to render the component corresponding to the active tab.
  const renderActiveTabComponent = () => {
    return tabs[activeTab].component;
  };

  return (
    <div className="font-sans">
      <div className="flex justify-around bg-white p-4 rounded-md">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`px-4 py-2 font-medium text-sm transition duration-300 ease-in-out ${
              index === activeTab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-800 hover:text-blue-600 hover:border-b-2 hover:border-blue-600"
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <div className="pt-5 border-t border-gray-300">
        {renderActiveTabComponent()}
      </div>
    </div>
  );
};

export default MetricTabs;
