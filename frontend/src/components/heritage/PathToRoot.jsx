import { useEffect, useState } from 'react';
import { useHeritage } from '../../context/HeritageContext';
import TotemPersonNode from './TotemPersonNode';
import { LUGANDA } from '../../utils/heritageUtils';

export default function PathToRoot({ personId }) {
  const { api, individuals } = useHeritage();
  const [pathData, setPathData] = useState(null);
  const [selectedId, setSelectedId] = useState(personId || individuals[0]?.id);

  useEffect(() => {
    if (!selectedId) return;
    api.get(`/api/heritage/path/${selectedId}`).then(({ data }) => setPathData(data));
  }, [api, selectedId]);

  return (
    <div>
      <label className="block mb-4">
        <span className="text-sm font-semibold text-gray-700">Start from</span>
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

      {!pathData ? (
        <p className="text-gray-500">Select a person to trace {LUGANDA.lineage} to the root ancestor.</p>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-4">
            {pathData.path.length} generations from <strong>{pathData.person.full_name}</strong> to root <strong>{pathData.root.full_name}</strong>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {pathData.path.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <TotemPersonNode person={step} compact />
                {i < pathData.path.length - 1 && (
                  <span className="text-heritage-gold text-2xl mx-1">→</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
