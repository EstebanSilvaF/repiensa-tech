import { Decimal } from '@prisma/client/runtime/library';

export function decimalToNumber(value: Decimal | number): number {
  return typeof value === 'number' ? value : Number(value);
}

export function toIsoDate(value: Date | null | undefined): Date | null {
  return value ?? null;
}
