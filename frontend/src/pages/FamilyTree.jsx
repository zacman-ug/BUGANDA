import { useState, useRef } from 'react';

import { Link } from 'react-router-dom';

import FamilyCard from '../components/FamilyCard';

import FamilyTreeVisualizer from '../components/FamilyTreeVisualizer';

import GenerationalFamilyTree from '../components/GenerationalFamilyTree';

import LineageViewer from '../components/LineageViewer';

import { useHeritage } from '../context/HeritageContext';



export default function FamilyTree({ fullView = true }) {

  const { individuals, clans } = useHeritage();

  const [viewMode, setViewMode] = useState('generational');

  const [selectedClan, setSelectedClan] = useState(null);

  const [selectedMemberForLineage, setSelectedMemberForLineage] = useState(null);

  const visualizerRef = useRef(null);



  const fallbackClans = [...new Map(

    individuals

      .filter((ind) => ind.clan_name)

      .map((ind) => [ind.clan_id, { id: ind.clan_id, name: ind.clan_name }])

  ).values()];



  const clanOptions = clans.length > 0 ? clans : fallbackClans;

  const filtered = selectedClan

    ? individuals.filter((i) => i.clan_id === selectedClan)

    : individuals;



  if (!fullView) {

    return (

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {individuals.slice(0, 3).map((person) => (

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

    <div className="min-h-screen bg-heritage-cream">

      <header className="bg-heritage-dark text-white p-4 flex flex-wrap justify-between items-center gap-3 print:hidden">

        <h1 className="text-xl font-bold">Visual Lineage Tree</h1>

        <div className="flex flex-wrap gap-4 text-sm">

          <Link to="/" className="text-heritage-gold hover:underline">Home</Link>

          <Link to="/dashboard" className="text-heritage-gold hover:underline">Lineage Home</Link>

          <Link to="/heritage" className="text-heritage-gold">Heritage Experience</Link>

          <Link to="/clans" className="text-heritage-gold">Clans</Link>

          <Link to="/profile" className="text-heritage-gold">Profile</Link>

        </div>

      </header>



      <div className="p-4 max-w-7xl mx-auto family-tree-container">

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 print:hidden">

          <p className="text-gray-600">{filtered.length} members{displayClanLabel(selectedClan, clanOptions)}</p>

          <button

            onClick={() => window.print()}

            className="bg-heritage-gold text-white px-4 py-2 rounded font-semibold"

          >

            Print / Save as PDF

          </button>

        </div>



        <div className="mb-6 print:hidden flex flex-col md:flex-row gap-4 items-stretch md:items-center">

          <div className="flex flex-wrap gap-2">

            {['visualizer', 'generational', 'cards'].map((mode) => (

              <button

                key={mode}

                onClick={() => setViewMode(mode)}

                className={`px-4 py-2 rounded-lg font-semibold transition ${

                  viewMode === mode ? 'bg-heritage-gold text-white' : 'bg-white border text-gray-700'

                }`}

              >

                {mode === 'visualizer' ? 'React Flow' : mode === 'generational' ? 'Generational' : 'Cards'}

              </button>

            ))}

          </div>

          {clanOptions.length > 1 && (

            <select

              value={selectedClan || ''}

              onChange={(e) => setSelectedClan(e.target.value ? parseInt(e.target.value, 10) : null)}

              className="px-4 py-2 rounded-lg border bg-white"

            >

              <option value="">All Clans</option>

              {clanOptions.map((clan) => (

                <option key={clan.id} value={clan.id}>{clan.name}</option>

              ))}

            </select>

          )}

        </div>



        {viewMode === 'visualizer' ? (

          <div ref={visualizerRef} className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: 'min(70vh, 600px)' }}>

            <FamilyTreeVisualizer clanFilter={selectedClan} individuals={filtered} />

          </div>

        ) : viewMode === 'generational' ? (

          <div ref={visualizerRef} className="generational-tree-wrapper">

            <GenerationalFamilyTree individuals={filtered} />

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {filtered.map((person) => (

              <FamilyCard

                key={person.id}

                person={person}

                onViewLineage={setSelectedMemberForLineage}

              />

            ))}

          </div>

        )}



        {selectedMemberForLineage && (

          <LineageViewer

            memberId={selectedMemberForLineage}

            onClose={() => setSelectedMemberForLineage(null)}

          />

        )}

      </div>

    </div>

  );

}



function displayClanLabel(selectedClan, clanOptions) {

  if (!selectedClan) return '';

  const clan = clanOptions.find((c) => c.id === selectedClan);

  return clan ? ` in ${clan.name}` : '';

}

