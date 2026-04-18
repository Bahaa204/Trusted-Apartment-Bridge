/**
 * This file defines the types for the chart data used in the application.
 */

import type { ChartConfig } from "@/components/ui/chart";
import type { DateString } from "./date";

export type ChartData = {
  date: DateString;
  profit: number;
  income: number;
  expenses: number;
};

export type ChartProps = {
  data: ChartData[];
  title: string;
  description: string;
  config: ChartConfig;
};
