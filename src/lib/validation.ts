export interface RangeValidation {
  min: number;
  max: number;
  ideal?: { min: number; max: number };
}

export const validateRange = (value: number, range: RangeValidation) => {
  if (value < range.min || value > range.max) {
    return { valid: false, status: 'danger' as const };
  }
  if (range.ideal && (value < range.ideal.min || value > range.ideal.max)) {
    return { valid: true, status: 'warning' as const };
  }
  return { valid: true, status: 'normal' as const };
};

export const getRangeColor = (status: 'normal' | 'warning' | 'danger') => {
  switch (status) {
    case 'normal':
      return 'text-green-600';
    case 'warning':
      return 'text-yellow-600';
    case 'danger':
      return 'text-red-600';
  }
};
