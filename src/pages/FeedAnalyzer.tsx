import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { CameraModal } from '../components/analyzer/CameraModal';
import { QualityScoreCard } from '../components/analyzer/QualityScoreCard';
import { NutritionBreakdown } from '../components/analyzer/NutritionBreakdown';
import { SilageFermentationCard } from '../components/analyzer/SilageFermentationCard';
import { ImageComparisonSlider } from '../components/common/ImageComparisonSlider';
import { ScanOverlayCanvas } from '../components/analyzer/ScanOverlayCanvas';
import { CertificateModal } from '../components/reports/CertificateModal';
import { analyzeFeedImage } from '../services/computerVisionEngine';
import { FeedType, FeedScanReport } from '../types';
import { Camera, Sparkles, Layers, Sliders } from 'lucide-react';

interface FeedAnalyzerProps {
  id?: string;
  isScannerModalOpen: boolean;
  setIsScannerModalOpen: (open: boolean) => void;
  selectedReportId?: string;
}

export const FeedAnalyzer: React.FC<FeedAnalyzerProps> = ({
  id,
  isScannerModalOpen,
  setIsScannerModalOpen,
  selectedReportId,
}) => {
  const { scanReports, addScanReport } = useAppData();
  const [activeReportId, setActiveReportId] = useState<string>(
    selectedReportId || scanReports[0]?.id || ''
  );
  const [isCertModalOpen, setIsCertModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'canvas'>('canvas');

  const currentReport: FeedScanReport =
    scanReports.find((r) => r.id === activeReportId) || scanReports[0];

  const handleCaptureFeed = async (
    imageDataUrl: string,
    feedType: FeedType,
    sampleName: string,
    manualPH?: number
  ) => {
    const report = await analyzeFeedImage({
      feedType,
      sampleName,
      imageDataUrl,
      manualPH,
    });
    addScanReport(report);
    setActiveReportId(report.id);
  };

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
            onChange={(e) => setActiveReportId(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
          >
            {scanReports.map((report) => (
              <option key={report.id} value={report.id}>
                {report.sampleName} ({report.qualityGrade})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsScannerModalOpen(true)}
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
            onClick={() => setIsScannerModalOpen(true)}
            className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Start First Feed Scan
          </button>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onCapture={handleCaptureFeed}
      />

      {/* Printable Certificate Modal */}
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        report={currentReport}
      />
    </div>
  );
};
