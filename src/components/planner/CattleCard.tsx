import React from 'react';
import { Cattle } from '../../types';
import { Droplet, Weight, Sparkles, Check, Edit2, Trash2 } from 'lucide-react';

interface CattleCardProps {
  id?: string;
  cattle: Cattle;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const CattleCard: React.FC<CattleCardProps> = ({
  id,
  cattle,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      id={id}
      onClick={onSelect}
      className={`relative cursor-pointer rounded-xl border p-4 transition-all ${
        isSelected
          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/50 shadow-xs'
          : 'border-stone-200 bg-white hover:border-emerald-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-emerald-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-stone-900 dark:text-white">
              {cattle.name}
            </h4>
            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-mono text-stone-600 dark:bg-stone-800 dark:text-stone-300">
              {cattle.tagId}
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {cattle.breed} • {cattle.category}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              title="Edit Cattle"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
              title="Delete Cattle"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
          <Droplet className="h-3.5 w-3.5 text-blue-500" />
          <span>
            <strong>{cattle.dailyMilkYieldLiters} L</strong> / day
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>
            Fat: <strong>{cattle.milkFatPercent}%</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 col-span-2 sm:col-span-1">
          <Weight className="h-3.5 w-3.5 text-stone-400" />
          <span>{cattle.bodyWeightKg} kg BW</span>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px]">
        <span className="text-stone-500">Stage: {cattle.lactationStage}</span>
        <span
          className={`font-semibold ${
            cattle.healthStatus === 'Healthy'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-amber-600 dark:text-amber-400'
          }`}
        >
          {cattle.healthStatus}
        </span>
      </div>
    </div>
  );
};
