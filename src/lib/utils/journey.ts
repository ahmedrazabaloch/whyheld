/**
 * Journey formatting and normalization utilities.
 * Pure functions. No side effects. No database queries.
 */

export function formatJourneyDuration(
  durationDays?: number | null, 
  startDate?: Date | string | null, 
  endDate?: Date | string | null
): string {
  if (durationDays && durationDays > 0) {
    return `${durationDays} ${durationDays === 1 ? 'day' : 'days'}`;
  }
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive duration
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    }
  }

  return "Duration flexible";
}

export function formatJourneyDate(date?: Date | string | null): string {
  if (!date) return "Unknown date";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Unknown date";
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(d);
}

export function normalizeJourneySummary(summary?: string | null, aiSummary?: string | null): string {
  if (summary && summary.trim().length > 0) return summary;
  if (aiSummary && aiSummary.trim().length > 0) return aiSummary;
  return "No summary available";
}

export function normalizeJourneyMetadata(metadata: {
  originQuery?: string | null;
  primaryCountry?: string | null;
  region?: string | null;
  pace?: string | null;
  budget?: string | null;
}) {
  const destination = metadata.originQuery || metadata.region || metadata.primaryCountry || "Unknown";
  
  let pace = "Flexible";
  switch (metadata.pace) {
    case "ONE_PLACE_DEEPLY": pace = "One place deeply"; break;
    case "SLOW_UNHURRIED": pace = "Slow & unhurried"; break;
    case "GENTLY_BALANCED": pace = "Gently balanced"; break;
  }

  let budget = "Not specified";
  switch (metadata.budget) {
    case "MODEST": budget = "Modest"; break;
    case "COMFORTABLE": budget = "Comfortable"; break;
    case "PREMIUM": budget = "Premium"; break;
    case "LUXURY": budget = "Luxury"; break;
  }

  return {
    destination,
    pace,
    budget
  };
}
