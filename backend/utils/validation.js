const pool = require('../config/db');

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function validateDateField(value, fieldName) {
    if (value == null || value === '') return null;
    if (!DATE_REGEX.test(value)) {
        return `${fieldName} must be in YYYY-MM-DD format`;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return `${fieldName} is not a valid date`;
    }
    return null;
}

function validateDates(dateOfBirth, dateOfDeath) {
    const errors = [];
    const dobError = validateDateField(dateOfBirth, 'date_of_birth');
    const dodError = validateDateField(dateOfDeath, 'date_of_death');
    if (dobError) errors.push(dobError);
    if (dodError) errors.push(dodError);
    if (!dobError && !dodError && dateOfBirth && dateOfDeath && dateOfDeath < dateOfBirth) {
        errors.push('date_of_death cannot be before date_of_birth');
    }
    return errors;
}

async function validateIndividualIds(userId, { father_id, mother_id, spouse_id, excludeId = null }) {
    const errors = [];
    const ids = [
        { id: father_id, label: 'father_id' },
        { id: mother_id, label: 'mother_id' },
        { id: spouse_id, label: 'spouse_id' }
    ].filter((entry) => entry.id);

    for (const { id, label } of ids) {
        if (excludeId && Number(id) === Number(excludeId)) {
            errors.push(`${label} cannot reference the same individual`);
            continue;
        }
        const [rows] = await pool.execute(
            'SELECT id FROM individuals WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        if (rows.length === 0) {
            errors.push(`${label} does not belong to your family records`);
        }
    }

    return errors;
}

async function isRelated(individualId, candidateId, userId) {
    if (!individualId || !candidateId || Number(individualId) === Number(candidateId)) {
        return false;
    }

    const [rows] = await pool.execute(
        'SELECT id, father_id, mother_id FROM individuals WHERE user_id = ?',
        [userId]
    );

    const byId = new Map(rows.map((row) => [row.id, row]));

    function getAncestors(id, visited = new Set()) {
        if (!id || visited.has(id)) return visited;
        visited.add(id);
        const person = byId.get(id);
        if (!person) return visited;
        getAncestors(person.father_id, visited);
        getAncestors(person.mother_id, visited);
        return visited;
    }

    function getDescendants(id, visited = new Set()) {
        if (!id || visited.has(id)) return visited;
        visited.add(id);
        for (const row of rows) {
            if (row.father_id === id || row.mother_id === id) {
                getDescendants(row.id, visited);
            }
        }
        return visited;
    }

    const a = Number(individualId);
    const b = Number(candidateId);
    const ancestorsA = getAncestors(a);
    const descendantsA = getDescendants(a);

    if (ancestorsA.has(b) || descendantsA.has(b)) return true;

    const ancestorsB = getAncestors(b);
    if (ancestorsB.has(a)) return true;

    return false;
}

async function validateSpouseLink(userId, individualId, spouseId) {
    if (!spouseId) return [];
    if (Number(individualId) === Number(spouseId)) {
        return ['An individual cannot be their own spouse'];
    }
    const related = await isRelated(individualId, spouseId, userId);
    if (related) {
        return ['Spouse cannot be a direct blood relative (parent, child, or ancestor/descendant)'];
    }
    return [];
}

module.exports = {
    validateDateField,
    validateDates,
    validateIndividualIds,
    isRelated,
    validateSpouseLink
};
