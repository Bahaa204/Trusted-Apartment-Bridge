import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <>
      <Breadcrumbs />
      <h1>404: Not Found</h1>
      <Button
        variant="link"
        type="button"
        className="cursor-pointer"
        onClick={() => {
          navigate("/");
        }}
      >
        Return Home
      </Button>
    </>
  );
}
