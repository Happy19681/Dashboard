import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { dashboardPeriods } from "@/features/dashboard/data/periods";

function DashboardPeriodPicker({ selectedPeriod, onPeriodChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (!pickerRef.current?.contains(event.target)) setIsOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative h-full" ref={pickerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Reporting period, ${selectedPeriod}`}
        className="inline-flex h-full items-center gap-2 rounded-l-lg px-3 text-[13px] font-medium text-[#111827] hover:bg-gray-50"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        {selectedPeriod}
        <ChevronDown aria-hidden="true" className="text-gray-500" size={14} />
      </button>

      {isOpen && (
        <div
          aria-label="Reporting period"
          className="absolute left-0 top-full z-50 mt-2 w-36 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
          role="listbox"
        >
          {dashboardPeriods.map((period) => (
            <button
              aria-selected={period === selectedPeriod}
              className={`flex w-full items-center rounded-md px-2.5 py-2 text-left text-[13px] transition-colors ${
                period === selectedPeriod
                  ? "bg-[#F4F4F6] font-medium text-[#111827]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              key={period}
              onClick={() => {
                onPeriodChange(period);
                setIsOpen(false);
              }}
              role="option"
              type="button"
            >
              {period}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardPeriodPicker;
