import { useEffect, useState } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/useAuth";
import { supabaseClient } from "@/lib/supabaseClient";
import type {
  TourBooking,
  TourBookingInput,
  TourBookingStatus,
} from "@/types/tour";
import type { Data } from "@/types/types";

type TourBookingOptions = {
  includeAllForStaff?: boolean;
};

export function useTourBookings(options: TourBookingOptions = {}) {
  const [Bookings, setBookings] = useState<TourBooking[]>([]);
  const [Loading, setLoading] = useState<boolean>(true);
  const [Error, setError] = useState<string>("");

  const { Session, GetRoleFromEmail } = useAuth();

  const role = GetRoleFromEmail(Session?.user.email);
  const isStaff = role === "admin" || role === "employee";

  function resetStates() {
    setLoading(true);
    setError("");
  }

  function SetError(error: PostgrestError) {
    const msg = `An Error has occurred. Error code: ${error.code} Error message: ${error.message}`;
    console.error(error);
    setError(msg);
    setLoading(false);
  }

  useEffect(() => {
    async function fetchBookings() {
      if (!Session?.user.id) {
        setBookings([]);
        setLoading(false);
        return;
      }

      resetStates();

      const query = supabaseClient
        .from("tour_bookings")
        .select("*")
        .order("added_at", { ascending: false })
        .order("preferred_date", { ascending: true })
        .order("preferred_time", { ascending: true });

      const { data, error: FetchError } = ((options.includeAllForStaff && isStaff
        ? await query
        : await query.eq("user_id", Session.user.id)) as Data<TourBooking[]>);

      if (FetchError) {
        SetError(FetchError);
        return;
      }

      setBookings(data ?? []);
      setLoading(false);
    }

    fetchBookings();

    if (!Session?.user.id) return;

    const channel = supabaseClient
      .channel(
        options.includeAllForStaff && isStaff
          ? "tour-bookings-staff-feed"
          : "tour-bookings-user-feed",
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tour_bookings",
        },
        fetchBookings,
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [Session?.user.id, options.includeAllForStaff, isStaff]);

  async function AddBooking(payload: TourBookingInput) {
    if (!Session?.user.id) return false;

    resetStates();

    const { error: InsertError } = await supabaseClient
      .from("tour_bookings")
      .insert({ ...payload, user_id: Session.user.id });

    if (InsertError) {
      SetError(InsertError);
      return false;
    }

    setLoading(false);
    return true;
  }

  async function UpdateBookingStatus(
    bookingId: TourBooking["id"],
    status: TourBookingStatus,
  ) {
    if (!Session?.user.id || typeof bookingId !== "number") return false;

    setError("");
    const previousBookings = Bookings;

    // Optimistic UI update so status reflects instantly in staff controls.
    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId ? { ...booking, status } : booking,
      ),
    );

    const { error: UpdateError } = await supabaseClient
      .from("tour_bookings")
      .update({ status })
      .eq("id", bookingId);

    if (UpdateError) {
      setBookings(previousBookings);
      SetError(UpdateError);
      return false;
    }

    return true;
  }

  return {
    Bookings,
    Loading,
    Error,
    AddBooking,
    UpdateBookingStatus,
  };
}
