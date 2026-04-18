import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { titleCase } from "title-case";
import type { BreadcrumbItem, BreadCrumbProps } from "@/types/breadcrumb";

export default function Breadcrumbs({ name }: BreadCrumbProps) {
  const location = useLocation();

  function getBreadcrumbs(): BreadcrumbItem[] {
    const pathnames = location.pathname.split("/").filter((x) => x);

    if (pathnames.length === 0) {
      return [];
    }

    const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", path: "/" }];

    let path = "";
    pathnames.forEach((pathname, index) => {
      path += `/${pathname}`;

      const isLastItem = index === pathnames.length - 1;
      const hasCustomName = Boolean(name?.trim());

      // Convert URL path to readable label
      const generatedLabel = pathname
        .replace(/-/g, " ")
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => titleCase(word))
        .join(" ");

      const label = isLastItem && hasCustomName ? name!.trim() : generatedLabel;

      // Only add if not the last item (current page will be shown but not clickable)
      if (index < pathnames.length - 1) {
        breadcrumbs.push({ label, path });
      } else {
        // Last item is the current page (non-clickable)
        breadcrumbs.push({ label, path });
      }
    });

    return breadcrumbs;
  }

  const breadcrumbs: BreadcrumbItem[] = getBreadcrumbs();

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav
      className="flex items-center gap-2 text-sm mb-6 relative z-1000"
      aria-label="Breadcrumb"
    >
      <Link
        to="/"
        className="text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
        title="Home"
      >
        <Home size={18} className="text-orange-600" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {breadcrumbs.slice(1).map((breadcrumb, index) => (
        <div key={`breadcrumb-${index}`} className="flex items-center gap-2">
          <ChevronRight
            size={16}
            className="text-slate-400"
            aria-hidden="true"
          />
          {index < breadcrumbs.length - 2 ? (
            <Link
              to={breadcrumb.path}
              className="text-slate-600 hover:text-slate-900 transition-colors hover:underline"
            >
              {breadcrumb.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-medium">
              {breadcrumb.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
