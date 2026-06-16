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

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportGenerationalJPEG = async () => {
    const treeWrapper = visualizerRef.current;
    const svg = treeWrapper?.querySelector('svg.generational-tree-svg');

    if (!svg) {
      return;
    }

    const clonedSvg = svg.cloneNode(true);
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    const svgString = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const width = Number(svg.getAttribute('width')) || svg.getBoundingClientRect().width || 1400;
      const height = Number(svg.getAttribute('height')) || svg.getBoundingClientRect().height || 1000;
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;

      const context = canvas.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(svgUrl);
        return;
      }

      context.scale(scale, scale);
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          downloadFile(blob, `generational_family_tree_${new Date().toISOString().split('T')[0]}.jpeg`);
        }
        URL.revokeObjectURL(svgUrl);
      }, 'image/jpeg', 0.95);
    };

    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
    };

    image.src = svgUrl;
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
    <div className="p-3 sm:p-4 family-tree-container w-full">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-serif">Visual Lineage Tree</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            {viewMode === 'generational' ? 'Generational Family Tree' : 'Organized by generational flow'}
          </p>
        </div>
        {viewMode === 'generational' ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full lg:w-auto">
            <button 
              onClick={handlePrintGenerational}
              className="w-full sm:w-auto bg-heritage-gold text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-yellow-600 transition shadow-lg font-bold flex items-center justify-center gap-2"
            >
              📥 Save as PDF
            </button>
            <button 
              onClick={handleExportGenerationalJPEG}
              className="w-full sm:w-auto bg-gray-800 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-black transition shadow-lg font-bold flex items-center justify-center gap-2"
            >
              🖼 Download JPEG
            </button>
          </div>
        ) : (
          <button 
            onClick={handlePrint}
            className="w-full sm:w-auto bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-800 transition shadow-lg font-bold"
          >
            Print / Save as PDF
          </button>
        )}
      </div>

      {/* View Mode and Clan Selection Controls */}
      <div className="mb-6 print:hidden flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="flex flex-col sm:flex-row gap-2 flex-wrap w-full">
          <button
            onClick={handleTreeViewClick}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-bold transition ${
              viewMode === 'visualizer'
                ? 'bg-heritage-gold text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            🌳 React Flow Tree
          </button>
          <button
            onClick={() => setViewMode('generational')}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-bold transition ${
              viewMode === 'generational'
                ? 'bg-heritage-gold text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            👨‍👩‍👧‍👦 Generational Tree
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-bold transition ${
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
            className="w-full md:w-auto px-4 py-2 rounded-lg border border-gray-300 bg-white"
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
        <div ref={visualizerRef} className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: 'min(70vh, 600px)' }}>
          <FamilyTreeVisualizer clanFilter={selectedClan} individuals={selectedClan ? individuals.filter(i => i.clan_id === selectedClan) : individuals} />
        </div>
      ) : viewMode === 'generational' ? (
        <div ref={visualizerRef} className="bg-white rounded-xl shadow-lg overflow-hidden generational-tree-wrapper max-h-[75vh] overflow-auto">
          <GenerationalFamilyTree individuals={selectedClan ? individuals.filter(i => i.clan_id === selectedClan) : individuals} />
        </div>
      ) : (
        <div className="bg-white p-4 sm:p-6 lg:p-10 rounded-xl shadow-inner border-2 border-heritage-gold overflow-hidden">
          <div className="flex flex-col items-center">
            
            {/* Root: Ancestor / Clan Concept */}
            <div className="bg-heritage-dark text-heritage-gold px-6 sm:px-8 py-4 rounded-lg shadow-xl mb-10 sm:mb-12 border-2 border-heritage-gold text-center max-w-full">
              <h3 className="text-lg sm:text-xl font-bold uppercase tracking-widest">Clan Head / Patriarch</h3>
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

