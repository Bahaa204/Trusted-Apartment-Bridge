import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { useEmployees } from "../hooks/useEmployees";
import { useAuth } from "@/hooks/useAuth";
import type {
  Employee,
  EmployeeFormValues,
  SortDirection,
  SortKey,
} from "@/types/employee";
import { titleCase } from "title-case";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Field } from "./ui/field";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export default function EmployeeTable() {
  const { Session, SignUp, GetRoleFromEmail, RestoreSession } = useAuth();

  const {
    Employees,
    Loading,
    Error,
    addEmployee,
    removeEmployee,
    updateEmployee,
  } = useEmployees();

  const emptyForm: EmployeeFormValues = {
    name: "",
    email: "",
    salary: 0,
  };

  function getEmployeeTone(employeeId: number) {
    const tones = [
      "from-[#ffe0c2] via-[#fff0e2] to-white",
      "from-[#d8e3f0] via-[#eef4fb] to-white",
      "from-[#ffd3ad] via-[#fff2e7] to-white",
      "from-[#dce7f5] via-[#f7f9fc] to-white",
    ];

    return tones[Math.abs(employeeId) % tones.length];
  }
  const [newEmployee, setNewEmployee] = useState<EmployeeFormValues>(emptyForm);
  const [editingId, setEditingId] = useState<Employee["id"] | null>(null);
  const [editValues, setEditValues] = useState<EmployeeFormValues>(emptyForm);
  const [actionMessage, setActionMessage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<
    Employee["id"] | null
  >(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredEmployees = Employees.filter((employee) => {
    if (!normalizedQuery) {
      return true;
    }

    return (
      employee.name.toLowerCase().includes(normalizedQuery) ||
      employee.email.toLowerCase().includes(normalizedQuery) ||
      String(employee.salary).includes(normalizedQuery)
    );
  });

  const sortedEmployees = [...filteredEmployees].sort(
    (firstEmployee, secondEmployee) => {
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
    },
  );

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

  function handleNewEmployeeChange(event: ChangeEvent<HTMLInputElement>) {
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

  async function handleAddEmployee(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionMessage("");

    const role = GetRoleFromEmail(newEmployee.email);

    if (role !== "employee") {
      setActionMessage(
        "Only emails ending with '@tab-employee.com' can be used to add employees.",
      );
      return;
    }

    const duplicateEmail = Employees.some(
      (employee) =>
        employee.email.trim().toLowerCase() ===
        newEmployee.email.trim().toLowerCase(),
    );

    if (duplicateEmail) {
      setActionMessage("This email already exists for another employee.");
      return;
    }

    const prevSession = Session;

    const created = await addEmployee(newEmployee);

    if (created) {
      const ok = await SignUp(newEmployee.email, "TAB@employee", "", {
        role: role,
        bypassRoleCheck: true,
      });

      if (ok && prevSession) {
        await RestoreSession(prevSession);
        setNewEmployee(emptyForm);
        setActionMessage("Employee added successfully.");
      }
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

    const duplicateEmail = Employees.some(
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
    <section className="space-y-8 p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-md border border-[#d7e0ea] bg-white p-5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-[#5f7490]">
              People in view
            </CardTitle>
            <CardDescription className="mt-2 text-3xl font-semibold text-[#10243e]">
              {filteredEmployees.length}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="rounded-md border border-[#d7e0ea] bg-white p-5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-[#5f7490]">
              Current payroll view
            </CardTitle>
            <CardDescription className="mt-2 text-3xl font-semibold text-[#10243e]">
              ${totalPayroll.toLocaleString()}
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="rounded-md border border-[#d7e0ea] bg-white p-5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-[#5f7490]">
              Highest salary
            </CardTitle>
            <CardDescription className="mt-2 text-2xl font-semibold text-[#10243e]">
              {highestPaidEmployee
                ? `${titleCase(highestPaidEmployee.name)} - $${highestPaidEmployee.salary.toLocaleString()}`
                : "No employees yet"}
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-2 text-sm text-[#5f7490] bg-transparent">
            Average salary: ${Math.round(averageSalary).toLocaleString()}
          </CardFooter>
        </div>
      </div>

      <Card className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)] p-5 bg-transparent">
        <div className="relative overflow-hidden rounded-md bg-[linear-gradient(135deg,#10243e,#17365d_55%,#f4821f)] px-7 py-8 text-white shadow-xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 right-20 h-24 w-24 rounded-full bg-[#ffd3ad]/30 blur-2xl" />
          <CardHeader>
            <CardTitle className="relative text-sm uppercase tracking-[0.3em] text-[#ffcfaa]">
              Meet The Team
            </CardTitle>
            <CardDescription className="text-white">
              <h3 className="relative mt-3 text-3xl font-semibold tracking-tight">
                {spotlightEmployee
                  ? spotlightEmployee.name
                  : "Your team preview"}
              </h3>
              <p className="relative mt-3 max-w-xl text-sm leading-6 text-[#e8eef6]">
                A warmer snapshot of the people behind the work. Click any
                employee below to bring their profile forward here.
              </p>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="relative mt-8 flex flex-wrap items-center gap-5">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-md border border-white/20 bg-linear-to-br ${spotlightEmployee ? getEmployeeTone(spotlightEmployee.id!) : "from-white/50 to-white/10"} text-2xl font-semibold text-[#10243e] shadow-lg backdrop-blur`}
              >
                {spotlightInitials}
              </div>
              <Card className="grid gap-2 bg-transparent p-5 border-none! outline-none!">
                <CardTitle className="inline-flex w-fit rounded-md bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#ffcfaa]">
                  Team profile
                </CardTitle>
                <CardDescription className="text-lg font-medium text-white/95">
                  {spotlightEmployee
                    ? spotlightEmployee.email
                    : "Select an employee to preview details."}
                </CardDescription>
                <CardContent>
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
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </div>

        <Card className="rounded-md border border-[#d7e0ea] bg-white p-6 shadow-sm">
          <CardHeader>
            <CardDescription className="text-sm uppercase tracking-[0.3em] text-[#ea6a12]">
              Team Mood
            </CardDescription>
            <CardTitle className="mt-3 text-2xl font-semibold text-[#10243e]">
              A softer overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Card className="mt-6 grid gap-3 p-5 bg-transparent">
              <Card className="rounded-md bg-[#f7f9fc] p-4">
                <CardHeader>
                  <CardTitle className="text-xs uppercase tracking-[0.2em] text-[#5f7490]">
                    What you are seeing
                  </CardTitle>
                  <CardDescription className="mt-2 text-xl font-semibold text-[#10243e]">
                    {filteredEmployees.length} people in the current view
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="rounded-md bg-[#fff0e2] p-4">
                <CardHeader>
                  <CardTitle className="text-xs uppercase tracking-[0.2em] text-[#ea6a12]">
                    Leading salary
                  </CardTitle>
                  <CardDescription className="mt-2 text-xl font-semibold text-[#10243e]">
                    {highestPaidEmployee
                      ? `${highestPaidEmployee.name}`
                      : "No one selected yet"}
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="rounded-md bg-[#e8eef6] p-4">
                <CardHeader>
                  <CardTitle className="text-xs uppercase tracking-[0.2em] text-[#17365d]">
                    Average salary
                  </CardTitle>
                  <CardDescription className="mt-2 text-xl font-semibold text-[#10243e]">
                    ${Math.round(averageSalary).toLocaleString()}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Card>
          </CardContent>
        </Card>
      </Card>

      <Card className="rounded-md border border-[#d7e0ea] bg-white p-6 shadow-sm">
        <CardHeader className="mb-6 flex flex-col gap-2">
          <CardTitle className="text-2xl font-semibold text-[#10243e]">
            Add employee
          </CardTitle>
          <CardDescription className="text-[16px] text-[#5f7490]">
            Add a new team member with the details you want to keep on hand.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
            onSubmit={handleAddEmployee}
          >
            <Field orientation="responsive">
              <Label className="text-sm font-medium text-[#17365d]">
                Full name
              </Label>
              <Input
                required
                className="rounded-md! border-2! border-[#d7e0ea]! p-5!"
                name="name"
                placeholder="Sara Ahmad"
                type="text"
                value={newEmployee.name}
                onChange={handleNewEmployeeChange}
              />
            </Field>
            <Field>
              <Label className="text-sm font-medium text-[#17365d]">
                Email
              </Label>
              <Input
                required
                className="rounded-md! border-2! border-[#d7e0ea]! p-5!"
                name="email"
                placeholder="sara@tab-employee.com"
                type="email"
                value={newEmployee.email}
                onChange={handleNewEmployeeChange}
              />
            </Field>
            <Field>
              <Label className="text-sm font-medium text-[#17365d]">
                Salary
              </Label>
              <Input
                required
                min="0"
                className="rounded-md! border-2! border-[#d7e0ea]! p-5!"
                name="salary"
                placeholder="2500"
                type="number"
                value={newEmployee.salary || ""}
                onChange={handleNewEmployeeChange}
              />
            </Field>
            <Field className="flex justify-end">
              <Button
                className="w-full rounded-md bg-[#10243e] p-5! text-sm font-semibold text-white transition hover:bg-[#17365d] disabled:cursor-not-allowed disabled:bg-[#5f7490] cursor-pointer"
                disabled={Loading}
                type="submit"
                variant="secondary"
              >
                {Loading ? "Saving..." : "Add employee"}
              </Button>
            </Field>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-md border border-[#d7e0ea] bg-white p-6 shadow-sm">
        <CardHeader className="min-w-full">
          <CardTitle className="text-2xl font-semibold text-[#10243e]">
            Employee list
          </CardTitle>
          <CardDescription className="text-sm text-[#5f7490]">
            Browse your team, update details inline, and keep everything tidy.
          </CardDescription>
          <CardAction className="rounded-md bg-[#e8eef6] px-4 py-2 text-sm font-medium text-[#17365d]">
            {Employees.length} employee{Employees.length === 1 ? "" : "s"}
          </CardAction>
        </CardHeader>

        <CardContent className="mt-6 mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <Field>
            <Label className="text-sm font-medium text-[#17365d]">
              Search employees
            </Label>
            <Input
              className="rounded-md! border-2! border-[#d7e0ea]! p-5!"
              placeholder="Search by name, email, or salary"
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </Field>

          <Field>
            <Label className="text-sm font-medium text-[#17365d]">
              Sort by
            </Label>
            <Select
              value={sortKey}
              onValueChange={(value) => toggleSort(value as SortKey)}
            >
              <SelectTrigger className="rounded-md! border-2! border-[#d7e0ea]! p-5!">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel> Sort By</SelectLabel>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </CardContent>

        {actionMessage && (
          <div
            className={`mb-4 rounded-md px-4 py-3 text-sm ${
              actionMessage.includes("already exists")
                ? "border border-[#ffd2ad] bg-[#fff0e2] text-[#ea6a12]"
                : "border border-[#d7e0ea] bg-[#e8eef6] text-[#17365d]"
            }`}
          >
            {actionMessage}
          </div>
        )}

        {Error && (
          <div className="mb-4 rounded-md border border-[#ffd2ad] bg-[#fff0e2] px-4 py-3 text-sm text-[#ea6a12]">
            {Error}
          </div>
        )}

        <Card className="overflow-x-auto">
          <Table className="min-w-full border-separate border-spacing-y-3">
            <TableHeader>
              <TableRow className="text-left text-xs uppercase tracking-[0.2em] text-[#5f7490]">
                <TableHead className="px-4 py-2">
                  <Button
                    className="transition hover:text-[#ea6a12] cursor-pointer"
                    type="button"
                    variant="link"
                    onClick={() => toggleSort("name")}
                  >
                    Name
                  </Button>
                </TableHead>
                <TableHead className="px-4 py-2">
                  <Button
                    className="transition hover:text-[#ea6a12] cursor-pointer"
                    type="button"
                    variant="link"
                    onClick={() => toggleSort("email")}
                  >
                    Email
                  </Button>
                </TableHead>
                <TableHead className="px-4 py-2">
                  <Button
                    className="transition hover:text-[#ea6a12] cursor-pointer"
                    type="button"
                    variant="link"
                    onClick={() => toggleSort("salary")}
                  >
                    Salary
                  </Button>
                </TableHead>
                <TableHead className="px-4 py-2">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Loading && sortedEmployees.length === 0 && (
                <TableRow>
                  <TableCell
                    className="rounded-md bg-[#f7f9fc] px-4 py-6 text-center text-sm text-[#5f7490]"
                    colSpan={4}
                  >
                    Loading employees...
                  </TableCell>
                </TableRow>
              )}

              {Employees.length === 0 && (
                <TableRow>
                  <TableCell
                    className="rounded-md bg-[#f7f9fc] px-4 py-6 text-center text-sm text-[#5f7490]"
                    colSpan={4}
                  >
                    No employees found yet. Add your first employee above.
                  </TableCell>
                </TableRow>
              )}

              {sortedEmployees.length === 0 && (
                <TableRow>
                  <TableCell
                    className="rounded-md bg-[#f7f9fc] px-4 py-6 text-center text-sm text-[#5f7490]"
                    colSpan={4}
                  >
                    No employees match your current search.
                  </TableCell>
                </TableRow>
              )}

              {sortedEmployees.map((employee) => {
                const isEditing = editingId === employee.id;
                const isSelected = spotlightEmployee?.id === employee.id;

                return (
                  <TableRow
                    key={employee.id}
                    className={`transition ${
                      isSelected
                        ? "bg-[#fff0e2] ring-1 ring-[#ffd2ad] hover:bg-[#fff0e2]!"
                        : "bg-[#f7f9fc] hover:bg-[#f7f9fc]!"
                    }`}
                    onClick={() => setSelectedEmployeeId(employee.id)}
                  >
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-linear-to-br ${getEmployeeTone(employee.id!)} text-sm font-semibold text-[#10243e] shadow-sm`}
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
                    </TableCell>

                    <TableCell className="px-4 py-4 text-[#17365d]">
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
                    </TableCell>

                    <TableCell className="px-4 py-4 text-[#17365d]">
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
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              className="rounded-md bg-[#10243e] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#17365d] cursor-pointer"
                              type="button"
                              onClick={() => handleUpdateEmployee(employee.id)}
                            >
                              Save
                            </Button>
                            <Button
                              className="rounded-md border border-[#d7e0ea] px-3 py-2 text-sm font-medium text-[#17365d] transition hover:bg-[#f7f9fc] cursor-pointer"
                              type="button"
                              variant="secondary"
                              onClick={cancelEditing}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              className="rounded-md border border-[#d7e0ea] px-3 py-2 text-sm font-medium text-[#17365d] transition hover:bg-[#f7f9fc] cursor-pointer"
                              type="button"
                              variant="secondary"
                              onClick={() => startEditing(employee)}
                            >
                              Edit
                            </Button>
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </Card>
    </section>
  );
}
