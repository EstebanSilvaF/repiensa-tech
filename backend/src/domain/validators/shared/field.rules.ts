import { ValidationRule } from '../../../shared/validation/validator';

export function requiredTrimmed<T>(
  message: string,
  getValue: (data: T) => string | undefined
): ValidationRule<T> {
  return {
    test: (data) => !!getValue(data)?.trim(),
    message,
  };
}

export function required<T>(
  message: string,
  getValue: (data: T) => unknown
): ValidationRule<T> {
  return {
    test: (data) => !!getValue(data),
    message,
  };
}
