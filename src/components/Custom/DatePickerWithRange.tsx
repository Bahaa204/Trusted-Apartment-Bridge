import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import { formatDate } from "@/helpers/Date";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DatePickerWithRangeProps } from "@/types/date";

export function DatePickerWithRange({
  label,
  minDate,
  maxDate,
  selectedMinDate,
  selectedMaxDate,
  onDateRangeChange,
  pickerBackgroundColor,
  pickerTextColor,
}: DatePickerWithRangeProps) {
  const date: DateRange = {
    from: new Date(selectedMinDate),
    to: new Date(selectedMaxDate),
  };

  const pickerStyle = {
    backgroundColor: pickerBackgroundColor,
    color: pickerTextColor,
  };

  function handleSelect(range: DateRange | undefined) {
    if (!range?.from) return;

    onDateRangeChange({
      minDate: formatDate(range.from),
      maxDate: formatDate(range.to ?? range.from),
    });
  }

  return (
    <Field className="mx-auto w-full max-w-sm">
      <FieldLabel
        htmlFor="date-picker-range"
        className="text-center text-[18px]"
      >
        {label}
      </FieldLabel>
      <Popover>
        <PopoverTrigger className="cursor-pointer" asChild>
          <Button
            variant="outline"
            id="date-picker-range"
            className="h-12 w-full justify-center gap-2 px-4 text-center text-base font-normal cursor-pointer"
            style={pickerStyle}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto min-w-[20rem] p-0"
          align="start"
          style={pickerStyle}
        >
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            disabled={{
              before: new Date(minDate),
              after: new Date(maxDate),
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
