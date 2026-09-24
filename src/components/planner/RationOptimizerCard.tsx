import React, { useState } from 'react';
import { Cattle, RationOptimizationPlan } from '../../types';
import { optimizeCattleRation } from '../../services/rationOptimizationEngine';
import { IndianRupee, Droplet, Sparkles, Scale, CheckCircle2, ChevronRight, Edit3 } from 'lucide-react';
import { VoiceButton } from '../common/VoiceButton';

interface RationOptimizerCardProps {
  id?: string;
  cattle: Cattle;
  customCosts?: Record<string, number>;
  onUpdateCost?: (feedId: string, newCost: number) => void;
}

export const RationOptimizerCard: React.FC<RationOptimizerCardProps> = ({
  id,
  cattle,
  customCosts,
  onUpdateCost,
}) => {
  const [isEditingCosts, setIsEditingCosts] = useState(false);
  const plan: RationOptimizationPlan = optimizeCattleRation(cattle, customCosts);

  const voiceSummary = `Balanced ration plan for ${cattle.name}: Total daily feed weight is ${plan.items.reduce((s, i) => s + i.amountKg, 0).toFixed(1)} kilograms providing ${plan.items.reduce((s, i) => s + i.providedDMKg, 0).toFixed(1)} kilograms dry matter and ${plan.items.reduce((s, i) => s + i.providedCPKg, 0).toFixed(2)} kilograms crude protein. Total daily feed cost is ₹${plan.totalDailyCost}, costing ₹${plan.costPerLiterMilk} per liter of milk. Estimated daily farmer margin is ₹${plan.estimatedDailyProfitMargin}.`;

  return (
    <div
      id={id}
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-stone-900 dark:text-white">
              TMR Ration Balancer: {cattle.name}
            </h3>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Score: {plan.nutritionalAdequacyScore}%
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            ICAR / NRC precision dairy ration for {cattle.dailyMilkYieldLiters}L milk ({cattle.milkFatPercent}% fat)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <VoiceButton textToRead={voiceSummary} label="Read Plan" />
          <button
            type="button"
            onClick={() => setIsEditingCosts(!isEditingCosts)}
            className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            {isEditingCosts ? 'Done Prices' : 'Adjust Feed Prices'}
          </button>
        </div>
      </div>

      {/* Primary KPI row */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-stone-50 dark:bg-stone-800/60 p-3 border border-stone-200/70 dark:border-stone-800">
          <span className="text-[11px] font-medium uppercase text-stone-500 block">
            Daily Feed Cost
          </span>
          <p className="text-xl font-extrabold text-stone-900 dark:text-white mt-0.5">
            ₹{plan.totalDailyCost}
          </p>
          <span className="text-[10px] text-stone-500">Per animal / day</span>
        </div>

        <div className="rounded-xl bg-stone-50 dark:bg-stone-800/60 p-3 border border-stone-200/70 dark:border-stone-800">
          <span className="text-[11px] font-medium uppercase text-stone-500 block">
            Cost Per Liter Milk
          </span>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
            ₹{plan.costPerLiterMilk}
          </p>
          <span className="text-[10px] text-stone-500">Benchmark: &lt;₹22/L</span>
        </div>

        <div className="rounded-xl bg-stone-50 dark:bg-stone-800/60 p-3 border border-stone-200/70 dark:border-stone-800">
          <span className="text-[11px] font-medium uppercase text-stone-500 block">
            Est. Daily Profit
          </span>
          <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
            +₹{plan.estimatedDailyProfitMargin}
          </p>
          <span className="text-[10px] text-stone-500">At standard ₹42/L</span>
        </div>

        <div className="rounded-xl bg-stone-50 dark:bg-stone-800/60 p-3 border border-stone-200/70 dark:border-stone-800">
          <span className="text-[11px] font-medium uppercase text-stone-500 block">
            Fresh Drinking Water
          </span>
          <p className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-0.5">
            {plan.dailyWaterRequirementLiters} L
          </p>
          <span className="text-[10px] text-stone-500">Ad libitum access</span>
        </div>
      </div>

      {/* Ration Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400">
              <th className="pb-2 font-semibold">Feed Ingredient</th>
              <th className="pb-2 font-semibold">Category</th>
              <th className="pb-2 font-semibold text-right">Fresh Wt (kg)</th>
              <th className="pb-2 font-semibold text-right">DM (kg)</th>
              <th className="pb-2 font-semibold text-right">CP (kg)</th>
              <th className="pb-2 font-semibold text-right">Rate (₹/kg)</th>
              <th className="pb-2 font-semibold text-right">Cost (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {plan.items.map((item, idx) => (
              <tr key={idx} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/30">
                <td className="py-2.5 font-medium text-stone-900 dark:text-white">
                  {item.name}
                </td>
                <td className="py-2.5 text-stone-500 capitalize">
                  {item.type.replace('_', ' ')}
                </td>
                <td className="py-2.5 text-right font-bold text-stone-900 dark:text-white">
                  {item.amountKg} kg
                </td>
                <td className="py-2.5 text-right text-stone-600 dark:text-stone-300">
                  {item.providedDMKg}
                </td>
                <td className="py-2.5 text-right text-stone-600 dark:text-stone-300">
                  {item.providedCPKg}
                </td>
                <td className="py-2.5 text-right">
                  {isEditingCosts && onUpdateCost ? (
                    <input
                      type="number"
                      step="0.5"
                      value={item.costPerKg}
                      onChange={(e) => onUpdateCost(item.feedId, Number(e.target.value))}
                      className="w-16 text-right rounded border border-stone-300 px-1 py-0.5 bg-white dark:bg-stone-800 dark:border-stone-700 text-xs"
                    />
                  ) : (
                    `₹${item.costPerKg}`
                  )}
                </td>
                <td className="py-2.5 text-right font-semibold text-stone-900 dark:text-white">
                  ₹{item.totalCost}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-stone-200 dark:border-stone-700 font-bold text-stone-900 dark:text-white">
              <td className="pt-2.5">Total Daily Ration</td>
              <td className="pt-2.5"></td>
              <td className="pt-2.5 text-right">
                {plan.items.reduce((s, i) => s + i.amountKg, 0).toFixed(1)} kg
              </td>
              <td className="pt-2.5 text-right text-emerald-600 dark:text-emerald-400">
                {plan.items.reduce((s, i) => s + i.providedDMKg, 0).toFixed(1)} / {plan.dailyDryMatterTargetKg} kg
              </td>
              <td className="pt-2.5 text-right text-blue-600 dark:text-blue-400">
                {plan.items.reduce((s, i) => s + i.providedCPKg, 0).toFixed(2)} / {plan.dailyCPTargetKg} kg
              </td>
              <td className="pt-2.5 text-right"></td>
              <td className="pt-2.5 text-right text-base text-emerald-600 dark:text-emerald-400">
                ₹{plan.totalDailyCost}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Advisory notes */}
      <div className="mt-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 border border-emerald-200/60 dark:border-emerald-900/40">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h5 className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Feeding Guidelines & Minerals
          </h5>
          <div className="flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
            <span className="rounded bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5">
              Ca: {plan.calciumTargetGrams}g/day
            </span>
            <span className="rounded bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5">
              P: {plan.phosphorusTargetGrams}g/day
            </span>
          </div>
        </div>
        <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
          {plan.advisorNotes.map((note, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
