/**
 * Logic tính lương theo skill /skills/salary-logic.md
 * amount = hours * hourly_rate (làm tròn 2 chữ số mỗi dòng).
 */

const MONEY_DECIMALS = 2;

export function amountForLine(hours: number, hourlyRate: number): number {
  const raw = hours * hourlyRate;
  const factor = 10 ** MONEY_DECIMALS;
  return Math.round(raw * factor) / factor;
}

export type SessionLine = {
  hours: number;
  hourly_rate: number | null;
};

export type ComputedLine = SessionLine & {
  amount: number | null;
  missingRate: boolean;
};

export function computeLines(lines: SessionLine[]): {
  lines: ComputedLine[];
  total: number | null;
  hasMissingRate: boolean;
} {
  const computed: ComputedLine[] = lines.map((line) => {
    if (line.hourly_rate == null || Number.isNaN(line.hourly_rate)) {
      return {
        ...line,
        amount: null,
        missingRate: true,
      };
    }
    return {
      ...line,
      amount: amountForLine(line.hours, line.hourly_rate),
      missingRate: false,
    };
  });

  const hasMissingRate = computed.some((l) => l.missingRate);
  const total = hasMissingRate
    ? null
    : computed.reduce((sum, l) => sum + (l.amount ?? 0), 0);

  return { lines: computed, total, hasMissingRate };
}
