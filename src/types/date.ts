/**
 * This file defines the types for the date-related data used in the application.
 */

type TwoDigits = `${string}${string}`;

type FourDigits = `${TwoDigits}${TwoDigits}`;

export type DateString = `${FourDigits}-${TwoDigits}-${TwoDigits}`;

export type DateReturn = {
  minInputDate: `${string}-${string}-${string}`;
  maxInputDate: `${string}-${string}-${string}`;
};

export type DateRange = {
  minDate: DateString;
  maxDate: DateString;
};

export type DatePickerWithRangeProps = {
  label: string;
  minDate: DateString;
  maxDate: DateString;
  selectedMinDate: DateString;
  selectedMaxDate: DateString;
  onDateRangeChange: (range: DateRange) => void;
  pickerBackgroundColor?: string;
  pickerTextColor?: string;
};
