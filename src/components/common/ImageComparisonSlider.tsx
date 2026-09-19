import React, { useState } from 'react';

interface ImageComparisonSliderProps {
  id?: string;
  originalImage: string;
  annotatedImage?: string;
  aspectRatio?: string;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  id,
  originalImage,
  annotatedImage,
}) => {
  const [sliderPos, setSliderPos] = useState(50);

  const displayAnnotated =
    annotatedImage ||
    originalImage; // Can overlay canvas markers or visual color filters

  return (
    <div
      id={id}
      className="relative h-64 sm:h-80 w-full overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 select-none"
    >
      {/* Annotated AI Spectrum view */}
      <img
        src={displayAnnotated}
        alt="Analyzed Feed"
        className="absolute inset-0 h-full w-full object-cover filter contrast-125 saturate-150"
      />
      <div className="absolute top-3 right-3 rounded-md bg-stone-950/80 px-2.5 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-xs">
        AI Spectral Map
      </div>

      {/* Raw View overlay clipped by slider */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={originalImage}
          alt="Raw Camera Scan"
          className="absolute inset-0 h-full w-full object-cover max-w-none"
          style={{ width: '100%', height: '100%' }}
        />
        <div className="absolute top-3 left-3 rounded-md bg-stone-950/80 px-2.5 py-1 text-xs font-semibold text-stone-200 backdrop-blur-xs">
          Raw Scan
        </div>
      </div>

      {/* Slider divider line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-md cursor-ew-resize"
        style={{ left: `calc(${sliderPos}% - 2px)` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg text-stone-800 text-xs font-bold">
          ⇄
        </div>
      </div>

      {/* Interactive slider input */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPos}
        onChange={(e) => setSliderPos(Number(e.target.value))}
        className="absolute inset-0 h-full w-full opacity-0 cursor-ew-resize"
        aria-label="Image comparison slider"
      />
    </div>
  );
};
