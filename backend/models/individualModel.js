const db = require('../config/db');

const Individual = {
    // Fetch all individuals with their clan names and spouse info
    fetchAll: async () => {
        const [rows] = await db.execute(`
            SELECT i.*, c.name as clan_name, 
                   s.full_name as spouse_full_name, s.clan_id as spouse_clan_id,
                   sc.name as spouse_clan_name
            FROM individuals i 
            LEFT JOIN clans c ON i.clan_id = c.id
            LEFT JOIN individuals s ON i.spouse_id = s.id
            LEFT JOIN clans sc ON s.clan_id = sc.id
        `);
        return rows;
    },

    // Add a new family member with automatic clan inheritance from father
    create: async (data) => {
        const { full_name, gender, clan_id, father_id, mother_id, bio, date_of_birth, date_of_death, occupation, residence, alternative_name, spouse_id } = data;
        
        // Determine clan: inherit from father if not provided, else use provided clan_id
        let finalClanId = clan_id;
        if (father_id && !clan_id) {
            const [father] = await db.execute(
                'SELECT clan_id FROM individuals WHERE id = ?',
                [father_id]
            );
            if (father.length > 0) {
                finalClanId = father[0].clan_id;
            }
        }

        const [result] = await db.execute(
            'INSERT INTO individuals (full_name, gender, clan_id, father_id, mother_id, bio, date_of_birth, date_of_death, occupation, residence, alternative_name, spouse_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [full_name, gender, finalClanId || null, father_id || null, mother_id || null, bio || null, date_of_birth || null, date_of_death || null, occupation || null, residence || null, alternative_name || null, spouse_id || null]
        );
        return result;
    },

    // Check if two people are relatives (to prevent incest)
    areRelatives: async (person_id, potential_spouse_id) => {
        // Get all ancestors and descendants of person_id
        const [relatives] = await db.execute(`
            WITH RECURSIVE relations AS (
                SELECT id FROM individuals WHERE id = ?
                UNION ALL
                SELECT father_id FROM individuals WHERE id = ? AND father_id IS NOT NULL
                UNION ALL
                SELECT mother_id FROM individuals WHERE id = ? AND mother_id IS NOT NULL
                UNION ALL
                SELECT i.father_id FROM individuals i 
                JOIN relations r ON (i.id = r.id AND i.father_id IS NOT NULL)
                UNION ALL
                SELECT i.mother_id FROM individuals i 
                JOIN relations r ON (i.id = r.id AND i.mother_id IS NOT NULL)
                UNION ALL
                SELECT i.id FROM individuals i 
                WHERE i.father_id = ? OR i.mother_id = ?
            )
            SELECT id FROM relations WHERE id = ?
        `, [person_id, person_id, person_id, person_id, person_id, potential_spouse_id]);
        
        return relatives.length > 0;
    },

    // Link two people as spouses (bidirectional)
    linkSpouses: async (person_id, spouse_id) => {
        // Check if they're relatives (incest prevention)
        const areRelatives = await Individual.areRelatives(person_id, spouse_id);
        if (areRelatives) {
            throw new Error('Cannot link relatives as spouses');
        }

        // Update both directions
        await db.execute('UPDATE individuals SET spouse_id = ? WHERE id = ?', [spouse_id, person_id]);
        await db.execute('UPDATE individuals SET spouse_id = ? WHERE id = ?', [person_id, spouse_id]);
        
        return { success: true };
    },

    // Unlink spouses
    unlinkSpouses: async (person_id) => {
        const [person] = await db.execute('SELECT spouse_id FROM individuals WHERE id = ?', [person_id]);
        if (person.length > 0 && person[0].spouse_id) {
            const spouse_id = person[0].spouse_id;
            await db.execute('UPDATE individuals SET spouse_id = NULL WHERE id = ?', [person_id]);
            await db.execute('UPDATE individuals SET spouse_id = NULL WHERE id = ?', [spouse_id]);
        }
        return { success: true };
    }
};

module.exports = Individual;
