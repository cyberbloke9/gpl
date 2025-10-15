import { ValidationResult } from '@/types/generator';

// Temperature Validations
export const validateWindingTemperature = (temp: number | undefined): ValidationResult => {
  if (temp === undefined || temp === null) return { status: 'valid' };
  if (temp > 95) return { status: 'error', message: '⚠️ CRITICAL: Above 95°C!' };
  if (temp > 85) return { status: 'warning', message: '⚠️ Warning: Above 85°C' };
  return { status: 'valid' };
};

export const validateBearingTemperature = (temp: number | undefined): ValidationResult => {
  if (temp === undefined || temp === null) return { status: 'valid' };
  if (temp > 85) return { status: 'error', message: '⚠️ CRITICAL: Above 85°C!' };
  if (temp > 75) return { status: 'warning', message: '⚠️ Warning: Above 75°C' };
  return { status: 'valid' };
};

export const validateOilTemperature = (temp: number | undefined): ValidationResult => {
  if (temp === undefined || temp === null) return { status: 'valid' };
  if (temp > 70) return { status: 'error', message: '⚠️ CRITICAL: Above 70°C!' };
  if (temp > 60) return { status: 'warning', message: '⚠️ Warning: Above 60°C' };
  return { status: 'valid' };
};

// Electrical Parameter Validations
export const validateVoltage = (voltage: number | undefined, nominal: number = 3300): ValidationResult => {
  if (voltage === undefined || voltage === null) return { status: 'valid' };
  const variance = Math.abs(voltage - nominal) / nominal;
  if (variance > 0.05) {
    return { status: 'warning', message: '⚠️ Outside ±5% nominal range' };
  }
  return { status: 'valid' };
};

export const validateFrequency = (freq: number | undefined): ValidationResult => {
  if (freq === undefined || freq === null) return { status: 'valid' };
  if (freq < 49.5 || freq > 50.5) {
    return { status: 'warning', message: '⚠️ Outside 49.5-50.5 Hz range' };
  }
  return { status: 'valid' };
};

export const validatePowerFactor = (pf: number | undefined): ValidationResult => {
  if (pf === undefined || pf === null) return { status: 'valid' };
  if (pf < 0 || pf > 1) {
    return { status: 'error', message: '❌ Must be between 0 and 1' };
  }
  return { status: 'valid' };
};

// Helper to get visual styles based on validation status
export const getValidationStyles = (status: ValidationResult['status']) => {
  switch (status) {
    case 'valid':
      return '';
    case 'warning':
      return 'border-yellow-400 bg-yellow-50';
    case 'error':
      return 'border-red-400 bg-red-50';
    default:
      return '';
  }
};
