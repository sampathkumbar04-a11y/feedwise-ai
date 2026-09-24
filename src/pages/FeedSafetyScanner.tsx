import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  FileCheck,
  Layers,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Printer,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Flame,
  Search,
  WifiOff,
  Clock,
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { FeedType, FeedScanReport, FeedSafetyAssessment, SafetyRiskLevel } from '../types';
import { evaluateFeedSafety } from '../services/feedSafetyEngine';
import { CertificateModal } from '../components/reports/CertificateModal';

interface FeedSafetyScannerProps {
  id?: string;
  initialReportId?: string;
  onNavigate?: (tab: string) => void;
  onOpenScanner?: () => void;
}

const PRESET_SAFETY_SAMPLES = [
  {
    name: 'Bunker Maize Silage #1',
    type: 'silage' as FeedType,
    url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80',
    description: 'Clean whole-crop corn silage, lactic fermentation, no mold.',
    category: 'Low Risk Sample',
  },
  {
    name: 'Stored Mustard Oil Cake (Lot #4)',
    type: 'concentrate' as FeedType,
    url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80',
    description: 'High-moisture concentrate cake with guarded mold incubation risk.',
    category: 'Medium Risk Sample',
  },
  {
    name: 'Damp Grain & Surface Mold Spoilage',
    type: 'concentrate' as FeedType,
    url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    description: 'Darkened humid grain sample exhibiting focal fungal growth.',
    category: 'High Fungal & Mycotoxin Risk',
  },
  {
    name: 'Floor-Threshed Wheat Straw (Bhusa)',
    type: 'dry_roughage' as FeedType,
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    description: 'Dry roughage collected from earthen threshing floor with particulate grit.',
    category: 'Silica Contamination Risk',
  },
];

