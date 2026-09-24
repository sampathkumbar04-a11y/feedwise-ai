import { FliegGrade, FliegResult } from '../types';

/**
 * Calculates the Flieg Score and fermentation evaluation for silage.
 * Standard formula:
 * Flieg Index = 220 + (2 * DryMatter% - 15) - 40 * pH
 * Corrected for aerobic stability, secondary clostridial fermentation,
 * and high-moisture/high-pH penalties in whole-crop and grass silages.
 */
export function calculateFliegScore(params: {
  pH: number;
  dryMatterPercent: number;
  lacticAcidInput?: number;
  aceticAcidInput?: number;
  butyricAcidInput?: number;
}): FliegResult {
  const { pH, dryMatterPercent } = params;

  // Base Flieg formula
  let rawScore = 220 + (2 * dryMatterPercent - 15) - 40 * pH;

  // Modern biological correction:
  // In silage, pH > 4.3 signifies incomplete lactic acidification, aerobic heating,
  // or secondary clostridial / enterobacterial fermentation. Uncorrected Flieg formula
  // artificially inflates score for dry silages (>38% DM) even with high pH.
  if (pH > 4.3) {
    const phExcess = pH - 4.3;
    // Scale penalty smoothly based on how far pH deviates from optimal lactic preservation
    const penalty = phExcess * 38 + (phExcess > 0.8 ? 15 : 0);
    rawScore -= penalty;
  }

  // Also penalize extreme waterlogged silage (DM < 25%) where clostridial butyric risk escalates
  if (dryMatterPercent < 25) {
    rawScore -= (25 - dryMatterPercent) * 2.5;
  }

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
      'Moderate fermentation. Higher acetic acid content and elevated pH indicating slower initial acidification or heat damage.';
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
  const lacticPercent = Math.max(10, Math.min(88, Math.round(clampedScore * 0.72 + Math.max(0, 5.0 - pH) * 8)));
  const butyricPercent = clampedScore < 40 
    ? Math.min(35, Math.round((45 - clampedScore) * 0.65 + (pH > 5.0 ? 8 : 0)))
    : Math.max(0, Math.min(8, Math.round((80 - clampedScore) * 0.1)));
  const aceticPercent = Math.max(5, 100 - lacticPercent - butyricPercent);
  const ammoniaN = Math.max(3.5, Math.min(24, +( (pH - 3.7) * 6.0 + (100 - clampedScore) * 0.09 ).toFixed(1)));

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
