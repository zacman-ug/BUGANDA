import { useHeritage } from '../context/HeritageContext';
import { exportToCSV, exportToJSON, generateFamilyTreeReport } from '../utils/exportUtils';
import { useToast } from './Toast';

const DataExportPanel = ({ onClose }) => {
  const { individuals } = useHeritage();
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
      showToast(`Exported ${individuals.length} members to CSV`, 'success');
    } catch (err) {
      showToast('Failed to export CSV', 'error');
    }
  };

  const handleExportJSON = () => {
    try {
      const report = generateFamilyTreeReport(individuals);
      exportToJSON(report, `buganda_heritage_${new Date().toISOString().split('T')[0]}.json`);
      showToast('Exported family tree report to JSON', 'success');
    } catch (err) {
      showToast('Failed to export JSON', 'error');
    }
  };

  const handleExportSummary = () => {
    try {
      const summary = {
        report: 'Buganda Heritage Summary',
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
      showToast('Exported summary report', 'success');
    } catch (err) {
      showToast('Failed to export summary', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <ToastContainer />
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-heritage-dark to-black text-white p-6 flex justify-between items-center border-b border-heritage-gold/30">
          <div>
            <h2 className="text-2xl font-bold font-serif">Share Your Heritage</h2>
            <p className="text-heritage-gold text-sm mt-1">Download your lineage for family and elders</p>
          </div>
          <button onClick={onClose} className="text-sm hover:text-heritage-gold transition">
            Close
          </button>
        </div>

        <div className="p-8 space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200 hover:border-blue-400 transition">
            <h3 className="font-bold text-lg text-blue-900 mb-1">Export to CSV</h3>
            <p className="text-blue-700 text-sm">Spreadsheet format for Excel, Google Sheets, etc.</p>
            <p className="text-blue-600 text-xs mt-2">{individuals.length} members, all fields included</p>
            <button
              onClick={handleExportCSV}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Download CSV
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-200 hover:border-green-400 transition">
            <h3 className="font-bold text-lg text-green-900 mb-1">Export Full Report (JSON)</h3>
            <p className="text-green-700 text-sm">Complete family tree with statistics and relationships</p>
            <button
              onClick={handleExportJSON}
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Download Full Report
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-200 hover:border-purple-400 transition">
            <h3 className="font-bold text-lg text-purple-900 mb-1">Export Summary</h3>
            <p className="text-purple-700 text-sm">Overview with statistics and clan breakdown</p>
            <button
              onClick={handleExportSummary}
              className="mt-4 w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Download Summary
            </button>
          </div>

          <div className="bg-heritage-gold/10 border border-heritage-gold/30 rounded-lg p-4 mt-6">
            <p className="text-sm text-gray-700">
              You can import these files later to back up your data or share with family members.
            </p>
          </div>

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
