import React from 'react';
import { ShieldCheck, AlertTriangle, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { FeedScanReport } from '../../types';
import { QualityBadge } from '../common/QualityBadge';
import { GaugeChart } from '../common/GaugeChart';
import { VoiceButton } from '../common/VoiceButton';

interface QualityScoreCardProps {
  id?: string;
  report: FeedScanReport;
  onExportCertificate?: () => void;
}

export const QualityScoreCard: React.FC<QualityScoreCardProps> = ({
  id,
  report,
  onExportCertificate,
}) => {
  const isExcellent = report.overallScore >= 80;
  const isWarning = report.overallScore < 60 || report.moldDetected;

  const audioSummary = `${report.sampleName} scored ${report.overallScore} out of 100, graded as ${report.qualityGrade}. Moisture is ${report.moistureEstimate} percent with dry matter of ${report.nutritionalValues.dryMatter} percent. Spoilage risk is ${report.spoilageRisk}.`;

  return (
    <div
      id={id}
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-stone-900 dark:text-white">
              {report.sampleName}
            </h3>
            <QualityBadge grade={report.qualityGrade} size="md" />
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Analyzed {new Date(report.timestamp).toLocaleString()} • Confidence {report.confidenceScore}%
          </p>
        </div>

        <div className="flex items-center gap-2">
          <VoiceButton textToRead={audioSummary} label="Hear Summary" />
          {onExportCertificate && (
            <button
              type="button"
              onClick={onExportCertificate}
              className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              Certificate PDF
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Quality Gauge */}
        <div className="flex flex-col items-center justify-center p-2">
          <GaugeChart
            value={report.overallScore}
            label="Feed Quality Index"
            subLabel={`${report.qualityGrade}`}
            size={190}
          />
        </div>

        {/* Quick Highlights */}
        <div className="md:col-span-2 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase">
                Dry Matter (DM)
              </span>
              <p className="text-lg font-bold text-stone-900 dark:text-white mt-0.5">
                {report.nutritionalValues.dryMatter}%
              </p>
              <span className="text-[10px] text-stone-500">Target: 30-35%</span>
            </div>

            <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase">
                Crude Protein (CP)
              </span>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {report.nutritionalValues.crudeProtein}%
              </p>
              <span className="text-[10px] text-stone-500">Target: &gt;8.5%</span>
            </div>

            <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase">
                Energy (TDN)
              </span>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                {report.nutritionalValues.totalDigestibleNutrients}%
              </p>
              <span className="text-[10px] text-stone-500">Target: &gt;65%</span>
            </div>
          </div>

          {/* Spoilage / Safety status */}
          <div
            className={`rounded-xl p-3.5 border flex items-start gap-3 ${
              isWarning
                ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/60 text-rose-800 dark:text-rose-300'
                : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            {isWarning ? (
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">
                {isWarning ? 'Attention Required: Elevated Spoilage Risk' : 'Livestock Safety Verified: Clean Feed'}
              </p>
              <p className="text-xs mt-0.5 opacity-90">
                {report.safetyWarning ||
                  `Mycotoxin risk: ${report.mycotoxinRiskLevel}. Mold detected: ${
                    report.moldDetected ? 'Yes' : 'Negative'
                  }. Odor profile: ${report.odorProfile}.`}
              </p>
            </div>
          </div>

          {/* Agronomist recommendations */}
          <div className="rounded-xl bg-stone-50 dark:bg-stone-800/50 p-3 border border-stone-200/70 dark:border-stone-800">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Feeding Recommendation
            </span>
            <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
