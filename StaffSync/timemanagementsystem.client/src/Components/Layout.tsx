import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = () => {
  const [open, setOpen] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Determine the appropriate margin class based on the sidebar state
  // const mainContentMarginClass = open ? "ml-[240px]" : "ml-0";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-custom-bg">
      <Header handleDrawerToggle={handleDrawerToggle} open={open} />
      <div className="flex flex-grow overflow-hidden">
        <Sidebar open={open} handleDrawerToggle={handleDrawerToggle} />
        {/* Apply the dynamic margin class here */}
        <main className={`flex-grow p-3  overflow-auto pt-20 `}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
