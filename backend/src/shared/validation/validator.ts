export type ValidationRule<T> = {
  test: (value: T) => boolean;
  message: string;
};

export function assertValid<T>(value: T, rules: ValidationRule<T>[]): void {
  for (const rule of rules) {
    if (!rule.test(value)) {
      throw new Error(rule.message);
    }
  }
}
