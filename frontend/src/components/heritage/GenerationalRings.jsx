import { useState } from 'react';
import { useHeritage } from '../../context/HeritageContext';
import TotemPersonNode from './TotemPersonNode';
import { LUGANDA } from '../../utils/heritageUtils';

export default function GenerationalRings() {
  const { individuals } = useHeritage();
  const [centerId, setCenterId] = useState(individuals[0]?.id);

  if (individuals.length === 0) {
    return <p className="text-gray-500 p-8 text-center">Add family members to see generational rings.</p>;
  }

  const center = individuals.find((p) => p.id === centerId) || individuals[0];
  const parents = individuals.filter((p) => p.id === center.father_id || p.id === center.mother_id);
  const grandparents = individuals.filter((p) =>
    parents.some((par) => p.id === par.father_id || p.id === par.mother_id)
  );
  const children = individuals.filter((p) => p.father_id === center.id || p.mother_id === center.id);

  const rings = [
    { label: 'Grandparents', people: grandparents },
    { label: `${LUGANDA.father} / ${LUGANDA.mother}`, people: parents },
    { label: 'You / Selected', people: [center], highlight: true },
    { label: LUGANDA.children, people: children }
  ].filter((r) => r.people.length > 0);

  return (
    <div>
      <label className="block mb-6">
        <span className="text-sm font-semibold">Center the rings on</span>
        <select
          value={center.id}
          onChange={(e) => setCenterId(Number(e.target.value))}
          className="w-full mt-1 p-2 border rounded-lg"
        >
          {individuals.map((p) => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
        </select>
      </label>
      <div className="flex flex-col items-center gap-8">
        {rings.map((ring, i) => (
          <div
            key={i}
            className={`w-full max-w-2xl rounded-full border-2 py-6 px-4 flex flex-wrap justify-center gap-2 ${
              ring.highlight ? 'border-heritage-gold bg-heritage-gold/10' : 'border-gray-200 bg-white'
            }`}
          >
            <p className="w-full text-center text-xs uppercase text-gray-500 mb-2">{ring.label}</p>
            {ring.people.map((p) => (
              <TotemPersonNode key={p.id} person={p} compact />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
