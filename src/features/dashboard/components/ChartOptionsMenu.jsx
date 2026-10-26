import { useEffect, useRef, useState } from "react";
import { FileDown, ImageDown, MoreHorizontal, RotateCcw } from "lucide-react";
import { downloadCsvRows, downloadSvgElement } from "@/lib/chartDownloads";

function formatDateForFilename(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ChartOptionsMenu({
  chartRef,
  csvRows,
  label,
  onResetSelection,
  selectedDate,
  selectedPeriod,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const filename = `${label.toLowerCase().replaceAll(" ", "-")}-${selectedPeriod.toLowerCase()}-${formatDateForFilename(selectedDate)}`;

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) setIsOpen(false);
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

  function downloadSvg() {
    downloadSvgElement(chartRef.current, `${filename}.svg`);
    setIsOpen(false);
  }

  function downloadCsv() {
    downloadCsvRows(csvRows, `${filename}.csv`);
    setIsOpen(false);
  }

  function resetSelection() {
    onResetSelection?.();
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`${label} options`}
        className="grid size-6 place-items-center rounded-full text-[#9CA3AF] hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CA3AF]"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <MoreHorizontal aria-hidden="true" size={15} />
      </button>

      {isOpen && (
        <div
          aria-label={`${label} chart actions`}
          className="absolute right-0 top-full z-30 mt-1 w-48 rounded-lg border border-[#E5E7EB] bg-white p-1 shadow-lg"
          role="menu"
        >
          <button
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-[#374151] hover:bg-[#F9FAFB] focus-visible:bg-[#F9FAFB] focus-visible:outline-none"
            onClick={downloadSvg}
            role="menuitem"
            type="button"
          >
            <ImageDown aria-hidden="true" className="text-[#6B7280]" size={14} />
            Download chart as SVG
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-[#374151] hover:bg-[#F9FAFB] focus-visible:bg-[#F9FAFB] focus-visible:outline-none"
            onClick={downloadCsv}
            role="menuitem"
            type="button"
          >
            <FileDown aria-hidden="true" className="text-[#6B7280]" size={14} />
            Export chart data CSV
          </button>
          {onResetSelection && (
            <>
              <div aria-hidden="true" className="my-1 border-t border-[#E5E7EB]" />
              <button
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-[#374151] hover:bg-[#F9FAFB] focus-visible:bg-[#F9FAFB] focus-visible:outline-none"
                onClick={resetSelection}
                role="menuitem"
                type="button"
              >
                <RotateCcw aria-hidden="true" className="text-[#6B7280]" size={14} />
                Reset chart selection
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ChartOptionsMenu;
