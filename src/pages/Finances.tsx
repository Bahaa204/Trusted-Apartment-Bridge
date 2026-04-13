import { useState, type ChangeEvent } from "react";
import { useEmployees } from "../hooks/useEmployees";
import { useHouses } from "../hooks/useHouses";
import { formatDate } from "../helpers/Date";
import type { DateString } from "../types/date";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import ChartBarInteractive from "@/components/BarChart";
import type { ChartConfig } from "@/components/ui/chart";
import type { ChartData } from "@/types/chart";

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
  const [Calculating, setCalculating] = useState<boolean>(false);
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

    setCalculating(true);
    if (new Date(MinDate) > new Date(MaxDate)) {
      alert("Start date must be before end date.");
      setCalculating(false);
      return;
    }

    // console.log("Min Date: ", MinDate);
    // console.log("Max Date: ", MaxDate);

    const houses = await getHousesBetweenDates(MinDate, MaxDate);

    console.log("Houses between dates: ", houses);

    if (!houses || houses.length === 0) {
      setIncome(0);
      alert(`No Houses were added during ${MinDate} and ${MaxDate}`);
      setCalculating(false);
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

    setCalculating(false);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const name = event.target.name;

    const date: Date = new Date(event.target.value);

    const formattedDate: DateString = formatDate(date);

    if (name.includes("max")) setSelectedMaxDate(formattedDate);
    else setSelectedMinDate(formattedDate);
  }

  const chartConfig = {
    views: {
      label: "Finances",
    },
    profit: {
      label: "Total Profit",
      color: "var(--chart-1)",
    },
    income: {
      label: "Total Income",
      color: "var(--chart-2)",
    },
    expenses: {
      label: "Total Expenses",
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig;

  async function ConstructChartData(minDate: DateString, maxDate: DateString) {
    const data: ChartData[] = [];

    const currentDate = new Date(minDate);
    const endDate = new Date(maxDate);
    const expenses = getSalaries();

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

  return (
    <>
      <h1>Finances</h1>
      <div>
        <label htmlFor="min-date">Start Date:</label>
        <input
          type="date"
          // defaultValue={minInputDate}
          value={MinDate}
          onChange={handleChange}
          min={minInputDate}
          max={maxInputDate}
          id="min-date"
          name="min-date"
        />
      </div>
      <div>
        <label htmlFor="max-date">End Date:</label>
        <input
          type="date"
          value={MaxDate}
          // defaultValue={maxInputDate}
          onChange={handleChange}
          min={minInputDate}
          max={maxInputDate}
          id="max-date"
          name="max-date"
        />
        <p>Income: {Income}</p>
        <p>Expenses: {getSalaries()}</p>
        <p>Profit: {Income - getSalaries()}</p>
        <button type="button" onClick={handleClick} disabled={Calculating}>
          {Calculating ? "Calculating..." : "Calculate Profits"}
        </button>
      </div>

      <ChartBarInteractive
        title="Finances"
        description="showing finances between the selected time frames"
        data={ChartData}
        config={chartConfig}
      />
    </>
  );
}
