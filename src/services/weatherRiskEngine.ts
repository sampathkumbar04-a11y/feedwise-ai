import { WeatherRiskStatus } from '../types';

/**
 * Maps standard WMO weather codes to human-readable weather descriptions.
 */
export function getWeatherConditionFromCode(code?: number): string {
  if (code === undefined || code === null) return 'Fair Weather';
  if (code === 0) return 'Clear Sky';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Fog / Mist';
  if (code >= 51 && code <= 55) return 'Light Drizzle';
  if (code >= 61 && code <= 65) return 'Rain Showers';
  if (code >= 71 && code <= 77) return 'Snow / Hail';
  if (code >= 80 && code <= 82) return 'Scattered Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Partly Cloudy';
}

/**
 * Calculates Temperature Humidity Index (THI) for dairy cattle using the standard NDRI/NRC formula:
 * THI = (1.8 * T + 32) - (0.55 - 0.0055 * RH) * (1.8 * T - 26)
 * Generates actionable farm weather risks for cattle heat stress and feed mold prevention.
 */
export function evaluateFarmWeatherRisk(
  temperatureC: number = 32,
  humidityPercent: number = 68,
  expectedRainfallMm: number = 14,
  locationName: string = 'District Dairy Cluster / Farm',
  options?: {
    weatherCondition?: string;
    weatherCode?: number;
    lastUpdated?: string;
    isLiveLocation?: boolean;
    isCached?: boolean;
    latitude?: number;
    longitude?: number;
    rainForecastSummary?: string;
  }
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

  // Potential spoilage risk based on environmental conditions (temperature > 24C + humidity > 70% accelerates aerobic mold activity)
  let moldScore = 20;
  if (humidityPercent > 70) moldScore += 35;
  if (temperatureC > 28) moldScore += 25;
  if (expectedRainfallMm > 5) moldScore += 15;
  moldScore = Math.min(100, Math.max(10, moldScore));

  const mitigationSteps: string[] = [];
  if (heatStressLevel === 'Severe Stress' || heatStressLevel === 'Moderate Stress') {
    mitigationSteps.push('Activate barn fans and misting systems between 11:00 AM and 4:00 PM.');
    mitigationSteps.push('Shift 60% of daily total mixed ration (TMR) feeding to cooler evening and early morning hours.');
    mitigationSteps.push('Add electrolytes and bypass fat to maintain energy density when dry matter intake dips.');
    mitigationSteps.push('Ensure 24/7 unlimited access to shaded, cool drinking water.');
  } else if (heatStressLevel === 'Mild Stress') {
    mitigationSteps.push('Ensure 24/7 unlimited access to shaded, cool drinking water.');
    mitigationSteps.push('Provide well-ventilated resting areas with clean, dry bedding.');
    mitigationSteps.push('Schedule milking and heavy movements before peak afternoon heat.');
  } else {
    mitigationSteps.push('Comfortable climatic zone for dairy livestock. Normal feeding schedules.');
    mitigationSteps.push('Maintain regular feed bunk cleanouts to prevent residual TMR heating.');
  }

  // Weather-based silage & storage guidance
  if (expectedRainfallMm > 5 || moldScore > 65) {
    mitigationSteps.push('Rain forecast: Inspect silage bunker covers for punctures or rainwater leakage.');
    mitigationSteps.push('Elevate dry straw and bagged concentrate cakes on wooden pallets off damp ground.');
  }

  // Silage storage alert wording - Weather-based storage risk
  let silageStorageAlert = 'Potential spoilage risk low under current environmental conditions. Maintain clean vertical face cuts.';
  if (humidityPercent > 75 && expectedRainfallMm > 5) {
    silageStorageAlert =
      'Weather-based storage risk (High): High humidity and rain forecast increase risk of aerobic deterioration and water ingress. Ensure airtight bunker tarp sealing.';
  } else if (humidityPercent > 75) {
    silageStorageAlert =
      'Weather-based storage risk (Elevated Humidity): Potential aerobic spoilage risk from ambient moisture. Keep exposed bunker face covered with heavy UV-grade plastic.';
  } else if (expectedRainfallMm > 5) {
    silageStorageAlert =
      'Weather-based storage risk (Precipitation): Inspect silage bunker covers and perimeter drainage to prevent moisture seepage into ensiled fodder.';
  } else if (temperatureC > 32) {
    silageStorageAlert =
      'Weather-based storage risk (Ambient Heat): High temperature increases surface heating and fermentation losses at the bunker face. Feed out immediately upon opening.';
  }

  return {
    location: locationName,
    temperatureC,
    humidityPercent,
    thiIndex: thi,
    heatStressLevel,
    expectedRainfallMm,
    moldRiskScore: moldScore,
    mitigationSteps,
    silageStorageAlert,
    weatherCondition: options?.weatherCondition || 'Normal Conditions',
    weatherCode: options?.weatherCode,
    lastUpdated: options?.lastUpdated,
    isLiveLocation: options?.isLiveLocation,
    isCached: options?.isCached,
    latitude: options?.latitude,
    longitude: options?.longitude,
    rainForecastSummary: options?.rainForecastSummary,
  };
}

