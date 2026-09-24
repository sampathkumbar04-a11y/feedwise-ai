import React from 'react';

interface FooterProps {
  id?: string;
}

export const Footer: React.FC<FooterProps> = ({ id }) => {
  return (
    <footer
      id={id}
      className="border-t border-stone-200/80 bg-white/80 backdrop-blur-md py-6 text-xs text-stone-500 dark:border-stone-800/80 dark:bg-stone-900/80 dark:text-stone-400"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-800 dark:text-stone-200">
            FeedWise AI Platform
          </span>
          <span>•</span>
          <span>ICAR & NRC 2001 Dairy Standards Compliant</span>
        </div>
        <div>
          <span>Flieg Score Silage Fermentation Index & TMR Nutrition Engine</span>
        </div>
      </div>
    </footer>
  );
};
