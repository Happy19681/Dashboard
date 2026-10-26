import { useEffect, useMemo, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

function MetricCard({ label, value, detail, trend, bars }) {
  const [progress, setProgress] = useState(0);
  const highlightedBarIndex = bars.indexOf(Math.max(...bars));
  const valueParts = useMemo(() => {
    const match = value.match(/^(\$?)([\d,]+(?:\.\d+)?)(%?)$/);
    const prefix = match?.[1] ?? "";
    const numericText = match?.[2] ?? "0";
    const suffix = match?.[3] ?? "";
    const numericValue = Number(numericText.replaceAll(",", ""));
    const decimalPlaces = numericText.split(".")[1]?.length ?? 0;

    return {
      prefix,
      suffix,
      numericValue,
      formatter: new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }),
    };
  }, [value]);

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

  const displayedValue = `${valueParts.prefix}${valueParts.formatter.format(
    valueParts.numericValue * progress,
  )}${valueParts.suffix}`;

  return (
    <Card
      aria-label={label}
      className="min-w-0 overflow-hidden border-0 bg-[#F5F4F2] p-px pb-2 shadow-[0_1px_2px_rgba(17,24,39,0.03)]"
      role="article"
    >
      <CardContent className="rounded-xl border border-[#E5E7EB] bg-white p-3 pb-2">
        <p className="origin-left scale-y-[1.2] font-sans text-[10px] font-semibold leading-[14px] text-[#6B7280]">
          {label}
        </p>

        <div className="mt-0.5 flex min-w-0 items-center justify-between gap-2">
          <p className="min-w-0 truncate font-sans text-[18px] font-semibold leading-6 text-[#111827]">
            {displayedValue}
            {detail && (
              <span className="ml-1 font-sans text-[10px] font-normal tracking-normal text-[#6B7280]">
                {detail}
              </span>
            )}
          </p>

          <div aria-hidden="true" className="flex h-9 shrink-0 items-end gap-[3px]">
            {bars.map((height, index) => (
              <span
                className={`w-[2px] rounded-full ${
                  index === highlightedBarIndex ? "bg-[#111827]" : "bg-[#D1D5DB]"
                }`}
                key={`${height}-${index}`}
                style={{ height: `${Math.round(height * progress)}px` }}
              />
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="h-7 justify-between px-3 pb-0">
        <span
          aria-hidden="true"
          className="inline-grid size-3 place-items-center rounded-full bg-[#9CA3AF] text-white"
        >
          <ArrowUp className="block text-white" size={8} strokeWidth={2} />
        </span>
        <p className="text-[10px] leading-[14px] text-[#6B7280]">
          <span className="font-medium text-[#059669]">{trend}</span> last year
        </p>
      </CardFooter>
    </Card>
  );
}

export default MetricCard;
