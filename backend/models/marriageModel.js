const prisma = require('../lib/prisma');

function formatMarriage(marriage) {
    if (!marriage) return null;
    const { husband, wife, ...rest } = marriage;
    return {
        ...rest,
        husband_name: husband?.full_name || null,
        wife_name: wife?.full_name || null
    };
}

async function getAllByUser(userId) {
    const marriages = await prisma.marriage.findMany({
        where: { user_id: userId },
        include: {
            husband: { select: { id: true, full_name: true, gender: true } },
            wife: { select: { id: true, full_name: true, gender: true } }
        },
        orderBy: { created_at: 'desc' }
    });
    return marriages.map(formatMarriage);
}

async function upsertForSpouses(userId, personAId, personBId, extra = {}) {
    if (!personAId || !personBId) return null;

    const [a, b] = await Promise.all([
        prisma.individual.findFirst({ where: { id: Number(personAId), user_id: userId } }),
        prisma.individual.findFirst({ where: { id: Number(personBId), user_id: userId } })
    ]);
    if (!a || !b) return null;

    const husbandId = a.gender === 'Male' ? a.id : b.gender === 'Male' ? b.id : a.id;
    const wifeId = a.gender === 'Female' ? a.id : b.gender === 'Female' ? b.id : b.id;

    const existing = await prisma.marriage.findFirst({
        where: {
            user_id: userId,
            OR: [
                { husband_id: husbandId, wife_id: wifeId },
                { husband_id: wifeId, wife_id: husbandId }
            ]
        }
    });

    if (existing) {
        return prisma.marriage.update({
            where: { id: existing.id },
            data: {
                husband_id: husbandId,
                wife_id: wifeId,
                marriage_date: extra.marriage_date || existing.marriage_date,
                location: extra.location ?? existing.location,
                notes: extra.notes ?? existing.notes
            }
        });
    }

    return prisma.marriage.create({
        data: {
            husband_id: husbandId,
            wife_id: wifeId,
            marriage_date: extra.marriage_date || null,
            location: extra.location || null,
            notes: extra.notes || null,
            user_id: userId
        }
    });
}

async function create(userId, data) {
    const { husband_id, wife_id, marriage_date, location, notes } = data;
    if (!husband_id || !wife_id) {
        const err = new Error('husband_id and wife_id are required');
        err.status = 400;
        throw err;
    }
    const marriage = await upsertForSpouses(userId, husband_id, wife_id, {
        marriage_date, location, notes
    });
    return formatMarriage(await prisma.marriage.findUnique({
        where: { id: marriage.id },
        include: {
            husband: { select: { id: true, full_name: true, gender: true } },
            wife: { select: { id: true, full_name: true, gender: true } }
        }
    }));
}

async function update(userId, id, data) {
    const existing = await prisma.marriage.findFirst({
        where: { id: Number(id), user_id: userId }
    });
    if (!existing) {
        const err = new Error('Marriage record not found');
        err.status = 404;
        throw err;
    }

    const updated = await prisma.marriage.update({
        where: { id: existing.id },
        data: {
            marriage_date: data.marriage_date !== undefined ? data.marriage_date : undefined,
            location: data.location !== undefined ? data.location : undefined,
            notes: data.notes !== undefined ? data.notes : undefined
        },
        include: {
            husband: { select: { id: true, full_name: true, gender: true } },
            wife: { select: { id: true, full_name: true, gender: true } }
        }
    });
    return formatMarriage(updated);
}

async function remove(userId, id) {
    const result = await prisma.marriage.deleteMany({
        where: { id: Number(id), user_id: userId }
    });
    if (result.count === 0) {
        const err = new Error('Marriage record not found');
        err.status = 404;
        throw err;
    }
    return { message: 'Marriage record deleted successfully' };
}

module.exports = {
    getAllByUser,
    upsertForSpouses,
    create,
    update,
    remove
};
