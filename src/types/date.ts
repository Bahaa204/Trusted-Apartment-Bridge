type TwoDigits = `${string}${string}`;

type FourDigits = `${TwoDigits}${TwoDigits}`;

export type DateString = `${FourDigits}-${TwoDigits}-${TwoDigits}`;

export type DateReturn = {
  minInputDate: `${string}-${string}-${string}`;
  maxInputDate: `${string}-${string}-${string}`;
};
