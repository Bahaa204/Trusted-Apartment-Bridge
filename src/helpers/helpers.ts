import type { PaymentFormData } from "@/types/form";
import type { House } from "@/types/house";

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
