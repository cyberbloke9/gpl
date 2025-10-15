import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ValidationResult } from '@/types/generator';
import { getValidationStyles } from '@/lib/generatorValidation';

interface GeneratorInputRowProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  disabled?: boolean;
  unit?: string;
  type?: string;
  step?: string;
  placeholder?: string;
  validation?: ValidationResult;
}

export function GeneratorInputRow({
  label,
  value,
  onChange,
  disabled = false,
  unit,
  type = 'number',
  step = '0.1',
  placeholder,
  validation,
}: GeneratorInputRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <label className="text-xs sm:text-sm font-medium text-foreground sm:w-32 md:w-40 flex-shrink-0">
          {label}
        </label>
        <div className="flex-1 flex items-center gap-2">
          <Input
            type={type}
            step={step}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder || `0${step === '0.01' ? '.00' : step === '0.1' ? '.0' : ''}`}
            className={cn(
              'flex-1 h-8 sm:h-9 text-sm',
              validation && getValidationStyles(validation.status),
              disabled && 'opacity-60 cursor-not-allowed'
            )}
          />
          {unit && (
            <span className="text-xs sm:text-sm text-muted-foreground w-12 sm:w-16 flex-shrink-0">
              {unit}
            </span>
          )}
        </div>
      </div>
      {validation?.message && (
        <p
          className={cn(
            'text-xs sm:ml-36 md:ml-[172px] pl-0 sm:pl-3',
            validation.status === 'error' && 'text-red-600',
            validation.status === 'warning' && 'text-yellow-600'
          )}
        >
          {validation.message}
        </p>
      )}
    </div>
  );
}
