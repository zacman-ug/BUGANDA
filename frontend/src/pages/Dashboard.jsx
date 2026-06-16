import React, { useState, useContext, useEffect } from 'react';
import Layout from '../components/Layout';
import FamilyTree from './FamilyTree';
import AddMemberForm from '../components/AddMemberForm';
import HeritageStats from '../components/HeritageStats';
import SearchFilterBar from '../components/SearchFilterBar';
import AdvancedSearch from '../components/AdvancedSearch';
import DataExportPanel from '../components/DataExportPanel';
import MemberDetailsPanel from '../components/MemberDetailsPanel';
import { HeritageContext } from '../context/HeritageContext';
import { useSearchParams } from 'react-router-dom';

/**
 * Dashboard Component
 * Main dashboard with navigation and features
 */
const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState(() => searchParams.get('view') === 'add' ? 'add' : 'tree');
  const { individuals, canCreateRecord } = useContext(HeritageContext);
  const [filteredIndividuals, setFilteredIndividuals] = useState(individuals);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const familyTreeSectionRef = React.useRef(null);

  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'add' || viewParam === 'tree') {
      setView(viewParam);
    }
  }, [searchParams]);

  const handleAdvancedSearch = (results) => {
    setFilteredIndividuals(results);
  };

  const handleFamilyTreeClick = () => {
    setView('tree');
    window.requestAnimationFrame(() => {
      familyTreeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <Layout setView={setView} currentView={view} onFamilyTreeClick={handleFamilyTreeClick}>
      {selectedMember && (
        <MemberDetailsPanel
          member={selectedMember}
          individuals={individuals}
          onClose={() => setSelectedMember(null)}
          onEdit={() => {
            // TODO: Implement edit functionality
            setSelectedMember(null);
          }}
        />
      )}

      {showExportPanel && (
        <DataExportPanel onClose={() => setShowExportPanel(false)} />
      )}

      <div className="mb-12 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-10 -right-20 w-60 h-60 bg-heritage-gold opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-5 -left-32 w-80 h-80 bg-heritage-gold opacity-5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:justify-between xl:items-center gap-6 bg-gradient-to-br from-heritage-dark via-gray-900 to-black text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-heritage-lg border-2 border-heritage-gold/20 hover:border-heritage-gold/40 transition-all duration-300">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <span className="text-4xl sm:text-5xl">👑</span>
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-heritage-gold to-yellow-300">Buganda Archives</h1>
            </div>
            <p className="text-gray-300 text-base sm:text-lg font-serif italic sm:pl-14 lg:pl-20">"Where every ancestor's story becomes immortal..."</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto xl:ml-8">
            <button
              onClick={() => setShowExportPanel(true)}
              className="relative overflow-hidden w-full sm:w-auto bg-gradient-to-r from-green-500 via-emerald-400 to-green-600 text-white px-5 py-3 rounded-2xl font-bold shadow-heritage-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 sm:whitespace-nowrap group before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-white before:translate-y-full hover:before:translate-y-0 before:transition-transform before:duration-300"
            >
              <span className="relative z-10 group-hover:text-green-600 transition-colors duration-300">📥 Export</span>
            </button>
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="relative overflow-hidden w-full sm:w-auto bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-white px-5 py-3 rounded-2xl font-bold shadow-heritage-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 sm:whitespace-nowrap group before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-white before:translate-y-full hover:before:translate-y-0 before:transition-transform before:duration-300"
            >
              <span className="relative z-10 group-hover:text-blue-600 transition-colors duration-300">🔍 Search</span>
            </button>
            <button
              onClick={() => setView(view === 'tree' ? 'add' : 'tree')}
              className="relative overflow-hidden w-full sm:w-auto bg-gradient-to-r from-heritage-gold via-yellow-400 to-heritage-bronze text-heritage-dark px-8 py-3 rounded-2xl font-bold text-base sm:text-lg shadow-heritage-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 sm:whitespace-nowrap group before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-r before:from-heritage-dark before:to-black before:translate-y-full hover:before:translate-y-0 before:transition-transform before:duration-300"
            >
              <span className="relative z-10 group-hover:text-heritage-gold transition-colors duration-300 flex items-center gap-2">
                {view === 'tree' ? '✚' : '←'}
                {view === 'tree' ? 'Add Member' : 'Back'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {view === 'tree' ? (
        <div className="space-y-8 sm:space-y-10 animate-in fade-in duration-500">
          {/* Advanced Search */}
          {showAdvancedSearch && (
            <div className="animate-in slide-in-from-top-4 duration-300">
              <AdvancedSearch onResults={handleAdvancedSearch} />
            </div>
          )}

          {/* Stats */}
          <HeritageStats data={filteredIndividuals} />

          {/* Quick Filter Bar */}
          <SearchFilterBar data={individuals} onFilteredDataChange={setFilteredIndividuals} />

          {/* Family Tree */}
          <div ref={familyTreeSectionRef} onClick={(e) => {
            // If clicked on a member node, show details
            if (e.target.closest('[data-member-id]')) {
              const memberId = e.target.closest('[data-member-id]').getAttribute('data-member-id');
              const member = individuals.find(p => p.id === parseInt(memberId));
              if (member) setSelectedMember(member);
            }
          }}>
            <FamilyTree fullView={true} data={filteredIndividuals} />
          </div>
        </div>
      ) : canCreateRecord() ? (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <AddMemberForm />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-red-200">
          <h2 className="text-2xl font-bold text-red-700 mb-3">Access restricted</h2>
          <p className="text-gray-700">
            Your role does not allow adding records.
          </p>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
