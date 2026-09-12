const pool = require('../config/db');
const {
    validateDates,
    validateIndividualIds,
    validateSpouseLink
} = require('../utils/validation');

const INDIVIDUAL_FIELDS = [
    'full_name', 'gender', 'clan_id', 'father_id', 'mother_id', 'bio',
    'date_of_birth', 'date_of_death', 'spouse_id', 'occupation', 'residence', 'alternative_name'
];

function normalizePayload(data) {
    const normalized = {};
    for (const field of INDIVIDUAL_FIELDS) {
        if (data[field] !== undefined) {
            normalized[field] = data[field] === '' ? null : data[field];
        }
    }
    return normalized;
}

async function resolveClanId(userId, clanId, fatherId) {
    if (clanId) return clanId;
    if (!fatherId) return null;
    const [father] = await pool.execute(
        'SELECT clan_id FROM individuals WHERE id = ? AND user_id = ?',
        [fatherId, userId]
    );
    return father.length > 0 ? father[0].clan_id : null;
}

async function linkSpouses(userId, individualId, spouseId, previousSpouseId = null) {
    if (previousSpouseId && Number(previousSpouseId) !== Number(spouseId)) {
        await pool.execute(
            'UPDATE individuals SET spouse_id = NULL WHERE id = ? AND user_id = ? AND spouse_id = ?',
            [previousSpouseId, userId, individualId]
        );
    }

    if (!spouseId) return;

    await pool.execute(
        'UPDATE individuals SET spouse_id = ? WHERE id = ? AND user_id = ?',
        [individualId, spouseId, userId]
    );
    await pool.execute(
        'UPDATE individuals SET spouse_id = ? WHERE id = ? AND user_id = ?',
        [spouseId, individualId, userId]
    );
}

async function validateIndividualData(userId, data, { excludeId = null } = {}) {
    const errors = [];

    if (!data.full_name || !data.gender) {
        errors.push('Full name and gender are required');
    }

    errors.push(...validateDates(data.date_of_birth, data.date_of_death));
    errors.push(...await validateIndividualIds(userId, {
        father_id: data.father_id,
        mother_id: data.mother_id,
        spouse_id: data.spouse_id,
        excludeId
    }));

    if (data.spouse_id) {
        if (data.father_id && Number(data.spouse_id) === Number(data.father_id)) {
            errors.push('Spouse cannot be the father');
        }
        if (data.mother_id && Number(data.spouse_id) === Number(data.mother_id)) {
            errors.push('Spouse cannot be the mother');
        }
        if (excludeId) {
            errors.push(...await validateSpouseLink(userId, excludeId, data.spouse_id));
        } else {
            const { isRelated } = require('../utils/validation');
            if (data.father_id && await isRelated(data.father_id, data.spouse_id, userId)) {
                errors.push('Spouse cannot be a blood relative in the father\'s line');
            }
            if (data.mother_id && await isRelated(data.mother_id, data.spouse_id, userId)) {
                errors.push('Spouse cannot be a blood relative in the mother\'s line');
            }
        }
    }

    return errors;
}

async function getById(userId, id) {
    const [rows] = await pool.execute(
        `SELECT i.*, c.name AS clan_name
         FROM individuals i
         LEFT JOIN clans c ON i.clan_id = c.id
         WHERE i.id = ? AND i.user_id = ?`,
        [id, userId]
    );
    return rows[0] || null;
}

async function getAllByUser(userId) {
    const [rows] = await pool.execute(
        `SELECT i.*, c.name AS clan_name
         FROM individuals i
         LEFT JOIN clans c ON i.clan_id = c.id
         WHERE i.user_id = ?
         ORDER BY i.full_name ASC`,
        [userId]
    );
    return rows;
}

async function create(userId, data) {
    const payload = normalizePayload(data);
    const errors = await validateIndividualData(userId, payload);
    if (errors.length > 0) {
        const err = new Error(errors.join('; '));
        err.status = 400;
        throw err;
    }

    payload.clan_id = await resolveClanId(userId, payload.clan_id, payload.father_id);

    const sql = `INSERT INTO individuals (
        full_name, gender, clan_id, father_id, mother_id, bio,
        date_of_birth, date_of_death, spouse_id, occupation, residence, alternative_name, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await pool.execute(sql, [
        payload.full_name,
        payload.gender,
        payload.clan_id || null,
        payload.father_id || null,
        payload.mother_id || null,
        payload.bio || null,
        payload.date_of_birth || null,
        payload.date_of_death || null,
        payload.spouse_id || null,
        payload.occupation || null,
        payload.residence || null,
        payload.alternative_name || null,
        userId
    ]);

    if (payload.spouse_id) {
        await linkSpouses(userId, result.insertId, payload.spouse_id);
    }

    return getById(userId, result.insertId);
}

async function update(userId, id, data) {
    const existing = await getById(userId, id);
    if (!existing) {
        const err = new Error('Individual not found');
        err.status = 404;
        throw err;
    }

    const payload = normalizePayload({ ...existing, ...data });
    const errors = await validateIndividualData(userId, payload, { excludeId: id });
    if (errors.length > 0) {
        const err = new Error(errors.join('; '));
        err.status = 400;
        throw err;
    }

    payload.clan_id = await resolveClanId(userId, payload.clan_id, payload.father_id);

    const sql = `UPDATE individuals SET
        full_name = ?, gender = ?, clan_id = ?, father_id = ?, mother_id = ?, bio = ?,
        date_of_birth = ?, date_of_death = ?, spouse_id = ?, occupation = ?, residence = ?, alternative_name = ?
        WHERE id = ? AND user_id = ?`;

    await pool.execute(sql, [
        payload.full_name,
        payload.gender,
        payload.clan_id || null,
        payload.father_id || null,
        payload.mother_id || null,
        payload.bio || null,
        payload.date_of_birth || null,
        payload.date_of_death || null,
        payload.spouse_id || null,
        payload.occupation || null,
        payload.residence || null,
        payload.alternative_name || null,
        id,
        userId
    ]);

    await linkSpouses(userId, id, payload.spouse_id, existing.spouse_id);

    return getById(userId, id);
}

async function remove(userId, id) {
    const existing = await getById(userId, id);
    if (!existing) {
        const err = new Error('Individual not found');
        err.status = 404;
        throw err;
    }

    if (existing.spouse_id) {
        await pool.execute(
            'UPDATE individuals SET spouse_id = NULL WHERE id = ? AND user_id = ?',
            [existing.spouse_id, userId]
        );
    }

    const [result] = await pool.execute(
        'DELETE FROM individuals WHERE id = ? AND user_id = ?',
        [id, userId]
    );

    if (result.affectedRows === 0) {
        const err = new Error('Individual not found');
        err.status = 404;
        throw err;
    }

    return { message: 'Individual deleted successfully' };
}

module.exports = {
    create,
    update,
    remove,
    getById,
    getAllByUser
};
