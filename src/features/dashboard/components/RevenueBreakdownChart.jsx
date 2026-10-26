import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, Info, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ChartOptionsMenu from "@/features/dashboard/components/ChartOptionsMenu";

const revenueFormatter = new Intl.NumberFormat("en-US");
const shortDateFormatter = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" });

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateInputValue(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getLatestAvailableDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return selectedDay > today ? today : selectedDay;
}

function getDefaultDateRange(date) {
  const latestDate = getLatestAvailableDate(date);
  const startDate = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
  return {
    start: toDateInputValue(startDate),
    end: toDateInputValue(latestDate),
  };
}

function getInclusiveDayCount(startDate, endDate) {
  const start = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  return Math.max(1, Math.floor((end - start) / 86400000) + 1);
}

function RevenueBreakdownChart({ selectedDate, selectedPeriod, revenue }) {
  const [progress, setProgress] = useState(0);
  const [showInsight, setShowInsight] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState(() => getDefaultDateRange(selectedDate));
  const [draftDateRange, setDraftDateRange] = useState(() => getDefaultDateRange(selectedDate));
  const chartRef = useRef(null);
  const calendarRef = useRef(null);
  const rangeStart = fromDateInputValue(dateRange.start) ?? selectedDate;
  const rangeEnd = fromDateInputValue(dateRange.end) ?? selectedDate;
  const rangeStartLabel = shortDateFormatter.format(rangeStart).toUpperCase();
  const rangeEndLabel = shortDateFormatter.format(rangeEnd).toUpperCase();
  const latestAvailableDate = getLatestAvailableDate(selectedDate);
  const latestAvailableValue = toDateInputValue(latestAvailableDate);
  const rangeDays = getInclusiveDayCount(rangeStart, rangeEnd);
  const periodScale = { Daily: 0.96, Weekly: 0.98, Monthly: 1, Yearly: 1.08 }[selectedPeriod] ?? 1;
  const dateSeed = latestAvailableDate.getFullYear() * 367 + latestAvailableDate.getMonth() * 31 + latestAvailableDate.getDate();
  const rangeSeed = rangeStart.getFullYear() * 367 + rangeStart.getMonth() * 31 + rangeStart.getDate()
    + rangeEnd.getFullYear() * 367 + rangeEnd.getMonth() * 31 + rangeEnd.getDate()
    + rangeDays * 13;
  const barHeights = [
    { gray: 72, black: 70 },
    { gray: 128, black: 96 },
    { gray: 96, black: 62 },
    { gray: 150, black: 118 },
    { gray: 124, black: 96 },
    { gray: 108, black: 54 },
    { gray: 122, black: 82 },
    { gray: 94, black: 64 },
    { gray: 144, black: 112 },
    { gray: 116, black: 78 },
    { gray: 126, black: 100 },
    { gray: 106, black: 94 },
    { gray: 92, black: 64 },
  ];
  const bars = barHeights.map(({ gray, black }, index) => {
    const dateChange = 1 + Math.sin((dateSeed + rangeSeed) * 0.13 + index * 1.7) * 0.06;
    const grayHeight = Math.round(gray * dateChange);
    const blackHeight = Math.round(black * periodScale * dateChange);
    return { grayHeight, blackHeight };
  });

  useEffect(() => {
    if (!isCalendarOpen) return undefined;

    function handlePointerDown(event) {
      if (!calendarRef.current?.contains(event.target)) setIsCalendarOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsCalendarOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCalendarOpen]);

  useEffect(() => {
    const duration = 1100;
    let startTime;
    let animationFrame;

    function animate(timestamp) {
      if (startTime === undefined) {
        startTime = timestamp;
        setProgress(0);
      }
      const linearProgress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - (1 - linearProgress) ** 3;

      setProgress(easedProgress);
      if (linearProgress < 1) animationFrame = requestAnimationFrame(animate);
    }

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [dateRange.end, dateRange.start, revenue, selectedDate, selectedPeriod]);

  const revenueValue = Number(revenue.replace(/[^\d.-]/g, "")) || 0;
  const periodDays = selectedPeriod === "Daily"
    ? 1
    : selectedPeriod === "Weekly"
      ? 7
      : selectedPeriod === "Yearly"
        ? (new Date(selectedDate.getFullYear(), 1, 29).getMonth() === 1 ? 366 : 365)
        : new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const rangeRevenue = revenueValue * (rangeDays / periodDays);
  const displayedRevenue = `$${revenueFormatter.format(rangeRevenue * progress)}`;
  const strongestBarIndex = bars.reduce(
    (strongestIndex, bar, index) => bar.blackHeight > bars[strongestIndex].blackHeight ? index : strongestIndex,
    0,
  );
  const firstSegmentAverage = bars.slice(0, 3).reduce((sum, bar) => sum + bar.blackHeight, 0) / 3;
  const lastSegmentAverage = bars.slice(-3).reduce((sum, bar) => sum + bar.blackHeight, 0) / 3;
  const segmentChange = Math.round(((lastSegmentAverage - firstSegmentAverage) / Math.max(firstSegmentAverage, 1)) * 100);
  const segmentTrend = Math.abs(segmentChange) < 3
    ? "roughly level"
    : `${Math.abs(segmentChange)}% ${segmentChange > 0 ? "higher" : "lower"}`;
  const canApplyDateRange = Boolean(
    draftDateRange.start
    && draftDateRange.end
    && draftDateRange.start <= draftDateRange.end
    && draftDateRange.end <= latestAvailableValue,
  );

  function applyDateRange() {
    if (!canApplyDateRange) return;
    setDateRange(draftDateRange);
    setIsCalendarOpen(false);
  }

  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border-0 bg-[#F5F4F2] p-px pb-0 shadow-[0_1px_2px_rgba(17,24,39,0.03)]">
      <CardHeader className="flex h-9 grid-cols-none grid-rows-none items-center justify-between px-3 py-0 sm:px-4">
        <div className="flex items-center gap-1.5">
          <h2 className="origin-left scale-y-[1.2] font-sans text-[10px] font-semibold leading-[14px] text-[#6B7280]">
            REVENUE BREAKDOWN
          </h2>
          <Info aria-hidden="true" className="text-[#9CA3AF]" size={11} />
        </div>
        <ChartOptionsMenu
          chartRef={chartRef}
          csvRows={[
            ["Range Start", "Range End", "Bar", "Background Bar Height", "Revenue Bar Height"],
            ...bars.map(({ grayHeight, blackHeight }, index) => [
              dateRange.start,
              dateRange.end,
              `Bar ${index + 1}`,
              Math.min(grayHeight, 135),
              Math.min(blackHeight, grayHeight, 135),
            ]),
          ]}
          label="Revenue breakdown"
          selectedDate={selectedDate}
          selectedPeriod={selectedPeriod}
        />
      </CardHeader>

      <CardContent className="flex flex-1 flex-col rounded-xl border border-[#E5E7EB] bg-white px-3 pb-2 pt-3 sm:px-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[10px] text-[#6B7280]">Revenue by Category</p>
            <p className="font-sans text-[18px] font-semibold leading-6 text-[#111827]">{displayedRevenue}</p>
          </div>
          <div className="relative shrink-0" ref={calendarRef}>
            <button
              aria-expanded={isCalendarOpen}
              aria-haspopup="dialog"
              aria-label={`Choose revenue date range, ${rangeStartLabel} to ${rangeEndLabel}`}
              className="inline-flex h-7 items-center gap-1 rounded-full border border-[#E5E7EB] px-2 text-[9px] text-[#111827] hover:bg-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CA3AF]"
              onClick={() => {
                setDraftDateRange(dateRange);
                setIsCalendarOpen((open) => !open);
              }}
              type="button"
            >
              <CalendarDays aria-hidden="true" className="text-[#9CA3AF]" size={11} />
              <span>{rangeStartLabel} - {rangeEndLabel}</span>
              <ChevronDown aria-hidden="true" className={`text-[#9CA3AF] transition-transform ${isCalendarOpen ? "rotate-180" : ""}`} size={11} />
            </button>

            {isCalendarOpen && (
              <div
                aria-label="Choose revenue date range"
                className="absolute right-0 top-full z-40 mt-2 w-64 max-w-[calc(100vw-5rem)] rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-lg"
                role="dialog"
              >
                <p className="mb-3 text-xs font-medium text-[#111827]">Select date range</p>
                <label className="mb-2 block text-[10px] text-[#6B7280]">
                  Start date
                  <input
                    className="mt-1 block h-8 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-xs text-[#111827] outline-none focus:border-[#9CA3AF]"
                    max={latestAvailableValue}
                    onChange={(event) => {
                      const start = event.target.value;
                      setDraftDateRange((current) => ({
                        start,
                        end: current.end && current.end < start ? start : current.end,
                      }));
                    }}
                    type="date"
                    value={draftDateRange.start}
                  />
                </label>
                <label className="block text-[10px] text-[#6B7280]">
                  End date
                  <input
                    className="mt-1 block h-8 w-full rounded-md border border-[#E5E7EB] bg-white px-2 text-xs text-[#111827] outline-none focus:border-[#9CA3AF]"
                    max={latestAvailableValue}
                    min={draftDateRange.start}
                    onChange={(event) => {
                      const end = event.target.value;
                      setDraftDateRange((current) => ({
                        start: end && current.start && current.start > end ? end : current.start,
                        end,
                      }));
                    }}
                    type="date"
                    value={draftDateRange.end}
                  />
                </label>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    className="h-8 rounded-md px-2.5 text-xs text-[#6B7280] hover:bg-[#F9FAFB]"
                    onClick={() => setIsCalendarOpen(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="h-8 rounded-md bg-[#111827] px-3 text-xs font-medium text-white hover:bg-[#1F2937] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!canApplyDateRange}
                    onClick={applyDateRange}
                    type="button"
                  >
                    Apply range
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          aria-expanded={showInsight}
          className="flex h-8 w-full items-center gap-2 rounded-lg bg-[#F5F4F2] px-2.5 text-left text-[10px] text-[#111827] transition-colors hover:bg-[#EEEEF0]"
          onClick={() => setShowInsight((visible) => !visible)}
          type="button"
        >
          <span className="grid size-5 shrink-0 place-items-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280]">
            <Sparkles aria-hidden="true" size={11} />
          </span>
          <span className="truncate">{showInsight ? "Hide quick insight" : "Get AI insight for better analysis"}</span>
          <span aria-hidden="true" className="ml-auto grid size-4 shrink-0 place-items-center rounded-full bg-[#D1D5DB] text-[9px] text-white">{showInsight ? "-" : "+"}</span>
        </button>

        {showInsight && (
          <div aria-live="polite" className="mt-2 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2">
            <p className="text-[10px] font-medium text-[#374151]">Quick insight | sample chart data</p>
            <p className="mt-1 text-[10px] leading-4 text-[#6B7280]">
              Bar {strongestBarIndex + 1} is tallest. The final three bars are {segmentTrend} than the first three for {rangeStartLabel} to {rangeEndLabel}.
            </p>
          </div>
        )}

        <svg
          aria-label={`Revenue breakdown from ${rangeStartLabel} through ${rangeEndLabel}`}
          className={`block w-full flex-1 ${showInsight ? "min-h-[150px]" : "min-h-[200px]"}`}
          preserveAspectRatio="none"
          ref={chartRef}
          role="img"
          viewBox="0 0 300 200"
        >
          <rect fill="#FCFCFC" height="159" rx="2" width="296" x="2" y="8" />
          {[8, 31, 54, 76, 99, 122, 145, 167].map((y) => (
            <g key={y}>
              <line stroke="#D1D5DB" strokeDasharray="1 4" strokeWidth="1" x1="2" x2="298" y1={y} y2={y} />
              <circle cx="2" cy={y} fill="#9CA3AF" r="1.5" />
            </g>
          ))}
          {bars.map(({ grayHeight, blackHeight }, index) => {
            const x = 20 + index * (260 / (bars.length - 1));
            const boundedGrayHeight = Math.round(Math.min(grayHeight, 135) * progress);
            const boundedBlackHeight = Math.min(Math.round(blackHeight * progress), boundedGrayHeight);
            return (
              <g key={index}>
                <rect
                  fill="#D1D5DB"
                  height={boundedGrayHeight}
                  rx="1.5"
                  width="3.5"
                  x={x}
                  y={167 - boundedGrayHeight}
                />
                <rect
                  fill="#111827"
                  height={boundedBlackHeight}
                  rx="1.5"
                  width="2"
                  x={x + 0.75}
                  y={167 - boundedBlackHeight}
                />
              </g>
            );
          })}
          <line stroke="#D1D5DB" strokeDasharray="1 4" x1="40" x2="220" y1="195" y2="195" />
          <text fill="#6B7280" fontFamily="Inter, sans-serif" fontSize="9" x="2" y="195">{rangeStartLabel}</text>
          <text fill="#6B7280" fontFamily="Inter, sans-serif" fontSize="9" textAnchor="end" x="298" y="195">{rangeEndLabel} {rangeEnd.getFullYear()}</text>
        </svg>
      </CardContent>
    </Card>
  );
}

export default RevenueBreakdownChart;
