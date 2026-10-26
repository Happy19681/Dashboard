import { useState } from "react";
import { FileDown } from "lucide-react";
import { useOutletContext } from "react-router";
import MetricCard from "@/features/dashboard/components/MetricCard";
import DashboardDatePicker from "@/features/dashboard/components/DashboardDatePicker";
import DashboardPeriodPicker from "@/features/dashboard/components/DashboardPeriodPicker";
import SalesTrendChart from "@/features/dashboard/components/SalesTrendChart";
import RevenueBreakdownChart from "@/features/dashboard/components/RevenueBreakdownChart";
import RecentTransactionsTable from "@/features/dashboard/components/RecentTransactionsTable";
import { getDashboardMetrics } from "@/features/dashboard/data/metrics";

function formatDateForFilename(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function escapeCSV(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function DashboardPage() {
  const { searchQuery } = useOutletContext();
  const [selectedPeriod, setSelectedPeriod] = useState("Daily");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const metrics = getDashboardMetrics(selectedPeriod, selectedDate);
  const animationKey = `${selectedPeriod}-${selectedDate.getTime()}`;

  function handleExportCSV() {
    const rows = [
      ["Period", "Date", "Metric", "Value", "Detail", "Change"],
      ...metrics.map((metric) => [
        selectedPeriod,
        formatDateForFilename(selectedDate),
        metric.label,
        metric.value,
        metric.detail ?? "",
        `${metric.trend} last year`,
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCSV).join(",")).join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = `dashboard-${selectedPeriod.toLowerCase()}-${formatDateForFilename(selectedDate)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  }

  return (
    <main className="w-full p-6 md:pt-4 md:pr-8 md:pb-8 md:pl-6">
      <section
        aria-labelledby="dashboard-welcome"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <h1
          className="text-[20px] font-semibold leading-7 tracking-[-0.02em] text-[#111827]"
          id="dashboard-welcome"
        >
          Welcome back, Salung
        </h1>

        <div className="flex flex-wrap items-center gap-2 md:gap-[14px]">
          <div
            aria-label="Dashboard date controls"
            className="inline-flex h-9 rounded-lg border border-gray-200 bg-white"
            role="group"
          >
            <DashboardPeriodPicker
              onPeriodChange={setSelectedPeriod}
              selectedPeriod={selectedPeriod}
            />
            <DashboardDatePicker
              onDateChange={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#111827] bg-[#111827] px-3 text-[13px] font-medium text-white shadow-sm hover:bg-[#1F2937] md:px-4"
            onClick={handleExportCSV}
            type="button"
          >
            <FileDown aria-hidden="true" className="text-white" size={14} strokeWidth={1.8} />
            Export CSV
          </button>
        </div>
      </section>

      <section
        aria-label="Key metrics"
        className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => (
          <MetricCard key={`${metric.label}-${animationKey}`} {...metric} />
        ))}
      </section>

      <section
        aria-label="Sales and revenue charts"
        className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[2.15fr_1fr]"
      >
        <SalesTrendChart
          key={`sales-${animationKey}`}
          onPeriodChange={setSelectedPeriod}
          revenue={metrics[0].value}
          selectedDate={selectedDate}
          selectedPeriod={selectedPeriod}
        />
        <RevenueBreakdownChart
          key={`revenue-${selectedDate.getTime()}`}
          revenue={metrics[0].value}
          selectedDate={selectedDate}
          selectedPeriod={selectedPeriod}
        />
      </section>

      <RecentTransactionsTable globalSearchQuery={searchQuery} />
    </main>
  );
}

export default DashboardPage;
