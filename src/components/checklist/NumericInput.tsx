import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateRange, getRangeColor, RangeValidation } from '@/lib/validation';
import { StatusBadge } from '@/components/ui/status-badge';
import { AlertCircle } from 'lucide-react';
import { IssueFlagger } from './IssueFlagger';

interface NumericInputProps {
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  range?: RangeValidation;
  unit?: string;
  required?: boolean;
  onProblemDetected?: (isProblem: boolean, details?: any) => void;
  fieldKey?: string;
  disabled?: boolean;
  checklistId?: string | null;
  transformerLogId?: string | null;
  module?: string;
  section?: string;
  item?: string;
  canFlagIssues?: boolean;
  onPendingIssue?: (issue: any) => void;
}

export const NumericInput = ({ 
  label, 
  value, 
  onChange, 
  range, 
  unit, 
  required,
  onProblemDetected,
  fieldKey,
  disabled = false,
  checklistId,
  transformerLogId,
  module,
  section,
  item,
  canFlagIssues = true,
  onPendingIssue
}: NumericInputProps) => {
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
  // Only validate if value is not 0 (default/empty state)
  const validation = range && numValue !== 0 ? validateRange(numValue, range) : { valid: true, status: 'normal' as const };

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
      </div>
      <div className="relative">
        <Input
          type="number"
          step="any"
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            const inputValue = e.target.value;
            if (inputValue === '' || inputValue === '-') {
              onChange(0);
              return;
            }
            const parsed = parseFloat(inputValue);
            onChange(isNaN(parsed) ? 0 : parsed);
          }}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className={`${getBgColor()} ${validation.status !== 'normal' ? getRangeColor(validation.status) : ''}`}
        />
        {unit && (
          <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">{unit}</span>
        )}
      </div>
      
      {/* Flag Issue Button - Always visible when context is provided */}
      {module && section && item && (
        <div className="mt-2">
          <IssueFlagger
            checklistId={checklistId || undefined}
            transformerLogId={transformerLogId || 'pending'}
            module={module}
            section={section}
            item={item}
            unit={unit}
            disabled={!canFlagIssues}
            defaultSeverity={
              validation.status === 'danger' ? 'critical' : 
              validation.status === 'warning' ? 'high' : 
              'medium'
            }
            autoDescription={
              validation.status === 'danger' 
                ? `Value ${numValue}${unit || ''} is outside acceptable range (${range?.min}-${range?.max}${unit || ''})`
                : validation.status === 'warning'
                ? `Value ${numValue}${unit || ''} is outside ideal range`
                : undefined
            }
            onPendingIssue={onPendingIssue}
          />
        </div>
      )}
    </div>
  );
};
