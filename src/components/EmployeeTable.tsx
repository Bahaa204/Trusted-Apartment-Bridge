import { useState, type ChangeEvent, type FormEvent } from "react";
import { useEmployees } from "../hooks/useEmployees";
import type { Employee, EmployeeFormValues } from "../types/types";

const emptyForm: EmployeeFormValues = {
  name: "",
  email: "",
  salary: 0,
};

type SortKey = "name" | "email" | "salary";
type SortDirection = "asc" | "desc";

function getEmployeeTone(employeeId: number) {
  const tones = [
    "from-[#ffe0c2] via-[#fff0e2] to-white",
    "from-[#d8e3f0] via-[#eef4fb] to-white",
    "from-[#ffd3ad] via-[#fff2e7] to-white",
    "from-[#dce7f5] via-[#f7f9fc] to-white",
  ];

  return tones[Math.abs(employeeId) % tones.length];
}

export default function EmployeeTable() {
  const {
    employees,
    loading,
    error,
    addEmployee,
    updateEmployee,
    removeEmployee,
  } = useEmployees();
  const [newEmployee, setNewEmployee] = useState<EmployeeFormValues>(emptyForm);
  const [editingId, setEditingId] = useState<Employee["id"] | null>(null);
  const [editValues, setEditValues] = useState<EmployeeFormValues>(emptyForm);
  const [actionMessage, setActionMessage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<Employee["id"] | null>(
    null,
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredEmployees = employees.filter((employee) => {
    if (!normalizedQuery) {
      return true;
    }

    return (
      employee.name.toLowerCase().includes(normalizedQuery) ||
      employee.email.toLowerCase().includes(normalizedQuery) ||
      String(employee.salary).includes(normalizedQuery)
    );
  });

  const sortedEmployees = [...filteredEmployees].sort((firstEmployee, secondEmployee) => {
    const directionMultiplier = sortDirection === "asc" ? 1 : -1;

    if (sortKey === "salary") {
      return (
        (firstEmployee.salary - secondEmployee.salary) * directionMultiplier
      );
    }

    return (
      firstEmployee[sortKey].localeCompare(secondEmployee[sortKey]) *
      directionMultiplier
    );
  });

  const totalPayroll = filteredEmployees.reduce(
    (sum, employee) => sum + employee.salary,
    0,
  );
  const averageSalary =
    filteredEmployees.length > 0 ? totalPayroll / filteredEmployees.length : 0;
  const highestPaidEmployee =
    filteredEmployees.length > 0
      ? [...filteredEmployees].sort((a, b) => b.salary - a.salary)[0]
      : null;
  const spotlightEmployee =
    sortedEmployees.find((employee) => employee.id === selectedEmployeeId) ??
    sortedEmployees[0] ??
    null;
  const spotlightInitials = spotlightEmployee
    ? spotlightEmployee.name
        .split(" ")
        .map((namePart) => namePart[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "CT";

  function handleNewEmployeeChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const { name, value } = event.target;

    setNewEmployee((current) => ({
      ...current,
      [name]: name === "salary" ? Number(value) : value,
    }));
  }

  function handleEditChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setEditValues((current) => ({
      ...current,
      [name]: name === "salary" ? Number(value) : value,
    }));
  }

  async function handleAddEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionMessage("");

    const duplicateEmail = employees.some(
      (employee) =>
        employee.email.trim().toLowerCase() ===
        newEmployee.email.trim().toLowerCase(),
    );

    if (duplicateEmail) {
      setActionMessage("This email already exists for another employee.");
      return;
    }

    const created = await addEmployee(newEmployee);

    if (created) {
      setNewEmployee(emptyForm);
      setActionMessage("Employee added successfully.");
    }
  }

  function startEditing(employee: Employee) {
    setEditingId(employee.id);
    setEditValues({
      name: employee.name,
      email: employee.email,
      salary: employee.salary,
    });
    setActionMessage("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditValues(emptyForm);
  }

  async function handleUpdateEmployee(employeeId: Employee["id"]) {
    setActionMessage("");

    const duplicateEmail = employees.some(
      (employee) =>
        employee.id !== employeeId &&
        employee.email.trim().toLowerCase() ===
          editValues.email.trim().toLowerCase(),
    );

    if (duplicateEmail) {
      setActionMessage("This email already exists for another employee.");
      return;
    }

    const updated = await updateEmployee(editValues, employeeId);

    if (updated) {
      setEditingId(null);
      setEditValues(emptyForm);
      setActionMessage("Employee updated successfully.");
    }
  }

  async function handleDeleteEmployee(employeeId: Employee["id"]) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?",
    );

    if (!confirmed) {
      return;
    }

    setActionMessage("");
    const deleted = await removeEmployee(employeeId);

    if (deleted) {
      setActionMessage("Employee removed successfully.");
    }
  }

  function toggleSort(nextSortKey: SortKey) {
    if (sortKey === nextSortKey) {
      setSortDirection((currentDirection) =>
        currentDirection === "asc" ? "desc" : "asc",
      );
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection("asc");
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-[#d7e0ea] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#5f7490]">People in view</p>
          <p className="mt-2 text-3xl font-semibold text-[#10243e]">
            {filteredEmployees.length}
          </p>
        </div>
        <div className="rounded-md border border-[#d7e0ea] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#5f7490]">Current payroll view</p>
          <p className="mt-2 text-3xl font-semibold text-[#10243e]">
            ${totalPayroll.toLocaleString()}
          </p>
        </div>
        <div className="rounded-md border border-[#d7e0ea] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#5f7490]">Highest salary</p>
          <p className="mt-2 text-2xl font-semibold text-[#10243e]">
            {highestPaidEmployee
              ? `${highestPaidEmployee.name} - $${highestPaidEmployee.salary.toLocaleString()}`
              : "No employees yet"}
          </p>
          <p className="mt-2 text-sm text-[#5f7490]">
            Average salary: ${Math.round(averageSalary).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <div className="relative overflow-hidden rounded-md bg-[linear-gradient(135deg,_#10243e,_#17365d_55%,_#f4821f)] px-7 py-8 text-white shadow-xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 right-20 h-24 w-24 rounded-full bg-[#ffd3ad]/30 blur-2xl" />
          <p className="relative text-sm uppercase tracking-[0.3em] text-[#ffcfaa]">
            Meet The Team
          </p>
          <h3 className="relative mt-3 text-3xl font-semibold tracking-tight">
            {spotlightEmployee ? spotlightEmployee.name : "Your team preview"}
          </h3>
          <p className="relative mt-3 max-w-xl text-sm leading-6 text-[#e8eef6]">
            A warmer snapshot of the people behind the work. Click any employee
            below to bring their profile forward here.
          </p>

          <div className="relative mt-8 flex flex-wrap items-center gap-5">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-md border border-white/20 bg-gradient-to-br ${spotlightEmployee ? getEmployeeTone(spotlightEmployee.id) : "from-white/50 to-white/10"} text-2xl font-semibold text-[#10243e] shadow-lg backdrop-blur`}
            >
              {spotlightInitials}
            </div>

            <div className="grid gap-2">
              <div className="inline-flex w-fit rounded-md bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#ffcfaa]">
                Team profile
              </div>
              <p className="text-lg font-medium text-white/95">
                {spotlightEmployee
                  ? spotlightEmployee.email
                  : "Select an employee to preview details."}
              </p>
              <p className="text-sm text-[#ffddb8]">
                {spotlightEmployee
                  ? `Monthly salary: $${spotlightEmployee.salary.toLocaleString()}`
                  : "Use the employee table below to highlight someone here."}
              </p>
              <p className="text-sm text-[#d9e4f0]">
                {spotlightEmployee
                  ? "A valued member of the care and operations team."
                  : "This area helps the page feel more personal and welcoming."}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-[#d7e0ea] bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-[#ea6a12]">
            Team Mood
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-[#10243e]">
            A softer overview
          </h3>
          <div className="mt-6 grid gap-3">
            <div className="rounded-md bg-[#f7f9fc] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#5f7490]">
                What you are seeing
              </p>
              <p className="mt-2 text-xl font-semibold text-[#10243e]">
                {filteredEmployees.length} people in the current view
              </p>
            </div>
            <div className="rounded-md bg-[#fff0e2] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#ea6a12]">
                Leading salary
              </p>
              <p className="mt-2 text-xl font-semibold text-[#10243e]">
                {highestPaidEmployee
                  ? `${highestPaidEmployee.name}`
                  : "No one selected yet"}
              </p>
            </div>
            <div className="rounded-md bg-[#e8eef6] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#17365d]">
                Average salary
              </p>
              <p className="mt-2 text-xl font-semibold text-[#10243e]">
                ${Math.round(averageSalary).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-[#d7e0ea] bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-[#10243e]">
            Add employee
          </h2>
          <p className="text-sm text-[#5f7490]">
            Add a new team member with the details you want to keep on hand.
          </p>
        </div>

        <form
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          onSubmit={handleAddEmployee}
        >
          <label className="flex flex-col gap-2 text-sm font-medium text-[#17365d]">
            Full name
            <input
              required
              className="rounded-md border border-[#d7e0ea] px-4 py-3 outline-none transition focus:border-[#f4821f]"
              name="name"
              placeholder="Sara Ahmad"
              type="text"
              value={newEmployee.name}
              onChange={handleNewEmployeeChange}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-[#17365d]">
            Email
            <input
              required
              className="rounded-md border border-[#d7e0ea] px-4 py-3 outline-none transition focus:border-[#f4821f]"
              name="email"
              placeholder="sara@company.com"
              type="email"
              value={newEmployee.email}
              onChange={handleNewEmployeeChange}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-[#17365d]">
            Salary
            <input
              required
              min="0"
              className="rounded-md border border-[#d7e0ea] px-4 py-3 outline-none transition focus:border-[#f4821f]"
              name="salary"
              placeholder="2500"
              type="number"
              value={newEmployee.salary || ""}
              onChange={handleNewEmployeeChange}
            />
          </label>

          <div className="flex items-end">
            <button
              className="w-full rounded-md bg-[#10243e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#17365d] disabled:cursor-not-allowed disabled:bg-[#5f7490]"
              disabled={loading}
              type="submit"
            >
              {loading ? "Saving..." : "Add employee"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-md border border-[#d7e0ea] bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#10243e]">
              Employee list
            </h2>
            <p className="text-sm text-[#5f7490]">
              Browse your team, update details inline, and keep everything tidy.
            </p>
          </div>
          <div className="rounded-md bg-[#e8eef6] px-4 py-2 text-sm font-medium text-[#17365d]">
            {employees.length} employee{employees.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label className="flex flex-col gap-2 text-sm font-medium text-[#17365d]">
            Search employees
            <input
              className="rounded-md border border-[#d7e0ea] px-4 py-3 outline-none transition focus:border-[#f4821f]"
              placeholder="Search by name, email, or salary"
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-[#17365d]">
            Sort by
            <select
              className="rounded-md border border-[#d7e0ea] px-4 py-3 outline-none transition focus:border-[#f4821f]"
              value={sortKey}
              onChange={(event) => toggleSort(event.target.value as SortKey)}
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="salary">Salary</option>
            </select>
          </label>
        </div>

        {actionMessage ? (
          <div
            className={`mb-4 rounded-md px-4 py-3 text-sm ${
              actionMessage.includes("already exists")
                ? "border border-[#ffd2ad] bg-[#fff0e2] text-[#ea6a12]"
                : "border border-[#d7e0ea] bg-[#e8eef6] text-[#17365d]"
            }`}
          >
            {actionMessage}
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-md border border-[#ffd2ad] bg-[#fff0e2] px-4 py-3 text-sm text-[#ea6a12]">
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-[#5f7490]">
                <th className="px-4 py-2">
                  <button
                    className="transition hover:text-[#ea6a12]"
                    type="button"
                    onClick={() => toggleSort("name")}
                  >
                    Name
                  </button>
                </th>
                <th className="px-4 py-2">
                  <button
                    className="transition hover:text-[#ea6a12]"
                    type="button"
                    onClick={() => toggleSort("email")}
                  >
                    Email
                  </button>
                </th>
                <th className="px-4 py-2">
                  <button
                    className="transition hover:text-[#ea6a12]"
                    type="button"
                    onClick={() => toggleSort("salary")}
                  >
                    Salary
                  </button>
                </th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && sortedEmployees.length === 0 ? (
                <tr>
                  <td
                    className="rounded-md bg-[#f7f9fc] px-4 py-6 text-center text-sm text-[#5f7490]"
                    colSpan={4}
                  >
                    Loading employees...
                  </td>
                </tr>
              ) : null}

              {!loading && employees.length === 0 ? (
                <tr>
                  <td
                    className="rounded-md bg-[#f7f9fc] px-4 py-6 text-center text-sm text-[#5f7490]"
                    colSpan={4}
                  >
                    No employees found yet. Add your first employee above.
                  </td>
                </tr>
              ) : null}

              {!loading && employees.length > 0 && sortedEmployees.length === 0 ? (
                <tr>
                  <td
                    className="rounded-md bg-[#f7f9fc] px-4 py-6 text-center text-sm text-[#5f7490]"
                    colSpan={4}
                  >
                    No employees match your current search.
                  </td>
                </tr>
              ) : null}

              {sortedEmployees.map((employee) => {
                const isEditing = editingId === employee.id;
                const isSelected = spotlightEmployee?.id === employee.id;

                return (
                  <tr
                    key={employee.id}
                    className={`transition ${
                      isSelected ? "bg-[#fff0e2] ring-1 ring-[#ffd2ad]" : "bg-[#f7f9fc]"
                    }`}
                    onClick={() => setSelectedEmployeeId(employee.id)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${getEmployeeTone(employee.id)} text-sm font-semibold text-[#10243e] shadow-sm`}
                        >
                          {employee.name
                            .split(" ")
                            .map((namePart) => namePart[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          {isEditing ? (
                            <input
                              className="w-full rounded-md border border-[#d7e0ea] bg-white px-3 py-2 outline-none focus:border-[#f4821f]"
                              name="name"
                              type="text"
                              value={editValues.name}
                              onChange={handleEditChange}
                            />
                          ) : (
                            <>
                              <span className="block font-medium text-[#10243e]">
                                {employee.name}
                              </span>
                              <span className="block text-xs text-[#5f7490]">
                                Click row to feature this person above
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-[#17365d]">
                      {isEditing ? (
                        <input
                          className="w-full rounded-md border border-[#d7e0ea] bg-white px-3 py-2 outline-none focus:border-[#f4821f]"
                          name="email"
                          type="email"
                          value={editValues.email}
                          onChange={handleEditChange}
                        />
                      ) : (
                        employee.email
                      )}
                    </td>

                    <td className="px-4 py-4 text-[#17365d]">
                      {isEditing ? (
                        <input
                          className="w-full rounded-md border border-[#d7e0ea] bg-white px-3 py-2 outline-none focus:border-[#f4821f]"
                          min="0"
                          name="salary"
                          type="number"
                          value={editValues.salary}
                          onChange={handleEditChange}
                        />
                      ) : (
                        `$${employee.salary.toLocaleString()}`
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <button
                              className="rounded-md bg-[#10243e] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#17365d]"
                              type="button"
                              onClick={() => handleUpdateEmployee(employee.id)}
                            >
                              Save
                            </button>
                            <button
                              className="rounded-md border border-[#d7e0ea] px-3 py-2 text-sm font-medium text-[#17365d] transition hover:bg-[#f7f9fc]"
                              type="button"
                              onClick={cancelEditing}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="rounded-md border border-[#d7e0ea] px-3 py-2 text-sm font-medium text-[#17365d] transition hover:bg-[#f7f9fc]"
                              type="button"
                              onClick={() => startEditing(employee)}
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-md bg-[#ea6a12] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#f4821f]"
                              type="button"
                              onClick={() => handleDeleteEmployee(employee.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
