const prisma = require('../lib/prisma');
const marriageModel = require('./marriageModel');

const {

    validateDates,

    validateIndividualIds,

    validateSpouseLink

} = require('../utils/validation');



const INDIVIDUAL_FIELDS = [

    'full_name', 'gender', 'clan_id', 'father_id', 'mother_id', 'bio',

    'date_of_birth', 'date_of_death', 'spouse_id', 'occupation', 'residence',

    'alternative_name', 'photo_url', 'is_external'

];



const PARENT_INLINE_FIELDS = ['full_name', 'clan_id', 'bio', 'is_external'];



function formatIndividual(individual) {

    if (!individual) return null;

    const { clan, ...rest } = individual;

    return {

        ...rest,

        clan_name: clan?.name || null,

        clan_totem: clan?.totem || null

    };

}



function normalizePayload(data) {

    const normalized = {};

    for (const field of INDIVIDUAL_FIELDS) {

        if (data[field] !== undefined) {

            normalized[field] = data[field] === '' ? null : data[field];

        }

    }

    if (normalized.clan_id) normalized.clan_id = Number(normalized.clan_id);

    if (normalized.father_id) normalized.father_id = Number(normalized.father_id);

    if (normalized.mother_id) normalized.mother_id = Number(normalized.mother_id);

    if (normalized.spouse_id) normalized.spouse_id = Number(normalized.spouse_id);

    if (normalized.is_external !== undefined) {

        normalized.is_external = Boolean(normalized.is_external);

    }

    return normalized;

}



function normalizeInlineParent(data, gender) {

    if (!data || !data.full_name) return null;

    return {

        full_name: data.full_name.trim(),

        gender,

        clan_id: data.clan_id ? Number(data.clan_id) : null,

        bio: data.bio || null,

        is_external: Boolean(data.is_external)

    };

}



async function resolveClanId(userId, clanId, fatherId) {

    if (clanId) return clanId;

    if (!fatherId) return null;

    const father = await prisma.individual.findFirst({

        where: { id: Number(fatherId), user_id: userId },

        select: { clan_id: true }

    });

    return father?.clan_id || null;

}



async function linkSpouses(userId, individualId, spouseId, previousSpouseId = null) {

    if (previousSpouseId && Number(previousSpouseId) !== Number(spouseId)) {

        await prisma.individual.updateMany({

            where: {

                id: Number(previousSpouseId),

                user_id: userId,

                spouse_id: Number(individualId)

            },

            data: { spouse_id: null }

        });

    }



    if (!spouseId) return;



    await prisma.individual.updateMany({

        where: { id: Number(individualId), user_id: userId },

        data: { spouse_id: Number(spouseId) }

    });

    await prisma.individual.updateMany({

        where: { id: Number(spouseId), user_id: userId },

        data: { spouse_id: Number(individualId) }

    });

    await marriageModel.upsertForSpouses(userId, individualId, spouseId);

}



