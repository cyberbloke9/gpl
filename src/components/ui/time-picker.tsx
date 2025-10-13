import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  disabled = false,
  placeholder = "Select time",
  className,
}: TimePickerProps) {
  // Debug logging
  React.useEffect(() => {
    console.log('[TimePicker Debug]', { value, disabled });
  }, [value, disabled]);

  // Parse the time value (HH:MM format)
  const [hours, minutes] = value ? value.split(":") : ["", ""];

  const handleHoursChange = (newHours: string) => {
    const newTime = `${newHours}:${minutes || "00"}`;
    onChange(newTime);
  };

  const handleMinutesChange = (newMinutes: string) => {
    const newTime = `${hours || "00"}:${newMinutes}`;
    onChange(newTime);
  };

  const displayValue = value
    ? `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`
    : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-9 sm:h-10",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayValue || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium">Select Time</div>
          <div className="flex items-center gap-2">
            <Select value={hours} onValueChange={handleHoursChange}>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="HH" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                  <SelectItem key={hour} value={hour.toString().padStart(2, "0")}>
                    {hour.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xl font-medium">:</span>
            <Select value={minutes} onValueChange={handleMinutesChange}>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                  <SelectItem key={minute} value={minute.toString().padStart(2, "0")}>
                    {minute.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {value && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange("")}
              className="w-full"
            >
              Clear
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
