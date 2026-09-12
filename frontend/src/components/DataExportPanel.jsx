import React, { useContext } from 'react';
import { HeritageContext } from '../context/HeritageContext';
import { exportToCSV, exportToJSON, generateFamilyTreeReport } from '../utils/exportUtils';
import { useToast } from './Toast';

/**
 * DataExportPanel - Export family tree data in multiple formats
 */
const DataExportPanel = ({ onClose }) => {
  const { individuals } = useContext(HeritageContext);
  const { show: showToast, ToastContainer } = useToast();

  const handleExportCSV = () => {
    try {
      const exportData = individuals.map(p => ({
        'Full Name': p.full_name,
        'Gender': p.gender,
        'Clan': p.clan_name || 'Unassigned',
        'Bio': p.bio || '',
        'Father ID': p.father_id || '',
        'Mother ID': p.mother_id || ''
      }));
      exportToCSV(exportData, `buganda_heritage_${new Date().toISOString().split('T')[0]}.csv`);
      showToast(`✓ Exported ${individuals.length} members to CSV`, 'success');
    } catch (err) {
      showToast('Failed to export CSV', 'error');
    }
  };

  const handleExportJSON = () => {
    try {
      const report = generateFamilyTreeReport(individuals);
      exportToJSON(report, `buganda_heritage_${new Date().toISOString().split('T')[0]}.json`);
      showToast('✓ Exported family tree report to JSON', 'success');
    } catch (err) {
      showToast('Failed to export JSON', 'error');
    }
  };

  const handleExportSummary = () => {
    try {
      const summary = {
        report: 'Buganda Heritage Archives Summary',
        exportedDate: new Date().toLocaleString(),
        totalMembers: individuals.length,
        maleCount: individuals.filter(p => p.gender === 'Male').length,
        femaleCount: individuals.filter(p => p.gender === 'Female').length,
        clans: [...new Set(individuals.map(p => p.clan_name))].length,
        clanDetails: Object.entries(
          individuals.reduce((acc, p) => {
            const clan = p.clan_name || 'Unassigned';
            acc[clan] = (acc[clan] || 0) + 1;
            return acc;
          }, {})
        ).map(([clan, count]) => ({ clan, memberCount: count }))
      };
      exportToJSON(summary, `buganda_heritage_summary_${new Date().toISOString().split('T')[0]}.json`);
      showToast('✓ Exported summary report', 'success');
    } catch (err) {
      showToast('Failed to export summary', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <ToastContainer />
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-heritage-dark to-black text-white p-6 flex justify-between items-center border-b border-heritage-gold/30">
          <div>
            <h2 className="text-2xl font-bold font-serif">📥 Export Data</h2>
            <p className="text-heritage-gold text-sm mt-1">Download your heritage records</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:text-heritage-gold transition"
          >
            ✕
          </button>
        </div>

        {/* Export Options */}
        <div className="p-8 space-y-4">
          {/* CSV Export */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200 hover:border-blue-400 transition cursor-pointer"
               onClick={handleExportCSV}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-blue-900 mb-1">📊 Export to CSV</h3>
                <p className="text-blue-700 text-sm">
                  Spreadsheet format - Open in Excel, Google Sheets, etc.
                </p>
                <p className="text-blue-600 text-xs mt-2">
                  {individuals.length} members • All fields included
                </p>
              </div>
              <span className="text-3xl">📑</span>
            </div>
            <button
              onClick={handleExportCSV}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Download CSV
            </button>
          </div>

          {/* JSON Export */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-200 hover:border-green-400 transition cursor-pointer"
               onClick={handleExportJSON}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-green-900 mb-1">🔗 Export Full Report (JSON)</h3>
                <p className="text-green-700 text-sm">
                  Complete family tree data with statistics and analysis
                </p>
                <p className="text-green-600 text-xs mt-2">
                  Includes gender breakdown, clan statistics, relationships
                </p>
              </div>
              <span className="text-3xl">📋</span>
            </div>
            <button
              onClick={handleExportJSON}
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Download Full Report
            </button>
          </div>

          {/* Summary Export */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-200 hover:border-purple-400 transition cursor-pointer"
               onClick={handleExportSummary}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-purple-900 mb-1">📈 Export Summary</h3>
                <p className="text-purple-700 text-sm">
                  Quick overview with statistics and clan breakdown
                </p>
                <p className="text-purple-600 text-xs mt-2">
                  Total members, gender split, clan distribution
                </p>
              </div>
              <span className="text-3xl">📊</span>
            </div>
            <button
              onClick={handleExportSummary}
              className="mt-4 w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Download Summary
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-heritage-gold/10 border border-heritage-gold/30 rounded-lg p-4 mt-6">
            <p className="text-sm text-gray-700">
              <span className="font-bold">💡 Tip:</span> You can import these files later to backup your data or share with family members.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataExportPanel;
