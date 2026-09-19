import React from 'react';
import { Building2, Award, CheckCircle2, TrendingUp, Users, ShieldAlert } from 'lucide-react';
import { QualityBadge } from '../components/common/QualityBadge';

interface CooperativePortalProps {
  id?: string;
}

const SAMPLE_MEMBER_BATCHES = [
  {
    farmerName: 'Ramesh Patel',
    village: 'Anand Dairy Society #4',
    feedType: 'Corn Silage',
    fliegScore: 89,
    crudeProtein: 9.1,
    grade: 'Grade A (Excellent)',
    procurementRate: '₹5.80 / kg (+₹0.30 Bonus)',
    status: 'Approved Premium',
  },
  {
    farmerName: 'Kishore Kumar',
    village: 'Mogar Dairy Cooperative',
    feedType: 'Napier Hybrid CO-5',
    fliegScore: 78,
    crudeProtein: 10.4,
    grade: 'Grade B (Good)',
    procurementRate: '₹2.40 / kg (Standard)',
    status: 'Approved',
  },
  {
    farmerName: 'Suresh Bhai',
    village: 'Chikhodra Milk Union',
    feedType: 'Corn Silage Pit 3',
    fliegScore: 54,
    crudeProtein: 7.2,
    grade: 'Grade C (Standard)',
    procurementRate: '₹4.50 / kg (-₹0.40 Deduction)',
    status: 'Needs Re-compaction',
  },
];

export const CooperativePortal: React.FC<CooperativePortalProps> = ({ id }) => {
  return (
    <div id={id} className="space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-stone-200 dark:border-stone-800">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
          <Building2 className="h-6 w-6 text-emerald-600" />
          Dairy Cooperative Milk Union Silage Grading Portal
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Standardized procurement index for milk union federations: incentivize high Flieg scores and penalize butyric clostridial silage.
        </p>
      </div>

      {/* Union Procurement Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
            <Award className="h-4 w-4 text-emerald-600" /> Grade A Incentive (+₹0.30/kg)
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-2">
            Flieg Score &gt; 80, pH &lt; 4.2, Ammonia-N &lt; 8%. Directly correlates with +0.3% higher milk fat test in bulk chilling tanks.
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-2 text-stone-900 dark:text-white font-bold text-sm">
            <CheckCircle2 className="h-4 w-4 text-blue-600" /> Standard Grade (Base Price)
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
            Flieg Score 61 - 80, pH 4.2 - 4.5. Accepted at baseline society market price for green fodder and silage pits.
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 dark:border-rose-900/60 dark:bg-rose-950/30">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
            <ShieldAlert className="h-4 w-4 text-rose-600" /> Spoilage Rejection Threshold
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-2">
            Flieg Score &lt; 40 or mold hyphae detected. Clostridial silage is barred from village collective tankers to prevent somatic cell count (SCC) surges.
          </p>
        </div>
      </div>

      {/* Member Farmer Batch Audits */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900 overflow-hidden">
        <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <h3 className="font-bold text-stone-900 dark:text-white text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" />
            Active Member Silage Lots for Procurement
          </h3>
          <span className="text-xs text-stone-500">Updated today</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 text-stone-500">
                <th className="py-3 px-4 font-semibold">Farmer & Society</th>
                <th className="py-3 px-4 font-semibold">Feed Lot</th>
                <th className="py-3 px-4 font-semibold">Flieg Score</th>
                <th className="py-3 px-4 font-semibold">Crude Protein</th>
                <th className="py-3 px-4 font-semibold">Quality Grade</th>
                <th className="py-3 px-4 font-semibold">Procurement Rate</th>
                <th className="py-3 px-4 font-semibold">Union Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {SAMPLE_MEMBER_BATCHES.map((batch, idx) => (
                <tr key={idx} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/30">
                  <td className="py-3 px-4">
                    <span className="font-bold text-stone-900 dark:text-white block">
                      {batch.farmerName}
                    </span>
                    <span className="text-[10px] text-stone-400">{batch.village}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-stone-700 dark:text-stone-300">
                    {batch.feedType}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                    {batch.fliegScore} / 100
                  </td>
                  <td className="py-3 px-4 font-semibold text-stone-800 dark:text-stone-200">
                    {batch.crudeProtein}%
                  </td>
                  <td className="py-3 px-4">
                    <QualityBadge grade={batch.grade} size="sm" />
                  </td>
                  <td className="py-3 px-4 font-semibold text-stone-900 dark:text-white">
                    {batch.procurementRate}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        batch.status.includes('Premium')
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : batch.status.includes('Approved')
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {batch.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
