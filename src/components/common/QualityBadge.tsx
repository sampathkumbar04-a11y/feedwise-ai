import React from 'react';
import { QualityGrade, FliegGrade } from '../../types';

interface QualityBadgeProps {
  id?: string;
  grade: QualityGrade | FliegGrade | string;
  size?: 'sm' | 'md' | 'lg';
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({ id, grade, size = 'md' }) => {
  let colorClass = 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300';

  if (grade.includes('Grade A') || grade === 'Very Good' || grade === 'Excellent') {
    colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
  } else if (grade.includes('Grade B') || grade === 'Good') {
    colorClass = 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800';
  } else if (grade.includes('Grade C') || grade === 'Fair' || grade === 'Standard') {
    colorClass = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
  } else if (grade.includes('Grade D') || grade === 'Poor' || grade === 'Substandard') {
    colorClass = 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800';
  } else if (grade.includes('Grade E') || grade === 'Very Poor' || grade === 'Hazardous') {
    colorClass = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-bold',
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center rounded-full border whitespace-nowrap ${sizeClasses[size]} ${colorClass}`}
    >
      {grade}
    </span>
  );
};
