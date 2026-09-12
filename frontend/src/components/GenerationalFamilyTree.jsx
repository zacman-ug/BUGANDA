import { useMemo } from 'react';

function buildGenerations(individuals) {
  const byId = new Map(individuals.map((p) => [p.id, p]));
  const generations = [];
  const assigned = new Set();

  const roots = individuals.filter((p) => !p.father_id || !byId.has(p.father_id));

  function assignGeneration(person, gen) {
    if (!person || assigned.has(person.id)) return;
    assigned.add(person.id);
    if (!generations[gen]) generations[gen] = [];
    generations[gen].push(person);

    const children = individuals.filter((p) => p.father_id === person.id || p.mother_id === person.id);
    children.forEach((child) => assignGeneration(child, gen + 1));
  }

  roots.forEach((root) => assignGeneration(root, 0));

  individuals.forEach((p) => {
    if (!assigned.has(p.id)) {
      if (!generations[0]) generations[0] = [];
      generations[0].push(p);
    }
  });

  return generations;
}

function TreeNode({ person }) {
  return (
    <div
      data-member-id={person.id}
      className="inline-block bg-white border-2 border-heritage-gold rounded-lg p-3 m-2 min-w-[140px] text-center cursor-pointer hover:shadow-lg transition-shadow"
    >
      <p className="font-bold text-heritage-dark text-sm">{person.full_name}</p>
      <p className="text-xs text-gray-500">{person.gender}</p>
      {person.clan_name && <p className="text-xs text-heritage-gold">{person.clan_name}</p>}
      {person.date_of_birth && (
        <p className="text-xs text-gray-400">{person.date_of_birth.split('T')[0]}</p>
      )}
    </div>
  );
}

export default function GenerationalFamilyTree({ individuals }) {
  const generations = useMemo(() => buildGenerations(individuals), [individuals]);

  if (individuals.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
      <h3 className="text-lg font-bold text-heritage-dark mb-4">Family Tree</h3>
      {generations.map((gen, idx) => (
        <div key={idx} className="mb-6">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Generation {idx + 1}</p>
          <div className="flex flex-wrap justify-center">
            {gen.map((person) => (
              <TreeNode key={person.id} person={person} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
