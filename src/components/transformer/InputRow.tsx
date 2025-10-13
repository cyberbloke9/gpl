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
  step = '0.01',
  isValid,
  isWarning,
  isError,
}: InputRowProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="w-36 sm:w-40 text-sm font-medium text-foreground flex-shrink-0 flex items-center gap-2">
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
          className={cn(
            "transition-all",
            disabled && "cursor-not-allowed opacity-60",
            isValid && "bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-700",
            isWarning && "bg-yellow-50 border-yellow-500 dark:bg-yellow-950 dark:border-yellow-700",
            isError && "bg-red-50 border-red-500 dark:bg-red-950 dark:border-red-700"
          )}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
