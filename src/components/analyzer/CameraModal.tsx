import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle,
  RefreshCw,
  Video,
  AlertCircle,
  FlipHorizontal,
  RotateCcw,
  Sliders,
  Check,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { FeedType } from '../../types';
import { compressImage } from '../../utils/storage';

interface CameraModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  onCapture: (
    imageDataUrl: string,
    feedType: FeedType,
    sampleName: string,
    manualPH?: number,
    silageConditionHint?: 'auto' | 'optimal' | 'caramelized' | 'wet' | 'moldy',
    chopTextureHint?: 'auto' | 'long_coarse' | 'medium_crisp' | 'fine_chopped' | 'mushy_sludge' | 'dry_fibrous'
  ) => void;
}

type CaptureMode = 'camera' | 'upload' | 'preset';

interface SamplePresetItem {
  id: string;
  name: string;
  type: FeedType;
  silageCondition?: 'optimal' | 'caramelized' | 'wet' | 'moldy';
  chopTexture?: 'auto' | 'long_coarse' | 'medium_crisp' | 'fine_chopped' | 'mushy_sludge' | 'dry_fibrous';
  category: 'silage' | 'green' | 'dry' | 'concentrate';
  url: string;
  description: string;
  ph: number;
}

const SAMPLE_PRESETS: SamplePresetItem[] = [
  {
    id: 'silage_pit_1_optimal',
    name: 'Optimal Whole Corn Silage (Pit 1)',
    type: 'silage',
    silageCondition: 'optimal',
    chopTexture: 'medium_crisp',
    category: 'silage',
    url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80',
    description: 'Golden-green corn silage, 34% DM, benchmark medium chop (12-19mm), pH 3.9.',
    ph: 3.9,
  },
  {
    id: 'silage_pit_2_fine',
    name: 'Fine Over-Chopped Corn Silage (Pit 2)',
    type: 'silage',
    silageCondition: 'optimal',
    chopTexture: 'fine_chopped',
    category: 'silage',
    url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    description: 'Short pulverized particles (5-10mm); tightly packed, but needs straw buffer against acidosis.',
    ph: 3.84,
  },
  {
    id: 'silage_pit_3_coarse',
    name: 'Coarse Long-Cut Corn Silage (Pit 3)',
    type: 'silage',
    silageCondition: 'optimal',
    chopTexture: 'long_coarse',
    category: 'silage',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    description: 'Long leafy ribbons (19-25mm); high physically effective NDF for maximum cud chewing.',
    ph: 4.02,
  },
  {
    id: 'silage_pit_4_caramelized',
    name: 'Overheated Caramelized Silage (Pit 4)',
    type: 'silage',
    silageCondition: 'caramelized',
    chopTexture: 'dry_fibrous',
    category: 'silage',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    description: 'Dark brown caramelized silage from delayed sealing; brittle coarse fibers, pH 4.8.',
    ph: 4.8,
  },
  {
    id: 'silage_pit_5_wet',
    name: 'Wet High-Moisture Silage (Pit 5)',
    type: 'silage',
    silageCondition: 'wet',
    chopTexture: 'mushy_sludge',
    category: 'silage',
    url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80',
    description: 'Dark waterlogged silage (>75% moisture); sludge mushy breakdown, effluent seepage, pH 5.2.',
    ph: 5.2,
  },
  {
    id: 'silage_pit_6_moldy',
    name: 'Surface Spoiled Silage (Pit 6 Mold)',
    type: 'silage',
    silageCondition: 'moldy',
    chopTexture: 'auto',
    category: 'silage',
    url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80',
    description: 'White/grey mold mycelium patches on exposed bunker edge; clumped fungal crusts, pH 5.75.',
    ph: 5.75,
  },
  {
    id: 'green_napier_co5',
    name: 'Fresh Green Napier Grass (CO-5)',
    type: 'green_fodder',
    category: 'green',
    url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80',
    description: 'Succulent tall leafy grass, harvested at 48 days.',
    ph: 6.2,
  },
  {
    id: 'dry_wheat_straw_bhusa',
    name: 'Golden Wheat Straw (Bhusa)',
    type: 'dry_roughage',
    category: 'dry',
    url: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=600&q=80',
    description: 'Crisp dry wheat straw, 90% Dry Matter, rumen stimulation.',
    ph: 6.8,
  },
  {
    id: 'concentrate_mustard_cake',
    name: 'Mustard Oil Cake Mash (Sarson Khali)',
    type: 'concentrate',
    category: 'concentrate',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    description: 'High-protein dairy concentrate cake (36% Crude Protein).',
    ph: 6.0,
  },
];

