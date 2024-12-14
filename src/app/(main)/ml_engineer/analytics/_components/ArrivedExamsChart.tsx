"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ArrivedExamsChartProps {
  data: { date: string; value: unknown }[];
}

const chartConfig = {
  value: {
    label: "Cantidad",
    color: "#2563eb",
  },
} satisfies ChartConfig;

export function ArrivedExamsChart({ data }: ArrivedExamsChartProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Exámenes recibidos</h3>
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
