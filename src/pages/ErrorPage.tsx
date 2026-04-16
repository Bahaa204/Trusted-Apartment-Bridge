import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {

  return (
    <>
      <Breadcrumbs />
      <h1>An Error has occurred</h1>
      <Button
        variant="link"
        type="button"
        className="cursor-pointer"
        onClick={() => {
          window.location.reload();
        }}
      >
        Reload Page
      </Button>
    </>
  );
}
