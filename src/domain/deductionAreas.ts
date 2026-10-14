export const deductionAreas = [
  { title: 'Home workspace', prompt: 'Review any records for a space you use for your work and its related costs.', action: 'Review expenses', to: '/transactions' },
  { title: 'Driving and travel', prompt: 'Check business trips, mileage entries, fares, and travel records you may have missed.', action: 'Review mileage', to: '/mileage' },
  { title: 'Tools and subscriptions', prompt: 'Look through equipment, supplies, software, and recurring charges used for work.', action: 'Review transactions', to: '/transactions' },
  { title: 'Outside help', prompt: 'Review payments to contractors and professional services connected to your work.', action: 'Review transactions', to: '/transactions' },
] as const;
