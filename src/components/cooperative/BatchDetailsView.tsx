import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Printer,
  BadgeCheck,
  FlaskConical,
  Wheat,
  Info,
  Layers,
  FileCheck,
  Eye,
  User,
  MapPin,
  Tag,
} from 'lucide-react';
import { CooperativeBatch, FeedScanReport } from '../../types';
import { QualityBadge } from '../common/QualityBadge';
import { CertificateModal } from '../reports/CertificateModal';
import { Modal } from '../common/Modal';

interface BatchDetailsViewProps {
  id?: string;
  batch: CooperativeBatch;
  onBack: () => void;
  onUpdateBatch?: (updated: CooperativeBatch) => void;
}

export const BatchDetailsView: React.FC<BatchDetailsViewProps> = ({
  id,
  batch,
  onBack,
  onUpdateBatch,
}) => {
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isFullAnalysisModalOpen, setIsFullAnalysisModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(batch.isVerified ?? false);
  const [verificationNote, setVerificationNote] = useState<string | null>(
    batch.verifiedBy ? `Verified by ${batch.verifiedBy} on ${batch.verificationDate || 'record'}` : null
  );

  const report: FeedScanReport | undefined = batch.scanReport;
  const nutrition = report?.nutritionalValues;
  const flieg = report?.fliegData;
  const isSilage =
    batch.feedType.toLowerCase().includes('silage') ||
    report?.feedType === 'silage' ||
    Boolean(flieg);

  const handleToggleVerification = () => {
    const nextState = !isVerified;
    const nowStr = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    setIsVerified(nextState);
    const note = nextState ? `Verified by Cooperative Quality Inspector on ${nowStr}` : null;
    setVerificationNote(note);

    if (onUpdateBatch) {
      onUpdateBatch({
        ...batch,
        isVerified: nextState,
        verifiedBy: nextState ? 'Cooperative Quality Inspector' : undefined,
        verificationDate: nextState ? nowStr : undefined,
      });
    }
  };

  // Determine practical cooperative recommendation based on actual risk/quality data
  const getCooperativeRecommendation = (): {
    status: 'Approved' | 'Needs inspection' | 'Requires further testing' | 'Review before procurement';
    color: string;
    description: string;
  } => {
    if (report?.moldDetected || report?.mycotoxinRiskLevel === 'Unsafe') {
      return {
        status: 'Requires further testing',
        color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        description:
          'Potential contamination flags identified by AI optical analysis. Hold lot from village bulk chilling tanks until certified wet-chemistry or chromatography lab clearance.',
      };
    }

    if (
      batch.status.toLowerCase().includes('re-compaction') ||
      batch.status.toLowerCase().includes('inspection') ||
      report?.spoilageRisk === 'Moderate' ||
      report?.spoilageRisk === 'High'
    ) {
      return {
        status: 'Needs inspection',
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        description:
          'Elevated moisture or sub-optimal packing compaction noted. Union agronomist on-site face audit recommended before full procurement authorization.',
      };
    }

    if (batch.overallScore < 60) {
      return {
        status: 'Review before procurement',
        color: 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border-stone-300 dark:border-stone-700',
        description:
          'Overall quality score is below standard union benchmark. Review pricing schedule or assign to low-producing / dry cattle rations.',
      };
    }

    return {
      status: 'Approved',
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      description:
        'Batch meets or exceeds cooperative nutritional and fermentation benchmarks. Recommended for standard or premium procurement intake.',
    };
  };

  const recommendation = getCooperativeRecommendation();

  // Generate dynamic FeedWise AI Insight strictly from existing batch data
  const generateAIInsight = (): string => {
    const parts: string[] = [];

    if (batch.overallScore >= 80) {
      parts.push(
        `Overall quality is high (${batch.overallScore}/100) based on available nutrition and risk indicators.`
      );
    } else if (batch.overallScore >= 65) {
      parts.push(
        `Overall quality is good (${batch.overallScore}/100) meeting standard union baseline requirements.`
      );
    } else {
      parts.push(
        `Overall quality is moderate (${batch.overallScore}/100) with key nutritional or packing indicators below optimal benchmarks.`
      );
    }

    if (nutrition?.moisture !== undefined) {
      if (isSilage) {
        if (nutrition.moisture >= 62 && nutrition.moisture <= 68) {
          parts.push(`Moisture is within the optimal ensiling range at ${nutrition.moisture}%.`);
        } else if (nutrition.moisture > 68) {
          parts.push(
            `Moisture is slightly elevated at ${nutrition.moisture}%, which warrants monitoring for clostridial activity.`
          );
        } else {
          parts.push(
            `Moisture is on the drier end at ${nutrition.moisture}%, requiring thorough compaction.`
          );
        }
      } else {
        parts.push(`Moisture is estimated at ${nutrition.moisture}%.`);
      }
    }

    if (nutrition?.crudeProtein !== undefined) {
      parts.push(`Crude protein is recorded at ${nutrition.crudeProtein}%.`);
    }

    if (isSilage && flieg) {
      parts.push(
        `Silage fermentation scored ${flieg.fliegScore}/100 (pH ${flieg.pH}) with ${flieg.lacticAcidPercent}% lactic acid dominance.`
      );
    }

    if (report?.spoilageRisk) {
      parts.push(
        `Spoilage risk is categorized as ${report.spoilageRisk.toLowerCase()}${
          report.moldDetected ? ' with visual fungal flags' : ' with negative mold detection'
        }.`
      );
    }

    return parts.join(' ');
  };

  const formattedDate = batch.timestamp
    ? new Date(batch.timestamp).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not available';

  return (
    <div id={id} className="space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Batch List</span>
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
                Batch #{batch.id}
              </h2>
              <QualityBadge grade={batch.grade} size="sm" />
              {isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified Batch
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Member farmer feed audit profile for cooperative procurement & grading
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleToggleVerification}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors shadow-2xs ${
              isVerified
                ? 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <BadgeCheck className="h-4 w-4" />
            <span>{isVerified ? 'Mark as Pending Audit' : 'Verify Batch'}</span>
          </button>

          {report && (
            <>
              <button
                type="button"
                onClick={() => setIsCertModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 transition-colors shadow-2xs"
              >
                <Printer className="h-4 w-4 text-emerald-600" />
                <span>Generate Report</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullAnalysisModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 transition-colors shadow-2xs"
              >
                <Eye className="h-4 w-4" />
                <span>View Full Analysis</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Verification Note Banner */}
      {verificationNote && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50/80 p-3 text-xs text-emerald-900 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/80 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{verificationNote}</span>
        </div>
      )}

      {/* SECTION 1: Batch Information */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
          <Tag className="h-4 w-4 text-emerald-600" />
          1. Batch & Procurement Identity
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-xs">
          <div className="space-y-1">
            <span className="text-stone-500 dark:text-stone-400 block font-medium">Batch Identifier</span>
            <span className="font-mono font-bold text-stone-900 dark:text-white text-sm">
              {batch.id}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-stone-500 dark:text-stone-400 block font-medium flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-stone-400" /> Farmer Name
            </span>
            <span className="font-semibold text-stone-900 dark:text-white text-sm">
              {batch.farmerName}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-stone-500 dark:text-stone-400 block font-medium flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-stone-400" /> Dairy Society / Cooperative
            </span>
            <span className="font-semibold text-stone-900 dark:text-white">
              {batch.village}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-stone-500 dark:text-stone-400 block font-medium flex items-center gap-1">
              <Wheat className="h-3.5 w-3.5 text-stone-400" /> Feed / Silage Type
            </span>
            <span className="font-semibold text-stone-900 dark:text-white">
              {batch.feedType}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-stone-500 dark:text-stone-400 block font-medium">Lot Name / Pit ID</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {batch.lotName || 'Not available'}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-stone-500 dark:text-stone-400 block font-medium flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-stone-400" /> Analysis Date & Time
            </span>
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {formattedDate}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-stone-500 dark:text-stone-400 block font-medium">Current Batch Status</span>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                batch.status.includes('Premium')
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : batch.status.includes('Approved')
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {batch.status}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-stone-500 dark:text-stone-400 block font-medium">
              Procurement Schedule Rate
            </span>
            <span className="font-bold text-stone-900 dark:text-white">
              {batch.procurementRate}
            </span>
            <span className="text-[10px] text-stone-400 block">
              Commercial society rate (distinguished from AI quality score)
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Quality Assessment */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
          <FlaskConical className="h-4 w-4 text-emerald-600" />
          2. Quality Assessment & Contributing Factors
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 items-center">
          {/* Main Score Box */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-stone-50 p-6 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Overall Quality Score
            </span>
            <div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
              {batch.overallScore}
              <span className="text-base font-medium text-stone-400"> / 100</span>
            </div>
            <div className="mt-3">
              <QualityBadge grade={batch.grade} size="md" />
            </div>
            <span className="text-[11px] text-stone-400 mt-2">
              Based on FeedWise multi-factor index
            </span>
          </div>

          {/* Contributing Factors */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide">
              Factors Contributing to Score
            </h4>

            <div className="space-y-2.5 text-xs">
              {/* Factor 1: Protein */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800">
                <div>
                  <span className="font-semibold text-stone-900 dark:text-white block">
                    Crude Protein Density
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Benchmark: &gt;8.5% for dairy forage maintenance
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-stone-900 dark:text-white">
                    {nutrition?.crudeProtein !== undefined ? `${nutrition.crudeProtein}%` : 'Not available'}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
                    {nutrition?.crudeProtein && nutrition.crudeProtein >= 8.5
                      ? 'Optimal Contribution'
                      : 'Moderate Contribution'}
                  </span>
                </div>
              </div>

              {/* Factor 2: Moisture */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800">
                <div>
                  <span className="font-semibold text-stone-900 dark:text-white block">
                    Moisture & Dry Matter Balance
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Target: 62% - 68% for bunker silage; 12% - 14% for dry roughage
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-stone-900 dark:text-white">
                    {nutrition?.moisture !== undefined ? `${nutrition.moisture}% Moisture` : 'Not available'}
                  </span>
                  <span className="text-[10px] text-stone-500 block">
                    {nutrition?.dryMatter !== undefined ? `${nutrition.dryMatter}% Dry Matter` : ''}
                  </span>
                </div>
              </div>

              {/* Factor 3: Fermentation / Energy */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800">
                <div>
                  <span className="font-semibold text-stone-900 dark:text-white block">
                    Digestibility & Fermentation Stability
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {isSilage && flieg
                      ? `Flieg Score: ${flieg.fliegScore}/100 • pH ${flieg.pH}`
                      : `Total Digestible Nutrients (TDN): ${nutrition?.totalDigestibleNutrients ?? 'Not available'}%`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-stone-900 dark:text-white">
                    {isSilage && flieg ? `${flieg.grade}` : `${nutrition?.totalDigestibleNutrients ?? 'Not available'}% TDN`}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
                    Standard Scoring Applied
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Nutritional Information */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Wheat className="h-4 w-4 text-emerald-600" />
            3. Nutritional Information
          </h3>
          <span className="text-[11px] text-stone-400">
            Laboratory values & Near-Infrared Spectrometry estimates
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          {/* Crude Protein */}
          <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">
              Crude Protein (CP)
            </span>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {nutrition?.crudeProtein !== undefined ? `${nutrition.crudeProtein}%` : 'Not available'}
            </p>
            <span className="text-[10px] text-stone-400">Target &gt;8.5%</span>
          </div>

          {/* Moisture */}
          <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">
              Moisture
            </span>
            <p className="text-base font-bold text-stone-900 dark:text-white mt-0.5">
              {nutrition?.moisture !== undefined ? `${nutrition.moisture}%` : 'Not available'}
            </p>
            <span className="text-[10px] text-stone-400">Target 62-68%</span>
          </div>

          {/* Neutral Detergent Fiber (NDF) */}
          <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">
              NDF (Neutral Detergent Fiber)
            </span>
            <p className="text-base font-bold text-stone-900 dark:text-white mt-0.5">
              {nutrition?.neutralDetergentFiber !== undefined ? `${nutrition.neutralDetergentFiber}%` : 'Not available'}
            </p>
            <span className="text-[10px] text-stone-400">Target 40-50%</span>
          </div>

          {/* Acid Detergent Fiber (ADF) */}
          <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">
              ADF (Acid Detergent Fiber)
            </span>
            <p className="text-base font-bold text-stone-900 dark:text-white mt-0.5">
              {nutrition?.acidDetergentFiber !== undefined ? `${nutrition.acidDetergentFiber}%` : 'Not available'}
            </p>
            <span className="text-[10px] text-stone-400">Target 25-30%</span>
          </div>

          {/* Energy Value (TDN / ME) */}
          <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">
              Energy (TDN & ME)
            </span>
            <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              {nutrition?.totalDigestibleNutrients !== undefined
                ? `${nutrition.totalDigestibleNutrients}% TDN`
                : 'Not available'}
            </p>
            <span className="text-[10px] text-stone-400">
              {nutrition?.metabolizableEnergy !== undefined
                ? `${nutrition.metabolizableEnergy} MJ/kg ME`
                : 'ME: Not available'}
            </span>
          </div>

          {/* Minerals (Calcium & Phosphorus) */}
          <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">
              Minerals (Ca / P)
            </span>
            <p className="text-base font-bold text-stone-900 dark:text-white mt-0.5">
              {nutrition?.calcium !== undefined ? `Ca: ${nutrition.calcium}%` : 'Ca: Not available'}
            </p>
            <span className="text-[10px] text-stone-400">
              {nutrition?.phosphorus !== undefined ? `P: ${nutrition.phosphorus}%` : 'P: Not available'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 4: Silage Quality Information */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
          <Layers className="h-4 w-4 text-emerald-600" />
          4. Silage Fermentation & Flieg Index
        </h3>

        {isSilage ? (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
                <span className="text-stone-500 dark:text-stone-400 block font-medium">Silage pH</span>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {flieg?.pH !== undefined ? flieg.pH : 'Not available'}
                </p>
                <span className="text-[10px] text-stone-400">Optimal: 3.8 - 4.2</span>
              </div>

              <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
                <span className="text-stone-500 dark:text-stone-400 block font-medium">Flieg Fermentation Score</span>
                <p className="text-lg font-bold text-stone-900 dark:text-white mt-0.5">
                  {flieg?.fliegScore !== undefined ? `${flieg.fliegScore} / 100` : `${batch.fliegScore ?? 'Not available'}`}
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {flieg?.grade ? `Grade: ${flieg.grade}` : 'Standard Grade'}
                </span>
              </div>

              <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
                <span className="text-stone-500 dark:text-stone-400 block font-medium">Spoilage Risk Level</span>
                <p className="text-lg font-bold text-stone-900 dark:text-white mt-0.5">
                  {report?.spoilageRisk ?? 'Not available'}
                </p>
                <span className="text-[10px] text-stone-400">AI Risk Assessment</span>
              </div>

              <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
                <span className="text-stone-500 dark:text-stone-400 block font-medium">Aerobic Stability</span>
                <p className="text-lg font-bold text-stone-900 dark:text-white mt-0.5">
                  {flieg?.aerobicStabilityHours !== undefined ? `${flieg.aerobicStabilityHours} hrs` : 'Not available'}
                </p>
                <span className="text-[10px] text-stone-400">Time before heating</span>
              </div>
            </div>

            {/* Volatile Fatty Acid (VFA) breakdown if available */}
            {flieg && (
              <div className="rounded-xl bg-stone-50 dark:bg-stone-800/40 p-3.5 border border-stone-200/70 dark:border-stone-800 text-xs">
                <span className="font-bold text-stone-700 dark:text-stone-300 block mb-2">
                  Fermentation Organic Acid Profile
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-white dark:bg-stone-900 p-2 rounded-lg border border-stone-200/60 dark:border-stone-700/60">
                    <span className="text-[10px] text-stone-400 block">Lactic Acid (% of acids)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {flieg.lacticAcidPercent !== undefined ? `${flieg.lacticAcidPercent}%` : 'Not available'}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-stone-900 p-2 rounded-lg border border-stone-200/60 dark:border-stone-700/60">
                    <span className="text-[10px] text-stone-400 block">Acetic Acid (% of acids)</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">
                      {flieg.aceticAcidPercent !== undefined ? `${flieg.aceticAcidPercent}%` : 'Not available'}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-stone-900 p-2 rounded-lg border border-stone-200/60 dark:border-stone-700/60">
                    <span className="text-[10px] text-stone-400 block">Butyric Acid (% of acids)</span>
                    <span className={`font-bold ${flieg.butyricAcidPercent > 5 ? 'text-amber-600' : 'text-stone-800 dark:text-stone-200'}`}>
                      {flieg.butyricAcidPercent !== undefined ? `${flieg.butyricAcidPercent}%` : 'Not available'}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-stone-900 p-2 rounded-lg border border-stone-200/60 dark:border-stone-700/60">
                    <span className="text-[10px] text-stone-400 block">Ammonia-Nitrogen (% total N)</span>
                    <span className={`font-bold ${flieg.ammoniaNitrogenPercent > 10 ? 'text-amber-600' : 'text-stone-800 dark:text-stone-200'}`}>
                      {flieg.ammoniaNitrogenPercent !== undefined ? `${flieg.ammoniaNitrogenPercent}%` : 'Not available'}
                    </span>
                  </div>
                </div>

                {flieg.fermentationQualitySummary && (
                  <p className="mt-2.5 text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                    <strong>Fermentation Quality:</strong> {flieg.fermentationQualitySummary}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 p-4 border border-stone-200/70 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
            <p className="font-medium text-stone-700 dark:text-stone-300">
              Not applicable to this feed category
            </p>
            <p className="mt-1">
              Silage fermentation indicators (pH, Flieg score, volatile fatty acids, aerobic stability) apply strictly to anaerobically fermented ensiled crops. This batch is cataloged as {batch.feedType}.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 5: Safety Information */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            5. Safety & Hazard Screening
          </h3>
          <span className="text-[10px] font-medium rounded-full bg-stone-100 px-2.5 py-0.5 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
            AI Computer Vision & Predictive Risk
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-xs">
          {/* Fungal / Mould Detection */}
          <div className="rounded-xl bg-stone-50 p-3.5 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
            <span className="text-stone-500 dark:text-stone-400 block font-medium">
              Fungal / Mold Detection
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              {report?.moldDetected ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  <span className="font-bold text-rose-600 dark:text-rose-400">Mould Detected</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Negative / Safe</span>
                </>
              )}
            </div>
            <span className="text-[10px] text-stone-400 mt-1 block">AI Optical Prediction</span>
          </div>

          {/* Spoilage Risk */}
          <div className="rounded-xl bg-stone-50 p-3.5 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
            <span className="text-stone-500 dark:text-stone-400 block font-medium">
              Spoilage Risk Assessment
            </span>
            <span className="font-bold text-stone-900 dark:text-white text-sm mt-1 block">
              {report?.spoilageRisk ?? 'Not available'}
            </span>
            <span className="text-[10px] text-stone-400 mt-1 block">AI Risk Assessment</span>
          </div>

          {/* Mycotoxin Risk Level */}
          <div className="rounded-xl bg-stone-50 p-3.5 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
            <span className="text-stone-500 dark:text-stone-400 block font-medium">
              Mycotoxin Risk Tier
            </span>
            <span
              className={`font-bold text-sm mt-1 block ${
                report?.mycotoxinRiskLevel === 'Safe'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : report?.mycotoxinRiskLevel === 'Guarded'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {report?.mycotoxinRiskLevel ?? 'Not available'}
            </span>
            <span className="text-[10px] text-stone-400 mt-1 block">Predictive Risk Assessment</span>
          </div>

          {/* Sensory / Odor Profile */}
          <div className="rounded-xl bg-stone-50 p-3.5 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
            <span className="text-stone-500 dark:text-stone-400 block font-medium">
              Sensory / Odor Profile
            </span>
            <span className="font-bold text-stone-900 dark:text-white text-sm mt-1 block">
              {report?.odorProfile ?? 'Not available'}
            </span>
            <span className="text-[10px] text-stone-400 mt-1 block">
              Texture: {report?.physicalTexture ?? 'Not available'}
            </span>
          </div>
        </div>

        {/* Methodology Disclosure Notice */}
        <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-stone-50 p-3 text-[11px] text-stone-500 dark:bg-stone-800/40 dark:text-stone-400 border border-stone-200/60 dark:border-stone-800">
          <Info className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Methodology Notice:</strong> Risk indicators and contamination predictions are generated by FeedWise AI computer vision and predictive agronomy heuristics. They are intended for rapid in-field decision triage and do not claim laboratory-confirmed detection.
          </p>
        </div>
      </div>

      {/* SECTION 6: FeedWise AI Insight */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
        <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 pb-2">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          6. FeedWise AI Insight
        </h3>
        <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
          {generateAIInsight()}
        </p>
      </div>

      {/* SECTION 7: Cooperative Recommendation & Operational Action */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          7. Cooperative Recommendation & Operational Guidance
        </h3>

        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold ${recommendation.color}`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Recommended Action: {recommendation.status}</span>
            </span>
          </div>

          <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            <p>{recommendation.description}</p>
          </div>
        </div>

        {report?.recommendations && report.recommendations.length > 0 && (
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-2">
              Agronomist Feed-out & Storage Protocols:
            </span>
            <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* SECTION 8: Action Controls */}
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900/60 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Batch List</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleToggleVerification}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
              isVerified
                ? 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <BadgeCheck className="h-4 w-4" />
            <span>{isVerified ? 'Mark as Unverified' : 'Verify Batch'}</span>
          </button>

          {report && (
            <>
              <button
                type="button"
                onClick={() => setIsCertModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 transition-colors"
              >
                <Printer className="h-4 w-4 text-emerald-600" />
                <span>Generate Official Report</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullAnalysisModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>View Full Analysis</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Official Certificate Modal */}
      {report && (
        <CertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          report={report}
        />
      )}

      {/* Full Analysis Modal */}
      {report && (
        <Modal
          isOpen={isFullAnalysisModalOpen}
          onClose={() => setIsFullAnalysisModalOpen(false)}
          title={`Detailed Feed Analysis • ${batch.lotName || batch.farmerName}`}
          subtitle={`Near-Infrared Spectrometry & Nutritional Profile for Batch #${batch.id}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {report.imageUrl && (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-stone-900 border border-stone-200 dark:border-stone-800">
                <img
                  src={report.imageUrl}
                  alt={report.sampleName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-mono text-emerald-400">
                  Optical Scan Resolution: 600x400
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-stone-50 p-3 dark:bg-stone-800">
                <span className="text-stone-500 block">Dry Matter (DM)</span>
                <span className="font-bold text-stone-900 dark:text-white text-base">
                  {report.nutritionalValues.dryMatter}%
                </span>
              </div>
              <div className="rounded-lg bg-stone-50 p-3 dark:bg-stone-800">
                <span className="text-stone-500 block">Crude Protein (CP)</span>
                <span className="font-bold text-emerald-600 text-base">
                  {report.nutritionalValues.crudeProtein}%
                </span>
              </div>
              <div className="rounded-lg bg-stone-50 p-3 dark:bg-stone-800">
                <span className="text-stone-500 block">Total Digestible Nutrients (TDN)</span>
                <span className="font-bold text-blue-600 text-base">
                  {report.nutritionalValues.totalDigestibleNutrients}%
                </span>
              </div>
              <div className="rounded-lg bg-stone-50 p-3 dark:bg-stone-800">
                <span className="text-stone-500 block">Metabolizable Energy</span>
                <span className="font-bold text-stone-900 dark:text-white text-base">
                  {report.nutritionalValues.metabolizableEnergy} MJ/kg
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsFullAnalysisModalOpen(false)}
                className="rounded-lg bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
