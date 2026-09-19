import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { evaluateFarmWeatherRisk } from '../services/weatherRiskEngine';
import { GaugeChart } from '../components/common/GaugeChart';
import { VoiceButton } from '../components/common/VoiceButton';
import { CloudSun, Droplet, Thermometer, Wind, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface WeatherAdvisorProps {
  id?: string;
}

export const WeatherAdvisor: React.FC<WeatherAdvisorProps> = ({ id }) => {
  const { weatherStatus, refreshWeather } = useAppData();
  const [temp, setTemp] = useState<number>(weatherStatus.temperatureC);
  const [rh, setRh] = useState<number>(weatherStatus.humidityPercent);
  const [rain, setRain] = useState<number>(weatherStatus.expectedRainfallMm);

  const activeWeather = evaluateFarmWeatherRisk(temp, rh, rain);

  const handleUpdate = (newTemp: number, newRh: number, newRain: number) => {
    setTemp(newTemp);
    setRh(newRh);
    setRain(newRain);
    refreshWeather(newTemp, newRh, newRain);
  };

  const voiceSummary = `Current Temperature Humidity Index is ${activeWeather.thiIndex}, categorized as ${activeWeather.heatStressLevel}. Temperature is ${activeWeather.temperatureC} degrees Celsius with ${activeWeather.humidityPercent} percent humidity. Storage alert: ${activeWeather.silageStorageAlert}`;

  return (
    <div id={id} className="space-y-6">
      {/* Title */}
      <div className="pb-3 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
            <CloudSun className="h-6 w-6 text-amber-500" />
            Weather, THI & Silage Storage Risk Advisor
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Dairy Temperature-Humidity Index (THI) and aerobic spoilage prevention engine.
          </p>
        </div>

        <VoiceButton textToRead={voiceSummary} label="Listen to Advisory" />
      </div>

      {/* Main THI & Sliders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Climate Simulator */}
        <div className="lg:col-span-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-5">
          <h3 className="font-bold text-stone-900 dark:text-white text-base flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-rose-500" />
            Microclimate Simulator (Farm Ambient)
          </h3>

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
                onChange={(e) => handleUpdate(Number(e.target.value), rh, rain)}
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
                onChange={(e) => handleUpdate(temp, Number(e.target.value), rain)}
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
                onChange={(e) => handleUpdate(temp, rh, Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>0 mm (Clear)</span>
                <span>15 mm (Moderate Shower)</span>
                <span>60 mm (Heavy Downpour)</span>
              </div>
            </div>
          </div>
        </div>

        {/* THI Gauge & Stress Evaluation */}
        <div className="lg:col-span-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-stone-900 dark:text-white text-base">
                Temperature-Humidity Index (THI)
              </h3>
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
