import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ChartOptionsMenu from "@/features/dashboard/components/ChartOptionsMenu";
import { dashboardPeriods } from "@/features/dashboard/data/periods";

const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const baseMonthPeaks = [
  { existing: 5, total: 10 },
  { existing: 15, total: 35 },
  { existing: 10, total: 25 },
  { existing: 18, total: 48 },
  { existing: 12, total: 25 },
  { existing: 10, total: 30 },
  { existing: 18, total: 33 },
  { existing: 5, total: 20 },
  { existing: 15, total: 30 },
  { existing: 18, total: 38 },
  { existing: 10, total: 20 },
  { existing: 12, total: 25 },
];
const monthProfiles = [
  [0.22, 0.45, 1, 0.63, 0.34],
  [0.2, 0.45, 0.8, 1, 0.62],
  [0.28, 0.58, 1, 0.74, 0.4],
  [0.18, 0.44, 0.74, 1, 0.58],
  [0.32, 0.62, 1, 0.72, 0.42],
  [0.2, 0.52, 1, 0.67, 0.3],
  [0.25, 0.54, 1, 0.58, 0.28],
  [0.24, 0.46, 0.72, 1, 0.4],
  [0.2, 0.48, 1, 0.75, 0.4],
  [0.22, 0.58, 1, 0.62, 0.32],
  [0.22, 0.48, 1, 0.68, 0.4],
  [0.25, 0.52, 1, 0.72, 0.38],
];

const baselineDate = new Date(2025, 10, 6);
const revenueFormatter = new Intl.NumberFormat("en-US");

function getDateOffset(date) {
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const baseline = Date.UTC(baselineDate.getFullYear(), baselineDate.getMonth(), baselineDate.getDate());
  return Math.round((current - baseline) / 86400000);
}

function getMonthPeaks(selectedDate, selectedPeriod) {
  const dateOffset = getDateOffset(selectedDate);
  const periodScale = { Daily: 0.96, Weekly: 0.98, Monthly: 1, Yearly: 1.08 }[selectedPeriod] ?? 1;
  const dateScale = dateOffset === 0
    ? 1
    : 1 + ((Math.sin(dateOffset * 0.173) + Math.cos(dateOffset * 0.071)) * 0.02);
  const scale = periodScale * dateScale;

  return baseMonthPeaks.map(({ existing, total }) => {
    const updatedTotal = Math.max(4, Math.min(60, Math.round(total * scale)));
    return {
      total: updatedTotal,
      existing: Math.min(updatedTotal - 1, Math.max(1, Math.round(existing * scale))),
    };
  });
}

