import { addMonths, addYears, format } from "date-fns";

export type SubscriptionCycle = "monthly" | "quarterly" | "yearly";

/**
 * Calculate the next renewal date based on current date and cycle
 */
export function calculateNextRenewal(currentDate: Date, cycle: SubscriptionCycle): Date {
  switch (cycle) {
    case "monthly":
      return addMonths(currentDate, 1);
    case "quarterly":
      return addMonths(currentDate, 3);
    case "yearly":
      return addYears(currentDate, 1);
    default:
      return addMonths(currentDate, 1);
  }
}

/**
 * Generate preview of next few renewal dates
 */
export function previewRenewalDates(startDate: Date, cycle: SubscriptionCycle, count: number = 3): string[] {
  const dates: string[] = [];
  let currentDate = new Date(startDate);
  
  for (let i = 0; i < count; i++) {
    currentDate = calculateNextRenewal(currentDate, cycle);
    dates.push(format(currentDate, "PPP"));
  }
  
  return dates;
}

/**
 * Calculate subscription end date based on start date and duration
 */
export function calculateEndDate(startDate: Date, cycle: SubscriptionCycle, periods: number): Date {
  switch (cycle) {
    case "monthly":
      return addMonths(startDate, periods);
    case "quarterly":
      return addMonths(startDate, periods * 3);
    case "yearly":
      return addYears(startDate, periods);
    default:
      return addMonths(startDate, periods);
  }
}