import { useState } from "react";
import { Outlet } from "react-router";
import AppSidebar from "@/components/layout/AppSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";

function DashboardLayout() {
  const [userAvailability, setUserAvailability] = useState("Available");
  const [searchQuery, setSearchQuery] = useState("");

  function toggleAvailability() {
    setUserAvailability((current) => current === "Available" ? "Away" : "Available");
  }

  return (
    <div className="min-h-svh bg-white font-sans text-[#111827] pl-[68px] lg:pl-[205px]">
      <AppSidebar
        onToggleAvailability={toggleAvailability}
        userAvailability={userAvailability}
      />
      <div className="min-w-0 flex-1">
        <DashboardHeader
          onToggleAvailability={toggleAvailability}
          onSearchQueryChange={setSearchQuery}
          searchQuery={searchQuery}
          userAvailability={userAvailability}
        />
        <Outlet context={{ searchQuery }} />
      </div>
    </div>
  );
}

export default DashboardLayout;