async function validateIndividualData(userId, data, { excludeId = null } = {}) {

    const errors = [];



    if (!data.full_name || !data.gender) {

        errors.push('Full name and gender are required');

    }

    if (data.gender && !['Male', 'Female'].includes(data.gender)) {

        errors.push('Gender must be Male or Female');

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



function validateInlineParent(parent, label) {

    const errors = [];

    if (!parent) return errors;

    if (!parent.full_name) {

        errors.push(`${label} name is required when adding a new parent`);

    }

    return errors;

}



async function createInlineParent(userId, parent, gender) {

    const created = await prisma.individual.create({

        data: {

            full_name: parent.full_name,

            gender,

            clan_id: parent.clan_id,

            bio: parent.bio,

            is_external: parent.is_external,

            user_id: userId

        }

    });

    return created.id;

}



async function resolveParents(userId, data) {

    const payload = { ...data };

    const inlineFather = normalizeInlineParent(data.new_father, 'Male');

    const inlineMother = normalizeInlineParent(data.new_mother, 'Female');



    const inlineErrors = [

        ...validateInlineParent(inlineFather, 'Father'),

        ...validateInlineParent(inlineMother, 'Mother')

    ];

    if (inlineErrors.length > 0) {

        const err = new Error(inlineErrors.join('; '));

        err.status = 400;

        throw err;

    }



    if (inlineFather) {

        if (payload.father_id) {

            const err = new Error('Provide either father_id or new_father, not both');

            err.status = 400;

            throw err;

        }

        payload.father_id = await createInlineParent(userId, inlineFather, 'Male');

    }



    if (inlineMother) {

        if (payload.mother_id) {

            const err = new Error('Provide either mother_id or new_mother, not both');

            err.status = 400;

            throw err;

        }

        payload.mother_id = await createInlineParent(userId, inlineMother, 'Female');

    }



    return payload;

}



async function getById(userId, id) {

    const individual = await prisma.individual.findFirst({

        where: { id: Number(id), user_id: userId },

        include: { clan: true }

    });

    return formatIndividual(individual);

}



async function getAllByUser(userId) {

    const individuals = await prisma.individual.findMany({

        where: { user_id: userId },

        include: { clan: true },

        orderBy: { full_name: 'asc' }

    });

    return individuals.map(formatIndividual);

}



async function create(userId, data) {

    let payload = normalizePayload(data);

    payload = await resolveParents(userId, { ...data, ...payload });



    const errors = await validateIndividualData(userId, payload);

    if (errors.length > 0) {

        const err = new Error(errors.join('; '));

        err.status = 400;

        throw err;

    }



    payload.clan_id = await resolveClanId(userId, payload.clan_id, payload.father_id);



    const created = await prisma.individual.create({

        data: {

            full_name: payload.full_name,

            gender: payload.gender,

            clan_id: payload.clan_id,

            father_id: payload.father_id,

            mother_id: payload.mother_id,

            bio: payload.bio,

            date_of_birth: payload.date_of_birth,

            date_of_death: payload.date_of_death,

            spouse_id: payload.spouse_id,

            occupation: payload.occupation,

            residence: payload.residence,

            alternative_name: payload.alternative_name,

            photo_url: payload.photo_url,

            is_external: payload.is_external || false,

            user_id: userId

        }

    });



    if (payload.spouse_id) {

        await linkSpouses(userId, created.id, payload.spouse_id);

    }



    return getById(userId, created.id);

}



async function update(userId, id, data) {

    const existing = await getById(userId, id);

    if (!existing) {

        const err = new Error('Individual not found');

        err.status = 404;

        throw err;

    }



    let payload = normalizePayload({ ...existing, ...data });

    payload = await resolveParents(userId, { ...data, ...payload });



    const errors = await validateIndividualData(userId, payload, { excludeId: id });

    if (errors.length > 0) {

        const err = new Error(errors.join('; '));

        err.status = 400;

        throw err;

    }



    payload.clan_id = await resolveClanId(userId, payload.clan_id, payload.father_id);



    await prisma.individual.updateMany({

        where: { id: Number(id), user_id: userId },

        data: {

            full_name: payload.full_name,

            gender: payload.gender,

            clan_id: payload.clan_id,

            father_id: payload.father_id,

            mother_id: payload.mother_id,

            bio: payload.bio,

            date_of_birth: payload.date_of_birth,

            date_of_death: payload.date_of_death,

            spouse_id: payload.spouse_id,

            occupation: payload.occupation,

            residence: payload.residence,

            alternative_name: payload.alternative_name,

            photo_url: payload.photo_url,

            is_external: payload.is_external || false

        }

    });



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

        await prisma.individual.updateMany({

            where: { id: existing.spouse_id, user_id: userId },

            data: { spouse_id: null }

        });

    }



    const result = await prisma.individual.deleteMany({

        where: { id: Number(id), user_id: userId }

    });



    if (result.count === 0) {

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

