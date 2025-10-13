import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

interface InputRowProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  disabled?: boolean;
  unit?: string;
  type?: 'number' | 'text' | 'time';
  placeholder?: string;
  min?: number;
  max?: number;
  step?: string;
  inputMode?: 'decimal' | 'numeric' | 'text';
  isValid?: boolean;
  isWarning?: boolean;
  isError?: boolean;
}

export function InputRow({
  label,
  value,
  onChange,
  disabled = false,
  unit,
  type = 'number',
  placeholder = '0.00',
  min,
  max,
  step = 'any',
  inputMode = 'decimal',
  isValid,
  isWarning,
  isError,
}: InputRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
      <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2 sm:w-36 md:w-40 flex-shrink-0">
        {label}
        {disabled && <Lock className="h-3 w-3 text-muted-foreground" />}
      </label>
      <div className="flex-1 relative">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          inputMode={inputMode}
          className={cn(
            "transition-all text-sm h-9 sm:h-10",
            disabled && "cursor-not-allowed opacity-60",
            isValid && "bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-700",
            isWarning && "bg-yellow-50 border-yellow-500 dark:bg-yellow-950 dark:border-yellow-700",
            isError && "bg-red-50 border-red-500 dark:bg-red-950 dark:border-red-700"
          )}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-muted-foreground pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
