import { useState, type ChangeEvent } from "react";
import { useEmployees } from "../hooks/useEmployees";
import { useHouses } from "../hooks/useHouses";
import { formatDate } from "../helpers/Date";
import type { DateString } from "../types/date";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

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

  if (!Session){
    return <Navigate to="/" replace />
  }

  async function handleClick() {
    if (new Date(MinDate) > new Date(MaxDate)) {
      alert("Start date must be before end date.");
      return;
    }

    // console.log("Min Date: ", MinDate);
    // console.log("Max Date: ", MaxDate);

    const houses = await getHousesBetweenDates(MinDate, MaxDate);

    if (!houses || houses.length === 0) {
      setIncome(0);
      alert(`No Houses were added during ${MinDate} and ${MaxDate}`);
      return;
    }

    const income = houses.reduce(
      (sum, house) => (sum += house.is_sold ? house.price : 0),
      0,
    );

    setIncome(income);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const name = event.target.name;

    const date: Date = new Date(event.target.value);

    const formattedDate: DateString = formatDate(date);

    if (name.includes("max")) setSelectedMaxDate(formattedDate);
    else setSelectedMinDate(formattedDate);
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
        <button type="button" onClick={handleClick}>
          Calculate Profits
        </button>
      </div>
    </>
  );
}
