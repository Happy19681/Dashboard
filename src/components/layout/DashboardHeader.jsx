import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Bell, ChevronDown, ChevronRight, Command, Inbox, Search, Settings, X } from "lucide-react";
import profilePicture from "@/assets/picture.jpg";
import { navigationGroups } from "@/app/navigation";

function DashboardHeader({ onSearchQueryChange, onToggleAvailability, searchQuery, userAvailability }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const searchContainerRef = useRef(null);
  const profileMenuRef = useRef(null);
  const [openNotice, setOpenNotice] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pages = navigationGroups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label })));
  const currentPage = pages.find((item) => item.path === pathname);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
  const pageResults = pages
    .filter((page) => queryWords.length === 0 || queryWords.every((word) =>
      page.title.toLowerCase().includes(word) || page.group.toLowerCase().includes(word),
    ))
    .slice(0, normalizedQuery ? 6 : 4);
  const currentLabel = pathname === "/" ? "Overview" : currentPage?.title ?? "Overview";
  const NoticeIcon = openNotice === "Inbox" ? Inbox : Bell;

  useEffect(() => {
    function focusSearch(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  useEffect(() => {
    if (!openNotice) return undefined;

    function closeOnEscape(event) {
      if (event.key === "Escape") setOpenNotice(null);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [openNotice]);

  useEffect(() => {
    if (!isProfileMenuOpen) return undefined;

    function closeOnOutsideClick(event) {
      if (!profileMenuRef.current?.contains(event.target)) setIsProfileMenuOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setIsProfileMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    if (!isSearchOpen) return undefined;

    function closeOnOutsideClick(event) {
      if (!searchContainerRef.current?.contains(event.target)) setIsSearchOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setIsSearchOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isSearchOpen]);

  function handleSearchKeyDown(event) {
    if (event.key === "Escape") {
      setIsSearchOpen(false);
      return;
    }

    if (event.key === "Enter" && normalizedQuery && pageResults[0]) {
      event.preventDefault();
      navigate(pageResults[0].path);
      onSearchQueryChange("");
      setIsSearchOpen(false);
    }
  }

  function selectSearchResult() {
    onSearchQueryChange("");
    setIsSearchOpen(false);
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-gray-200 bg-white px-6 py-3 md:min-h-14 md:flex-nowrap md:px-8 md:py-0">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-[13px] leading-[18px]">
        <Link className="shrink-0 text-gray-500 hover:text-gray-900" to="/">
          Dashboard
        </Link>
        <ChevronRight aria-hidden="true" className="shrink-0 text-[#9CA3AF]" size={14} />
        <span aria-current="page" className="truncate font-medium text-gray-900">
          {currentLabel}
        </span>
      </nav>

      <div className="flex w-full min-w-0 items-center gap-3 md:w-auto md:flex-1 md:justify-end">
        <div className="relative min-w-0 flex-1 md:w-[280px] md:flex-none" ref={searchContainerRef}>
          <label className="flex h-9 w-full min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-[#F5F4F2] px-3 text-gray-500">
            <Search aria-hidden="true" className="shrink-0 text-[#9CA3AF]" size={16} />
            <input
              aria-autocomplete="list"
              aria-controls="header-search-results"
              aria-expanded={isSearchOpen}
              aria-label="Search pages and transactions"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-gray-900 outline-none placeholder:text-[#9CA3AF]"
              onChange={(event) => onSearchQueryChange(event.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search..."
              ref={searchRef}
              role="combobox"
              type="search"
              value={searchQuery}
            />
            <span aria-hidden="true" className="hidden shrink-0 items-center gap-1 sm:inline-flex">
              <kbd className="inline-flex size-5 items-center justify-center rounded border border-gray-200 bg-white text-gray-500">
                <Command size={11} strokeWidth={1.8} />
              </kbd>
              <kbd className="inline-flex size-5 items-center justify-center rounded border border-gray-200 bg-white text-[10px] leading-[14px] text-gray-500">
                K
              </kbd>
            </span>
          </label>

          {isSearchOpen && (
            <div
              className="absolute top-full left-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
              aria-label="Search suggestions"
              role="dialog"
            >
              <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                {normalizedQuery ? "Pages" : "Quick links"}
              </p>
              <div id="header-search-results" role="listbox">
                {pageResults.map((page) => (
                  <Link
                    className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-xs text-gray-700 hover:bg-[#F5F4F2]"
                    key={page.path}
                    onClick={selectSearchResult}
                    role="option"
                    to={page.path}
                  >
                    <span className="truncate">{page.title}</span>
                    <span className="shrink-0 text-[10px] text-gray-400">{page.group}</span>
                  </Link>
                ))}
              </div>
              {pageResults.length === 0 && (
                <p className="px-2 py-2 text-xs text-gray-500">No matching pages.</p>
              )}
              <p className="mt-1 border-t border-gray-100 px-2 py-2 text-[10px] leading-4 text-gray-500">
                {pathname === "/"
                  ? "Recent transactions are filtered as you type."
                  : "Search by page name, or return to Dashboard to filter transactions."}
              </p>
            </div>
          )}
        </div>

        <button
          aria-label="Notifications"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          onClick={() => setOpenNotice("Notifications")}
          type="button"
        >
          <Bell aria-hidden="true" size={17} strokeWidth={1.7} />
        </button>
        <button
          aria-label="Inbox"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          onClick={() => setOpenNotice("Inbox")}
          type="button"
        >
          <Inbox aria-hidden="true" size={17} strokeWidth={1.7} />
        </button>
        <div className="relative shrink-0" ref={profileMenuRef}>
          <button
            aria-expanded={isProfileMenuOpen}
            aria-haspopup="dialog"
            aria-label="Open profile menu for Salung Prastyo"
            className="block size-8 overflow-hidden rounded-md border border-gray-200 bg-white outline-none focus-visible:ring-2 focus-visible:ring-[#9CA3AF]"
            onClick={() => setIsProfileMenuOpen((open) => !open)}
            type="button"
          >
            <img
              alt=""
              className="size-full object-cover"
              src={profilePicture}
            />
          </button>

          {isProfileMenuOpen && (
            <div
              aria-label="Profile menu"
              className="absolute top-full right-0 z-50 mt-2 w-60 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
              role="dialog"
            >
              <div className="flex items-center gap-2 border-b border-gray-100 px-2 pb-2 pt-1">
                <img alt="" className="size-9 rounded-md object-cover" src={profilePicture} />
                <span className="min-w-0 leading-tight">
                  <span className="block truncate text-xs font-medium text-gray-900">Salung Prastyo</span>
                  <span className="block truncate text-[10px] text-gray-500">Sales Operator</span>
                </span>
                <ChevronDown aria-hidden="true" className="ml-auto rotate-180 text-gray-400" size={14} />
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
              <Link
                className="flex items-center gap-2 rounded-md px-2 py-2 text-xs text-gray-700 hover:bg-[#F5F4F2]"
                onClick={() => setIsProfileMenuOpen(false)}
                to="/settings"
              >
                <Settings aria-hidden="true" className="text-gray-500" size={14} />
                Account settings
              </Link>
            </div>
          )}
        </div>
      </div>

      {openNotice && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-[#111827]/20 p-4 backdrop-blur-[3px]"
          onClick={() => setOpenNotice(null)}
        >
          <section
            aria-labelledby="coming-soon-title"
            aria-modal="true"
            className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="Close message"
              className="absolute top-3 right-3 inline-flex size-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              onClick={() => setOpenNotice(null)}
              type="button"
            >
              <X aria-hidden="true" size={16} />
            </button>
            <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl border border-gray-200 bg-[#F5F4F2] text-[#111827]">
              <NoticeIcon aria-hidden="true" size={19} strokeWidth={1.7} />
            </span>
            <div className="mb-5">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">
                Coming soon
              </p>
              <h2 className="text-lg font-semibold text-[#111827]" id="coming-soon-title">
                {openNotice}
              </h2>
              <p className="mt-2 text-[13px] leading-5 text-[#6B7280]">
                We’re getting this area ready. It will be available soon.
              </p>
            </div>
            <button
              className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-[#111827] px-4 text-[13px] font-medium text-white hover:bg-[#1F2937]"
              onClick={() => setOpenNotice(null)}
              type="button"
            >
              Got it
            </button>
          </section>
        </div>
      )}
    </header>
  );
}

export default DashboardHeader;
