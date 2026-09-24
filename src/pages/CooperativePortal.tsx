import React, { useState } from 'react';
import { Building2, Award, CheckCircle2, Users, ShieldAlert, ArrowRight, Eye, Sparkles } from 'lucide-react';
import { QualityBadge } from '../components/common/QualityBadge';
import { CooperativeBatch, FeedScanReport } from '../types';
import { INITIAL_SCAN_REPORTS } from '../data/mockData';
import { BatchDetailsView } from '../components/cooperative/BatchDetailsView';
import { useAppData } from '../context/AppDataContext';

interface CooperativePortalProps {
  id?: string;
}

const DEFAULT_BATCHES: CooperativeBatch[] = [
  {
    id: 'BATCH-2026-09-001',
    farmerName: 'Ramesh Patel',
    village: 'Anand Dairy Society #4',
    feedType: 'Corn Silage',
    lotName: 'Bunker Pit #1 - Whole Crop Maize Silage',
    timestamp: '2026-09-18T08:30:00.000Z',
    fliegScore: 89,
    crudeProtein: 9.1,
    grade: 'Grade A (Excellent)',
    procurementRate: '₹5.80 / kg (+₹0.30 Bonus)',
    procurementRateDetails: {
      baseRate: '₹5.50 / kg',
      incentiveOrDeduction: '+₹0.30 / kg Quality Incentive',
      note: 'Society commercial rate schedule for Grade A silage',
    },
    status: 'Approved Premium',
    overallScore: 89,
    scanReport: {
      ...INITIAL_SCAN_REPORTS[0],
      nutritionalValues: {
        ...INITIAL_SCAN_REPORTS[0].nutritionalValues,
        crudeProtein: 9.1,
      },
    },
    isVerified: true,
    verifiedBy: 'Anand Milk Union Quality Inspector',
    verificationDate: '18 Sep 2026',
  },
  {
    id: 'BATCH-2026-09-002',
    farmerName: 'Kishore Kumar',
    village: 'Mogar Dairy Cooperative',
    feedType: 'Napier Hybrid CO-5',
    lotName: 'Field B - Hybrid Napier CO-5 (Day 48 Cut)',
    timestamp: '2026-09-17T11:15:00.000Z',
    fliegScore: 78,
    crudeProtein: 10.4,
    grade: 'Grade B (Good)',
    procurementRate: '₹2.40 / kg (Standard)',
    procurementRateDetails: {
      baseRate: '₹2.40 / kg',
      incentiveOrDeduction: 'Standard Base',
      note: 'Society baseline procurement rate for green fodder',
    },
    status: 'Approved',
    overallScore: 78,
    scanReport: {
      ...INITIAL_SCAN_REPORTS[1],
      nutritionalValues: {
        ...INITIAL_SCAN_REPORTS[1].nutritionalValues,
        crudeProtein: 10.4,
      },
    },
    isVerified: false,
  },
  {
    id: 'BATCH-2026-09-003',
    farmerName: 'Suresh Bhai',
    village: 'Chikhodra Milk Union',
    feedType: 'Corn Silage Pit 3',
    lotName: 'Pit #3 - Late Ensiled Maize Pit',
    timestamp: '2026-09-16T14:20:00.000Z',
    fliegScore: 54,
    crudeProtein: 7.2,
    grade: 'Grade C (Standard)',
    procurementRate: '₹4.50 / kg (-₹0.40 Deduction)',
    procurementRateDetails: {
      baseRate: '₹4.90 / kg',
      incentiveOrDeduction: '-₹0.40 / kg Quality Deduction',
      note: 'Society penalty applied per union rules for elevated pH and secondary aerobic activity',
    },
    status: 'Needs Re-compaction',
    overallScore: 54,
    scanReport: {
      id: 'scan_171804_pit3',
      timestamp: '2026-09-16T14:20:00.000Z',
      sampleName: 'Corn Silage Pit 3 (Late Ensiled)',
      feedType: 'silage',
      imageUrl:
        'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80',
      overallScore: 54,
      qualityGrade: 'Grade C (Standard)',
      confidenceScore: 91,
      moistureEstimate: 72,
      spoilageRisk: 'Moderate',
      moldDetected: false,
      mycotoxinRiskLevel: 'Guarded',
      physicalTexture: 'Slightly Chopped',
      odorProfile: 'Pungent Vinegar',
      nutritionalValues: {
        dryMatter: 28.0,
        crudeProtein: 7.2,
        totalDigestibleNutrients: 61.0,
        neutralDetergentFiber: 52.0,
        acidDetergentFiber: 33.0,
        metabolizableEnergy: 9.1,
        calcium: 0.28,
        phosphorus: 0.21,
        moisture: 72.0,
      },
      fliegData: {
        fliegScore: 54,
        grade: 'Fair',
        pH: 4.8,
        dryMatter: 28.0,
        lacticAcidPercent: 52,
        aceticAcidPercent: 36,
        butyricAcidPercent: 12,
        ammoniaNitrogenPercent: 11.2,
        fermentationQualitySummary:
          'Sub-optimal fermentation with elevated butyric acid and ammonia-N, indicating insufficient anaerobic packing.',
        feedingAdvisory:
          'Restrict daily intake for high-yielding stock; feed out quickly after opening to prevent surface heating.',
        aerobicStabilityHours: 36,
      },
      recommendations: [
        'Re-compact exposed silage face and re-cover tightly with weighted poly-sheet.',
        'Prioritize feed-out within 48 hours to minimize secondary aerobic decay.',
      ],
      assessedByRole: 'Field Verification Officer',
    },
    isVerified: false,
  },
];

