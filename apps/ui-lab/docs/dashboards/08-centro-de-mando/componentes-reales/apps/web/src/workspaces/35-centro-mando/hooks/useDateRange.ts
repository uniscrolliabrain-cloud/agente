import { useState } from 'react';
import type { DateRange } from '../types';
const LABELS: Record<DateRange, string> = { '7d': 'Últimos 7 días', '30d': 'Últimos 30 días', '90d': 'Últimos 90 días' };
export function useDateRange(initial: DateRange = '30d') {
  const [range, setRange] = useState<DateRange>(initial);
  const label = LABELS[range];
  return { range, setRange, label };
}
