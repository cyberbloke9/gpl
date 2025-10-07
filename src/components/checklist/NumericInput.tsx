import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateRange, getRangeColor, RangeValidation } from '@/lib/validation';
import { StatusBadge } from '@/components/ui/status-badge';
import { AlertCircle } from 'lucide-react';

interface NumericInputProps {
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  range?: RangeValidation;
  unit?: string;
  required?: boolean;
  onProblemDetected?: (isProblem: boolean, details?: any) => void;
  fieldKey?: string;
}

export const NumericInput = ({ 
  label, 
  value, 
  onChange, 
  range, 
  unit, 
  required,
  onProblemDetected,
  fieldKey
}: NumericInputProps) => {
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
  const validation = range ? validateRange(numValue, range) : { valid: true, status: 'normal' as const };

  // Notify parent component about problem status
  useEffect(() => {
    if (onProblemDetected && range && numValue > 0) {
      const isProblem = validation.status === 'danger';
      onProblemDetected(isProblem, isProblem ? {
        field: fieldKey || label,
        value: numValue,
        range: `${range.min}-${range.max}`,
        unit: unit || '',
        timestamp: new Date().toISOString()
      } : undefined);
    }
  }, [numValue, validation.status]);

  const getBgColor = () => {
    switch (validation.status) {
      case 'danger':
        return 'bg-red-50 border-red-300';
      case 'warning':
        return 'bg-yellow-50 border-yellow-300';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>
          {label} {required && <span className="text-red-500">*</span>}
          {range && (
            <span className="text-xs text-muted-foreground ml-2">
              ({range.min}-{range.max}{unit || ''})
            </span>
          )}
        </Label>
        {validation.status === 'danger' && (
          <div className="flex items-center gap-1 text-red-600 text-xs font-semibold">
            <AlertCircle className="h-3 w-3" />
            PROBLEM
          </div>
        )}
      </div>
      <div className="relative">
        <Input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={`${getBgColor()} ${validation.status !== 'normal' ? getRangeColor(validation.status) : ''}`}
        />
        {unit && (
          <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">{unit}</span>
        )}
      </div>
      {validation.status === 'warning' && (
        <p className="text-xs text-yellow-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Value outside ideal range
        </p>
      )}
      {validation.status === 'danger' && (
        <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Value out of acceptable range - flagged as PROBLEM
        </p>
      )}
    </div>
  );
};
