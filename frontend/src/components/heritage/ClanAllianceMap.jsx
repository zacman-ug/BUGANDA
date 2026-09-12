import { useEffect, useState } from 'react';
import { useHeritage } from '../../context/HeritageContext';
import { getTotemIcon } from '../../utils/heritageUtils';

export default function ClanAllianceMap() {
  const { api } = useHeritage();
  const [alliances, setAlliances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/heritage/alliances')
      .then(({ data }) => setAlliances(data.alliances || []))
      .finally(() => setLoading(false));
  }, [api]);

  if (loading) return <p className="text-gray-500 p-8 text-center">Loading clan alliances...</p>;
  if (alliances.length === 0) {
    return (
      <p className="text-gray-500 p-8 text-center">
        No cross-clan alliances yet. Link spouses or parents from different clans to see marriage webs.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Buganda heritage flows through blood (omuziro) and marriage alliances between clans.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alliances.map((a, i) => (
          <div key={i} className="bg-white border-2 border-heritage-gold/30 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-heritage-gold mb-2">
              {a.type === 'marriage' ? 'Okwanjula (Marriage)' : 'Parentage alliance'}
            </p>
            <div className="flex items-center justify-between gap-2">
              <ClanBubble person={a.person_a} />
              <span className="text-sm text-heritage-gold font-bold">and</span>
              <ClanBubble person={a.person_b} />
            </div>
            <p className="text-sm text-gray-600 mt-3 text-center">{a.label}</p>
            {a.through_child && (
              <p className="text-xs text-center text-gray-500 mt-1">Through {a.through_child}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ClanBubble({ person }) {
  return (
    <div className="flex-1 text-center p-2 bg-heritage-cream rounded-lg">
      <div className="w-10 h-10 mx-auto rounded-full bg-white border border-heritage-gold/40 flex items-center justify-center text-xs font-bold text-heritage-dark">
        {getTotemIcon(person.totem, person.clan)}
      </div>
      <p className="font-semibold text-sm text-heritage-dark">{person.name}</p>
      <p className="text-xs text-heritage-gold">{person.clan}</p>
    </div>
  );
}
