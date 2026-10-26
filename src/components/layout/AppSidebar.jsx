import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import { Check, ChevronDown, Plus, Settings } from "lucide-react";
import { navigationGroups } from "@/app/navigation";
import agencyLogo from "@/assets/logo.png";
import profilePicture from "@/assets/picture.jpg";

function SidebarContents({
  activeWorkspace,
  availableWorkspaces,
  compact = false,
  onCreateWorkspace,
  onSelectWorkspace,
  onToggleAvailability,
  userAvailability,
}) {
  const [isAgencyOpen, setIsAgencyOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const agencyCardRef = useRef(null);
  const profileCardRef = useRef(null);
  const shellPadding = "px-2";
  const shellHeight = compact ? "pt-3 pb-3" : "pt-5 pb-3";

  useEffect(() => {
    if (!isAgencyOpen) return undefined;

    function closeAgencyOnOutsideClick(event) {
      if (!agencyCardRef.current?.contains(event.target)) setIsAgencyOpen(false);
    }

    function closeAgencyOnEscape(event) {
      if (event.key === "Escape") setIsAgencyOpen(false);
    }

    document.addEventListener("pointerdown", closeAgencyOnOutsideClick);
    document.addEventListener("keydown", closeAgencyOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeAgencyOnOutsideClick);
      document.removeEventListener("keydown", closeAgencyOnEscape);
    };
  }, [isAgencyOpen]);

  useEffect(() => {
    if (!isProfileOpen) return undefined;

    function closeProfileOnOutsideClick(event) {
      if (!profileCardRef.current?.contains(event.target)) setIsProfileOpen(false);
    }

    function closeProfileOnEscape(event) {
      if (event.key === "Escape") setIsProfileOpen(false);
    }

    document.addEventListener("pointerdown", closeProfileOnOutsideClick);
    document.addEventListener("keydown", closeProfileOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeProfileOnOutsideClick);
      document.removeEventListener("keydown", closeProfileOnEscape);
    };
  }, [isProfileOpen]);

  function handleCreateWorkspace(event) {
    event.preventDefault();
    const nextWorkspace = workspaceName.trim();
    if (!nextWorkspace) return;

    onCreateWorkspace(nextWorkspace);
    setWorkspaceName("");
    setIsCreatingWorkspace(false);
    setIsAgencyOpen(false);
  }

  return (
    <div className={`flex h-full min-h-0 flex-col bg-[#F5F4F2] ${shellHeight} ${shellPadding}`}>
      <div className={`relative shrink-0 ${compact ? "w-10" : "w-full"}`} ref={agencyCardRef}>
        <button
          aria-expanded={isAgencyOpen}
          aria-haspopup="dialog"
          aria-label={`Select agency, current workspace ${activeWorkspace}`}
          className={`flex h-10 w-full items-center rounded-lg border border-gray-200 bg-[#F3F4F6] shadow-sm hover:bg-[#F9FAFB] ${
            compact ? "justify-center px-0" : "gap-2 px-2"
          }`}
          onClick={() => {
            setIsCreatingWorkspace(false);
            setIsAgencyOpen((open) => !open);
          }}
          title={compact ? `Agency: ${activeWorkspace}` : undefined}
          type="button"
        >
          <span
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white text-gray-900 ${
              compact ? "h-7 w-8" : "size-7"
            }`}
          >
            <img alt="" className="size-full object-contain" src={agencyLogo} />
          </span>
          {!compact && (
            <>
              <span className="min-w-0 flex-1 text-left leading-tight">
                <span className="block text-[11px] leading-[14px] text-gray-500">Agency</span>
                <span className="block truncate text-[13px] font-medium leading-[18px] text-gray-900">
                  {activeWorkspace}
                </span>
              </span>
              <span aria-hidden="true" className="flex flex-col items-center text-[8px] leading-[3px] text-[#9CA3AF]">
                <i className="fa-solid fa-caret-up" />
                <i className="fa-solid fa-caret-down" />
              </span>
            </>
          )}
        </button>

        {isAgencyOpen && (
          <div
            aria-label="Workspace options"
            className={`absolute z-50 w-60 rounded-xl border border-gray-200 bg-white p-2 shadow-lg ${
              compact ? "left-full top-0 ml-2" : "left-0 top-full mt-2"
            }`}
            role="dialog"
          >
            <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Workspaces
            </p>
            {availableWorkspaces.map((workspace) => (
              <button
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-gray-700 hover:bg-[#F5F4F2]"
                key={workspace}
                onClick={() => {
                  onSelectWorkspace(workspace);
                  setIsAgencyOpen(false);
                }}
                type="button"
              >
                <span className="min-w-0 flex-1 truncate">{workspace}</span>
                {workspace === activeWorkspace && <Check aria-hidden="true" className="text-gray-900" size={14} />}
              </button>
            ))}
            <div className="my-1 border-t border-gray-100" />
            {isCreatingWorkspace ? (
              <form className="space-y-2 p-1" onSubmit={handleCreateWorkspace}>
                <label className="block text-[10px] text-gray-500" htmlFor={`workspace-name-${compact ? "compact" : "full"}`}>
                  New workspace name
                </label>
                <input
                  autoFocus
                  className="h-8 w-full rounded-md border border-gray-200 px-2 text-xs text-gray-900 outline-none focus:border-gray-400"
                  id={`workspace-name-${compact ? "compact" : "full"}`}
                  maxLength={32}
                  onChange={(event) => setWorkspaceName(event.target.value)}
                  placeholder="e.g. Spark Pixel Studio"
                  value={workspaceName}
                />
                <div className="flex justify-end gap-1">
                  <button
                    className="rounded-md px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100"
                    onClick={() => setIsCreatingWorkspace(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="rounded-md bg-[#111827] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#1F2937] disabled:opacity-50"
                    disabled={!workspaceName.trim()}
                    type="submit"
                  >
                    Create
                  </button>
                </div>
              </form>
            ) : (
              <button
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-gray-600 hover:bg-[#F5F4F2]"
                onClick={() => setIsCreatingWorkspace(true)}
                type="button"
              >
                <Plus aria-hidden="true" size={14} />
                Create workspace
              </button>
            )}
          </div>
        )}
      </div>

      <nav
        aria-label="Main navigation"
        className={`min-h-0 flex-1 ${compact ? "mt-3 space-y-1" : "mt-4"}`}
      >
        {navigationGroups.map((group, groupIndex) => (
          <section
            className={
              groupIndex > 0
                ? compact
                  ? "border-t border-gray-200 pt-1"
                  : "border-t border-gray-200 pb-3 pt-4"
                : compact
                  ? ""
                  : "pb-3"
            }
            key={group.label}
          >
            {!compact && (
              <h2 className="mb-1 px-2 text-[11px] font-semibold leading-[14px] text-gray-500">
                {group.label}
              </h2>
            )}
            <ul className="space-y-0">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <li key={item.path}>
                    <NavLink
                      aria-label={compact ? item.label : undefined}
                      end={item.path === "/"}
                      title={compact ? item.label : undefined}
                      to={item.path}
                      className={({ isActive }) =>
                        [
                          "flex rounded-lg border transition-colors",
                          compact
                            ? "sidebar-compact-link items-center justify-center"
                            : "sidebar-full-link items-center gap-2 px-2 text-[12px] leading-[18px]",
                          isActive
                            ? "border-gray-200 bg-white font-semibold text-gray-900 shadow-[0_1px_2px_rgba(17,24,39,0.04)]"
                            : "border-transparent text-gray-500 hover:bg-[#F9FAFB] hover:text-gray-900",
                        ].join(" ")
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className="flex size-6 shrink-0 items-center justify-center">
                            <Icon
                              aria-hidden="true"
                              className={isActive ? "text-[#111827]" : "text-[#6B7280]"}
                              size={16}
                              strokeWidth={1.7}
                            />
                          </span>
                          {!compact && <span className="truncate">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>

      <div className={`relative mt-2 shrink-0 ${compact ? "w-10" : "w-full"}`} ref={profileCardRef}>
        <button
          aria-expanded={isProfileOpen}
          aria-haspopup="dialog"
          aria-label="Open profile options for Salung Prastyo"
          className={`flex items-center rounded-lg border border-gray-200 bg-white text-left hover:bg-[#F9FAFB] ${
            compact ? "size-10 justify-center p-0" : "h-[42px] w-full gap-2 px-2 py-1"
          }`}
          onClick={() => setIsProfileOpen((open) => !open)}
          title={compact ? "Salung Prastyo - Sales Operator" : undefined}
          type="button"
        >
          <span className={`relative shrink-0 ${compact ? "size-full" : "size-6"}`}>
            <img
              alt=""
              className="size-full rounded-md object-cover"
              src={profilePicture}
            />
            <span className={`absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white ${userAvailability === "Available" ? "bg-emerald-500" : "bg-amber-400"}`} />
          </span>
          {!compact && (
            <>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-[13px] font-medium leading-[18px] text-gray-900">
                  Salung Prastyo
                </span>
                <span className="block truncate text-[11px] leading-[14px] text-gray-500">
                  Sales Operator
                </span>
              </span>
              <ChevronDown aria-hidden="true" className="text-[#9CA3AF]" size={14} />
            </>
          )}
        </button>

        {isProfileOpen && (
          <div
            aria-label="Profile options"
            className={`absolute z-50 w-60 rounded-xl border border-gray-200 bg-white p-2 shadow-lg ${
              compact ? "bottom-0 left-full ml-2" : "bottom-full left-0 mb-2"
            }`}
            role="dialog"
          >
            <div className="flex items-center gap-2 border-b border-gray-100 px-2 pb-2 pt-1">
              <img alt="" className="size-9 rounded-md object-cover" src={profilePicture} />
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-xs font-medium text-gray-900">Salung Prastyo</span>
                <span className="block truncate text-[10px] text-gray-500">Sales Operator</span>
              </span>
            </div>
            <button
              className="mt-1 flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-xs text-gray-700 hover:bg-[#F5F4F2]"
              onClick={onToggleAvailability}
              type="button"
            >
              <span>Availability</span>
              <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-500">
                <span className={`size-2 rounded-full ${userAvailability === "Available" ? "bg-emerald-500" : "bg-amber-400"}`} />
                {userAvailability}
              </span>
            </button>
            <NavLink
              className="flex items-center gap-2 rounded-md px-2 py-2 text-xs text-gray-700 hover:bg-[#F5F4F2]"
              onClick={() => setIsProfileOpen(false)}
              to="/settings"
            >
              <Settings aria-hidden="true" className="text-gray-500" size={14} />
              Account settings
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}

function AppSidebar({ onToggleAvailability, userAvailability }) {
  const [availableWorkspaces, setAvailableWorkspaces] = useState(["Spark Pixel Team"]);
  const [activeWorkspace, setActiveWorkspace] = useState("Spark Pixel Team");

  function handleCreateWorkspace(workspace) {
    setAvailableWorkspaces((current) => current.includes(workspace) ? current : [...current, workspace]);
    setActiveWorkspace(workspace);
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[205px] flex-col border-r border-gray-200 bg-[#F5F4F2] lg:flex">
        <SidebarContents
          activeWorkspace={activeWorkspace}
          availableWorkspaces={availableWorkspaces}
          onCreateWorkspace={handleCreateWorkspace}
          onSelectWorkspace={setActiveWorkspace}
          onToggleAvailability={onToggleAvailability}
          userAvailability={userAvailability}
        />
      </aside>
      <aside className="fixed inset-y-0 left-0 z-30 flex w-[68px] flex-col border-r border-gray-200 bg-[#F5F4F2] lg:hidden">
        <SidebarContents
          activeWorkspace={activeWorkspace}
          availableWorkspaces={availableWorkspaces}
          compact
          onCreateWorkspace={handleCreateWorkspace}
          onSelectWorkspace={setActiveWorkspace}
          onToggleAvailability={onToggleAvailability}
          userAvailability={userAvailability}
        />
      </aside>
    </>
  );
}

export default AppSidebar;
