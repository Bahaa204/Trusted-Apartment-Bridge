import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();

  return (
    <>
      <h1>Admin</h1>

      <div>
        <div>
          <p>Manage Employees</p>
          <button
            type="button"
            onClick={() => {
              navigate("/admin/employees");
            }}
          >
            Go
          </button>
        </div>
        <div>
          <p>See Statistics and Finances</p>
          <button
            type="button"
            onClick={() => {
              navigate("/admin/finances");
            }}
          >
            Go
          </button>
        </div>
        <div>
          <p>Manage Projects</p>
          <button
            type="button"
            onClick={() => {
              navigate("/admin/projects");
            }}
          >
            Go
          </button>
        </div>
      </div>
    </>
  );
}
