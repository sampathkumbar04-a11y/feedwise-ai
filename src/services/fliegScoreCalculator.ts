import { FliegGrade, FliegResult } from '../types';

/**
 * Calculates the Flieg Score and fermentation evaluation for silage.
 * Standard formula:
 * Flieg Index = 220 + (2 * DryMatter% - 15) - 40 * pH
 * Normalizes to standard 0-100 scale and evaluates acid ratios.
 */
export function calculateFliegScore(params: {
  pH: number;
  dryMatterPercent: number;
  lacticAcidInput?: number;
  aceticAcidInput?: number;
  butyricAcidInput?: number;
}): FliegResult {
  const { pH, dryMatterPercent } = params;

  // Standard scientific Flieg formula
  const rawScore = 220 + (2 * dryMatterPercent - 15) - 40 * pH;
  const clampedScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  let grade: FliegGrade;
  let fermentationQualitySummary: string;
  let feedingAdvisory: string;
  let aerobicStabilityHours: number;

  if (clampedScore >= 81) {
    grade = 'Very Good';
    fermentationQualitySummary =
      'Optimal homolactic fermentation. Clean acidic profile with low ammonia-N and zero to trace butyric acid.';
    feedingAdvisory =
      'Safe for all high-yielding dairy cattle and calves. Maximizes dry matter intake and milk fat percentage.';
    aerobicStabilityHours = 96;
  } else if (clampedScore >= 61) {
    grade = 'Good';
    fermentationQualitySummary =
      'Predominantly lactic acid with mild acetic acid notes. Stable bunker face with sound preservation.';
    feedingAdvisory =
      'Good quality roughage for lactating cows. Feed within 24 hours of pit exposure.';
    aerobicStabilityHours = 72;
  } else if (clampedScore >= 41) {
    grade = 'Fair';
    fermentationQualitySummary =
      'Moderate fermentation. Higher acetic acid content and elevated pH indicating slower initial acidification.';
    feedingAdvisory =
      'Suitable for maintenance or dry cows. Blend with sweet silage or dry hay to prevent intake depression.';
    aerobicStabilityHours = 48;
  } else if (clampedScore >= 21) {
    grade = 'Poor';
    fermentationQualitySummary =
      'Clostridial contamination risk. Detectable butyric acid and high protein degradation (ammonia-N > 12%).';
    feedingAdvisory =
      'Exercise caution. Do NOT feed to pregnant cows or calves. Limit intake to < 20% of total daily forage.';
    aerobicStabilityHours = 24;
  } else {
    grade = 'Very Poor';
    fermentationQualitySummary =
      'Putrefied / failed fermentation. Severe clostridial activity with high butyric acid and volatile fatty acids.';
    feedingAdvisory =
      'Unsafe for livestock consumption. High risk of ketosis, listeriosis, and severe milk drop. Discard batch.';
    aerobicStabilityHours = 8;
  }

  // Estimated acid ratios based on pH and score
  const lacticPercent = Math.max(15, Math.min(85, Math.round(clampedScore * 0.75 + (5.5 - pH) * 8)));
  const butyricPercent = Math.max(0, Math.min(30, Math.round((100 - clampedScore) * 0.22)));
  const aceticPercent = Math.max(5, 100 - lacticPercent - butyricPercent);
  const ammoniaN = Math.max(4, Math.min(22, +( (pH - 3.8) * 6.5 + (100 - clampedScore) * 0.08 ).toFixed(1)));

  return {
    fliegScore: clampedScore,
    grade,
    pH,
    dryMatter: dryMatterPercent,
    lacticAcidPercent: lacticPercent,
    aceticAcidPercent: aceticPercent,
    butyricAcidPercent: butyricPercent,
    ammoniaNitrogenPercent: ammoniaN,
    fermentationQualitySummary,
    feedingAdvisory,
    aerobicStabilityHours,
  };
}