/**
 * Converts geographical coordinates into a human-readable location name
 * without storing precise coordinates unnecessarily.
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<string> {
  // Strategy 1: BigDataCloud free client-side reverse geocode
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const parts: string[] = [];
      const place = data.locality || data.village || data.city || data.localityInfo?.administrative?.[3]?.name;
      const state = data.principalSubdivision || data.localityInfo?.administrative?.[1]?.name;
      if (place) parts.push(place);
      if (state && !parts.includes(state)) parts.push(state);
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
  } catch {
    // Continue to fallback
  }

  // Strategy 2: OpenStreetMap Nominatim reverse geocode
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
      {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en' },
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const address = data.address;
      if (address) {
        const place =
          address.village ||
          address.town ||
          address.city ||
          address.county ||
          address.state_district;
        const state = address.state;
        if (place && state) return `${place}, ${state}`;
        if (place) return place;
        if (data.display_name) {
          const split = data.display_name.split(',');
          return `${split[0].trim()}${split[1] ? `, ${split[1].trim()}` : ''}`;
        }
      }
    }
  } catch {
    // Continue to fallback
  }

  // Fallback: General regional area
  return `Farm Location (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`;
}

export interface LiveWeatherDataResult {
  weatherStatus: WeatherRiskStatus;
  locationName: string;
  raw: {
    temp: number;
    rh: number;
    rain24h: number;
    condition: string;
    weatherCode: number;
    rainProb?: number;
  };
}

/**
 * Retrieves live weather data from Open-Meteo API using latitude & longitude.
 * Completely free, highly accurate, requires no API keys, and avoids hardcoded values.
 */
export async function fetchLiveFarmWeather(
  latitude: number,
  longitude: number,
  cachedLocationName?: string
): Promise<LiveWeatherDataResult> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&daily=precipitation_sum,precipitation_probability_max,weather_code&timezone=auto&forecast_days=2`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  let response: Response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Weather service request timed out. Check internet connection.');
    }
    throw new Error('Failed to connect to weather service.');
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Weather service returned HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data.current) {
    throw new Error('Incomplete weather information received from service');
  }

  const temp = Math.round(data.current.temperature_2m);
  const rh = Math.round(data.current.relative_humidity_2m);
  const currentPrecip = Number(data.current.precipitation) || 0;
  const forecastRainSum = Number(data.daily?.precipitation_sum?.[0]) || currentPrecip;
  const expectedRain = Math.round(Math.max(currentPrecip, forecastRainSum));
  const rainProb = data.daily?.precipitation_probability_max?.[0];
  const weatherCode = Number(data.current.weather_code) ?? 0;
  const weatherCondition = getWeatherConditionFromCode(weatherCode);

  const rainForecastSummary =
    expectedRain > 0
      ? `${expectedRain} mm expected today${rainProb !== undefined ? ` (${rainProb}% prob.)` : ''}`
      : `Dry conditions (0 mm rain forecast${rainProb !== undefined ? `, ${rainProb}% prob.` : ''})`;

  const locationName =
    cachedLocationName || (await reverseGeocodeCoordinates(latitude, longitude));
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const weatherStatus = evaluateFarmWeatherRisk(temp, rh, expectedRain, locationName, {
    weatherCondition,
    weatherCode,
    lastUpdated: now,
    isLiveLocation: true,
    isCached: false,
    latitude,
    longitude,
    rainForecastSummary,
  });

  return {
    weatherStatus,
    locationName,
    raw: {
      temp,
      rh,
      rain24h: expectedRain,
      condition: weatherCondition,
      weatherCode,
      rainProb,
    },
  };
}

const CACHE_KEY = 'feedwise_weather_cache';

export interface CachedWeatherData {
  weatherStatus: WeatherRiskStatus;
  locationName: string;
  cachedAt: string;
  displayTime: string;
  latitude: number;
  longitude: number;
}

/**
 * Saves the most recently fetched weather status to local storage for offline use.
 */
export function saveCachedWeatherData(
  weatherStatus: WeatherRiskStatus,
  locationName: string,
  latitude: number,
  longitude: number
): void {
  try {
    const data: CachedWeatherData = {
      weatherStatus: {
        ...weatherStatus,
        isCached: true,
      },
      locationName,
      cachedAt: new Date().toISOString(),
      displayTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      latitude,
      longitude,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not cache weather data', e);
  }
}

/**
 * Retrieves the most recently cached weather data when the device is offline.
 */
export function getCachedWeatherData(): CachedWeatherData | null {
  try {
    const item = localStorage.getItem(CACHE_KEY);
    if (!item) return null;
    return JSON.parse(item) as CachedWeatherData;
  } catch {
    return null;
  }
}
