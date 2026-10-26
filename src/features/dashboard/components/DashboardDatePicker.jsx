import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function isSameDay(firstDate, secondDate) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function DashboardDatePicker({ selectedDate, onDateChange }) {
  const [displayedMonth, setDisplayedMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(selectedDate);
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(displayedMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isCurrentOrFutureMonth =
    displayedMonth.getFullYear() > today.getFullYear() ||
    (displayedMonth.getFullYear() === today.getFullYear() &&
      displayedMonth.getMonth() >= today.getMonth());

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

  const monthStart = new Date(
    displayedMonth.getFullYear(),
    displayedMonth.getMonth(),
    1,
  );
  const daysInMonth = new Date(
    displayedMonth.getFullYear(),
    displayedMonth.getMonth() + 1,
    0,
  ).getDate();
  const leadingDays = (monthStart.getDay() + 6) % 7;
  const calendarCells = [
    ...Array.from({ length: leadingDays }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  function changeMonth(offset) {
    setDisplayedMonth(
      (month) => new Date(month.getFullYear(), month.getMonth() + offset, 1),
    );
  }

  function selectDate(day) {
    const nextDate = new Date(
      displayedMonth.getFullYear(),
      displayedMonth.getMonth(),
      day,
    );
    onDateChange(nextDate);
    setIsOpen(false);
  }

  return (
    <div className="relative h-full" ref={pickerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Choose date, ${dateLabel}`}
        className="inline-flex h-full items-center gap-2 rounded-r-lg border-l border-gray-200 px-3 text-[13px] text-[#6B7280] hover:bg-gray-50"
        onClick={() => {
          setDisplayedMonth(
            new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
          );
          setIsOpen((open) => !open);
        }}
        type="button"
      >
        <CalendarDays aria-hidden="true" size={14} strokeWidth={1.7} />
        <span>{dateLabel}</span>
      </button>

      {isOpen && (
        <div
          aria-label="Choose a date"
          className="absolute right-0 top-full z-50 mt-2 w-[280px] rounded-xl border border-gray-200 bg-white p-3 shadow-lg"
          role="dialog"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[#111827]">{monthLabel}</p>
            <div className="flex items-center gap-1">
              <button
                aria-label="Previous month"
                className="inline-flex size-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => changeMonth(-1)}
                type="button"
              >
                <ChevronLeft aria-hidden="true" size={16} />
              </button>
              <button
                aria-label="Next month"
                className="inline-flex size-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                disabled={isCurrentOrFutureMonth}
                onClick={() => changeMonth(1)}
                type="button"
              >
                <ChevronRight aria-hidden="true" size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center">
            {weekdays.map((day) => (
              <span
                className="pb-2 text-[10px] font-medium text-gray-500"
                key={day}
              >
                {day}
              </span>
            ))}
            {calendarCells.map((day, index) => {
              if (day === null) {
                return <span aria-hidden="true" className="h-8" key={`empty-${index}`} />;
              }

              const date = new Date(
                displayedMonth.getFullYear(),
                displayedMonth.getMonth(),
                day,
              );
              const isSelected = isSameDay(date, selectedDate);
              const isFutureDate = date > today;

              return (
                <button
                  aria-label={new Intl.DateTimeFormat("en-US", {
                    dateStyle: "full",
                  }).format(date)}
                  aria-pressed={isSelected}
                  className={`mx-auto inline-flex size-8 items-center justify-center rounded-lg text-[12px] transition-colors ${
                    isSelected
                      ? "bg-[#111827] font-medium text-white"
                      : isFutureDate
                        ? "cursor-not-allowed text-gray-300"
                        : "text-[#111827] hover:bg-[#F4F4F6]"
                  }`}
                  disabled={isFutureDate}
                  key={day}
                  onClick={() => selectDate(day)}
                  type="button"
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardDatePicker;
