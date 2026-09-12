const CLAN_PALETTE = [
  '#C4A035', '#2C1810', '#8B6914', '#4A6741', '#6B4226',
  '#1E4D6B', '#7B3F61', '#3D5A80', '#9A6234', '#5C4033'
];

/** Two-letter clan abbreviation for badge display (no emoji). */
export function getTotemIcon(totem, clanName) {
  if (totem?.includes('Royal') || clanName === 'Abalangira') return 'RY';
  const name = clanName || totem || '';
  if (!name) return '?';
  const stripped = name.startsWith('Aba') ? name.slice(3) : name;
  return stripped.slice(0, 2).toUpperCase();
}

export function getClanColor(clanId, clanName) {
  const seed = clanId || (clanName?.charCodeAt(0) ?? 0);
  return CLAN_PALETTE[Math.abs(seed) % CLAN_PALETTE.length];
}

export const LUGANDA = {
  father: 'Kitaawe',
  mother: 'Nnyina',
  clan: 'Omuziro',
  totem: 'Akafaananyo k\'omuziro',
  spouse: 'Balamu',
  children: 'Abaana',
  birth: 'Kuzaalibwa',
  death: 'Okufiira',
  marriage: 'Okwanjula',
  oralHistory: 'Ebyafaayo',
  lineage: 'Obusika',
  generation: 'Olunyiriri',
  outsideFamily: 'Okuva ebweru w\'omu maka'
};

export const LIFE_EVENT_META = {
  birth: { label: 'Kuzaalibwa', color: 'bg-green-100 border-green-400 text-green-800' },
  death: { label: 'Okufiira', color: 'bg-gray-100 border-gray-400 text-gray-800' },
  marriage: { label: 'Okwanjula', color: 'bg-purple-100 border-purple-400 text-purple-800' }
};

export function getLifeEvents(person) {
  const events = [];
  if (person.date_of_birth) events.push({ type: 'birth', date: person.date_of_birth });
  if (person.date_of_death) events.push({ type: 'death', date: person.date_of_death });
  if (person.spouse_id) events.push({ type: 'marriage', date: person.date_of_birth });
  return events;
}

export function buildGenerations(individuals, centerId = null) {
  const byId = new Map(individuals.map((p) => [p.id, p]));
  const rings = [[], [], [], [], []];

  if (centerId && byId.has(centerId)) {
    const center = byId.get(centerId);
    rings[2] = [center];
    if (center.father_id && byId.has(center.father_id)) rings[1].push(byId.get(center.father_id));
    if (center.mother_id && byId.has(center.mother_id)) rings[1].push(byId.get(center.mother_id));
    individuals.filter((p) => p.father_id === center.id || p.mother_id === center.id).forEach((c) => rings[3].push(c));
    return rings.filter((r) => r.length > 0);
  }

  const roots = individuals.filter((p) => !p.father_id && !p.mother_id);
  roots.forEach((r) => rings[0].push(r));
  return rings.filter((r) => r.length > 0);
}
