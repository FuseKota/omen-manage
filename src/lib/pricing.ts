import { Category, RentalPlan } from './constants';

export function getSaleUnitPrice(category: Category): number {
  switch (category) {
    case 'OMEN':
      return 500;
    case 'VINYL':
      return 300;
    default:
      return 0;
  }
}

export function getRentalAmount(category: Category, minutes: number): { plan: RentalPlan; amount: number } {
  const hours = minutes / 60;

  let plan: RentalPlan;
  let baseAmount: number;

  // 猶予15分を考慮してプランを決定
  if (hours <= 1.25) { // 1時間15分まで
    plan = '1h';
    baseAmount = 100;
  } else if (hours <= 3.25) { // 3時間15分まで
    plan = '3h';
    baseAmount = 200;
  } else if (hours <= 6.25) { // 6時間15分まで
    plan = '6h';
    baseAmount = 300;
  } else { // 6時間15分超
    plan = 'allday';
    baseAmount = 400;
  }

  return { plan, amount: baseAmount };
}

export function getRentalEstimateText(category: Category, plan: RentalPlan): string {
  const baseAmounts = {
    '1h': 100,
    '3h': 200,
    '6h': 300,
    'allday': 400,
  };

  const baseAmount = baseAmounts[plan];
  return `約${baseAmount}円`;
}

export function getPlanDisplayName(plan: RentalPlan): string {
  const names = {
    '1h': '1時間',
    '3h': '3時間',
    '6h': '6時間',
    'allday': '終日',
  };

  return names[plan];
}