export const FeedSafetyScanner: React.FC<FeedSafetyScannerProps> = ({
  id,
  initialReportId,
  onNavigate,
  onOpenScanner,
}) => {
  const { scanReports, safetyAssessments, saveSafetyAssessment } = useAppData();
  const { isOnline } = useOnlineStatus();

  // Form State
  const [selectedScanReportId, setSelectedScanReportId] = useState<string>(
    initialReportId || ''
  );
  const [feedType, setFeedType] = useState<FeedType>('silage');
  const [sampleName, setSampleName] = useState<string>('Bunker Maize Silage #1');
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(
    PRESET_SAFETY_SAMPLES[0].url
  );
  const [showSensoryDetails, setShowSensoryDetails] = useState<boolean>(false);
  const [sensoryObservations, setSensoryObservations] = useState({
    hasWhiteCrystalsOrAmmoniaOdor: false,
    hasGrittySedimentOrDirt: false,
    hasDiscolorationOrMoldSpots: false,
    isUncoveredOrDampStorage: false,
  });

  // Assessment Results
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeAssessment, setActiveAssessment] = useState<FeedSafetyAssessment | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);
  const [showMethodology, setShowMethodology] = useState<boolean>(false);
  const [selectedCertReport, setSelectedCertReport] = useState<FeedScanReport | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with initialReportId or default to first scan report if available
  useEffect(() => {
    if (initialReportId) {
      const match = scanReports.find((r) => r.id === initialReportId);
      if (match) {
        loadFromReport(match);
      }
    } else if (scanReports.length > 0 && !selectedScanReportId) {
      // Preload first available scan report
      const first = scanReports[0];
      setSelectedScanReportId(first.id);
      loadFromReport(first);
    } else if (!activeAssessment && safetyAssessments.length > 0) {
      setActiveAssessment(safetyAssessments[0]);
    }
  }, [initialReportId, scanReports]);

  const loadFromReport = (report: FeedScanReport) => {
    setSelectedScanReportId(report.id);
    setFeedType(report.feedType);
    setSampleName(report.sampleName);
    setImageDataUrl(report.imageUrl);

    // If report already has a pre-existing safety assessment, load it
    if (report.safetyAssessment) {
      setActiveAssessment(report.safetyAssessment);
    } else {
      // Auto-populate sensible sensory flags based on existing data
      setSensoryObservations({
        hasWhiteCrystalsOrAmmoniaOdor: false,
        hasGrittySedimentOrDirt: false,
        hasDiscolorationOrMoldSpots: report.moldDetected || report.spoilageRisk === 'High',
        isUncoveredOrDampStorage: report.moistureEstimate > 14 && report.feedType !== 'silage' && report.feedType !== 'green_fodder',
      });
      // Run quick assessment
      triggerAssessment(report);
    }
  };

  const handleReportSelectChange = (reportId: string) => {
    setSelectedScanReportId(reportId);
    if (reportId === 'custom') {
      setSampleName('Custom Field Sample');
      setImageDataUrl(undefined);
    } else {
      const match = scanReports.find((r) => r.id === reportId);
      if (match) loadFromReport(match);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageDataUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAssessment = async (
    overrideReport?: FeedScanReport,
    forceInsufficientData: boolean = false
  ) => {
    setIsAnalyzing(true);
    setSaveSuccessNotice(false);

    const targetReport = overrideReport || scanReports.find((r) => r.id === selectedScanReportId);

    try {
      const result = await evaluateFeedSafety({
        feedType,
        sampleName,
        sampleId: targetReport?.id || `SMP-${Date.now().toString().slice(-6)}`,
        imageDataUrl,
        existingReport: targetReport,
        sensoryObservations,
        forceInsufficientData,
      });

      setActiveAssessment(result);

      // Automatically sync to existing report if present
      if (targetReport && !forceInsufficientData) {
        saveSafetyAssessment(result, targetReport.id);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToReport = () => {
    if (!activeAssessment) return;
    saveSafetyAssessment(activeAssessment, selectedScanReportId);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3500);
  };

  const handlePrintCertificate = () => {
    if (!activeAssessment) return;
    // Find matching report or create synthetic one
    const existing = scanReports.find((r) => r.id === activeAssessment.sampleId);
    if (existing) {
      setSelectedCertReport({
        ...existing,
        safetyAssessment: activeAssessment,
      });
    } else {
      // Synthetic report for certificate printing
      const synthetic: FeedScanReport = {
        id: activeAssessment.sampleId,
        timestamp: activeAssessment.timestamp,
        sampleName: activeAssessment.sampleName,
        feedType: activeAssessment.feedType,
        imageUrl: imageDataUrl || 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80',
        overallScore: activeAssessment.safetyScore,
        qualityGrade: activeAssessment.safetyScore >= 80 ? 'Grade A (Excellent)' : activeAssessment.safetyScore >= 65 ? 'Grade B (Good)' : 'Grade C (Standard)',
        confidenceScore: 92,
        moistureEstimate: 35,
        spoilageRisk: activeAssessment.fungalRisk === 'HIGH' ? 'High' : activeAssessment.fungalRisk === 'MEDIUM' ? 'Moderate' : 'Low',
        moldDetected: activeAssessment.fungalRisk === 'HIGH',
        mycotoxinRiskLevel: activeAssessment.mycotoxinRisk === 'HIGH' ? 'Unsafe' : activeAssessment.mycotoxinRisk === 'MEDIUM' ? 'Guarded' : 'Safe',
        physicalTexture: 'Crisp & Long-cut',
        odorProfile: 'Sweet & Aromatic',
        nutritionalValues: {
          dryMatter: 45,
          crudeProtein: 12,
          totalDigestibleNutrients: 65,
          neutralDetergentFiber: 42,
          acidDetergentFiber: 26,
          metabolizableEnergy: 9.8,
          calcium: 0.4,
          phosphorus: 0.3,
          moisture: 55,
        },
        recommendations: [
          activeAssessment.farmerAdvisory,
          'Maintain clean, moisture-free storage on elevated wooden pallets.',
        ],
        safetyAssessment: activeAssessment,
      };
      setSelectedCertReport(synthetic);
    }
  };

  const getRiskBadge = (level: SafetyRiskLevel) => {
    switch (level) {
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Low Risk
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            Medium Risk
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            High Risk
          </span>
        );
      case 'Insufficient data':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-600 border border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700">
            <HelpCircle className="h-3 w-3 text-stone-400" />
            Insufficient data
          </span>
        );
    }
  };

  return (
    <div id={id} className="space-y-6">
      {/* Header & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-emerald-600" />
              Feed Safety & Adulteration Scanner
            </h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Automated screening for urea adulteration, sand/silica contamination, fungal colonization, and aflatoxin risk vectors.
          </p>
        </div>

        {/* Offline & Architecture Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            {isOnline ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>On-Device Edge AI Engine</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-500" />
                <span>100% Offline Active</span>
              </>
            )}
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('analyzer')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <Camera className="h-3.5 w-3.5" />
              View Feed Analyzer
            </button>
          )}
        </div>
      </div>

      {/* Input Configuration & Ingestion Section */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3 dark:border-stone-800">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
              1. Feed Sample & Ingestion Profile
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Select feed type, reuse existing Feed Analyzer scan data, or upload an image.
            </p>
          </div>

          {/* Quick Preset Selector for Easy Demonstration */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 shrink-0">
              Presets:
            </span>
            {PRESET_SAFETY_SAMPLES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setFeedType(preset.type);
                  setSampleName(preset.name);
                  setImageDataUrl(preset.url);
                  setSelectedScanReportId('custom');
                  if (preset.category.includes('High Fungal')) {
                    setSensoryObservations({
                      hasWhiteCrystalsOrAmmoniaOdor: false,
                      hasGrittySedimentOrDirt: false,
                      hasDiscolorationOrMoldSpots: true,
                      isUncoveredOrDampStorage: true,
                    });
                  } else if (preset.category.includes('Silica')) {
                    setSensoryObservations({
                      hasWhiteCrystalsOrAmmoniaOdor: false,
                      hasGrittySedimentOrDirt: true,
                      hasDiscolorationOrMoldSpots: false,
                      isUncoveredOrDampStorage: false,
                    });
                  } else {
                    setSensoryObservations({
                      hasWhiteCrystalsOrAmmoniaOdor: false,
                      hasGrittySedimentOrDirt: false,
                      hasDiscolorationOrMoldSpots: false,
                      isUncoveredOrDampStorage: false,
                    });
                  }
                }}
                className="rounded-lg bg-stone-100 px-2.5 py-1 text-[10px] font-semibold text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 whitespace-nowrap transition-colors"
              >
                {preset.name.split(' ')[0]} ({preset.category.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Reuse existing Feed Analyzer Scan */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Link Existing Feed Analyzer Scan
            </label>
            <select
              value={selectedScanReportId}
              onChange={(e) => handleReportSelectChange(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
            >
              <option value="custom">-- Custom Feed Entry (No Linked Scan) --</option>
              {scanReports.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.sampleName} ({report.feedType} • {report.overallScore}/100)
                </option>
              ))}
            </select>
            <p className="text-[10px] text-stone-400 mt-1">
              Automatically reuses crude protein, fiber, moisture, and camera frames.
            </p>
          </div>

          {/* Feed Type */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Feed Substrate Category
            </label>
            <select
              value={feedType}
              onChange={(e) => setFeedType(e.target.value as FeedType)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
            >
              <option value="silage">Corn / Sorghum Silage (साइलेज)</option>
              <option value="concentrate">Compounded Concentrate & Oil Cakes (खली / दाना)</option>
              <option value="green_fodder">Fresh Green Fodder (हरा चारा)</option>
              <option value="dry_roughage">Dry Roughage & Wheat Straw (भूसा / कड़बी)</option>
              <option value="byproduct">Agricultural Byproducts (चोकर / छिलका)</option>
              <option value="mineral_mix">Mineral Mixture / Feed Supplements</option>
            </select>
          </div>

          {/* Sample Identifier */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Sample Identifier / Batch Lot
            </label>
            <input
              type="text"
              value={sampleName}
              onChange={(e) => setSampleName(e.target.value)}
              placeholder="e.g. Mustard Cake Batch 12"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Visual Image Capture / Upload Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2">
          <div className="md:col-span-8 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative h-24 w-32 shrink-0 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800 flex items-center justify-center">
              {imageDataUrl ? (
                <img
                  src={imageDataUrl}
                  alt="Feed Sample Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-stone-400 p-2 text-center">
                  <Camera className="h-6 w-6 mb-1" />
                  <span className="text-[10px]">No image attached</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5 w-full">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 transition-colors shadow-xs"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload Sample Image
                </button>

                {onOpenScanner && (
                  <button
                    type="button"
                    onClick={onOpenScanner}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 transition-colors shadow-xs"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Open Live Camera
                  </button>
                )}

                {imageDataUrl && (
                  <button
                    type="button"
                    onClick={() => setImageDataUrl(undefined)}
                    className="text-xs text-rose-500 hover:text-rose-700 px-2 py-1"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Visual inspection analyzes macroscopic fungal hyphae, surface discoloration, and particulate grit.
              </p>
            </div>
          </div>

          {/* Trigger Assessment Buttons */}
          <div className="md:col-span-4 flex flex-col gap-2">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => triggerAssessment()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Analyzing Safety Risks...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Run Feed Safety Assessment
                </>
              )}
            </button>

            {/* Test Case Trigger for Insufficient Data */}
            <button
              type="button"
              onClick={() => triggerAssessment(undefined, true)}
              className="text-[11px] text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 text-center hover:underline"
            >
              Test Case C: Simulate Insufficient Data
            </button>
          </div>
        </div>

        {/* Sensory & Handling Observations (Collapsible) */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={() => setShowSensoryDetails(!showSensoryDetails)}
            className="flex items-center justify-between w-full text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white py-1"
          >
            <span className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-emerald-600" />
              Optional Physical & Sensory Field Observations ({Object.values(sensoryObservations).filter(Boolean).length} flagged)
            </span>
            {showSensoryDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showSensoryDetails && (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-xl dark:bg-stone-800/40">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sensoryObservations.hasWhiteCrystalsOrAmmoniaOdor}
                  onChange={(e) =>
                    setSensoryObservations({
                      ...sensoryObservations,
                      hasWhiteCrystalsOrAmmoniaOdor: e.target.checked,
                    })
                  }
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-stone-700 dark:text-stone-300">
                  White crystalline residues or pungent chemical/ammonia odor (Urea risk indicator)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sensoryObservations.hasGrittySedimentOrDirt}
                  onChange={(e) =>
                    setSensoryObservations({
                      ...sensoryObservations,
                      hasGrittySedimentOrDirt: e.target.checked,
                    })
                  }
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-stone-700 dark:text-stone-300">
                  Noticeable grit, sand sediment, or floor dirt in sample (Silica contamination)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sensoryObservations.hasDiscolorationOrMoldSpots}
                  onChange={(e) =>
                    setSensoryObservations({
                      ...sensoryObservations,
                      hasDiscolorationOrMoldSpots: e.target.checked,
                    })
                  }
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-stone-700 dark:text-stone-300">
                  Visible dark/white mold colonies or musty fermentation spoilage
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sensoryObservations.isUncoveredOrDampStorage}
                  onChange={(e) =>
                    setSensoryObservations({
                      ...sensoryObservations,
                      isUncoveredOrDampStorage: e.target.checked,
                    })
                  }
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-stone-700 dark:text-stone-300">
                  Feed stored in high-humidity or leaking shelter (Aflatoxin proxy factor)
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Safety Results View */}
      {activeAssessment && (
        <div className="space-y-6">
          {/* Main Score & Risk Matrix Card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Overall Safety Score Gauge */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Overall Feed Safety Score
                </span>

                {activeAssessment.overallRiskLevel === 'Insufficient data' ? (
                  <div className="my-4">
                    <div className="text-3xl font-extrabold text-stone-400 dark:text-stone-500">
                      — / 100
                    </div>
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-stone-200 px-3 py-1 text-xs font-bold text-stone-700 dark:bg-stone-700 dark:text-stone-300">
                      <HelpCircle className="h-3.5 w-3.5" /> Insufficient Data
                    </span>
                  </div>
                ) : (
                  <div className="my-3">
                    <div
                      className={`text-5xl font-extrabold tracking-tight ${
                        activeAssessment.safetyScore >= 80
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : activeAssessment.safetyScore >= 60
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {activeAssessment.safetyScore}
                      <span className="text-xl font-normal text-stone-400 ml-1">/ 100</span>
                    </div>
                    <div className="mt-2">
                      {getRiskBadge(activeAssessment.overallRiskLevel)}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-stone-500 dark:text-stone-400 max-w-[220px]">
                  Aggregated index based on urea profile, silica contamination, fungal morphology, and mycotoxin proxy.
                </p>

                <button
                  type="button"
                  onClick={() => setShowMethodology(!showMethodology)}
                  className="mt-3 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <Info className="h-3 w-3" />
                  {showMethodology ? 'Hide Scoring Method' : 'View Scoring Methodology'}
                </button>
              </div>

              {/* Individual Vector Risk Badges Grid */}
              <div className="lg:col-span-8 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. Urea Adulteration Risk */}
                  <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3.5 dark:border-stone-800 dark:bg-stone-800/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 dark:text-white">
                        Urea Adulteration Risk
                      </span>
                      {getRiskBadge(activeAssessment.ureaRisk)}
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-2 line-clamp-2">
                      {activeAssessment.ureaDetails || 'Evaluated via protein profile and NPN benchmarks.'}
                    </p>
                    <div className="mt-2 text-[10px] text-stone-400 flex items-center gap-1">
                      <span>Test:</span>
                      <span className="font-medium text-stone-500 dark:text-stone-300">
                        Urease test (p-DMAB strip) for chemical confirmation
                      </span>
                    </div>
                  </div>

                  {/* 2. Sand / Silica Contamination Risk */}
                  <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3.5 dark:border-stone-800 dark:bg-stone-800/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 dark:text-white">
                        Sand / Silica Contamination
                      </span>
                      {getRiskBadge(activeAssessment.silicaRisk)}
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-2 line-clamp-2">
                      {activeAssessment.silicaDetails || 'Evaluated via optical foreign matter and soil grit.'}
                    </p>
                    <div className="mt-2 text-[10px] text-stone-400 flex items-center gap-1">
                      <span>Test:</span>
                      <span className="font-medium text-stone-500 dark:text-stone-300">
                        Acid Insoluble Ash (AIA) laboratory assay
                      </span>
                    </div>
                  </div>

                  {/* 3. Fungal Contamination Risk */}
                  <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3.5 dark:border-stone-800 dark:bg-stone-800/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 dark:text-white">
                        Fungal Contamination Risk
                      </span>
                      {getRiskBadge(activeAssessment.fungalRisk)}
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-2 line-clamp-2">
                      {activeAssessment.fungalDetails || 'Evaluated via optical surface hyphae and moisture.'}
                    </p>
                    <div className="mt-2 text-[10px] text-stone-400 flex items-center gap-1">
                      <span>Test:</span>
                      <span className="font-medium text-stone-500 dark:text-stone-300">
                        Microscopic mycelial spore count & culture
                      </span>
                    </div>
                  </div>

                  {/* 4. Mycotoxin / Aflatoxin Risk */}
                  <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3.5 dark:border-stone-800 dark:bg-stone-800/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 dark:text-white">
                        Mycotoxin / Aflatoxin Risk
                      </span>
                      {getRiskBadge(activeAssessment.mycotoxinRisk)}
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-2 line-clamp-2">
                      {activeAssessment.mycotoxinDetails || 'Estimated biological proxy based on substrate & fungal presence.'}
                    </p>
                    <div className="mt-2 text-[10px] text-stone-400 flex items-center gap-1">
                      <span>Test:</span>
                      <span className="font-medium text-stone-500 dark:text-stone-300">
                        ELISA strip / HPLC fluorescence test (ppb)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Methodology Accordion View */}
                {showMethodology && (
                  <div className="rounded-xl bg-emerald-50/50 p-3 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/60 text-xs text-stone-700 dark:text-stone-300 space-y-1 animate-fadeIn">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                      Scoring Methodology & Mathematical Formula:
                    </span>
                    <p className="text-[11px]">
                      The Feed Safety Index is calibrated on a 100-point scale starting at 100 with deduction weights:
                    </p>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-1">
                      <li><strong>HIGH Risk Vector:</strong> -24 points deduction per vector</li>
                      <li><strong>MEDIUM Risk Vector:</strong> -11 points deduction per vector</li>
                      <li><strong>LOW Risk Vector:</strong> 0 deduction (Normal baseline)</li>
                      <li><strong>Insufficient Data:</strong> Score marked pending; user alerted to provide sample image or lab data.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Findings & Visual Inspection Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Findings */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-3">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                AI Findings & Risk Rationale
              </h3>
              <ul className="space-y-2 text-xs text-stone-700 dark:text-stone-300">
                {activeAssessment.aiFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>

              {activeAssessment.visualIndicators && (
                <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-lg bg-stone-50 p-2 dark:bg-stone-800">
                    <span className="text-stone-400 block">Surface Discoloration:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {activeAssessment.visualIndicators.discolorationLevel}
                    </span>
                  </div>
                  <div className="rounded-lg bg-stone-50 p-2 dark:bg-stone-800">
                    <span className="text-stone-400 block">Foreign Particles:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {activeAssessment.visualIndicators.foreignMaterialObserved ? 'Detected' : 'None Detected'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Practical Farmer Advisory */}
            <div
              className={`rounded-2xl border p-5 shadow-xs space-y-3 ${
                activeAssessment.overallRiskLevel === 'HIGH'
                  ? 'border-rose-300 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-950/20'
                  : activeAssessment.overallRiskLevel === 'MEDIUM'
                  ? 'border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20'
                  : 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/20'
              }`}
            >
              <div className="flex items-center gap-2">
                {activeAssessment.overallRiskLevel === 'HIGH' ? (
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                ) : activeAssessment.overallRiskLevel === 'MEDIUM' ? (
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                )}
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                  Farmer Action Advisory
                </h3>
              </div>

              <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
                {activeAssessment.farmerAdvisory}
              </p>

              <div className="rounded-lg bg-white/70 p-3 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-700/80 text-[11px] text-stone-600 dark:text-stone-400">
                <span className="font-bold text-stone-800 dark:text-stone-200 block mb-1">
                  Practical Feeding Guidelines:
                </span>
                {activeAssessment.overallRiskLevel === 'HIGH' ? (
                  <p>
                    • Do NOT feed to lactating cows, pregnant cows, or young calves.
                    <br />• Isolate the batch and contact your Dairy Cooperative Inspector or Veterinarian.
                  </p>
                ) : activeAssessment.overallRiskLevel === 'MEDIUM' ? (
                  <p>
                    • Scrape off and discard any top spoiled bunker crust before feeding.
                    <br />• Limit intake and monitor cud chewing rate and milk butterfat consistency.
                  </p>
                ) : (
                  <p>
                    • Safe for routine herd ration integration according to targeted dry matter allowances.
                    <br />• Maintain sealed storage to preserve lactic fermentation and aerobic stability.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Batch ID: <strong className="font-mono text-stone-800 dark:text-stone-200">{activeAssessment.sampleId}</strong>
              </span>
              {saveSuccessNotice && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 animate-fadeIn">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Saved to FeedWise Audit Logs!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveToReport}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 transition-colors shadow-xs"
              >
                <FileCheck className="h-4 w-4 text-emerald-600" />
                Add to Official Report
              </button>

              <button
                type="button"
                onClick={handlePrintCertificate}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <Printer className="h-4 w-4" />
                Export Certificate
              </button>
            </div>
          </div>

          {/* Scientific Accuracy Disclaimer */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-800/40 text-[11px] text-stone-500 dark:text-stone-400 space-y-1">
            <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-stone-500" />
              Scientific Protocol & Laboratory Disclaimer:
            </span>
            <p>{activeAssessment.disclaimer}</p>
          </div>
        </div>
      )}

      {/* Previous Safety Assessments History Table */}
      {safetyAssessments.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              Recent Feed Safety & Adulteration Audit Logs ({safetyAssessments.length})
            </h3>
            <span className="text-xs text-stone-400">Integrated with FeedWise History</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 text-[11px]">
                  <th className="py-2.5 px-3 font-semibold">Sample Name</th>
                  <th className="py-2.5 px-3 font-semibold">Feed Type</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Safety Score</th>
                  <th className="py-2.5 px-3 font-semibold">Urea Risk</th>
                  <th className="py-2.5 px-3 font-semibold">Silica Risk</th>
                  <th className="py-2.5 px-3 font-semibold">Fungal / Mycotoxin</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {safetyAssessments.map((assessment) => (
                  <tr
                    key={assessment.id}
                    className="hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-stone-900 dark:text-white">
                      {assessment.sampleName}
                    </td>
                    <td className="py-3 px-3 capitalize text-stone-600 dark:text-stone-300">
                      {assessment.feedType.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3 text-stone-500">
                      {new Date(assessment.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-stone-900 dark:text-white">
                          {assessment.overallRiskLevel === 'Insufficient data' ? '—' : assessment.safetyScore}
                        </span>
                        {getRiskBadge(assessment.overallRiskLevel)}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {getRiskBadge(assessment.ureaRisk)}
                    </td>
                    <td className="py-3 px-3">
                      {getRiskBadge(assessment.silicaRisk)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-stone-500">Fungal: {assessment.fungalRisk}</span>
                        <span className="text-[10px] text-stone-500">Mycotoxin: {assessment.mycotoxinRisk}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveAssessment(assessment);
                          setSampleName(assessment.sampleName);
                          setFeedType(assessment.feedType);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="rounded-md px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      >
                        Load Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={Boolean(selectedCertReport)}
        onClose={() => setSelectedCertReport(null)}
        report={selectedCertReport}
      />
    </div>
  );
};
