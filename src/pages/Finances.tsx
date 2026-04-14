import { useState } from "react";
import { useEmployees } from "../hooks/useEmployees";
import { useHouses } from "../hooks/useHouses";
import { formatDate } from "../helpers/Date";
import type { DateRange, DateString } from "../types/date";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import ChartBarInteractive from "@/components/BarChart";
import type { ChartConfig } from "@/components/ui/chart";
import type { ChartData } from "@/types/chart";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
// import { Card, CardHeader } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import Card from "@/components/Card";

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
    return <div>{error}</div>;
  }

  if (loading) {
    return <div>Loading Data...</div>;
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
    <div className="min-h-screen bg-linear-to-b from-[#061b3a] via-[#0b2b57] to-[#123a74] p-4 text-white sm:p-8">
      <Card
        title="Finances"
        description="Manage your financial overview"
        className="text-white min-h-screen w-full bg-transparent flex flex-col gap-6"
      >
        <div className="mx-auto w-full h-31.25 max-w-md rounded-xl border bg-white/6 p-4 flex flex-wrap items-center justify-center gap-4">
          <DatePickerWithRange
            label="Select Dates"
            minDate={minInputDate}
            maxDate={maxInputDate}
            selectedMinDate={MinDate}
            selectedMaxDate={MaxDate}
            onDateRangeChange={handleDateRangeChange}
            pickerBackgroundColor="#0b1f3f"
            pickerTextColor="#ffffff"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-wrap flex-col gap-2.5 justify-center items-center rounded-xl bg-transparent p-4 text-center">
            <h3 className="text-2xl tracking-wide text-[#ffd8b1]">
              <strong>Income</strong>
            </h3>
            <p className="text-xl font-bold text-white">
              {Income.toLocaleString()}$
            </p>
          </div>
          <div className="flex flex-wrap flex-col gap-2.5 justify-center items-center rounded-xl bg-transparent p-4 text-center">
            <h3 className="text-2xl tracking-wide text-[#ffd8b1]">
              <strong>Profit</strong>
            </h3>
            <p className="text-xl font-bold text-[#ffb76a]">
              {profit < 0 ? 0 : profit.toLocaleString()}$
            </p>
          </div>
          <div className="flex flex-wrap flex-col gap-2.5 justify-center items-center rounded-xl bg-transparent p-4 text-center">
            <h3 className="text-2xl tracking-wide text-[#ffd8b1]">
              <strong>Expenses</strong>
            </h3>
            <p className="text-xl font-bold text-white">
              {expenses.toLocaleString()}$
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            type="button"
            variant="default"
            size="lg"
            onClick={handleClick}
            disabled={Calculating !== ""}
            className="h-12 cursor-pointer rounded-xl border border-[#ffdfbf] bg-[#C35214] px-10 text-base text-white shadow-[0_12px_30px_rgba(249,115,22,0.35)] transition hover:bg-[#ea6407] disabled:cursor-not-allowed! disabled:opacity-70"
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

        <div className="rounded-2xl border border-[#fd9a39]/40 bg-white p-2 text-[#0b2b57] sm:p-3">
          <ChartBarInteractive
            title="Finances"
            description="Showing finances between the selected time frames"
            data={ChartData}
            config={chartConfig}
          />
        </div>
      </Card>
    </div>
  );
}