export const CooperativePortal: React.FC<CooperativePortalProps> = ({ id }) => {
  const { scanReports } = useAppData();
  const [batches, setBatches] = useState<CooperativeBatch[]>(DEFAULT_BATCHES);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || null;

  const handleUpdateBatch = (updated: CooperativeBatch) => {
    setBatches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  // If a batch is selected, render the detailed Batch Details view
  if (selectedBatch) {
    return (
      <BatchDetailsView
        id={id}
        batch={selectedBatch}
        onBack={() => setSelectedBatchId(null)}
        onUpdateBatch={handleUpdateBatch}
      />
    );
  }

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
            <Award className="h-4 w-4 text-emerald-600" /> Grade A Procurement Incentive
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-2">
            Flieg Score &gt; 80, pH &lt; 4.2, Ammonia-N &lt; 8%. Eligible for union quality incentive under commercial pricing schedule.
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
            Flieg Score &lt; 40 or mold hyphae detected. Clostridial silage is barred from village collective tankers to prevent bulk tank contamination.
          </p>
        </div>
      </div>

      {/* Member Farmer Batch Audits */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900 overflow-hidden">
        <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 dark:text-white text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" />
              Active Member Silage Lots for Procurement
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Click any batch row to inspect detailed nutritional, silage, and safety audit information
            </p>
          </div>
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
                <th className="py-3 px-4 font-semibold text-right">Batch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {batches.map((batch) => (
                <tr
                  key={batch.id}
                  onClick={() => setSelectedBatchId(batch.id)}
                  className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4">
                    <span className="font-bold text-stone-900 dark:text-white block group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {batch.farmerName}
                    </span>
                    <span className="text-[10px] text-stone-400">{batch.village}</span>
                    <span className="text-[10px] font-mono text-stone-400 block mt-0.5">
                      {batch.id}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-stone-700 dark:text-stone-300">
                    <div>{batch.feedType}</div>
                    <div className="text-[10px] text-stone-400">{batch.lotName}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                    {batch.fliegScore !== undefined ? `${batch.fliegScore} / 100` : 'Not available'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-stone-800 dark:text-stone-200">
                    {batch.crudeProtein !== undefined ? `${batch.crudeProtein}%` : 'Not available'}
                  </td>
                  <td className="py-3 px-4">
                    <QualityBadge grade={batch.grade} size="sm" />
                  </td>
                  <td className="py-3 px-4 font-semibold text-stone-900 dark:text-white">
                    {batch.procurementRate}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
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
                      {batch.isVerified && (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Verified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBatchId(batch.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:border-emerald-500 hover:text-emerald-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:text-emerald-400 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Details</span>
                    </button>
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

