import { useEffect, useState } from 'react';
import { useHeritage } from '../../context/HeritageContext';

export default function HeritageNarrative({ personId }) {
  const { api, individuals } = useHeritage();
  const [narrative, setNarrative] = useState(null);
  const [selectedId, setSelectedId] = useState(personId || individuals[0]?.id);

  useEffect(() => {
    if (!selectedId) return;
    api.get(`/api/heritage/narrative/${selectedId}`).then(({ data }) => setNarrative(data));
  }, [api, selectedId]);

  const handleCopy = () => {
    if (narrative?.narrative) {
      navigator.clipboard.writeText(narrative.narrative);
    }
  };

  return (
    <div>
      <label className="block mb-4">
        <span className="text-sm font-semibold text-gray-700">Heritage story for</span>
        <select
          value={selectedId || ''}
          onChange={(e) => setSelectedId(Number(e.target.value))}
          className="w-full mt-1 p-2 border rounded-lg"
        >
          {individuals.map((p) => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
        </select>
      </label>

      {narrative ? (
        <div className="bg-heritage-cream border-2 border-heritage-gold/30 rounded-xl p-6 font-serif">
          <h3 className="text-xl font-bold text-heritage-dark mb-4">{narrative.full_name}&apos;s Heritage</h3>
          {narrative.paragraphs.map((p, i) => (
            <p key={i} className="text-gray-800 leading-relaxed mb-3">{p}</p>
          ))}
          <button
            onClick={handleCopy}
            className="mt-4 text-sm bg-heritage-gold text-heritage-dark px-4 py-2 rounded font-semibold"
          >
            Copy heritage story
          </button>
        </div>
      ) : (
        <p className="text-gray-500">Select a family member to generate their heritage narrative.</p>
      )}
    </div>
  );
}
