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
      <div className="flex items-center gap-3">
        <label className="w-40 flex-shrink-0 text-sm font-medium text-foreground">
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
              'flex-1',
              validation && getValidationStyles(validation.status),
              disabled && 'opacity-60 cursor-not-allowed'
            )}
          />
          {unit && (
            <span className="text-sm text-muted-foreground w-16 flex-shrink-0">
              {unit}
            </span>
          )}
        </div>
      </div>
      {validation?.message && (
        <p
          className={cn(
            'text-xs ml-[172px] pl-3',
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
