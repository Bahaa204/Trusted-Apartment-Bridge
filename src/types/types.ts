export type Employee = {
  id: number;
  name: string;
  email: string;
  salary: number;
};

export type EmployeeFormValues = Omit<Employee, "id">;
