import { useEffect, useState } from "react";
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
  const [statusNotice, setStatusNotice] = useState<string>("");

  useEffect(() => {
    if (!statusNotice) return;
    const timer = setTimeout(() => setStatusNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [statusNotice]);

  function getRequesterEmail(booking: (typeof Bookings)[number]) {
    const bookingRecord = booking as Record<string, unknown>;
    const candidates = [
      bookingRecord.requester_email,
      bookingRecord.contact_email,
      bookingRecord.user_email,
      bookingRecord.email,
    ];

    const found = candidates.find(
      (value): value is string =>
        typeof value === "string" && value.trim().includes("@"),
    );

    return found ?? "the requester email";
  }

  function getStatusNotice(status: TourBookingStatus, email: string) {
    if (status === "confirmed") {
      return `Tour accepted and sent to ${email}.`;
    }

    if (status === "cancelled") {
      return `Tour cancelled and sent to ${email}.`;
    }

    if (status === "completed") {
      return `Tour marked as completed and update sent to ${email}.`;
    }

    return `Tour set to pending and update sent to ${email}.`;
  }

  async function handleStatusChange(
    booking: (typeof Bookings)[number],
    status: TourBookingStatus,
  ) {
    const updated = await UpdateBookingStatus(booking.id, status);
    if (!updated) return;

    const requesterEmail = getRequesterEmail(booking);
    setStatusNotice(getStatusNotice(status, requesterEmail));
  }

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
    <main className="min-h-screen bg-[#e6e0d8] px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs />
      <section className="mx-auto w-full space-y-6">
        <div className="mb-8 rounded-[2rem] bg-[linear-gradient(135deg,#10243e,#17365d_65%,#bf530a)] px-8 py-10 text-white shadow-xl">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#ffe0c2]">
            Staff workspace
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Manage Tours
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#d9e4f0] sm:text-base">
            Review customer tour requests, update booking status, and keep
            communication flow clear across your team.
          </p>
        </div>

        {statusNotice ? (
          <Card className="border border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm">
            <CardContent className="p-4 text-sm font-semibold">{statusNotice}</CardContent>
          </Card>
        ) : null}

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
                          handleStatusChange(booking, value as TourBookingStatus)
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
