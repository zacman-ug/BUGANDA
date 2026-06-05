import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import FamilyCard from '../components/FamilyCard';
import FamilyTreeVisualizer from '../components/FamilyTreeVisualizer';
import GenerationalFamilyTree from '../components/GenerationalFamilyTree';
import LineageViewer from '../components/LineageViewer';
import { HeritageContext } from '../context/HeritageContext';

const FamilyTree = ({ fullView, data }) => {
  const { individuals: contextIndividuals } = useContext(HeritageContext);
  const individuals = data || contextIndividuals;
  const [clans, setClans] = useState([]);
  const [viewMode, setViewMode] = useState('visualizer'); // 'visualizer', 'generational', or 'cards'
  const [selectedClan, setSelectedClan] = useState(null);
  const [selectedMemberForLineage, setSelectedMemberForLineage] = useState(null);
  const visualizerRef = useRef(null);

  useEffect(() => {
    const fetchClans = async () => {
      try {
        const response = await axios.get('/api/clans');
        setClans(response.data || []);
      } catch (err) {
        console.error('Could not load clans', err);
      }
    };

    fetchClans();
  }, []);

  const fallbackClans = [...new Map(
    individuals
      .filter(ind => ind.clan_name)
      .map(ind => [ind.clan_id, { id: ind.clan_id, name: ind.clan_name }])
  ).values()];

  const clanOptions = clans.length > 0 ? clans : fallbackClans;

  // Handle Tree View button click with smooth scroll
  const handleTreeViewClick = () => {
    setViewMode('visualizer');
    // Scroll to the visualization area after state update
    setTimeout(() => {
      visualizerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Browser-native print function
  const handlePrint = () => {
    window.print();
  };

  // Print only the generational tree
  const handlePrintGenerational = () => {
    window.print();
  };

  if (!fullView) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {individuals.slice(0, 3).map(person => (
          <FamilyCard 
            key={person.id} 
            person={person}
            onViewLineage={setSelectedMemberForLineage}
          />
        ))}
        {selectedMemberForLineage && (
          <LineageViewer 
            memberId={selectedMemberForLineage}
            onClose={() => setSelectedMemberForLineage(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-4 family-tree-container">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-serif">Visual Lineage Tree</h2>
          <p className="text-sm text-gray-500">
            {viewMode === 'generational' ? 'Generational Family Tree' : 'Organized by generational flow'}
          </p>
        </div>
        {viewMode === 'generational' ? (
          <button 
            onClick={handlePrintGenerational}
            className="bg-heritage-gold text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition shadow-lg font-bold flex items-center gap-2"
          >
            📥 Print / Save as PDF
          </button>
        ) : (
          <button 
            onClick={handlePrint}
            className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition shadow-lg font-bold"
          >
            Print / Save as PDF
          </button>
        )}
      </div>

      {/* View Mode and Clan Selection Controls */}
      <div className="mb-6 print:hidden flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleTreeViewClick}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              viewMode === 'visualizer'
                ? 'bg-heritage-gold text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            🌳 React Flow Tree
          </button>
          <button
            onClick={() => setViewMode('generational')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              viewMode === 'generational'
                ? 'bg-heritage-gold text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            👨‍👩‍👧‍👦 Generational Tree
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              viewMode === 'cards'
                ? 'bg-heritage-gold text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            📋 Card View
          </button>
        </div>

        {clanOptions.length > 1 && (
          <select
            value={selectedClan || ''}
            onChange={(e) => setSelectedClan(e.target.value ? parseInt(e.target.value) : null)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white"
          >
            <option value="">All Clans</option>
            {clanOptions.map(clan => (
              <option key={clan.id} value={clan.id}>
                {clan.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Visualization Area */}
      {viewMode === 'visualizer' ? (
        <div ref={visualizerRef} className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
          <FamilyTreeVisualizer clanFilter={selectedClan} />
        </div>
      ) : viewMode === 'generational' ? (
        <div ref={visualizerRef} className="bg-white rounded-xl shadow-lg overflow-hidden generational-tree-wrapper">
          <GenerationalFamilyTree individuals={selectedClan ? individuals.filter(i => i.clan_id === selectedClan) : individuals} />
        </div>
      ) : (
        <div className="bg-white p-10 rounded-xl shadow-inner border-2 border-heritage-gold">
          <div className="flex flex-col items-center">
            
            {/* Root: Ancestor / Clan Concept */}
            <div className="bg-heritage-dark text-heritage-gold px-8 py-4 rounded-lg shadow-xl mb-12 border-2 border-heritage-gold text-center">
              <h3 className="text-xl font-bold uppercase tracking-widest">Clan Head / Patriarch</h3>
              <p className="text-xs opacity-80">Origin of Lineage</p>
            </div>

            {/* Vertical Connector Line */}
            <div className="w-1 h-12 bg-heritage-gold mb-8"></div>

            {/* Children / Descendants Level */}
            <div className="flex flex-wrap justify-center gap-12 relative">
              {/* Horizontal connecting line for the row */}
              <div className="absolute top-0 left-10 right-10 h-1 bg-gray-200 -translate-y-8 hidden md:block"></div>
              
              {individuals
                .filter(person => !selectedClan || person.clan_id === selectedClan)
                .map(person => (
                  <div key={person.id} className="flex flex-col items-center">
                    {/* Individual vertical connector */}
                    <div className="w-px h-8 bg-gray-200 mb-0 hidden md:block"></div>
                    <FamilyCard 
                      person={person} 
                      onViewLineage={setSelectedMemberForLineage}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Lineage Viewer Modal */}
      {selectedMemberForLineage && (
        <LineageViewer 
          memberId={selectedMemberForLineage}
          onClose={() => setSelectedMemberForLineage(null)}
        />
      )}

      {/* Special Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          nav { display: none !important; }
          main { margin-left: 0 !important; padding: 0 !important; }
          .print\\:hidden { display: none !important; }
          .family-tree-container { margin: 0 !important; padding: 0 !important; background: white !important; }
          
          /* Show only the generational tree wrapper */
          .generational-tree-wrapper { display: block !important; margin: 0 !important; padding: 20mm !important; background: white !important; }
          
          /* Hide all other elements */
          .family-tree-container > div:not(.generational-tree-wrapper) { display: none !important; }
          
          /* Optimize generational tree for printing */
          .generational-tree-header { display: none !important; }
          .generational-tree-info { display: none !important; }
          .generational-tree-svg { max-width: 100% !important; height: auto !important; }
          
          /* Landscape orientation for better tree display */
          @page { size: A3 landscape; margin: 10mm; }
          
          .bg-heritage-cream { background-color: white !important; }
        }
      `}} />
    </div>
  );
};

export default FamilyTree;

