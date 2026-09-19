import React, { useRef, useEffect } from 'react';
import { FeedScanReport } from '../../types';

interface ScanOverlayCanvasProps {
  id?: string;
  report: FeedScanReport;
}

export const ScanOverlayCanvas: React.FC<ScanOverlayCanvasProps> = ({ id, report }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = report.imageUrl;

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 400;

      // Draw base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Semi-transparent spectral scan grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw targeting bounding boxes / detection regions
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(100, 80, 400, 240);

      // Corner markers
      const cLen = 20;
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(100, 80 + cLen);
      ctx.lineTo(100, 80);
      ctx.lineTo(100 + cLen, 80);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(500 - cLen, 80);
      ctx.lineTo(500, 80);
      ctx.lineTo(500, 80 + cLen);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(100, 320 - cLen);
      ctx.lineTo(100, 320);
      ctx.lineTo(100 + cLen, 320);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(500 - cLen, 320);
      ctx.lineTo(500, 320);
      ctx.lineTo(500, 320 - cLen);
      ctx.stroke();

      // HUD Detection Tag
      ctx.fillStyle = 'rgba(21, 128, 61, 0.85)';
      ctx.fillRect(105, 85, 200, 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(
        `DM: ${report.nutritionalValues.dryMatter}% | CP: ${report.nutritionalValues.crudeProtein}%`,
        112,
        102
      );

      // Particle/fiber analysis badge
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(105, 290, 240, 24);
      ctx.fillStyle = '#a7f3d0';
      ctx.font = '11px sans-serif';
      ctx.fillText(
        `Chop Length: ${report.physicalTexture} (OK)`,
        112,
        306
      );
    };
  }, [report]);

  return (
    <div id={id} className="relative overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-950">
      <canvas ref={canvasRef} className="w-full h-auto object-cover" />
      <div className="absolute top-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 backdrop-blur-xs">
        SPECTRAL COMPUTER VISION
      </div>
    </div>
  );
};
