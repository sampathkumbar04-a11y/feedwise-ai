import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Cattle } from '../types';
import { Beef, Plus, Droplet, Sparkles, Scale, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { Modal } from '../components/common/Modal';

interface CattleManagerProps {
  id?: string;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const CattleManager: React.FC<CattleManagerProps> = ({
  id,
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const { cattleList, addCattle, updateCattle, deleteCattle } = useAppData();

  // New Cattle Form State
  const [name, setName] = useState('');
  const [tagId, setTagId] = useState('');
  const [breed, setBreed] = useState('Gir');
  const [category, setCategory] = useState<Cattle['category']>('Milking Cow');
  const [bodyWeightKg, setBodyWeightKg] = useState(450);
  const [dailyMilkYieldLiters, setDailyMilkYieldLiters] = useState(14);
  const [milkFatPercent, setMilkFatPercent] = useState(4.5);
  const [lactationStage, setLactationStage] = useState<Cattle['lactationStage']>('Early (1-100d)');

  // Edit Modal State
  const [editingCattle, setEditingCattle] = useState<Cattle | null>(null);

  const handleSaveNewCattle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCattle({
      name,
      tagId: tagId.trim() || `IN-${Math.floor(1000 + Math.random() * 9000)}`,
      breed,
      category,
      bodyWeightKg,
      dailyMilkYieldLiters,
      milkFatPercent,
      lactationStage,
      healthStatus: 'Healthy',
      currentDailyRationKg: Math.round(bodyWeightKg * 0.08),
      targetMilkLiters: dailyMilkYieldLiters + 2,
    });

    setName('');
    setTagId('');
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCattle) return;

    updateCattle(editingCattle.id, editingCattle);
    setEditingCattle(null);
  };

  const totalMilk = cattleList.reduce((sum, c) => sum + c.dailyMilkYieldLiters, 0);
  const avgFat =
    cattleList.length > 0
      ? +(
          cattleList.reduce((sum, c) => sum + c.milkFatPercent, 0) /
          cattleList.length
        ).toFixed(1)
      : 4.2;

  return (
    <div id={id} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
            <Beef className="h-6 w-6 text-emerald-600" />
            Dairy Cattle Herd Roster ({cattleList.length} Head)
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Track individual animal body weights, lactation stages, daily milk production, and fat percentages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Cattle</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <span className="text-xs font-medium text-stone-500 block">Total Daily Milk Collection</span>
          <p className="text-2xl font-extrabold text-stone-900 dark:text-white mt-1">
            {totalMilk.toFixed(1)} Liters
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">From {cattleList.filter(c => c.dailyMilkYieldLiters > 0).length} milking animals</span>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <span className="text-xs font-medium text-stone-500 block">Herd Average Milk Fat</span>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {avgFat}% Fat
          </p>
          <span className="text-[11px] text-stone-500">Includes Gir, HF Cross & Buffaloes</span>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <span className="text-xs font-medium text-stone-500 block">Veterinary Health Status</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            100% Sound
          </p>
          <span className="text-[11px] text-stone-500">Zero active mastitis or ketosis cases</span>
        </div>
      </div>

      {/* Cattle Table / Cards */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900 overflow-hidden">
        <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <h3 className="font-bold text-stone-900 dark:text-white text-sm">
            Registered Dairy Livestock
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 text-stone-500">
                <th className="py-3 px-4 font-semibold">Animal Name & Tag</th>
                <th className="py-3 px-4 font-semibold">Breed & Category</th>
                <th className="py-3 px-4 font-semibold">Body Weight</th>
                <th className="py-3 px-4 font-semibold">Daily Milk</th>
                <th className="py-3 px-4 font-semibold">Milk Fat %</th>
                <th className="py-3 px-4 font-semibold">Lactation Stage</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {cattleList.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-stone-900 dark:text-white block">
                      {c.name}
                    </span>
                    <span className="font-mono text-[10px] text-stone-400">{c.tagId}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-stone-800 dark:text-stone-200 block font-medium">{c.breed}</span>
                    <span className="text-[10px] text-stone-500">{c.category}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-stone-700 dark:text-stone-300">
                    {c.bodyWeightKg} kg
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                    {c.dailyMilkYieldLiters} L / day
                  </td>
                  <td className="py-3 px-4 font-semibold text-amber-600 dark:text-amber-400">
                    {c.milkFatPercent}%
                  </td>
                  <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                    {c.lactationStage}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingCattle(c)}
                        className="rounded-md p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                        title="Edit Cattle"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCattle(c.id)}
                        className="rounded-md p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title="Delete Cattle"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Cattle Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Cattle"
        subtitle="Add a dairy cow, buffalo, or heifer to optimize rations"
        maxWidth="md"
      >
        <form onSubmit={handleSaveNewCattle} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Animal Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Radhika, Ganga, Kamadhenu"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white dark:bg-stone-800 dark:border-stone-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Ear Tag ID
              </label>
              <input
                type="text"
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                placeholder="e.g. IN-GJ-1092"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white dark:bg-stone-800 dark:border-stone-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Breed
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white dark:bg-stone-800 dark:border-stone-700 dark:text-white"
              >
                <option value="Gir">Gir (गीर)</option>
                <option value="Sahiwal">Sahiwal (साहीवाल)</option>
                <option value="Red Sindhi">Red Sindhi (लाल सिंधी)</option>
                <option value="Murrah Buffalo">Murrah Buffalo (मुर्रा)</option>
                <option value="HF Cross">HF Cross (होलस्टीन)</option>
                <option value="Jersey Cross">Jersey Cross (जर्सी)</option>
                <option value="Deoni">Deoni (देवनी)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Body Weight (kg)
              </label>
              <input
                type="number"
                min="100"
                max="900"
                value={bodyWeightKg}
                onChange={(e) => setBodyWeightKg(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white dark:bg-stone-800 dark:border-stone-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Daily Milk (L)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                value={dailyMilkYieldLiters}
                onChange={(e) => setDailyMilkYieldLiters(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white dark:bg-stone-800 dark:border-stone-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Milk Fat %
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="12"
                value={milkFatPercent}
                onChange={(e) => setMilkFatPercent(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white dark:bg-stone-800 dark:border-stone-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Lactation Stage
              </label>
              <select
                value={lactationStage}
                onChange={(e) => setLactationStage(e.target.value as Cattle['lactationStage'])}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white dark:bg-stone-800 dark:border-stone-700 dark:text-white"
              >
                <option value="Early (1-100d)">Early (1-100d)</option>
                <option value="Mid (101-200d)">Mid (101-200d)</option>
                <option value="Late (201-305d)">Late (201-305d)</option>
                <option value="Dry">Dry / Non-milking</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-100 dark:text-stone-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
            >
              Register Animal
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {editingCattle && (
        <Modal
          isOpen={true}
          onClose={() => setEditingCattle(null)}
          title={`Edit ${editingCattle.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Daily Milk Yield (L)
              </label>
              <input
                type="number"
                step="0.5"
                value={editingCattle.dailyMilkYieldLiters}
                onChange={(e) =>
                  setEditingCattle({
                    ...editingCattle,
                    dailyMilkYieldLiters: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white dark:bg-stone-800 dark:border-stone-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Milk Fat %
              </label>
              <input
                type="number"
                step="0.1"
                value={editingCattle.milkFatPercent}
                onChange={(e) =>
                  setEditingCattle({
                    ...editingCattle,
                    milkFatPercent: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white dark:bg-stone-800 dark:border-stone-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Body Weight (kg)
              </label>
              <input
                type="number"
                value={editingCattle.bodyWeightKg}
                onChange={(e) =>
                  setEditingCattle({
                    ...editingCattle,
                    bodyWeightKg: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-stone-300 px-3 py-2 bg-white dark:bg-stone-800 dark:border-stone-700 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setEditingCattle(null)}
                className="px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-100 dark:text-stone-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
