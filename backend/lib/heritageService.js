function byIdMap(individuals) {
    return new Map(individuals.map((p) => [p.id, p]));
}

function getPerson(individuals, id) {
    return individuals.find((p) => p.id === Number(id)) || null;
}

function getParents(person, map) {
    return {
        father: person.father_id ? map.get(person.father_id) || null : null,
        mother: person.mother_id ? map.get(person.mother_id) || null : null
    };
}

function buildPathToRoot(personId, individuals) {
    const map = byIdMap(individuals);
    const person = map.get(Number(personId));
    if (!person) return null;

    const path = [];
    let current = person;
    const visited = new Set();

    while (current && !visited.has(current.id)) {
        visited.add(current.id);
        path.push({
            id: current.id,
            full_name: current.full_name,
            gender: current.gender,
            clan_name: current.clan_name,
            clan_totem: current.clan_totem,
            is_external: current.is_external,
            date_of_birth: current.date_of_birth,
            photo_url: current.photo_url
        });
        if (current.father_id && map.has(current.father_id)) {
            current = map.get(current.father_id);
        } else if (current.mother_id && map.has(current.mother_id)) {
            current = map.get(current.mother_id);
        } else {
            break;
        }
    }

    return { person, path, root: path[path.length - 1] };
}

function buildNarrative(personId, individuals) {
    const map = byIdMap(individuals);
    const person = map.get(Number(personId));
    if (!person) return null;

    const { father, mother } = getParents(person, map);
    const children = individuals.filter(
        (p) => p.father_id === person.id || p.mother_id === person.id
    );
    const spouse = person.spouse_id ? map.get(person.spouse_id) : null;

    const parts = [];
    parts.push(
        `${person.full_name} belongs to the ${person.clan_name || 'unrecorded'} clan` +
        (person.clan_totem ? ` (omuziro: ${person.clan_totem})` : '') +
        '.'
    );

    if (person.is_external) {
        parts.push('This person is linked from outside the main family lineage.');
    }

    if (father) {
        parts.push(
            `Kitaawe (father) is ${father.full_name}` +
            (father.clan_name && father.clan_name !== person.clan_name
                ? ` of the ${father.clan_name} clan`
                : '') +
            '.'
        );
    }
    if (mother) {
        parts.push(
            `Nnyina (mother) is ${mother.full_name}` +
            (mother.clan_name ? ` of the ${mother.clan_name} clan` : '') +
            (mother.is_external ? ' — from an outside family' : '') +
            '.'
        );
    }

    if (spouse) {
        parts.push(
            `Balamu (spouse) is ${spouse.full_name}` +
            (spouse.clan_name && spouse.clan_name !== person.clan_name
                ? ` — a clan alliance with ${spouse.clan_name}`
                : '') +
            '.'
        );
    }

    if (children.length > 0) {
        const names = children.map((c) => c.full_name).join(', ');
        parts.push(`Abazzukulu (children): ${names}.`);
        if (person.gender === 'Male' && person.clan_name) {
            parts.push(`Children inherit the ${person.clan_name} clan through patrilineal descent.`);
        }
    }

    if (person.bio) {
        parts.push(`Ebyafaayo (oral history): "${person.bio}"`);
    }

    return {
        person_id: person.id,
        full_name: person.full_name,
        narrative: parts.join(' '),
        paragraphs: parts
    };
}

function buildAlliances(individuals) {
    const map = byIdMap(individuals);
    const alliances = [];
    const seen = new Set();

    for (const person of individuals) {
        if (!person.spouse_id) continue;
        const spouse = map.get(person.spouse_id);
        if (!spouse) continue;

        const key = [person.id, spouse.id].sort().join('-');
        if (seen.has(key)) continue;
        seen.add(key);

        if (person.clan_id && spouse.clan_id && person.clan_id !== spouse.clan_id) {
            alliances.push({
                type: 'marriage',
                person_a: { id: person.id, name: person.full_name, clan: person.clan_name, totem: person.clan_totem },
                person_b: { id: spouse.id, name: spouse.full_name, clan: spouse.clan_name, totem: spouse.clan_totem },
                label: `${person.clan_name} ↔ ${spouse.clan_name}`
            });
        }

        if (person.father_id && person.mother_id) {
            const father = map.get(person.father_id);
            const mother = map.get(person.mother_id);
            if (father?.clan_id && mother?.clan_id && father.clan_id !== mother.clan_id) {
                const parentKey = `p-${father.id}-${mother.id}-${person.id}`;
                if (!seen.has(parentKey)) {
                    seen.add(parentKey);
                    alliances.push({
                        type: 'parentage',
                        person_a: { id: father.id, name: father.full_name, clan: father.clan_name, totem: father.clan_totem },
                        person_b: { id: mother.id, name: mother.full_name, clan: mother.clan_name, totem: mother.clan_totem },
                        through_child: person.full_name,
                        label: `${father.clan_name} ↔ ${mother.clan_name} (through ${person.full_name})`
                    });
                }
            }
        }
    }

    return alliances;
}

