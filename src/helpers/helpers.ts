import type { PaymentFormData } from "@/types/form";
import type { House } from "@/types/house";
import type { BookTourFormData } from "@/types/form";

export function ValidatePayment(
  paymentForm: PaymentFormData,
  paymentHouse: House | null,
): string {
  if (!paymentHouse) {
    return "No unit selected for payment.";
  }

  const { cardName, cardNumber, expiry, cvc, email } = paymentForm;
  if (!cardName || !cardNumber || !expiry || !cvc || !email) {
    return "Please fill in all fields to complete the payment.";
  }

  const normalizedNumber = cardNumber.replace(/\s+/g, "");
  if (!/^\d{16}$/.test(normalizedNumber))
    return "Enter a valid 16-digit card number.";

  if (!/^\d{2}\/\d{2}$/.test(expiry)) return "Expiry must be in MM/YY format.";

  if (!/^\d{3,4}$/.test(cvc)) return "Enter a valid CVC code.";

  if (paymentHouse.is_sold) return "Sorry, this unit has already been sold.";
  return "";
}

export function ValidateBookTour(form: BookTourFormData): string {
  if (!form.preferredDate || !form.preferredTime)
    return "Please select a date and time for your tour.";

  const selectedDate = new Date(`${form.preferredDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) return "Please choose a future date for your tour.";

  if (form.contactPhone && !/^\+?[0-9\s\-()]{7,20}$/.test(form.contactPhone)) {
    return "Please enter a valid phone number.";
  }

  return "";
}

export function sanitizeMapUrl(url?: string | null): string {
  if (!url) return "";
  const value = url.trim();
  if (!value) return "";

  if (
    value.startsWith("https://www.google.com/maps") ||
    value.startsWith("https://maps.google.com") ||
    value.startsWith("https://www.openstreetmap.org")
  ) {
    return value;
  }

  return "";
}

export function sanitizeMapEmbedUrl(url?: string | null): string {
  if (!url) return "";
  const value = url.trim();
  if (!value) return "";

  if (value.startsWith("https://www.google.com/maps/embed")) {
    return value;
  }

  return "";
}
