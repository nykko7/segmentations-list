"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface SegmentationLoadedChartProps {
  data: { date: string; value: unknown }[];
}

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

export function SegmentationLoadedChart({
  data,
}: SegmentationLoadedChartProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Segmentaciones</h3>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#adfa1d"
              strokeWidth={2}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}
