import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { CattleCard } from '../components/planner/CattleCard';
import { RationOptimizerCard } from '../components/planner/RationOptimizerCard';
import { Scale, Plus, IndianRupee, Sparkles } from 'lucide-react';

interface RationPlannerProps {
  id?: string;
  onOpenAddCattle: () => void;
}

export const RationPlanner: React.FC<RationPlannerProps> = ({
  id,
  onOpenAddCattle,
}) => {
  const {
    cattleList,
    selectedCattleId,
    setSelectedCattleId,
    feedCostOverrides,
    setFeedCostOverride,
  } = useAppData();

  const selectedCattle =
    cattleList.find((c) => c.id === selectedCattleId) || cattleList[0];

  return (
    <div id={id} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
            <Scale className="h-6 w-6 text-emerald-600" />
            Precision Dairy Ration Balancer (ICAR / NRC)
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Formulate least-cost Total Mixed Rations (TMR) optimized for Dry Matter intake, Crude Protein, and milk fat preservation.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddCattle}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Cow / Buffalo</span>
        </button>
      </div>

      {/* Cattle Selector Carousel / Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Select Animal from Herd ({cattleList.length})
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            Active: {selectedCattle?.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cattleList.map((cattle) => (
            <CattleCard
              key={cattle.id}
              cattle={cattle}
              isSelected={cattle.id === selectedCattleId}
              onSelect={() => setSelectedCattleId(cattle.id)}
            />
          ))}
        </div>
      </div>

      {/* Main Active Ration Optimizer */}
      {selectedCattle && (
        <RationOptimizerCard
          cattle={selectedCattle}
          customCosts={feedCostOverrides}
          onUpdateCost={(feedId, cost) => setFeedCostOverride(feedId, cost)}
        />
      )}
    </div>
  );
};
