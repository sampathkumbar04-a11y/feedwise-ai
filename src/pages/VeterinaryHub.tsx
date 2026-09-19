import React from 'react';
import { Stethoscope, AlertTriangle, ShieldCheck, Activity, Pill } from 'lucide-react';

interface VeterinaryHubProps {
  id?: string;
}

export const VeterinaryHub: React.FC<VeterinaryHubProps> = ({ id }) => {
  return (
    <div id={id} className="space-y-6">
      {/* Title */}
      <div className="pb-3 border-b border-stone-200 dark:border-stone-800">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-emerald-600" />
          Dairy Veterinary & Rumen Metabolic Health Hub
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Clinical risk assessment for Subacute Rumen Acidosis (SARA), bovine ketosis, and mycotoxicosis prevention.
        </p>
      </div>

      {/* Rumen Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-white">
            <Activity className="h-4 w-4 text-emerald-600" /> SARA Acidosis Index
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600">Low Risk (5.8)</span>
            <span className="text-xs text-stone-500">Rumen pH target &gt; 5.8</span>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Effective NDF fiber intake is currently adequate across all lactating cow rations, preventing sudden rumen lactic accumulation.
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-white">
            <ShieldCheck className="h-4 w-4 text-blue-600" /> Ketosis Vulnerability
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-blue-600">Safe (&lt;1.0)</span>
            <span className="text-xs text-stone-500">Blood BHBA &lt; 1.2 mmol/L</span>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Silage Flieg score is above 80 with minimal butyric acid, preventing secondary ketosis in fresh cows (days 1-30 post calving).
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-white">
            <AlertTriangle className="h-4 w-4 text-amber-600" /> Mycotoxin & Mold Watch
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-600">Guarded (Lot #4)</span>
            <span className="text-xs text-stone-500">Mustard Cake Moisture 13%</span>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Concentrate cake storage shows moderate humidity risk. Keep aerated off damp floors to prevent Aspergillus aflatoxin B1.
          </p>
        </div>
      </div>

      {/* Clinical Advisory & Supplementation Matrix */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-4">
        <h3 className="font-bold text-stone-900 dark:text-white text-base flex items-center gap-2">
          <Pill className="h-4 w-4 text-emerald-600" />
          Veterinary Buffer & Micronutrient Prescriptions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
            <h4 className="font-bold text-stone-900 dark:text-white mb-1">
              Sodium Bicarbonate (Baking Soda Rumen Buffer)
            </h4>
            <p className="text-stone-600 dark:text-stone-300">
              <strong>Dosage:</strong> 50 - 100g per cow per day blended into concentrate mash.
            </p>
            <p className="text-stone-500 mt-1">
              <strong>Indication:</strong> Crucial when feeding high-corn silage or finely crushed grains to maintain rumen pH above 6.0 and prevent milk fat depression.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
            <h4 className="font-bold text-stone-900 dark:text-white mb-1">
              Chelated Trace Mineral Mixture (Zinc, Copper, Cobalt, Se)
            </h4>
            <p className="text-stone-600 dark:text-stone-300">
              <strong>Dosage:</strong> 60 - 80g daily per adult lactating cow or buffalo.
            </p>
            <p className="text-stone-500 mt-1">
              <strong>Indication:</strong> Directly boosts uterine involution, heat expression (estrus cycle), and reduces somatic cell count in high yielders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
