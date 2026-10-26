const periodValues = {
  Daily: {
    revenue: 20320,
    orders: 10320,
    customers: 4305,
    conversion: 3.9,
    trend: 0.94,
    barScale: 1,
  },
  Weekly: {
    revenue: 84620,
    orders: 4210,
    customers: 1835,
    conversion: 4.2,
    trend: 1.12,
    barScale: 1.08,
  },
  Monthly: {
    revenue: 328740,
    orders: 16580,
    customers: 6940,
    conversion: 4.4,
    trend: 1.38,
    barScale: 0.94,
  },
  Yearly: {
    revenue: 3840260,
    orders: 194320,
    customers: 80650,
    conversion: 4.7,
    trend: 1.76,
    barScale: 1.14,
  },
};

const metricDefinitions = [
  {
    label: "TOTAL REVENUE",
    key: "revenue",
    bars: [13, 19, 15, 27, 22, 18, 31, 25],
  },
  {
    label: "TOTAL ORDERS",
    key: "orders",
    detail: "Orders",
    bars: [18, 14, 31, 20, 30, 17, 26, 22],
  },
  {
    label: "NEW CUSTOMERS",
    key: "customers",
    detail: "New Users",
    bars: [12, 23, 18, 28, 16, 21, 26, 31],
  },
  {
    label: "CONVERSION RATE",
    key: "conversion",
    bars: [16, 22, 13, 32, 18, 25, 31, 20],
  },
];

const numberFormatter = new Intl.NumberFormat("en-US");
const baselineDate = new Date(2025, 10, 6);

function daysFromBaseline(date) {
  const utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const utcBaseline = Date.UTC(
    baselineDate.getFullYear(),
    baselineDate.getMonth(),
    baselineDate.getDate(),
  );
  return Math.round((utcDate - utcBaseline) / 86400000);
}

function clampToToday(date) {
  const selectedDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selectedDay > today ? today : selectedDay;
}

function getDateVariation(dayOffset) {
  if (dayOffset === 0) return 0;

  const hash = Math.sin(dayOffset * 12.9898 + 78.233) * 43758.5453;
  return (hash - Math.floor(hash) - 0.5) * 0.06;
}

function formatMetricValue(key, value, dateVariation) {
  if (key === "revenue") {
    const roundedRevenue = Math.round((value * (1 + dateVariation)) / 10) * 10;
    return `$${numberFormatter.format(roundedRevenue)}`;
  }

  if (key === "orders" || key === "customers") {
    return numberFormatter.format(Math.round(value * (1 + dateVariation)));
  }

  return `${(value + dateVariation * 8).toFixed(1)}%`;
}

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function getUpdatedBars(metric, dayOffset, periodIndex, barScale, metricIndex) {
  const barCount = metric.bars.length;
  const shift = positiveModulo(dayOffset + periodIndex * 2 + metricIndex * 3, barCount);
  const reverse = positiveModulo(dayOffset + periodIndex + metricIndex, 2) === 1;
  const bars = metric.bars.map((_, index) => {
    let sourceIndex = positiveModulo(index + shift, barCount);
    if (reverse) sourceIndex = barCount - 1 - sourceIndex;

    const seed = dayOffset * (index + 1) + periodIndex * (metricIndex + 3) * 5;
    const variation = positiveModulo(seed + sourceIndex * 7 + metricIndex * 11, 9) - 4;
    const adjustedHeight = Math.round(metric.bars[sourceIndex] * barScale) + variation;

    return Math.max(8, Math.min(30, adjustedHeight));
  });

  const highlightedIndex = positiveModulo(
    dayOffset + periodIndex * 3 + metricIndex * 2,
    barCount,
  );
  const tallestOtherBar = Math.max(
    ...bars.filter((_, index) => index !== highlightedIndex),
  );
  bars[highlightedIndex] = Math.max(
    bars[highlightedIndex],
    Math.min(34, tallestOtherBar + 3),
  );

  return bars;
}

export function getDashboardMetrics(period, selectedDate) {
  const currentPeriod = periodValues[period] ?? periodValues.Daily;
  const periodIndex = Object.keys(periodValues).indexOf(period);
  const dayOffset = daysFromBaseline(clampToToday(selectedDate));
  const dateVariation = getDateVariation(dayOffset);
  const trendValue = currentPeriod.trend + dateVariation * 2;
  const trend = `+${trendValue.toFixed(2).replace(".", ",")}`;

  return metricDefinitions.map((metric, metricIndex) => ({
    label: metric.label,
    value: formatMetricValue(
      metric.key,
      currentPeriod[metric.key],
      dateVariation,
    ),
    detail: metric.detail,
    trend,
    bars: getUpdatedBars(
      metric,
      dayOffset,
      periodIndex,
      currentPeriod.barScale,
      metricIndex,
    ),
  }));
}
