import { useNavigate } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";
import ErrorCard from "@/components/ErrorCard";
import LoadingCard from "@/components/LoadingCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTourBookings } from "@/hooks/useTourBookings";
import type { TourBookingStatus } from "@/types/projects";

export default function StaffTourBookings() {
  useDocumentTitle("Tour Bookings");

  const navigate = useNavigate();
  const { Session, Loading: AuthLoading, Error: AuthError, GetRoleFromEmail } =
    useAuth();
  const { Bookings, Loading, Error, UpdateBookingStatus } = useTourBookings({
    includeAllForStaff: true,
  });

  const role = GetRoleFromEmail(Session?.user.email);

  if (AuthLoading || Loading) return <LoadingCard message="Loading bookings..." />;
  if (AuthError || Error)
    return (
      <ErrorCard
        message="We could not load tour bookings. Please try again later."
        error={AuthError || Error}
      />
    );

  if (!Session || (role !== "admin" && role !== "employee")) {
    return (
      <main className="min-h-screen bg-[#e6e0d8] px-4 py-10 md:px-8">
        <Card className="mx-auto max-w-xl border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Staff Access Required</CardTitle>
            <CardDescription className="text-[#24507f]">
              You must be logged in as staff to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="cursor-pointer bg-[#0f2f4f] text-white hover:bg-[#173b67]"
              onClick={() => navigate("/login")}
            >
              Go to login
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#e6e0d8] px-4 py-6 md:px-8 md:py-10">
      <Breadcrumbs />
      <section className="mx-auto max-w-7xl space-y-6">
        <Card className="border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Tour Bookings</CardTitle>
            <CardDescription className="text-[#24507f]">
              Confirm and manage customer property tours.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-lg">
          <CardContent className="p-5">
            {Bookings.length === 0 ? (
              <p className="text-[#24507f]">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {Bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-xl border border-[#d9c9b8] bg-[#fff9f2] p-4"
                  >
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-5 md:items-center">
                      <p className="text-sm text-[#24507f]">
                        Project #{booking.project_id}
                      </p>
                      <p className="text-sm text-[#24507f]">
                        Unit: {booking.house_id || "Not selected"}
                      </p>
                      <p className="text-sm text-[#24507f]">
                        {new Date(booking.preferred_date).toLocaleDateString()} at{" "}
                        {booking.preferred_time}
                      </p>
                      <p className="text-sm text-[#24507f]">
                        Phone: {booking.contact_phone || "N/A"}
                      </p>
                      <Select
                        value={booking.status}
                        onValueChange={(value) =>
                          UpdateBookingStatus(
                            booking.id,
                            value as TourBookingStatus,
                          )
                        }
                      >
                        <SelectTrigger className="w-full border-[#d9c9b8] bg-white text-[#0f2f4f]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {booking.notes && (
                      <p className="mt-2 text-sm text-[#5b6f84]">Notes: {booking.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
