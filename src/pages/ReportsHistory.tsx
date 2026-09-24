import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { QualityBadge } from '../components/common/QualityBadge';
import { CertificateModal } from '../components/reports/CertificateModal';
import { FeedScanReport, FeedType } from '../types';
import { FileCheck, Search, Filter, Printer, Trash2, Eye } from 'lucide-react';

interface ReportsHistoryProps {
  id?: string;
  onViewReport: (reportId: string) => void;
}

export const ReportsHistory: React.FC<ReportsHistoryProps> = ({
  id,
  onViewReport,
}) => {
  const { scanReports, deleteScanReport, clearAllScans } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedCertReport, setSelectedCertReport] = useState<FeedScanReport | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filtered = scanReports.filter((report) => {
    const matchesSearch =
      report.sampleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || report.feedType === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div id={id} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-emerald-600" />
            Feed Quality & Silage Audit Logs ({filtered.length})
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Historical laboratory and spectral scans with Flieg scores, nutritional records, and printable certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {showClearConfirm ? (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/50 p-1.5 px-2.5 rounded-xl border border-amber-300 dark:border-amber-800 text-xs">
              <span className="text-amber-900 dark:text-amber-200">Reset to default scans?</span>
              <button
                type="button"
                onClick={() => {
                  clearAllScans();
                  setShowClearConfirm(false);
                }}
                className="px-2 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors"
              >
                Yes, Reset
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-1 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/80 px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors shadow-xs"
              title="Reset scan reports storage cache to default"
            >
              <Trash2 className="h-3.5 w-3.5 text-stone-400" />
              <span>Clean Storage Cache</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sample name or ID..."
            className="w-full rounded-xl border border-stone-300 bg-white pl-9 pr-4 py-2 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-stone-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
          >
            <option value="all">All Feed Types</option>
            <option value="silage">Silage Only</option>
            <option value="green_fodder">Green Fodder Only</option>
            <option value="dry_roughage">Dry Roughage Only</option>
            <option value="concentrate">Concentrates Only</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 text-stone-500">
                <th className="py-3 px-4 font-semibold">Feed Sample</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Score / Grade</th>
                <th className="py-3 px-4 font-semibold">DM / CP</th>
                <th className="py-3 px-4 font-semibold">Flieg Score</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filtered.map((report) => (
                <tr key={report.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={report.imageUrl}
                        alt={report.sampleName}
                        className="h-9 w-9 rounded-lg object-cover border border-stone-200 dark:border-stone-700"
                      />
                      <div>
                        <span className="font-bold text-stone-900 dark:text-white block">
                          {report.sampleName}
                        </span>
                        <span className="font-mono text-[10px] text-stone-400">
                          #{report.id.substring(0, 12)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 capitalize text-stone-600 dark:text-stone-300">
                    {report.feedType.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4 text-stone-500">
                    {new Date(report.timestamp).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 dark:text-white">
                        {report.overallScore}
                      </span>
                      <QualityBadge grade={report.qualityGrade} size="sm" />
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-stone-700 dark:text-stone-300">
                    {report.nutritionalValues.dryMatter}% DM • {report.nutritionalValues.crudeProtein}% CP
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                    {report.fliegData ? `${report.fliegData.fliegScore} / 100` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewReport(report.id)}
                        className="rounded-md p-1.5 text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                        title="View Full Spectrometry"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCertReport(report)}
                        className="rounded-md p-1.5 text-stone-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                        title="Print Certificate"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteScanReport(report.id)}
                        className="rounded-md p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title="Delete Report"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CertificateModal
        isOpen={Boolean(selectedCertReport)}
        onClose={() => setSelectedCertReport(null)}
        report={selectedCertReport}
      />
    </div>
  );
};
