import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="error">
      <h1>An Error has occurred</h1>
      <button
        type="button"
        onClick={() => {
          navigate("/");
        }}
      >
        Return Home
      </button>
    </div>
  );
}
