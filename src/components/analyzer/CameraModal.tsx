import React, { useRef, useState } from 'react';
import { Camera, Upload, Image as ImageIcon, CheckCircle, RefreshCw } from 'lucide-react';
import { Modal } from '../common/Modal';
import { FeedType } from '../../types';

interface CameraModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string, feedType: FeedType, sampleName: string, manualPH?: number) => void;
}

const SAMPLE_PRESETS = [
  {
    name: 'Bunker Corn Silage (Pit 1)',
    type: 'silage' as FeedType,
    url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80',
    description: 'Fresh chopped yellow-green corn silage, 32% DM, lactic fermented.',
    ph: 3.9,
  },
  {
    name: 'Fresh Green Napier Grass (CO-5)',
    type: 'green_fodder' as FeedType,
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    description: 'Succulent tall leafy grass, harvested at day 48.',
    ph: 6.2,
  },
  {
    name: 'Golden Wheat Straw (Bhusa)',
    type: 'dry_roughage' as FeedType,
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    description: 'Crisp dry wheat straw, 90% Dry Matter, rumination fiber.',
    ph: 6.8,
  },
  {
    name: 'Mustard Oil Cake Mash (Sarson Khali)',
    type: 'concentrate' as FeedType,
    url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80',
    description: 'High protein dairy concentrate cake (36% CP).',
    ph: 6.0,
  },
];

export const CameraModal: React.FC<CameraModalProps> = ({
  id,
  isOpen,
  onClose,
  onCapture,
}) => {
  const [selectedType, setSelectedType] = useState<FeedType>('silage');
  const [sampleName, setSampleName] = useState('Bunker Maize Silage #1');
  const [selectedPresetUrl, setSelectedPresetUrl] = useState<string>(SAMPLE_PRESETS[0].url);
  const [manualPH, setManualPH] = useState<number>(3.9);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedPresetUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartAnalysis = () => {
    setIsCapturing(true);
    setTimeout(() => {
      onCapture(selectedPresetUrl, selectedType, sampleName, selectedType === 'silage' ? manualPH : undefined);
      setIsCapturing(false);
      onClose();
    }, 600);
  };

  return (
    <Modal
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      title="Scan Cattle Feed / Silage Sample"
      subtitle="Capture live feed with camera, select curated farm samples, or upload an image from device"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Sample Selection & Image Preview */}
        <div className="relative h-60 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-900 dark:border-stone-800">
          <img
            src={selectedPresetUrl}
            alt="Selected Feed"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4">
            <div className="flex justify-between items-center">
              <span className="rounded-md bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5" /> Spectral Sensor Ready
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md bg-stone-900/80 px-2.5 py-1 text-xs font-medium text-stone-200 hover:bg-stone-800 transition-colors flex items-center gap-1.5 border border-stone-700"
              >
                <Upload className="h-3.5 w-3.5" /> Upload Photo
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="text-white">
              <p className="text-sm font-semibold">{sampleName}</p>
              <p className="text-xs text-stone-300">Ready for automated spectrometry & nutritional estimation</p>
            </div>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-2">
            Choose Quick Demo Feed Sample
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SAMPLE_PRESETS.map((preset, idx) => {
              const isSelected = selectedPresetUrl === preset.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedPresetUrl(preset.url);
                    setSelectedType(preset.type);
                    setSampleName(preset.name);
                    setManualPH(preset.ph);
                  }}
                  className={`flex flex-col p-2.5 rounded-lg text-left border text-xs transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                      : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <span className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                    {preset.name.split('(')[0]}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase mt-0.5">
                    {preset.type.replace('_', ' ')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feed Metadata Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div>
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
              Sample Name / Batch Tag
            </label>
            <input
              type="text"
              value={sampleName}
              onChange={(e) => setSampleName(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white dark:bg-stone-800 dark:border-stone-700 dark:text-white focus:border-emerald-500 focus:outline-hidden"
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
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white dark:bg-stone-800 dark:border-stone-700 dark:text-white focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="silage">Silage (Fermented Forage)</option>
              <option value="green_fodder">Green Fodder (Napier, Maize, Berseem)</option>
              <option value="dry_roughage">Dry Roughage (Wheat Straw, Hay)</option>
              <option value="concentrate">Concentrate (Mustard/Cotton Cake, Grain)</option>
              <option value="byproduct">Byproduct (Wheat Bran, Chokar)</option>
            </select>
          </div>

          {selectedType === 'silage' && (
            <div className="sm:col-span-2 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                  Optional: Manual pH Measurement
                </span>
                <span className="text-[11px] text-stone-600 dark:text-stone-400">
                  Ideal corn silage pH is 3.8 to 4.2. Flieg Score will incorporate this.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="3.0"
                  max="7.0"
                  value={manualPH}
                  onChange={(e) => setManualPH(Number(e.target.value))}
                  className="w-20 rounded-md border border-emerald-300 bg-white px-2 py-1 text-sm font-semibold text-center dark:bg-stone-900 dark:border-emerald-800 dark:text-white"
                />
                <span className="text-xs font-semibold text-stone-500">pH</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStartAnalysis}
            disabled={isCapturing}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50"
          >
            {isCapturing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing Spectrometry...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Analyze Feed Quality
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
