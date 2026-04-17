import Breadcrumbs from "@/components/Breadcrumbs";
import { useState, type SubmitEvent } from "react";
import { Link } from "react-router-dom";

type FormValues = {
  firstName: string;
  familyName: string;
  email: string;
  phone: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  firstName: "",
  familyName: "",
  email: "",
  phone: "",
  message: "",
};

export default function Contact() {
  const [formValues, setFormValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (!formValues.firstName.trim()) {
      nextErrors.firstName = "Please enter your name.";
    }

    if (!formValues.familyName.trim()) {
      nextErrors.familyName = "Please enter your family name.";
    }

    if (!formValues.email.trim()) {
      nextErrors.email = "Please enter your email address.";
    }

    if (!formValues.phone.trim()) {
      nextErrors.phone = "Please enter your phone number.";
    }

    if (!formValues.message.trim()) {
      nextErrors.message = "Please enter your message.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setIsSubmitted(false);
      return;
    }

    setIsSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#e6e0d8] px-4 py-14 sm:px-6 lg:px-8">
      <Breadcrumbs />
      <div className="mx-auto w-full">
        <div className="border border-[#d7e0ea] bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.3em] text-[#bf530a]">
              Contact us
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-[#10243e]">
              Send your information
            </h1>
            <p className="mt-4 text-sm leading-7 text-[#5f7490]">
              Fill in your details and message, and we can contact you later.
            </p>
          </div>

          {isSubmitted && (
            <div className="border border-[#ffd2ad] bg-[#fff0e2] px-6 py-5">
              <p className="text-lg font-semibold text-[#bf530a]">
                Thank you for reaching to us.
              </p>
              <p className="mt-2 text-sm text-[#8a4b1d]">
                Your information has been sent successfully.
              </p>
              <div className="mt-5">
                <Link
                  className="inline-block bg-[#bf530a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a94708]"
                  to="/"
                >
                  Return to home
                </Link>
              </div>
            </div>
          )}

          <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium text-[#17365d]">
              Name
              {errors.firstName ? (
                <span className="text-sm font-medium text-red-600">
                  {errors.firstName}
                </span>
              ) : null}
              <input
                className="border border-[#d7e0ea] bg-white px-4 py-3 outline-none transition focus:border-[#17365d]"
                placeholder="Your name"
                type="text"
                value={formValues.firstName}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    firstName: event.target.value,
                  }))
                }
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-[#17365d]">
              Family name
              {errors.familyName && (
                <span className="text-sm font-medium text-red-600">
                  {errors.familyName}
                </span>
              )}
              <input
                className="border border-[#d7e0ea] bg-white px-4 py-3 outline-none transition focus:border-[#17365d]"
                placeholder="Your family name"
                type="text"
                value={formValues.familyName}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    familyName: event.target.value,
                  }))
                }
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-[#17365d]">
              Email address
              {errors.email && (
                <span className="text-sm font-medium text-red-600">
                  {errors.email}
                </span>
              )}
              <input
                className="border border-[#d7e0ea] bg-white px-4 py-3 outline-none transition focus:border-[#17365d]"
                placeholder="you@example.com"
                type="email"
                value={formValues.email}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-[#17365d]">
              Phone number
              {errors.phone && (
                <span className="text-sm font-medium text-red-600">
                  {errors.phone}
                </span>
              )}
              <input
                className="border border-[#d7e0ea] bg-white px-4 py-3 outline-none transition focus:border-[#17365d]"
                placeholder="+961 ..."
                type="tel"
                value={formValues.phone}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
              />
            </label>

            <div />

            <label className="flex flex-col gap-2 text-sm font-medium text-[#17365d] md:col-span-2">
              Message
              {errors.message && (
                <span className="text-sm font-medium text-red-600">
                  {errors.message}
                </span>
              )}
              <textarea
                className="min-h-40 border border-[#d7e0ea] bg-white px-4 py-3 outline-none transition focus:border-[#17365d]"
                placeholder="Write your message here"
                value={formValues.message}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
              />
            </label>

            <div className="md:col-span-2">
              <button
                className="bg-[#bf530a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a94708] cursor-pointer rounded-lg"
                type="submit"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