function buildTimeline(individuals, marriages = []) {
    const events = [];

    for (const p of individuals) {
        if (p.date_of_birth) {
            events.push({
                date: p.date_of_birth,
                type: 'birth',
                title: `Birth of ${p.full_name}`,
                person_id: p.id,
                clan: p.clan_name
            });
        }
        if (p.date_of_death) {
            events.push({
                date: p.date_of_death,
                type: 'death',
                title: `Remembrance of ${p.full_name}`,
                person_id: p.id,
                clan: p.clan_name
            });
        }
    }

    for (const m of marriages) {
        if (m.marriage_date) {
            events.push({
                date: m.marriage_date,
                type: 'marriage',
                title: `Okwanjula: ${m.husband_name || 'Unknown'} & ${m.wife_name || 'Unknown'}`,
                marriage_id: m.id,
                location: m.location
            });
        }
    }

    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    return events;
}

function computeCompleteness(individuals) {
    if (individuals.length === 0) {
        return {
            score: 0,
            total: 0,
            metrics: {},
            message: 'Begin your heritage by adding your first ancestor.'
        };
    }

    const withParents = individuals.filter((p) => p.father_id || p.mother_id).length;
    const withBio = individuals.filter((p) => p.bio).length;
    const withClan = individuals.filter((p) => p.clan_id).length;
    const withDates = individuals.filter((p) => p.date_of_birth).length;
    const withPhoto = individuals.filter((p) => p.photo_url).length;
    const roots = individuals.filter((p) => !p.father_id && !p.mother_id);
    const generations = new Set();
    const map = byIdMap(individuals);

    function depth(id, d = 0, visited = new Set()) {
        if (!id || visited.has(id)) return d;
        visited.add(id);
        const p = map.get(id);
        if (!p) return d;
        let max = d;
        if (p.father_id) max = Math.max(max, depth(p.father_id, d + 1, visited));
        if (p.mother_id) max = Math.max(max, depth(p.mother_id, d + 1, visited));
        return max;
    }

    individuals.forEach((p) => generations.add(depth(p.id)));

    const clans = new Set(individuals.filter((p) => p.clan_name).map((p) => p.clan_name));

    const metrics = {
        lives_connected: individuals.length,
        generations_documented: generations.size,
        ancestors_with_stories: withBio,
        parents_linked: Math.round((withParents / individuals.length) * 100),
        clans_represented: clans.size,
        omuziro_recorded: Math.round((withClan / individuals.length) * 100),
        life_dates_preserved: Math.round((withDates / individuals.length) * 100),
        memories_with_photos: withPhoto,
        root_ancestors: roots.length
    };

    const score = Math.round(
        (Math.min(individuals.length / 10, 1) * 20) +
        (Math.min(generations.size / 4, 1) * 20) +
        ((withParents / individuals.length) * 20) +
        ((withClan / individuals.length) * 15) +
        ((withBio / individuals.length) * 15) +
        ((withDates / individuals.length) * 10)
    );

    return {
        score: Math.min(score, 100),
        metrics,
        message: score >= 80
            ? 'Your heritage is richly preserved for future generations.'
            : score >= 50
                ? 'Good progress — keep adding stories and connections.'
                : 'Your heritage journey has begun — link parents and add omuziro.'
    };
}

function findSpotlightAncestor(individuals) {
    if (individuals.length === 0) return null;

    const descendantCounts = new Map();
    for (const p of individuals) {
        if (p.father_id) descendantCounts.set(p.father_id, (descendantCounts.get(p.father_id) || 0) + 1);
        if (p.mother_id) descendantCounts.set(p.mother_id, (descendantCounts.get(p.mother_id) || 0) + 1);
    }

    const roots = individuals.filter((p) => !p.father_id && !p.mother_id);
    let candidate = roots[0] || individuals[0];
    let maxDesc = descendantCounts.get(candidate.id) || 0;

    for (const p of individuals) {
        const count = descendantCounts.get(p.id) || 0;
        if (count > maxDesc) {
            maxDesc = count;
            candidate = p;
        }
    }

    const narrative = buildNarrative(candidate.id, individuals);
    return {
        ancestor: candidate,
        descendant_count: maxDesc,
        narrative: narrative?.narrative
    };
}

module.exports = {
    buildPathToRoot,
    buildNarrative,
    buildAlliances,
    buildTimeline,
    computeCompleteness,
    findSpotlightAncestor
};
