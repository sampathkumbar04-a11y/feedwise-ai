import React from 'react';
import { Modal } from '../common/Modal';
import { FeedScanReport } from '../../types';
import { generateCertificatePrint } from '../../services/pdfService';
import { Printer, ShieldCheck, Download } from 'lucide-react';
import { QualityBadge } from '../common/QualityBadge';

interface CertificateModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  report: FeedScanReport | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  id,
  isOpen,
  onClose,
  report,
}) => {
  if (!report) return null;

  return (
    <Modal
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      title="Official Feed Quality Analytical Certificate"
      subtitle={`Verified Certificate for Batch #${report.id.substring(0, 10)}`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Certificate Preview Box */}
        <div className="rounded-xl border-2 border-emerald-600 bg-stone-50/50 p-6 dark:bg-stone-900/80 dark:border-emerald-700">
          <div className="text-center pb-4 border-b border-stone-200 dark:border-stone-800">
            <div className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-lg uppercase tracking-wider">
              <ShieldCheck className="h-5 w-5" /> FeedWise AI Certified
            </div>
            <p className="text-xs text-stone-500">Autonomous Near-Infrared Spectrometry & Flieg Fermentation Audit</p>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4 text-xs">
            <div><strong>Sample Identifier:</strong> {report.sampleName}</div>
            <div><strong>Sample Category:</strong> {report.feedType.toUpperCase()}</div>
            <div><strong>Inspection Date:</strong> {new Date(report.timestamp).toLocaleDateString()}</div>
            <div className="flex items-center gap-1.5">
              <strong>Quality Grade:</strong>
              <QualityBadge grade={report.qualityGrade} size="sm" />
            </div>
          </div>

          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-3 border border-emerald-200 dark:border-emerald-800 text-center my-3">
            <div className="text-xs text-stone-600 dark:text-stone-300 uppercase font-semibold">Feed Quality Index</div>
            <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">{report.overallScore} / 100</div>
            {report.fliegData && (
              <div className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                Flieg Fermentation Score: <strong>{report.fliegData.fliegScore} / 100 ({report.fliegData.grade})</strong> • pH {report.fliegData.pH}
              </div>
            )}
          </div>

          <div className="text-xs space-y-1 mt-3">
            <p><strong>Dry Matter (DM):</strong> {report.nutritionalValues.dryMatter}%</p>
            <p><strong>Crude Protein (CP):</strong> {report.nutritionalValues.crudeProtein}%</p>
            <p><strong>Digestible Energy (TDN):</strong> {report.nutritionalValues.totalDigestibleNutrients}%</p>
            <p><strong>Spoilage / Mold Status:</strong> {report.spoilageRisk} Risk (Mold: {report.moldDetected ? 'Detected' : 'Negative'})</p>
          </div>

          {report.safetyAssessment && (
            <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-800 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <strong className="text-stone-800 dark:text-stone-200">
                  Feed Safety & Adulteration Screening:
                </strong>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  Score: {report.safetyAssessment.safetyScore}/100 ({report.safetyAssessment.overallRiskLevel})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] text-stone-600 dark:text-stone-400">
                <div>Urea Risk: <strong>{report.safetyAssessment.ureaRisk}</strong></div>
                <div>Silica Risk: <strong>{report.safetyAssessment.silicaRisk}</strong></div>
                <div>Fungal Risk: <strong>{report.safetyAssessment.fungalRisk}</strong></div>
                <div>Mycotoxin: <strong>{report.safetyAssessment.mycotoxinRisk}</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => generateCertificatePrint(report)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print / Export Official Certificate
          </button>
        </div>
      </div>
    </Modal>
  );
};