function SalesTrendChart({ selectedDate, selectedPeriod, onPeriodChange, revenue }) {
  const [progress, setProgress] = useState(0);
  const [hoverPoint, setHoverPoint] = useState(null);
  const [isSelectionPinned, setIsSelectionPinned] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const duration = 1100;
    let startTime;
    let animationFrame;

    function animate(timestamp) {
      if (startTime === undefined) startTime = timestamp;
      const linearProgress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - (1 - linearProgress) ** 3;

      setProgress(easedProgress);
      if (linearProgress < 1) animationFrame = requestAnimationFrame(animate);
    }

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const monthPeaks = getMonthPeaks(selectedDate, selectedPeriod);
  const revenueValue = Number(revenue.replace(/[^\d.-]/g, "")) || 0;
  const displayedRevenue = `$${revenueFormatter.format(revenueValue * progress)}`;
  const plot = { left: 52, right: 808, top: 14, bottom: 298 };
  const plotHeight = plot.bottom - plot.top;
  const plotWidth = plot.right - plot.left;
  const monthWidth = plotWidth / months.length;
  const columnsPerMonth = 5;
  const cellSize = 9;
  const cellGap = 2;
  const columnWidth = columnsPerMonth * (cellSize + cellGap) - cellGap;
  const selectedMonthIndex = hoverPoint?.monthIndex ?? selectedDate.getMonth();
  const activeMonthX = hoverPoint?.x ?? plot.left + selectedMonthIndex * monthWidth + monthWidth / 2;
  const activeMonthPeak = monthPeaks[selectedMonthIndex];
  const activeMonthY = hoverPoint?.y ?? plot.bottom - (activeMonthPeak.total * progress / 60) * plotHeight;
  const tooltipWidth = 154;
  const tooltipHeight = 112;
  const octoberMidpointX = plot.left + 9.5 * monthWidth;
  const showTooltipOnLeft = selectedMonthIndex > 9 ||
    (selectedMonthIndex === 9 && activeMonthX >= octoberMidpointX);
  const tooltipX = showTooltipOnLeft
    ? Math.max(plot.left, activeMonthX - tooltipWidth - 12)
    : Math.min(plot.right - tooltipWidth, Math.max(plot.left, activeMonthX + 12));
  const tooltipY = hoverPoint
    ? Math.min(plot.bottom - tooltipHeight, Math.max(plot.top, hoverPoint.y - 58))
    : Math.min(plot.bottom - tooltipHeight, Math.max(plot.top, activeMonthY - 24));
  const tooltipDate = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" })
    .format(new Date(selectedDate.getFullYear(), selectedMonthIndex, 1));
  const tooltipNewUsers = Math.round((activeMonthPeak.total - activeMonthPeak.existing) * progress);
  const tooltipExistingUsers = Math.round(activeMonthPeak.existing * progress);

  function getPointFromEvent(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 820;
    const y = ((event.clientY - bounds.top) / bounds.height) * 350;
    if (x < plot.left || x > plot.right || y < plot.top || y > plot.bottom) return null;

    const monthIndex = Math.max(0, Math.min(11, Math.floor((x - plot.left) / monthWidth)));
    return {
      x,
      y,
      monthIndex,
    };
  }

  function handleChartPointerMove(event) {
    if (isSelectionPinned) return;
    const point = getPointFromEvent(event);
    if (point) setHoverPoint(point);
  }

  function handleChartClick(event) {
    if (isSelectionPinned) {
      setIsSelectionPinned(false);
      return;
    }

    const point = getPointFromEvent(event);
    if (!point) return;
    setHoverPoint(point);
    setIsSelectionPinned(true);
  }

  return (
    <Card className="min-w-0 overflow-hidden rounded-xl border-0 bg-[#F5F4F2] p-px shadow-[0_1px_2px_rgba(17,24,39,0.03)]">
      <CardHeader className="flex h-9 grid-cols-none grid-rows-none items-center justify-between px-4 py-0">
        <div className="flex items-center gap-1.5">
          <h2 className="origin-left scale-y-[1.2] font-sans text-[10px] font-semibold leading-[14px] text-[#6B7280]">
            SALES TREND
          </h2>
          <Info aria-hidden="true" className="text-[#9CA3AF]" size={12} />
        </div>
        <ChartOptionsMenu
          chartRef={chartRef}
          csvRows={[
            ["Month", "New Users (thousands)", "Existing Users (thousands)", "Total Users (thousands)"],
            ...monthPeaks.map(({ existing, total }, index) => [
              months[index],
              total - existing,
              existing,
              total,
            ]),
          ]}
          label="Sales trend"
          onResetSelection={() => {
            setHoverPoint(null);
            setIsSelectionPinned(false);
          }}
          selectedDate={selectedDate}
          selectedPeriod={selectedPeriod}
        />
      </CardHeader>

      <CardContent className="rounded-xl border border-[#E5E7EB] bg-white px-3 pb-2 pt-3 sm:px-5">
        <div className="relative mb-1 flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-2 pl-4 pr-[1.46%]">
          <div className="flex items-baseline gap-3 whitespace-nowrap">
            <span className="text-[12px] leading-4 text-[#6B7280]">Total Revenue :</span>
            <span className="font-sans text-[24px] font-semibold leading-7 tracking-[-0.02em] text-[#111827]">
              {displayedRevenue}
            </span>
          </div>
          <div className="mx-auto flex shrink-0 items-center gap-4 font-sans text-[10px] font-semibold leading-[14px] text-[#6B7280] md:absolute md:left-1/2 md:top-1/2 md:mx-0 md:-translate-x-1/2 md:-translate-y-1/2">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span aria-hidden="true" className="size-1.5 rounded-full border border-[#D1D5DB] bg-white" />
              <span className="origin-left scale-y-[1.2]">NEW USER</span>
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-[#111827]" />
              <span className="origin-left scale-y-[1.2]">EXISTING USER</span>
            </span>
          </div>
          <div aria-label="Sales trend reporting period" className="ml-auto flex shrink-0 rounded-full bg-[#F4F4F6] p-0.5 font-sans" role="group">
            {dashboardPeriods.map((option) => (
              <button
                aria-pressed={selectedPeriod === option}
                className={`rounded-full px-3 py-1.5 text-[10px] font-normal transition-colors ${
                  selectedPeriod === option
                    ? "bg-white text-[#111827] shadow-sm"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
                key={option}
                onClick={() => onPeriodChange(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <svg
          aria-label={`Sales trend for January through December ${selectedDate.getFullYear()}, ${selectedPeriod.toLowerCase()} data`}
          className="block h-[300px] w-full cursor-crosshair overflow-visible"
          onClick={handleChartClick}
          onPointerMove={handleChartPointerMove}
          preserveAspectRatio="none"
          ref={chartRef}
          role="img"
          viewBox="0 0 820 350"
        >
          <defs>
            <pattern height="14" id="sales-trend-grid" patternUnits="userSpaceOnUse" width="14">
              <rect fill="#F8F8F8" height="12.5" stroke="#FFFFFF" strokeWidth="0.7" width="12.5" x="0.75" y="0.75" />
            </pattern>
          </defs>

          <rect fill="url(#sales-trend-grid)" height={plotHeight} width={plotWidth} x={plot.left} y={plot.top} />

          {[0, 10, 20, 30, 40, 50, 60].map((tick) => {
            const y = plot.bottom - (tick / 60) * plotHeight;
            return (
              <g key={tick}>
                <line stroke="#9CA3AF" strokeWidth="1" x1={plot.left - 5} x2={plot.left - 1} y1={y} y2={y} />
                <text fill="#9CA3AF" fontFamily="Inter, sans-serif" fontSize="12" textAnchor="end" x="42" y={y + 4}>
                  {tick}k
                </text>
              </g>
            );
          })}

          {months.map((month, monthIndex) => {
            const groupX = plot.left + monthIndex * monthWidth + (monthWidth - columnWidth) / 2;
            const peaks = monthPeaks[monthIndex];
            return (
              <g key={month}>
                {monthProfiles[monthIndex].map((profile, columnIndex) => {
                  const x = groupX + columnIndex * (cellSize + cellGap);
                  const targetExistingRows = Math.round((peaks.existing * profile / 60) * 28);
                  const targetTotalRows = Math.round((peaks.total * profile / 60) * 28);
                  const existingRows = Math.floor(targetExistingRows * progress);
                  const totalRows = Math.floor(targetTotalRows * progress);
                  const newUserRows = Math.max(0, totalRows - existingRows);

                  return (
                    <g key={`${month}-${columnIndex}`}>
                      {Array.from({ length: existingRows }, (_, row) => (
                        <rect
                          fill="#111111"
                          height={cellSize}
                          key={`existing-${row}`}
                          rx="0.6"
                          width={cellSize}
                          x={x}
                          y={plot.bottom - (row + 1) * (cellSize + cellGap) + cellGap}
                        />
                      ))}
                      {Array.from({ length: newUserRows }, (_, row) => (
                        <rect
                          fill="#E5E5E5"
                          height={cellSize}
                          key={`new-${row}`}
                          rx="0.6"
                          width={cellSize}
                          x={x}
                          y={plot.bottom - (existingRows + row + 1) * (cellSize + cellGap) + cellGap}
                        />
                      ))}
                    </g>
                  );
                })}
                <text
                  fill={monthIndex === selectedMonthIndex ? "#111827" : "#6B7280"}
                  fontFamily="Inter, sans-serif"
                  fontSize="11"
                  fontWeight={monthIndex === selectedMonthIndex ? "600" : "400"}
                  textAnchor="middle"
                  x={plot.left + monthIndex * monthWidth + monthWidth / 2}
                  y="337"
                >
                  {month}
                </text>
                {monthIndex < months.length - 1 && (
                  <circle cx={plot.left + monthIndex * monthWidth + monthWidth - 3} cy="333" fill="#D1D5DB" r="1" />
                )}
              </g>
            );
          })}

          <line stroke="#9CA3AF" strokeWidth="1" x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} />
          <line stroke="#6B7280" strokeDasharray="2 3" strokeWidth="1" x1={activeMonthX} x2={activeMonthX} y1={plot.top} y2={plot.bottom} />
          <line
            stroke="#6B7280"
            strokeDasharray="2 3"
            strokeWidth="1"
            x1={activeMonthX}
            x2={activeMonthX <= tooltipX ? tooltipX : tooltipX + tooltipWidth}
            y1={activeMonthY}
            y2={Math.max(tooltipY, Math.min(tooltipY + tooltipHeight, activeMonthY))}
          />
          <circle cx={activeMonthX} cy={activeMonthY} fill="#111827" r="4.5" stroke="white" strokeWidth="1.5" />
          <g transform={`translate(${tooltipX}, ${tooltipY})`}>
            <rect fill="white" height="112" rx="8" stroke="#D1D5DB" strokeWidth="1" width="154" />
            <path d="M8 1H146a7 7 0 0 1 7 7v24H1V8a7 7 0 0 1 7-7Z" fill="#F8F8F8" />
            <text fill="#6B7280" fontFamily="Inter, sans-serif" fontSize="13" x="12" y="21">
                  {tooltipDate}
            </text>
            <circle cx="14" cy="54" fill="#D1D5DB" r="2.2" />
            <text fill="#6B7280" fontFamily="Inter, sans-serif" fontSize="12" x="22" y="58">New User</text>
            <text fill="#111827" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="600" textAnchor="end" x="140" y="58">{tooltipNewUsers}k</text>
            <circle cx="14" cy="84" fill="#111827" r="2.2" />
            <text fill="#6B7280" fontFamily="Inter, sans-serif" fontSize="12" x="22" y="88">Existing User</text>
            <text fill="#111827" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="600" textAnchor="end" x="140" y="88">{tooltipExistingUsers}k</text>
          </g>
        </svg>
      </CardContent>
    </Card>
  );
}

export default SalesTrendChart;