export const CameraModal: React.FC<CameraModalProps> = ({
  id,
  isOpen,
  onClose,
  onCapture,
}) => {
  const [mode, setMode] = useState<CaptureMode>('preset');
  const [selectedType, setSelectedType] = useState<FeedType>('silage');
  const [silageCondition, setSilageCondition] = useState<'auto' | 'optimal' | 'caramelized' | 'wet' | 'moldy'>('auto');
  const [chopTexture, setChopTexture] = useState<
    'auto' | 'long_coarse' | 'medium_crisp' | 'fine_chopped' | 'mushy_sludge' | 'dry_fibrous'
  >('auto');
  const [isAutoPH, setIsAutoPH] = useState<boolean>(true);
  const [presetFilter, setPresetFilter] = useState<'all' | 'silage' | 'other'>('silage');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SAMPLE_PRESETS[0].id);
  const [sampleName, setSampleName] = useState('Bunker Maize Silage #1');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(SAMPLE_PRESETS[0].url);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [manualPH, setManualPH] = useState<number>(3.9);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Live Camera States
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop current active media stream
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
  }, []);

  // Initialize and start live camera
  const startCamera = useCallback(async () => {
    stopCameraStream();
    setCameraError(null);
    setIsCameraLoading(true);

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError(
        'Live camera access is not supported by this browser. Please use Photo Upload or Demo Samples.'
      );
      setIsCameraLoading(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
          setIsCameraActive(true);
          setIsCameraLoading(false);
        };
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('Camera stream request failed:', error);
      let message = 'Unable to access camera hardware.';
      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera access in browser settings or use Upload.';
      } else if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
        message = 'No camera found on this device. Please use Photo Upload or Demo Samples.';
      } else if (error?.name === 'NotReadableError') {
        message = 'Camera is currently in use by another application.';
      }
      setCameraError(message);
      setIsCameraLoading(false);
      setIsCameraActive(false);
    }
  }, [facingMode, stopCameraStream]);

  // Clean up streams when modal closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      setCapturedPhotoUrl(null);
      setIsAnalyzing(false);
    }
  }, [isOpen, stopCameraStream]);

  // Start/stop camera depending on mode
  useEffect(() => {
    if (isOpen && mode === 'camera' && !capturedPhotoUrl) {
      startCamera();
    } else {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [isOpen, mode, capturedPhotoUrl, startCamera, stopCameraStream]);

  // Handle snapping photo from video stream
  const handleSnapPhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    // Scale down dimensions to max 640x480 to preserve storage quota
    let width = video.videoWidth || 640;
    let height = video.videoHeight || 480;
    if (width > 640 || height > 480) {
      const ratio = Math.min(640 / width, 480 / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    canvas.width = Math.max(width, 1);
    canvas.height = Math.max(height, 1);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
      setCapturedPhotoUrl(dataUrl);
      setSelectedImageUrl(dataUrl);
      stopCameraStream();
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPhotoUrl(null);
    startCamera();
  };

  // Flip between environment (rear) and user (selfie)
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Handle local file upload with compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedUrl = await compressImage(file, 640, 480, 0.65);
        if (compressedUrl) {
          setSelectedImageUrl(compressedUrl);
          setSampleName((prev) => prev.includes('Silage') ? file.name.replace(/\.[^/.]+$/, '') : prev);
        }
      } catch (err) {
        console.warn('Image upload compression error:', err);
      }
    }
  };

  // Drag-and-drop file upload with compression
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const compressedUrl = await compressImage(file, 640, 480, 0.65);
        if (compressedUrl) {
          setSelectedImageUrl(compressedUrl);
          setSampleName(file.name.replace(/\.[^/.]+$/, ''));
        }
      } catch (err) {
        console.warn('Image drop compression error:', err);
      }
    }
  };

  // Trigger analysis and save
  const handleStartAnalysis = () => {
    const targetUrl = capturedPhotoUrl || selectedImageUrl;
    if (!targetUrl) return;

    setIsAnalyzing(true);
    stopCameraStream();

    setTimeout(() => {
      // Determine effective pH: if preset mode, pass preset's calibrated pH.
      // If manual mode, pass user's entered pH. If silage condition was chosen explicitly, pass that condition's target pH.
      const effectivePH =
        selectedType === 'silage'
          ? !isAutoPH
            ? manualPH
            : mode === 'preset'
            ? manualPH
            : silageCondition !== 'auto'
            ? manualPH
            : undefined
          : undefined;

      onCapture(
        targetUrl,
        selectedType,
        sampleName || `${selectedType.toUpperCase()} Sample`,
        effectivePH,
        selectedType === 'silage' ? silageCondition : undefined,
        selectedType === 'silage' ? chopTexture : undefined
      );
      setIsAnalyzing(false);
      onClose();
    }, 600);
  };

  const activeDisplayUrl = capturedPhotoUrl || selectedImageUrl;

  return (
    <Modal
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      title="Scan Cattle Feed / Silage Sample"
      subtitle="AI optical spectrometry & Flieg fermentation evaluation for dairy rations"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Source Mode Selector Tabs */}
        <div className="flex items-center rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
          <button
            type="button"
            onClick={() => {
              setMode('camera');
              setCapturedPhotoUrl(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              mode === 'camera'
                ? 'bg-white text-emerald-700 shadow-xs dark:bg-stone-900 dark:text-emerald-400'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Video className="h-4 w-4 text-emerald-600" />
            <span>Live Camera</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('upload');
              stopCameraStream();
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              mode === 'upload'
                ? 'bg-white text-emerald-700 shadow-xs dark:bg-stone-900 dark:text-emerald-400'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Upload className="h-4 w-4 text-emerald-600" />
            <span>Upload Photo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('preset');
              stopCameraStream();
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              mode === 'preset'
                ? 'bg-white text-emerald-700 shadow-xs dark:bg-stone-900 dark:text-emerald-400'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>Farm Presets</span>
          </button>
        </div>

        {/* Viewport Area */}
        {mode === 'camera' ? (
          <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-xl bg-black border border-stone-800 flex items-center justify-center">
            {capturedPhotoUrl ? (
              // Captured snapshot preview
              <div className="relative h-full w-full">
                <img
                  src={capturedPhotoUrl}
                  alt="Captured feed"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-4">
                  <span className="self-start rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" /> Frame Captured Ready
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/90">Click Analyze below or retake</span>
                    <button
                      type="button"
                      onClick={handleRetake}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900/80 px-3 py-1.5 text-xs font-semibold text-white border border-stone-700 hover:bg-stone-800"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Retake
                    </button>
                  </div>
                </div>
              </div>
            ) : cameraError ? (
              // Camera error / permission issue fallback
              <div className="p-6 text-center max-w-md space-y-3">
                <AlertCircle className="h-10 w-10 text-amber-400 mx-auto" />
                <p className="text-xs font-medium text-stone-200">{cameraError}</p>
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('upload');
                      fileInputRef.current?.click();
                    }}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    Upload Photo Instead
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('preset')}
                    className="rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-200 hover:bg-stone-700 border border-stone-700"
                  >
                    Select Demo Silage
                  </button>
                </div>
              </div>
            ) : (
              // Live camera stream & reticle HUD
              <div className="relative h-full w-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />

                {isCameraLoading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-white text-xs font-medium">
                    <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                    Initializing camera stream...
                  </div>
                )}

                {/* Reticle HUD overlay */}
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-emerald-500/80 px-2.5 py-1 text-[11px] font-bold text-white uppercase backdrop-blur-xs flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span> Live Viewfinder
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded-sm">
                      ISO AUTO • AF ACTIVE
                    </span>
                  </div>

                  {/* Framing rectangle */}
                  <div className="mx-auto w-48 sm:w-64 h-32 sm:h-40 border-2 border-dashed border-emerald-400/70 rounded-xl relative flex items-center justify-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-300/90 tracking-wider bg-black/60 px-2 py-0.5 rounded-sm">
                      Align Forage / Grain Matrix
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="text-[11px] text-stone-300 font-medium drop-shadow-sm">
                      Keep sample under direct light for calibrated crude protein estimation
                    </span>
                  </div>
                </div>

                {/* Viewfinder Controls */}
                <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3 z-10">
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    className="rounded-full bg-stone-900/80 p-2.5 text-white hover:bg-stone-800 transition-colors border border-white/20"
                    title="Flip camera"
                  >
                    <FlipHorizontal className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSnapPhoto}
                    disabled={!isCameraActive}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg ring-4 ring-white/20 hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Camera className="h-4 w-4" />
                    Snap Feed Sample
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : mode === 'upload' ? (
          // File Upload / Dropzone
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative h-60 w-full overflow-hidden rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 cursor-pointer transition-all flex flex-col items-center justify-center p-4 group"
          >
            {activeDisplayUrl ? (
              <div className="relative h-full w-full">
                <img
                  src={activeDisplayUrl}
                  alt="Uploaded feed"
                  className="h-full w-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/40 rounded-lg flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="h-6 w-6 text-white mb-1" />
                  <span className="text-xs font-semibold text-white">Click or drag to replace photo</span>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-stone-800 dark:text-stone-200 block">
                    Upload feed photo or drag & drop here
                  </span>
                  <span className="text-xs text-stone-500">
                    Supports high-resolution JPG, PNG, WEBP from farm or mobile gallery
                  </span>
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        ) : (
          // Demo Sample Preset Gallery
          <div className="space-y-3">
            <div className="relative h-48 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-900 dark:border-stone-800">
              <img
                src={selectedImageUrl}
                alt="Selected feed"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 text-white">
                <span className="text-xs font-bold">{sampleName}</span>
                <span className="text-[11px] text-stone-300">Ready for automated spectrometry & Flieg score estimation</span>
              </div>
            </div>

            {/* Preset Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setPresetFilter('silage')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  presetFilter === 'silage'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                }`}
              >
                Silage Variants ({SAMPLE_PRESETS.filter((p) => p.category === 'silage').length})
              </button>
              <button
                type="button"
                onClick={() => setPresetFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  presetFilter === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                }`}
              >
                All Feed Presets ({SAMPLE_PRESETS.length})
              </button>
              <button
                type="button"
                onClick={() => setPresetFilter('other')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  presetFilter === 'other'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                }`}
              >
                Fodder & Concentrate
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_PRESETS.filter((preset) => {
                if (presetFilter === 'silage') return preset.category === 'silage';
                if (presetFilter === 'other') return preset.category !== 'silage';
                return true;
              }).map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setSelectedImageUrl(preset.url);
                      setSelectedType(preset.type);
                      setSampleName(preset.name);
                      if (preset.type === 'silage') {
                        setSilageCondition(preset.silageCondition || 'auto');
                        setChopTexture(preset.chopTexture || 'auto');
                        setManualPH(preset.ph);
                      }
                    }}
                    className={`flex flex-col p-2.5 rounded-lg text-left border text-xs transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                        : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 w-full">
                      <span className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {preset.name.split('(')[0]}
                      </span>
                      {preset.type === 'silage' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 shrink-0">
                          pH {preset.ph.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase mt-0.5">
                      {preset.type.replace('_', ' ')}
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {preset.silageCondition && (
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-sm ${
                            preset.silageCondition === 'moldy'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                              : preset.silageCondition === 'wet'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                              : preset.silageCondition === 'caramelized'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          }`}
                        >
                          {preset.silageCondition.toUpperCase()}
                        </span>
                      )}
                      {preset.chopTexture && preset.chopTexture !== 'auto' && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-sm bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                          {preset.chopTexture === 'fine_chopped'
                            ? '5-10mm'
                            : preset.chopTexture === 'medium_crisp'
                            ? '12-19mm'
                            : preset.chopTexture === 'long_coarse'
                            ? '19-25mm'
                            : preset.chopTexture === 'mushy_sludge'
                            ? 'MUSHY'
                            : 'COARSE'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Metadata & Tagging Controls */}
        <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Sample Name / Bunker Lot
              </label>
              <input
                type="text"
                value={sampleName}
                onChange={(e) => setSampleName(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs bg-white dark:bg-stone-800 dark:border-stone-700 dark:text-white focus:border-emerald-500 focus:outline-hidden"
                placeholder="e.g. Silage Pit 2, Napier Lot B"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Feed Category
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as FeedType)}
                className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs bg-white dark:bg-stone-800 dark:border-stone-700 dark:text-white focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="silage">Silage (Fermented Bunker Forage)</option>
                <option value="green_fodder">Green Fodder (Napier, Maize, Berseem)</option>
                <option value="dry_roughage">Dry Roughage (Wheat Straw, Hay)</option>
                <option value="concentrate">Concentrate (Oil Cake, Grain Meal)</option>
                <option value="byproduct">Byproduct (Wheat Bran, Chokar)</option>
              </select>
            </div>
          </div>

          {/* Dedicated Silage Sensory Condition & pH Controls */}
          {selectedType === 'silage' && (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200/80 dark:border-emerald-900/60 space-y-2.5">
              <div>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                  Silage Fermentation Condition Profile
                </span>
                <span className="text-[11px] text-stone-600 dark:text-stone-400">
                  Select visual appearance or let AI Computer Vision automatically inspect image color & texture:
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'auto', label: 'Auto AI Spectrometry', desc: 'Inspects image pixels' },
                  { id: 'optimal', label: 'Optimal Golden-Green', desc: 'pH 3.9, High Flieg' },
                  { id: 'caramelized', label: 'Overheated Brown', desc: 'pH 4.8, Heat-Bound' },
                  { id: 'wet', label: 'High-Moisture Wet', desc: 'pH 5.2, Seepage Risk' },
                  { id: 'moldy', label: 'Surface Moldy / Spoiled', desc: 'pH 5.7, Hazard' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSilageCondition(item.id as any);
                      if (item.id === 'optimal') setManualPH(3.9);
                      if (item.id === 'caramelized') setManualPH(4.8);
                      if (item.id === 'wet') setManualPH(5.2);
                      if (item.id === 'moldy') setManualPH(5.7);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                      silageCondition === item.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Particle Chop & Texture Length Profile */}
              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                    Particle Chop & Physical Texture
                  </span>
                  <span className="text-[10px] text-stone-500">Penn State separator / Rumen peNDF</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'auto', label: 'Auto Vision Detection' },
                    { id: 'medium_crisp', label: 'Medium Crisp Chop (12-19mm)' },
                    { id: 'fine_chopped', label: 'Fine Over-chopped (5-10mm)' },
                    { id: 'long_coarse', label: 'Crisp & Long-cut (19-25mm)' },
                    { id: 'mushy_sludge', label: 'Sludge / Mushy Waterlogged' },
                    { id: 'dry_fibrous', label: 'Dry & Coarse-cut' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setChopTexture(item.id as any)}
                      className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-all ${
                        chopTexture === item.id
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100/40'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* pH Mode Toggle */}
              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800 dark:text-stone-200">
                  <input
                    type="checkbox"
                    checked={isAutoPH}
                    onChange={(e) => setIsAutoPH(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 dark:bg-stone-900"
                  />
                  <span>Auto-calculate pH & Flieg Score via Computer Vision</span>
                </label>

                {!isAutoPH ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400">Manual pH:</span>
                    <input
                      type="number"
                      step="0.1"
                      min="3.0"
                      max="7.0"
                      value={manualPH}
                      onChange={(e) => setManualPH(Number(e.target.value))}
                      className="w-20 rounded-md border border-emerald-300 bg-white px-2 py-1 text-xs font-semibold text-center dark:bg-stone-900 dark:border-emerald-800 dark:text-white"
                    />
                    <span className="text-xs font-semibold text-stone-500">pH</span>
                  </div>
                ) : (
                  <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/40 px-2 py-0.5 rounded">
                    AI Auto-Estimation Active
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
          <div className="text-[11px] text-stone-500">
            {activeDisplayUrl ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle className="h-3.5 w-3.5" /> Sample ready for scan
              </span>
            ) : (
              <span>Select or capture a photo above</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStartAnalysis}
              disabled={isAnalyzing || !activeDisplayUrl}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Running AI Spectrometry...
                </>
              ) : (
                <>
                  <CheckCircle className="h-3.5 w-3.5" />
                  Analyze Feed Quality
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
