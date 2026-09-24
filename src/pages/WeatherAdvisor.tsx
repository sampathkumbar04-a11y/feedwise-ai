import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  evaluateFarmWeatherRisk,
  fetchLiveFarmWeather,
  getCachedWeatherData,
  saveCachedWeatherData,
} from '../services/weatherRiskEngine';
import { GaugeChart } from '../components/common/GaugeChart';
import { VoiceButton } from '../components/common/VoiceButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  CloudSun,
  Droplet,
  Thermometer,
  CloudRain,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  RotateCw,
  Clock,
  WifiOff,
  AlertCircle,
  Sliders,
  Compass,
  Sparkles,
  Info,
} from 'lucide-react';

interface WeatherAdvisorProps {
  id?: string;
}

type WeatherMode = 'auto' | 'manual';

export const WeatherAdvisor: React.FC<WeatherAdvisorProps> = ({ id }) => {
  const { weatherStatus, refreshWeather, setWeatherStatus } = useAppData();
  const { isOnline } = useOnlineStatus();

  // Mode: automatic location weather vs manual microclimate simulator
  const [mode, setMode] = useState<WeatherMode>(() => {
    return weatherStatus.isLiveLocation ? 'auto' : 'manual';
  });

  // Manual simulator state (keeps existing functionality)
  const [temp, setTemp] = useState<number>(weatherStatus.temperatureC);
  const [rh, setRh] = useState<number>(weatherStatus.humidityPercent);
  const [rain, setRain] = useState<number>(weatherStatus.expectedRainfallMm);

  // Automatic location state
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [farmLocationName, setFarmLocationName] = useState<string>(
    weatherStatus.location || 'District Dairy Cluster / Farm'
  );
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(
    weatherStatus.lastUpdated || ''
  );
  const [isDataCached, setIsDataCached] = useState<boolean>(
    Boolean(weatherStatus.isCached)
  );

  // Stored coordinates in memory for refresh / reconnect
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(() => {
    if (weatherStatus.latitude && weatherStatus.longitude) {
      return { lat: weatherStatus.latitude, lon: weatherStatus.longitude };
    }
    const cached = getCachedWeatherData();
    if (cached) {
      return { lat: cached.latitude, lon: cached.longitude };
    }
    return null;
  });

  // Active weather object evaluated with THI engine
  const activeWeather =
    mode === 'manual'
      ? evaluateFarmWeatherRisk(temp, rh, rain, 'Manual Microclimate Simulation')
      : weatherStatus;

  // Handle manual slider updates (preserves 100% existing functionality)
  const handleManualUpdate = (newTemp: number, newRh: number, newRain: number) => {
    setTemp(newTemp);
    setRh(newRh);
    setRain(newRain);
    refreshWeather(newTemp, newRh, newRain, 'Manual Microclimate Simulation');
  };

  // Fetch weather data for given coordinates
  const fetchWeatherForCoords = useCallback(
    async (lat: number, lon: number, isBackground = false) => {
      if (!isOnline) {
        // In offline mode, check cached data
        const cached = getCachedWeatherData();
        if (cached) {
          setWeatherStatus(cached.weatherStatus);
          setFarmLocationName(cached.locationName);
          setLastUpdatedTime(cached.displayTime);
          setIsDataCached(true);
        } else {
          setApiError('Device is currently offline and no cached weather data is available.');
        }
        return;
      }

      if (!isBackground) setIsRefreshing(true);
      setApiError(null);

      try {
        const result = await fetchLiveFarmWeather(lat, lon);
        setWeatherStatus(result.weatherStatus);
        setFarmLocationName(result.locationName);
        setLastUpdatedTime(result.weatherStatus.lastUpdated || '');
        setIsDataCached(false);

        // Update slider values to match live readings so switching to manual is seamless
        setTemp(result.raw.temp);
        setRh(result.raw.rh);
        setRain(result.raw.rain24h);

        // Save to offline cache
        saveCachedWeatherData(result.weatherStatus, result.locationName, lat, lon);
      } catch (err: any) {
        setApiError(err.message || 'Failed to retrieve live weather data.');
        // Fallback to cache if available
        const cached = getCachedWeatherData();
        if (cached) {
          setWeatherStatus(cached.weatherStatus);
          setFarmLocationName(cached.locationName);
          setLastUpdatedTime(cached.displayTime);
          setIsDataCached(true);
        }
      } finally {
        if (!isBackground) setIsRefreshing(false);
      }
    },
    [isOnline, setWeatherStatus]
  );

  // Request browser geolocation permission & fetch live weather
  const requestLocationAndWeather = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    setApiError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCoords({ lat, lon });
        setIsLocating(false);
        setMode('auto');
        await fetchWeatherForCoords(lat, lon);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            'Location permission was denied. Please allow location access in your browser or continue with the manual simulation below.'
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError('Location information is currently unavailable from your device.');
        } else if (error.code === error.TIMEOUT) {
          setLocationError('Location request timed out. Please try clicking "Use My Location" again.');
        } else {
          setLocationError('Unable to obtain geographical location.');
        }
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
    );
  }, [fetchWeatherForCoords]);

  // Handle manual refresh button click
  const handleRefreshClick = () => {
    if (coords) {
      fetchWeatherForCoords(coords.lat, coords.lon);
    } else {
      requestLocationAndWeather();
    }
  };

  // Re-synchronize weather when internet connectivity returns (Requirement 7)
  const prevOnlineRef = useRef(isOnline);
  useEffect(() => {
    if (!prevOnlineRef.current && isOnline && coords && mode === 'auto') {
      fetchWeatherForCoords(coords.lat, coords.lon, true);
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline, coords, mode, fetchWeatherForCoords]);

  // Periodic automatic refresh every 20 minutes when active in auto mode & online (Requirement 6)
  useEffect(() => {
    if (mode !== 'auto' || !coords || !isOnline) return;
    const interval = setInterval(() => {
      fetchWeatherForCoords(coords.lat, coords.lon, true);
    }, 20 * 60 * 1000);
    return () => clearInterval(interval);
  }, [mode, coords, isOnline, fetchWeatherForCoords]);

  // Voice summary for audio accessibility
  const voiceSummary = `Current Temperature Humidity Index is ${activeWeather.thiIndex}, categorized as ${activeWeather.heatStressLevel}. Temperature is ${activeWeather.temperatureC} degrees Celsius with ${activeWeather.humidityPercent} percent humidity. Expected rainfall is ${activeWeather.expectedRainfallMm} millimeters. Weather-based storage advisory: ${activeWeather.silageStorageAlert}`;

  return (
    <div id={id} className="space-y-6">
      {/* Title & Top Bar */}
      <div className="pb-3 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
            <CloudSun className="h-6 w-6 text-amber-500" />
            Weather, THI & Silage Storage Risk Advisor
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Dairy Temperature-Humidity Index (THI) and aerobic spoilage prevention engine with automated farm geolocation.
          </p>
        </div>

        <VoiceButton textToRead={voiceSummary} label="Listen to Advisory" />
      </div>

      {/* Mode Switcher & Location Bar */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Mode Switcher Tabs */}
          <div className="inline-flex rounded-xl bg-stone-100 p-1 dark:bg-stone-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setMode('auto');
                if (!coords && !weatherStatus.isLiveLocation) {
                  requestLocationAndWeather();
                }
              }}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                mode === 'auto'
                  ? 'bg-white text-emerald-700 shadow-xs dark:bg-stone-700 dark:text-emerald-300 font-bold'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Automatic Location Weather</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                mode === 'manual'
                  ? 'bg-white text-emerald-700 shadow-xs dark:bg-stone-700 dark:text-emerald-300 font-bold'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Manual Simulation</span>
            </button>
          </div>

          {/* Action & Status Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {mode === 'auto' && (
              <>
                <button
                  type="button"
                  onClick={requestLocationAndWeather}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{isLocating ? 'Locating Farm...' : 'Use My Location'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRefreshClick}
                  disabled={isRefreshing || isLocating}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
                  <span>Refresh Weather</span>
                </button>
              </>
            )}

            {!isOnline && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900">
                <WifiOff className="h-3 w-3" />
                <span>Offline Mode</span>
              </span>
            )}
          </div>
        </div>

        {/* Location & Last Updated Status Banner */}
        {mode === 'auto' && (
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 font-medium">
              <span className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                📍 Farm Location:
              </span>
              <span>{farmLocationName}</span>
              {activeWeather.weatherCondition && (
                <span className="text-stone-400 text-[11px]">
                  • {activeWeather.weatherCondition}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-stone-500">
              {lastUpdatedTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {isDataCached ? (
                    <span className="text-amber-700 dark:text-amber-400 font-medium">
                      Last synced weather data: {lastUpdatedTime}
                    </span>
                  ) : (
                    <span>Last updated: {lastUpdatedTime}</span>
                  )}
                </span>
              )}
              {isDataCached && (
                <span className="rounded bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                  Cached
                </span>
              )}
            </div>
          </div>
        )}

        {/* Location or API Error Notices */}
        {locationError && (
          <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Location Access Notice:</span>
              <p>{locationError}</p>
              <button
                type="button"
                onClick={() => setMode('manual')}
                className="mt-1.5 text-[11px] font-bold underline text-amber-900 dark:text-amber-200"
              >
                Switch to Manual Simulation &rarr;
              </button>
            </div>
          </div>
        )}

        {apiError && (
          <div className="rounded-xl bg-rose-50 p-3 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Weather Service Notice:</span>
              <p>{apiError}</p>
              <div className="mt-1.5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRefreshClick}
                  className="text-[11px] font-bold underline text-rose-900 dark:text-rose-200"
                >
                  Retry Connection
                </button>
                <button
                  type="button"
                  onClick={() => setMode('manual')}
                  className="text-[11px] font-bold underline text-stone-600 dark:text-stone-300"
                >
                  Use Manual Simulation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main THI & Ambient / Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Microclimate Simulator OR Automatic Readings */}
        <div className="lg:col-span-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-5">
          {mode === 'manual' ? (
            /* Preserved Manual Microclimate Simulator */
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-stone-900 dark:text-white text-base flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-rose-500" />
                  Microclimate Simulator (Farm Ambient)
                </h3>
                <span className="text-[11px] font-semibold text-stone-400">Manual Mode</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Ambient Temperature (°C)</span>
                    <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                      {temp}°C
                    </span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="45"
                    step="1"
                    value={temp}
                    onChange={(e) => handleManualUpdate(Number(e.target.value), rh, rain)}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500">
                    <span>18°C (Comfortable)</span>
                    <span>32°C (Stress threshold)</span>
                    <span>45°C (Extreme Heat)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Relative Humidity (% RH)</span>
                    <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                      {rh}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="98"
                    step="1"
                    value={rh}
                    onChange={(e) => handleManualUpdate(temp, Number(e.target.value), rain)}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500">
                    <span>20% (Dry)</span>
                    <span>65% (Typical Monsoon)</span>
                    <span>98% (Saturated)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Expected 24-hr Rainfall (mm)</span>
                    <span className="text-base font-bold text-teal-600 dark:text-teal-400">
                      {rain} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="2"
                    value={rain}
                    onChange={(e) => handleManualUpdate(temp, rh, Number(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500">
                    <span>0 mm (Clear)</span>
                    <span>15 mm (Moderate Shower)</span>
                    <span>60 mm (Heavy Downpour)</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Automatic Farm Weather Observations */
            <>
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                <h3 className="font-bold text-stone-900 dark:text-white text-base flex items-center gap-2">
                  <Compass className="h-4 w-4 text-emerald-600" />
                  Live Farm Meteorological Data
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <Sparkles className="h-3 w-3" />
                  <span>Automated Detection</span>
                </span>
              </div>

              {/* Weather Metrics Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5 dark:border-rose-950/60 dark:bg-rose-950/20 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-rose-800 dark:text-rose-300 mb-1">
                    <Thermometer className="h-3.5 w-3.5" />
                    <span>Temperature</span>
                  </div>
                  <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                    {activeWeather.temperatureC}°C
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">Ambient Dry Bulb</div>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 dark:border-blue-950/60 dark:bg-blue-950/20 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-blue-800 dark:text-blue-300 mb-1">
                    <Droplet className="h-3.5 w-3.5" />
                    <span>Humidity</span>
                  </div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {activeWeather.humidityPercent}%
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">Relative Humidity (RH)</div>
                </div>

                <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3.5 dark:border-teal-950/60 dark:bg-teal-950/20 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-teal-800 dark:text-teal-300 mb-1">
                    <CloudRain className="h-3.5 w-3.5" />
                    <span>Rainfall</span>
                  </div>
                  <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
                    {activeWeather.expectedRainfallMm} mm
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">24h Forecast Sum</div>
                </div>
              </div>

              {/* Forecast & Environmental Storage Risk Tier */}
              <div className="space-y-2 pt-1 text-xs">
                {activeWeather.rainForecastSummary && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
                    <span className="font-semibold text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                      <CloudRain className="h-3.5 w-3.5 text-teal-600" />
                      Precipitation Forecast:
                    </span>
                    <span className="font-bold text-stone-900 dark:text-white">
                      {activeWeather.rainForecastSummary}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
                  <span className="font-semibold text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-amber-600" />
                    Weather-based storage risk index:
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                      activeWeather.moldRiskScore > 65
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : activeWeather.moldRiskScore > 40
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {activeWeather.moldRiskScore}/100 •{' '}
                    {activeWeather.moldRiskScore > 65
                      ? 'Elevated Risk'
                      : activeWeather.moldRiskScore > 40
                      ? 'Guarded Risk'
                      : 'Low Risk'}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setMode('manual')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 underline cursor-pointer"
                >
                  Need to simulate custom temperature & humidity conditions? Switch to Manual Mode &rarr;
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Column: THI Gauge & Stress Evaluation */}
        <div className="lg:col-span-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 className="font-bold text-stone-900 dark:text-white text-base">
                  Temperature-Humidity Index (THI)
                </h3>
                <span className="text-[11px] text-stone-500">
                  Temperature: {activeWeather.temperatureC}°C • Humidity: {activeWeather.humidityPercent}%
                </span>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  activeWeather.heatStressLevel === 'Normal'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : activeWeather.heatStressLevel === 'Mild Stress'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {activeWeather.heatStressLevel}
              </span>
            </div>

            <div className="my-4 flex items-center justify-center">
              <GaugeChart
                value={activeWeather.thiIndex}
                label="THI Value"
                subLabel={activeWeather.heatStressLevel}
                size={180}
              />
            </div>
          </div>

          <div className="rounded-xl bg-stone-50 dark:bg-stone-800/60 p-4 border border-stone-200 dark:border-stone-700 text-xs">
            <span className="font-bold text-stone-900 dark:text-white block mb-1">
              Silage Bunker & Storage Alert:
            </span>
            <p className="text-stone-600 dark:text-stone-300">
              {activeWeather.silageStorageAlert}
            </p>
            <span className="text-[10px] text-stone-400 block mt-2">
              * Note: Weather-based storage risk evaluates environmental predisposition for aerobic decay; inspect physical bunker face daily.
            </span>
          </div>
        </div>
      </div>

      {/* Action Mitigation Protocol */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <h3 className="font-bold text-stone-900 dark:text-white text-base mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Recommended Climate Actions & Feeding Shift
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeWeather.mitigationSteps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-stone-700 dark:text-stone-300">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
