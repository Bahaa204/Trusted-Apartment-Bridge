import { useState } from "react";
import { useEmployees } from "../hooks/useEmployees";
import { useHouses } from "../hooks/useHouses";
import { formatDate } from "../helpers/Date";
import type { DateRange, DateString } from "../types/date";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import ChartBarInteractive from "@/components/Custom/BarChart";
import type { ChartConfig } from "@/components/ui/chart";
import type { ChartData } from "@/types/chart";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/Custom/DatePickerWithRange";
import Breadcrumbs from "@/components/Breadcrumbs";
import { FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";

export default function Finances() {
  const { Session, Error: AuthError, Loading: AuthLoading } = useAuth();

  const {
    Error: HousesError,
    Loading: HousesLoading,
    getDates,
    getHousesBetweenDates,
  } = useHouses();

  const { minInputDate, maxInputDate } = getDates();

  const [SelectedMinDate, setSelectedMinDate] = useState<DateString | null>(
    null,
  );
  const [SelectedMaxDate, setSelectedMaxDate] = useState<DateString | null>(
    null,
  );
  const [Income, setIncome] = useState<number>(0);
  const [Calculating, setCalculating] = useState<string>("");
  const [ChartData, setChartData] = useState<ChartData[]>([]);

  const MinDate = SelectedMinDate ?? minInputDate;
  const MaxDate = SelectedMaxDate ?? maxInputDate;

  const {
    Error: EmployeesError,
    Loading: EmployeesLoading,
    getSalaries,
  } = useEmployees();

  const loading = EmployeesLoading || HousesLoading || AuthLoading;
  const error = EmployeesError || HousesError || AuthError;

  if (error) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 md:p-8">
        <Card className="mx-auto max-w-3xl border border-slate-200 bg-white text-slate-900 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Finances Error</CardTitle>
            <CardDescription className="text-slate-600">
              We could not load finances data.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-slate-700">{error}</CardContent>
        </Card>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 md:p-8">
        <Card className="mx-auto max-w-3xl border border-slate-200 bg-white text-slate-900 shadow-lg">
          <CardContent className="flex items-center justify-center gap-3 py-8 text-slate-700">
            <Spinner className="size-5 text-slate-700" />
            <span>Loading Data...</span>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!Session) {
    return <Navigate to="/" replace />;
  }

  async function handleClick() {
    if (Calculating) return;

    setCalculating("Calculating...");
    if (new Date(MinDate) > new Date(MaxDate)) {
      alert("Start date must be before end date.");
      setCalculating("");
      return;
    }

    // console.log("Min Date: ", MinDate);
    // console.log("Max Date: ", MaxDate);

    const houses = await getHousesBetweenDates(MinDate, MaxDate);

    console.log("Houses between dates: ", houses);

    if (!houses || houses.length === 0) {
      setIncome(0);
      alert(`No Houses were added during ${MinDate} and ${MaxDate}`);
      setCalculating("");
      return;
    }

    const income = houses.reduce(
      (sum, house) => (sum += house.is_sold ? house.price : 0),
      0,
    );

    console.log("Income: ", income);

    setIncome(income);

    const chartData = await ConstructChartData(MinDate, MaxDate);
    setChartData(chartData);

    setCalculating("");
  }

  function handleDateRangeChange(range: DateRange) {
    setSelectedMinDate(range.minDate);
    setSelectedMaxDate(range.maxDate);
  }

  const chartConfig = {
    views: {
      label: "Finances",
    },
    profit: {
      label: "Total Profit",
      color: "#FFA836",
    },
    income: {
      label: "Total Income",
      color: "#FD673A",
    },
    expenses: {
      label: "Total Expenses",
      color: "#C35214",
    },
  } satisfies ChartConfig;

  async function ConstructChartData(minDate: DateString, maxDate: DateString) {
    const data: ChartData[] = [];

    const currentDate = new Date(minDate);
    const endDate = new Date(maxDate);
    const expenses = getSalaries();

    setCalculating("Generating Chart Data...");

    while (currentDate <= endDate) {
      // console.log("Current Date: ", currentDate);

      const formattedDate = formatDate(currentDate);

      const houses = await getHousesBetweenDates(formattedDate, formattedDate);

      console.log("House: ", houses);

      const income = houses.reduce(
        (sum, house) => (sum += house.is_sold ? house.price : 0),
        0,
      );

      const part: ChartData = {
        date: formattedDate,
        profit: income - expenses,
        income: income,
        expenses: expenses,
      };

      console.log(part);

      data.push(part);

      currentDate.setDate(currentDate.getDate() + 1);
      // console.log("Moved to the next Day");
    }

    return data;
  }

  const expenses = getSalaries();
  const profit = Income - expenses;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 md:px-8 md:py-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Breadcrumbs />

        <Card className="border border-slate-200 bg-white text-slate-900 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">Finances</CardTitle>
            <CardDescription className="text-slate-600">
              Manage your financial overview
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <FieldSet className="mx-auto w-full max-w-xl rounded-xl border border-slate-200 bg-slate-50 p-4">
              <FieldGroup>
                <FieldLabel htmlFor="date-picker-range" className="text-slate-800">
                  Select Dates
                </FieldLabel>
                <FieldDescription className="text-slate-600">
                  Pick a start and end date to calculate financial totals.
                </FieldDescription>
                <DatePickerWithRange
                  label="Select Dates"
                  minDate={minInputDate}
                  maxDate={maxInputDate}
                  selectedMinDate={MinDate}
                  selectedMaxDate={MaxDate}
                  onDateRangeChange={handleDateRangeChange}
                  pickerBackgroundColor="#ffffff"
                  pickerTextColor="#0f172a"
                />
              </FieldGroup>
            </FieldSet>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Card className="border border-slate-200 bg-slate-50 text-center">
                <CardContent className="py-6">
                  <h3 className="text-lg font-semibold text-slate-700">Income</h3>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {Income.toLocaleString()}$
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-[#f3a342]/45 bg-[#fff8ef] text-center">
                <CardContent className="py-6">
                  <h3 className="text-lg font-semibold text-slate-700">Profit</h3>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {profit < 0 ? 0 : profit.toLocaleString()}$
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-slate-200 bg-slate-50 text-center">
                <CardContent className="py-6">
                  <h3 className="text-lg font-semibold text-slate-700">Expenses</h3>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {expenses.toLocaleString()}$
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="default"
                size="lg"
                onClick={handleClick}
                disabled={Calculating !== ""}
                className="h-12 cursor-pointer rounded-xl bg-[#173b67] px-10 text-base text-white transition hover:bg-[#24507f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {Calculating ? (
                  <>
                    <Spinner className="size-5" />
                    {Calculating}
                  </>
                ) : (
                  "Calculate Finances"
                )}
              </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-2 sm:p-3">
              <ChartBarInteractive
                title="Finances"
                description="Showing finances between the selected time frames"
                data={ChartData}
                config={chartConfig}
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
