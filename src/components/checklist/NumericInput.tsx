import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateRange, getRangeColor, RangeValidation } from '@/lib/validation';

interface NumericInputProps {
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  range?: RangeValidation;
  unit?: string;
  required?: boolean;
}

export const NumericInput = ({ label, value, onChange, range, unit, required }: NumericInputProps) => {
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
  const validation = range ? validateRange(numValue, range) : { valid: true, status: 'normal' as const };

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
        {range && (
          <span className="text-xs text-muted-foreground ml-2">
            ({range.min}-{range.max}{unit || ''})
          </span>
        )}
      </Label>
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={validation.status !== 'normal' ? getRangeColor(validation.status) : ''}
        />
        {unit && (
          <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">{unit}</span>
        )}
      </div>
      {validation.status === 'warning' && (
        <p className="text-xs text-yellow-600">Value outside ideal range</p>
      )}
      {validation.status === 'danger' && (
        <p className="text-xs text-red-600">Value out of acceptable range!</p>
      )}
    </div>
  );
};
