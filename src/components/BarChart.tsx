import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo, useState } from "react";
import type { ChartProps } from "@/types/chart";

export default function ChartBarInteractive({
  data,
  title,
  description,
  config,
}: ChartProps) {
  const [activeChart, setActiveChart] = useState<keyof typeof config>("profit");

  const total = useMemo(
    () => ({
      profit: data.reduce((acc, curr) => acc + curr.profit, 0),
      income: data.reduce((acc, curr) => acc + curr.income, 0),
      expenses: data.reduce((acc, curr) => acc + curr.expenses, 0),
    }),
    [data],
  );

  return (
    <Card className="border border-[#fd9a39]/40 py-0 shadow-sm">
      <CardHeader className="flex flex-col items-stretch border-b border-[#fd9a39]/35 p-0! text-left! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!">
          <CardTitle className="text-[#0b2b57]">{title}</CardTitle>
          <CardDescription className="text-[#31527b]">
            {description}
          </CardDescription>
        </div>
        <div className="flex">
          {["profit", "income", "expenses"].map((key) => {
            const chart = key as keyof typeof config;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-[#fd9a39]/25 px-6 py-4 text-left even:border-l even:border-[#fd9a39]/25 data-[active=true]:bg-[#fff0e2] sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-[#4e6689]">
                  {config[chart].label}
                </span>
                <span className="text-lg leading-none font-bold text-[#0b2b57] sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        {!data || data.length === 0 ? (
          <div className="flex h-62.5 flex-wrap items-center justify-center text-xl text-[#31527b]">
            No Data Available
          </div>
        ) : (
          <ChartContainer config={config} className="aspect-auto h-62.5 w-full">
            <BarChart
              accessibilityLayer
              data={data}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} stroke="#f4c38f" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tick={{ fill: "#27466d", fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-37.5"
                    nameKey="views"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                  />
                }
              />
              <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
