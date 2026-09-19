import { WeatherRiskStatus } from '../types';

/**
 * Calculates Temperature Humidity Index (THI) for dairy cattle:
 * THI = (1.8 * T + 32) - (0.55 - 0.0055 * RH) * (1.8 * T - 26)
 * Generates actionable farm weather risks for cattle heat stress and feed mold prevention.
 */
export function evaluateFarmWeatherRisk(
  temperatureC: number = 32,
  humidityPercent: number = 68,
  expectedRainfallMm: number = 14
): WeatherRiskStatus {
  // National Dairy Research Institute (NDRI) / NRC formula
  const t = temperatureC;
  const rh = humidityPercent;
  const thi = Math.round((1.8 * t + 32) - (0.55 - 0.0055 * rh) * (1.8 * t - 26));

  let heatStressLevel: WeatherRiskStatus['heatStressLevel'] = 'Normal';
  if (thi >= 89) {
    heatStressLevel = 'Severe Stress';
  } else if (thi >= 79) {
    heatStressLevel = 'Moderate Stress';
  } else if (thi >= 72) {
    heatStressLevel = 'Mild Stress';
  }

  // Mold risk calculation (temperature > 24C + humidity > 70% accelerates Aspergillus & Fusarium mold)
  let moldScore = 20;
  if (humidityPercent > 70) moldScore += 35;
  if (temperatureC > 28) moldScore += 25;
  if (expectedRainfallMm > 5) moldScore += 15;
  moldScore = Math.min(100, moldScore);

  const mitigationSteps: string[] = [];
  if (heatStressLevel === 'Severe Stress' || heatStressLevel === 'Moderate Stress') {
    mitigationSteps.push('Activate barn fans and misting systems between 11:00 AM and 4:00 PM.');
    mitigationSteps.push('Shift 60% of daily total mixed ration (TMR) feeding to cooler evening and early morning hours.');
    mitigationSteps.push('Add electrolytes and bypass fat to maintain energy density when dry matter intake dips.');
  } else if (heatStressLevel === 'Mild Stress') {
    mitigationSteps.push('Ensure 24/7 unlimited access to shaded, cool drinking water.');
    mitigationSteps.push('Provide well-ventilated resting areas with clean, dry bedding.');
  } else {
    mitigationSteps.push('Comfortable climatic zone for dairy livestock. Normal feeding schedules.');
  }

  if (expectedRainfallMm > 5 || moldScore > 65) {
    mitigationSteps.push('Inspect silage bunker covers for punctures or rainwater leakage.');
    mitigationSteps.push('Elevate dry straw and bagged concentrate cakes on wooden pallets off damp ground.');
  }

  const silageStorageAlert =
    humidityPercent > 75
      ? 'CRITICAL HUMIDITY: Cover exposed silage bunker face with heavy UV-grade plastic. Aerobic spoilage risk elevated.'
      : 'Silage storage stable. Maintain a tight vertical face cut during daily feeding extraction.';

  return {
    location: 'District Dairy Cluster / Farm',
    temperatureC,
    humidityPercent,
    thiIndex: thi,
    heatStressLevel,
    expectedRainfallMm,
    moldRiskScore: moldScore,
    mitigationSteps,
    silageStorageAlert,
  };
}
