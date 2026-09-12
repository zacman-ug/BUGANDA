import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHeritage } from '../context/HeritageContext';
import TotemPersonNode from '../components/heritage/TotemPersonNode';
import ClanAllianceMap from '../components/heritage/ClanAllianceMap';
import LivingTimeline from '../components/heritage/LivingTimeline';
import PathToRoot from '../components/heritage/PathToRoot';
import HeritageNarrative from '../components/heritage/HeritageNarrative';
import AncestorSpotlight from '../components/heritage/AncestorSpotlight';
import GenerationalRings from '../components/heritage/GenerationalRings';
import ClanStoryPanel from '../components/heritage/ClanStoryPanel';
import GenerationalFamilyTree from '../components/GenerationalFamilyTree';
import FamilyTreeVisualizer from '../components/FamilyTreeVisualizer';

const TABS = [
  { id: 'totem-tree', label: 'Omuziro Tree', desc: 'Totem heritage tree' },
  { id: 'alliances', label: 'Clan Alliances', desc: 'Marriage webs' },
  { id: 'timeline', label: 'Ekiseera', desc: 'Living timeline' },
  { id: 'path', label: 'Path to Root', desc: 'Lineage journey' },
  { id: 'story', label: 'Heritage Story', desc: 'Narrative mode' },
  { id: 'clan', label: 'Clan Heritage', desc: 'Clan story' },
  { id: 'spotlight', label: 'Ancestor Spotlight', desc: 'Featured ancestor' },
  { id: 'rings', label: 'Generations', desc: 'Radial rings' },
  { id: 'flow', label: 'Flow Tree', desc: 'Interactive' }
];

export default function HeritageHub() {
  const { individuals, clans } = useHeritage();
  const [tab, setTab] = useState('totem-tree');
  const [selectedClanId, setSelectedClanId] = useState(null);
  const selectedClan = clans.find((c) => c.id === selectedClanId);
  const clanMembers = selectedClanId
    ? individuals.filter((p) => p.clan_id === selectedClanId).length
    : 0;

  return (
    <div className="min-h-screen bg-heritage-cream">
      <header className="bg-heritage-dark text-white p-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="font-serif text-xl font-bold text-heritage-gold">Obusika — Heritage Experience</h1>
          <p className="text-xs text-gray-400">Living lineage, not a cold archive</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link to="/" className="text-heritage-gold hover:underline">Home</Link>
          <Link to="/dashboard" className="text-heritage-gold hover:underline">Lineage Home</Link>
          <Link to="/clans" className="text-heritage-gold hover:underline">Shared Clans</Link>
          <Link to="/profile" className="text-heritage-gold hover:underline">Profile</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              title={t.desc}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                tab === t.id ? 'bg-heritage-gold text-heritage-dark' : 'bg-white border text-gray-700 hover:border-heritage-gold'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[400px]">
          {tab === 'totem-tree' && (
            <>
              <h2 className="font-serif text-xl font-bold text-heritage-dark mb-4">Totem Heritage Tree</h2>
              {individuals.length === 0 ? (
                <EmptyHeritage />
              ) : (
                <div className="flex flex-wrap justify-center">
                  {individuals.map((p) => (
                    <TotemPersonNode key={p.id} person={p} />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'alliances' && (
            <>
              <h2 className="font-serif text-xl font-bold text-heritage-dark mb-4">Clan Alliance Map</h2>
              <ClanAllianceMap />
            </>
          )}

          {tab === 'timeline' && (
            <>
              <h2 className="font-serif text-xl font-bold text-heritage-dark mb-4">Ekiseera — Living Timeline</h2>
              <LivingTimeline />
            </>
          )}

          {tab === 'path' && (
            <>
              <h2 className="font-serif text-xl font-bold text-heritage-dark mb-4">Path to Root Ancestor</h2>
              <PathToRoot />
            </>
          )}

          {tab === 'story' && (
            <>
              <h2 className="font-serif text-xl font-bold text-heritage-dark mb-4">Heritage Narrative</h2>
              <HeritageNarrative />
            </>
          )}

          {tab === 'clan' && (
            <>
              <h2 className="font-serif text-xl font-bold text-heritage-dark mb-4">Clan Heritage Story</h2>
              <select
                value={selectedClanId || ''}
                onChange={(e) => setSelectedClanId(e.target.value ? Number(e.target.value) : null)}
                className="w-full max-w-md mb-4 p-2 border rounded-lg"
              >
                <option value="">Select a clan...</option>
                {clans.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.totem}</option>
                ))}
              </select>
              <ClanStoryPanel clan={selectedClan} memberCount={clanMembers} />
            </>
          )}

          {tab === 'spotlight' && (
            <>
              <h2 className="font-serif text-xl font-bold text-heritage-dark mb-4">Ancestor Spotlight</h2>
              <AncestorSpotlight />
            </>
          )}

          {tab === 'rings' && (
            <>
              <h2 className="font-serif text-xl font-bold text-heritage-dark mb-4">Generational Rings</h2>
              <GenerationalRings />
            </>
          )}

          {tab === 'flow' && (
            <>
              <h2 className="font-serif text-xl font-bold text-heritage-dark mb-4">Interactive Flow Tree</h2>
              <div style={{ height: 'min(70vh, 600px)' }}>
                <FamilyTreeVisualizer individuals={individuals} embedded />
              </div>
            </>
          )}
        </div>

        {individuals.length > 0 && tab === 'totem-tree' && (
          <div className="mt-6">
            <GenerationalFamilyTree individuals={individuals} />
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyHeritage() {
  return (
    <p className="text-gray-500 text-center py-12">
      Your heritage begins with one ancestor. <Link to="/dashboard" className="text-heritage-gold font-semibold">Add to your lineage →</Link>
    </p>
  );
}
