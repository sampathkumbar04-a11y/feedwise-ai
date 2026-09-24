import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { QualityScoreCard } from '../components/analyzer/QualityScoreCard';
import { NutritionBreakdown } from '../components/analyzer/NutritionBreakdown';
import { SilageFermentationCard } from '../components/analyzer/SilageFermentationCard';
import { ImageComparisonSlider } from '../components/common/ImageComparisonSlider';
import { ScanOverlayCanvas } from '../components/analyzer/ScanOverlayCanvas';
import { CertificateModal } from '../components/reports/CertificateModal';
import { FeedScanReport } from '../types';
import { Camera, Sparkles, Layers, Sliders, ShieldAlert, ChevronRight, CheckCircle2, Bot, Mic } from 'lucide-react';

interface FeedAnalyzerProps {
  id?: string;
  isScannerModalOpen?: boolean;
  setIsScannerModalOpen?: (open: boolean) => void;
  onOpenScanner?: () => void;
  onOpenChat?: () => void;
  selectedReportId?: string;
  onSelectReportId?: (id: string) => void;
  onNavigateToSafety?: (reportId: string) => void;
}

export const FeedAnalyzer: React.FC<FeedAnalyzerProps> = ({
  id,
  isScannerModalOpen,
  setIsScannerModalOpen,
  onOpenScanner,
  onOpenChat,
  selectedReportId,
  onSelectReportId,
  onNavigateToSafety,
}) => {
  const { scanReports } = useAppData();
  const [activeReportId, setActiveReportId] = useState<string>(
    selectedReportId || scanReports[0]?.id || ''
  );
  const [isCertModalOpen, setIsCertModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'canvas'>('canvas');

  // Keep activeReportId in sync when external selectedReportId changes or new scan created
  useEffect(() => {
    if (selectedReportId) {
      setActiveReportId(selectedReportId);
    } else if (scanReports.length > 0 && !scanReports.some((r) => r.id === activeReportId)) {
      setActiveReportId(scanReports[0].id);
    }
  }, [selectedReportId, scanReports, activeReportId]);

  const handleOpenScanner = () => {
    if (onOpenScanner) {
      onOpenScanner();
    } else if (setIsScannerModalOpen) {
      setIsScannerModalOpen(true);
    }
  };

  const currentReport: FeedScanReport =
    scanReports.find((r) => r.id === activeReportId) || scanReports[0];

  return (
    <div id={id} className="space-y-6">
      {/* Top Header & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
            <Camera className="h-6 w-6 text-emerald-600" />
            Computer Vision Feed Spectrometry
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Autonomous near-infrared spectral evaluation of crude protein, dry matter, fiber, and fungal contamination.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activeReportId}
            onChange={(e) => {
              setActiveReportId(e.target.value);
              onSelectReportId?.(e.target.value);
            }}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
          >
            {scanReports.map((report) => (
              <option key={report.id} value={report.id}>
                {report.sampleName} ({report.qualityGrade})
              </option>
            ))}
          </select>

          {onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-colors shadow-xs shrink-0"
              title="Ask Kisan Sahayak about this sample"
            >
              <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Ask Kisan Sahayak</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenScanner}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs shrink-0"
          >
            <Camera className="h-4 w-4" />
            <span>Scan Sample</span>
          </button>
        </div>
      </div>

      {currentReport ? (
        <div className="space-y-6">
          {/* Main Inspection Grid: Image Vision & Score Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Feed Image View */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" /> Spectral Vision Inspection
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('canvas')}
                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                      viewMode === 'canvas'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                  >
                    HUD Target Reticle
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('slider')}
                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                      viewMode === 'slider'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                  >
                    Compare Raw
                  </button>
                </div>
              </div>

              {viewMode === 'canvas' ? (
                <ScanOverlayCanvas report={currentReport} />
              ) : (
                <ImageComparisonSlider
                  originalImage={currentReport.imageUrl}
                />
              )}

              <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-medium text-stone-600 dark:text-stone-400 pt-1">
                <div className="rounded-lg bg-stone-100 dark:bg-stone-800 p-2">
                  <span className="block text-stone-400 text-[10px] uppercase">Chop Length Texture</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{currentReport.physicalTexture}</span>
                </div>
                <div className="rounded-lg bg-stone-100 dark:bg-stone-800 p-2">
                  <span className="block text-stone-400 text-[10px] uppercase">Odor & Aroma Profile</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{currentReport.odorProfile}</span>
                </div>
              </div>
            </div>

            {/* Quality Summary Card */}
            <div className="lg:col-span-7">
              <QualityScoreCard
                report={currentReport}
                onExportCertificate={() => setIsCertModalOpen(true)}
              />
            </div>
          </div>

          {/* Feed Safety Scanner Quick Integration Banner */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 shrink-0">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                      Feed Safety & Adulteration Screening
                    </h3>
                    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                      Urea • Silica • Fungal • Mycotoxins
                    </span>
                  </div>

                  {currentReport.safetyAssessment ? (
                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-stone-600 dark:text-stone-300">
                        Safety Score: <strong className="text-stone-900 dark:text-white font-extrabold">{currentReport.safetyAssessment.safetyScore}/100</strong> ({currentReport.safetyAssessment.overallRiskLevel} Risk)
                      </span>
                      <div className="flex items-center gap-1 text-[11px] flex-wrap">
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                          Urea: <strong>{currentReport.safetyAssessment.ureaRisk}</strong>
                        </span>
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                          Silica: <strong>{currentReport.safetyAssessment.silicaRisk}</strong>
                        </span>
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                          Fungal: <strong>{currentReport.safetyAssessment.fungalRisk}</strong>
                        </span>
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                          Mycotoxin: <strong>{currentReport.safetyAssessment.mycotoxinRisk}</strong>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Check for non-protein nitrogen (urea spike), sand/silica particulate grit, visible fungal hyphae, and biological mycotoxin risk using optical spectrometry and proxy markers.
                    </p>
                  )}
                </div>
              </div>

              {onNavigateToSafety && (
                <button
                  type="button"
                  onClick={() => onNavigateToSafety(currentReport.id)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shrink-0 shadow-xs"
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>{currentReport.safetyAssessment ? 'View Full Safety Assessment' : 'Run Feed Safety Assessment'}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Silage Fermentation Details if Silage */}
          {currentReport.feedType === 'silage' && (
            <SilageFermentationCard initialFliegData={currentReport.fliegData} />
          )}

          {/* Full Nutritional Breakdown */}
          <NutritionBreakdown
            nutrition={currentReport.nutritionalValues}
            feedType={currentReport.feedType}
          />
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-stone-300 p-12 text-center dark:border-stone-800">
          <Camera className="mx-auto h-12 w-12 text-stone-400" />
          <h3 className="mt-4 text-base font-bold text-stone-800 dark:text-stone-200">
            No Feed Samples Recorded Yet
          </h3>
          <p className="mt-1 text-xs text-stone-500">
            Click Scan Sample above to capture corn silage, green napier, or dry roughage.
          </p>
          <button
            type="button"
            onClick={handleOpenScanner}
            className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Start First Feed Scan
          </button>
        </div>
      )}

      {/* Printable Certificate Modal */}
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        report={currentReport}
      />
    </div>
  );
};
