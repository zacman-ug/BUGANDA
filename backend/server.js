require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const prisma = require('./lib/prisma');
const individualModel = require('./models/individualModel');
const marriageModel = require('./models/marriageModel');
const { logAudit } = require('./lib/auditLog');
const heritageService = require('./lib/heritageService');
const uploadPhoto = require('./middleware/uploadPhoto');

const app = express();
const PORT = process.env.PORT || 5000;
const DEFAULT_JWT_SECRET = 'your-secret-key-change-in-production';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || JWT_SECRET === DEFAULT_JWT_SECRET)) {
    console.error('FATAL: JWT_SECRET must be set to a strong value in production.');
    process.exit(1);
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts. Please try again later.' }
});

app.use('/api/auth', authLimiter);

let emailTransporter = null;
if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    emailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });
    emailTransporter.verify()
        .then(() => console.log('✓ Email service connected successfully'))
        .catch((err) => console.warn('Email service unavailable:', err.message));
}

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}

function verifyRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.userRole || !allowedRoles.includes(req.userRole)) {
            return res.status(403).json({ error: 'Insufficient permissions for this action.' });
        }
        next();
    };
}

function optionalVerifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
            req.userId = decoded.userId;
            req.userRole = decoded.role;
        } catch (err) {
            // Public route — invalid token is ignored
        }
    }
    next();
}

function asyncHandler(fn) {
    return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function handleModelError(err, res) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Internal server error' });
}

function isUniqueViolation(err) {
    return err.code === 'P2002';
}

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * POST /api/auth/register
 */
app.post('/api/auth/register', asyncHandler(async (req, res) => {
    const { full_name, email, password, phone } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ error: 'Full name, email, and password are required' });
    }

    try {
        const hashedPassword = await bcryptjs.hash(password, 10);
        const userCount = await prisma.user.count();
        const assignedRole = userCount === 0 ? 'admin' : 'viewer';

        const user = await prisma.user.create({
            data: {
                full_name,
                email,
                password_hash: hashedPassword,
                phone: phone || null,
                role: assignedRole
            }
        });

        res.status(201).json({
            message: 'Registration successful',
            userId: user.id,
            role: assignedRole
        });
    } catch (err) {
        console.error('Registration Error:', err);
        if (isUniqueViolation(err)) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        throw err;
    }
}));

/**
 * POST /api/auth/login
 */
app.post('/api/auth/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            full_name: true,
            email: true,
            password_hash: true,
            role: true
        }
    });

    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcryptjs.compare(password, user.password_hash);

    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({
        token,
        user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role
        }
    });
}));

/**
 * GET /api/auth/profile
 */
app.get('/api/auth/profile', verifyToken, asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            bio: true,
            role: true,
            created_at: true
        }
    });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
}));

/**
 * PUT /api/auth/profile
 */
app.put('/api/auth/profile', verifyToken, asyncHandler(async (req, res) => {
    const { full_name, phone, bio } = req.body;

    if (!full_name) {
        return res.status(400).json({ error: 'Full name is required' });
    }

    await prisma.user.update({
        where: { id: req.userId },
        data: {
            full_name,
            phone: phone || null,
            bio: bio != null ? bio : undefined
        }
    });

    await logAudit({
        userId: req.userId,
        action: 'update_profile',
        entityType: 'user',
        entityId: req.userId
    });

    res.json({ message: 'Profile updated successfully' });
}));

async function sendPasswordResetCode(email) {
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
    });
    if (!user) return;

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
        where: { email },
        data: { reset_code: resetCode, reset_expires: expires }
    });

    if (emailTransporter) {
        await emailTransporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Buganda Heritage - Password Reset',
            text: `Your password reset code is: ${resetCode}. It expires in 15 minutes.`
        });
    } else {
        console.log(`Password reset code for ${email}: ${resetCode}`);
    }
}

const handleForgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    await sendPasswordResetCode(email);
    res.json({ message: 'If email exists, verification code will be sent' });
});

const handleResetPassword = asyncHandler(async (req, res) => {
    const { email, code, password, reset_code, new_password } = req.body;
    const token = code || reset_code;
    const nextPassword = password || new_password;

    if (!email || !token || !nextPassword) {
        return res.status(400).json({ error: 'Email, code, and password are required' });
    }

    if (nextPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, reset_code: true, reset_expires: true }
    });

    if (!user || user.reset_code !== token) {
        return res.status(400).json({ error: 'Invalid verification code' });
    }

    if (!user.reset_expires || new Date() > new Date(user.reset_expires)) {
        return res.status(400).json({ error: 'Verification code has expired' });
    }

    const hashedPassword = await bcryptjs.hash(nextPassword, 10);
    await prisma.user.update({
        where: { email },
        data: {
            password_hash: hashedPassword,
            reset_code: null,
            reset_expires: null
        }
    });

    res.json({ message: 'Password reset successfully' });
});

app.post('/api/auth/forgot-password', handleForgotPassword);
app.post('/api/auth/forgot-password-request', handleForgotPassword);
app.post('/api/auth/reset-password', handleResetPassword);

/**
 * GET /api/clans — public; member counts when authenticated
 */
app.get('/api/clans', optionalVerifyToken, asyncHandler(async (req, res) => {
    const clans = await prisma.clan.findMany({
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            totem: true,
            head_title: true,
            description: true,
            created_at: true
        }
    });

    if (req.userId) {
        const individuals = await individualModel.getAllByUser(req.userId);
        return res.json(clans.map((clan) => ({
            ...clan,
            memberCount: individuals.filter((p) => p.clan_id === clan.id).length
        })));
    }

    res.json(clans);
}));

/**
 * GET /api/clans/:id/members
 */
app.get('/api/clans/:id/members', verifyToken, asyncHandler(async (req, res) => {
    const clanId = parseInt(req.params.id, 10);
    const clan = await prisma.clan.findUnique({ where: { id: clanId } });
    if (!clan) {
        return res.status(404).json({ error: 'Clan not found' });
    }

    const individuals = await individualModel.getAllByUser(req.userId);
    const members = individuals.filter((p) => p.clan_id === clanId);
    res.json({ clan, members, memberCount: members.length });
}));

/**
 * POST /api/uploads/photo — upload member portrait from device
 */
app.post(
    '/api/uploads/photo',
    verifyToken,
    verifyRole(['admin', 'contributor', 'moderator']),
    (req, res, next) => {
        uploadPhoto.single('photo')(req, res, (err) => {
            if (err) {
                return res.status(400).json({ error: err.message || 'Photo upload failed.' });
            }
            next();
        });
    },
    asyncHandler(async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No photo file provided.' });
        }
        const photoUrl = `/uploads/photos/${req.file.filename}`;
        res.status(201).json({ photo_url: photoUrl, url: photoUrl });
    })
);

/**
 * GET /api/individuals
 */
app.get('/api/individuals', verifyToken, asyncHandler(async (req, res) => {
    const individuals = await individualModel.getAllByUser(req.userId);
    res.json(individuals);
}));

/**
 * POST /api/individuals
 */
app.post('/api/individuals', verifyToken, verifyRole(['admin', 'contributor']), asyncHandler(async (req, res) => {
    try {
        const created = await individualModel.create(req.userId, req.body);
        await logAudit({
            userId: req.userId,
            action: 'create_individual',
            entityType: 'individual',
            entityId: created.id,
            changes: { full_name: created.full_name }
        });
        res.status(201).json({ message: 'Record preserved successfully', id: created.id, individual: created });
    } catch (err) {
        handleModelError(err, res);
    }
}));

/**
 * PUT /api/individuals/:id
 */
app.put('/api/individuals/:id', verifyToken, verifyRole(['admin', 'contributor', 'moderator']), asyncHandler(async (req, res) => {
    try {
        const updated = await individualModel.update(req.userId, req.params.id, req.body);
        await logAudit({
            userId: req.userId,
            action: 'update_individual',
            entityType: 'individual',
            entityId: updated.id,
            changes: { full_name: updated.full_name }
        });
        res.json({ message: 'Record updated successfully', individual: updated });
    } catch (err) {
        handleModelError(err, res);
    }
}));

/**
 * DELETE /api/individuals/:id
 */
app.delete('/api/individuals/:id', verifyToken, verifyRole(['admin']), asyncHandler(async (req, res) => {
    try {
        const result = await individualModel.remove(req.userId, req.params.id);
        await logAudit({
            userId: req.userId,
            action: 'delete_individual',
            entityType: 'individual',
            entityId: req.params.id
        });
        res.json(result);
    } catch (err) {
        handleModelError(err, res);
    }
}));

/**
 * GET /api/individuals/:id/lineage
 */
app.get('/api/individuals/:id/lineage', verifyToken, asyncHandler(async (req, res) => {
    const person = await individualModel.getById(req.userId, req.params.id);
    if (!person) {
        return res.status(404).json({ error: 'Individual not found' });
    }

    const individuals = await individualModel.getAllByUser(req.userId);
    const byId = new Map(individuals.map((p) => [p.id, p]));

    const parents = {
        father: person.father_id ? byId.get(person.father_id) || null : null,
        mother: person.mother_id ? byId.get(person.mother_id) || null : null
    };
    const children = individuals.filter(
        (p) => p.father_id === person.id || p.mother_id === person.id
    );

    res.json({ person, parents, children });
}));

/**
 * GET /api/family-tree
 */
app.get('/api/family-tree', verifyToken, asyncHandler(async (req, res) => {
    const individuals = await individualModel.getAllByUser(req.userId);

    const byId = new Map(individuals.map((person) => [person.id, { ...person, children: [] }]));
    const roots = [];

    for (const person of byId.values()) {
        if (person.father_id && byId.has(person.father_id)) {
            byId.get(person.father_id).children.push(person);
        } else if (!person.father_id) {
            roots.push(person);
        } else {
            roots.push(person);
        }
    }

    res.json({ roots, allIndividuals: individuals, total: individuals.length });
}));

/**
 * Heritage visualization APIs
 */
app.get('/api/heritage/completeness', verifyToken, asyncHandler(async (req, res) => {
    const individuals = await individualModel.getAllByUser(req.userId);
    res.json(heritageService.computeCompleteness(individuals));
}));

app.get('/api/heritage/narrative/:id', verifyToken, asyncHandler(async (req, res) => {
    const individuals = await individualModel.getAllByUser(req.userId);
    const narrative = heritageService.buildNarrative(req.params.id, individuals);
    if (!narrative) return res.status(404).json({ error: 'Person not found' });
    res.json(narrative);
}));

app.get('/api/heritage/path/:id', verifyToken, asyncHandler(async (req, res) => {
    const individuals = await individualModel.getAllByUser(req.userId);
    const path = heritageService.buildPathToRoot(req.params.id, individuals);
    if (!path) return res.status(404).json({ error: 'Person not found' });
    res.json(path);
}));

app.get('/api/heritage/alliances', verifyToken, asyncHandler(async (req, res) => {
    const individuals = await individualModel.getAllByUser(req.userId);
    res.json({ alliances: heritageService.buildAlliances(individuals) });
}));

app.get('/api/heritage/timeline', verifyToken, asyncHandler(async (req, res) => {
    const individuals = await individualModel.getAllByUser(req.userId);
    const marriages = await marriageModel.getAllByUser(req.userId);
    res.json({ events: heritageService.buildTimeline(individuals, marriages) });
}));

app.get('/api/heritage/spotlight', verifyToken, asyncHandler(async (req, res) => {
    const individuals = await individualModel.getAllByUser(req.userId);
    const spotlight = heritageService.findSpotlightAncestor(individuals);
    if (!spotlight) return res.json({ ancestor: null });
    res.json(spotlight);
}));

/**
 * GET /api/marriages
 */
app.get('/api/marriages', verifyToken, asyncHandler(async (req, res) => {
    const marriages = await marriageModel.getAllByUser(req.userId);
    res.json(marriages);
}));

/**
 * POST /api/marriages
 */
app.post('/api/marriages', verifyToken, verifyRole(['admin', 'contributor']), asyncHandler(async (req, res) => {
    try {
        const created = await marriageModel.create(req.userId, req.body);
        await logAudit({
            userId: req.userId,
            action: 'create_marriage',
            entityType: 'marriage',
            entityId: created.id
        });
        res.status(201).json({ message: 'Marriage record created', marriage: created });
    } catch (err) {
        handleModelError(err, res);
    }
}));

/**
 * PUT /api/marriages/:id
 */
app.put('/api/marriages/:id', verifyToken, verifyRole(['admin', 'contributor', 'moderator']), asyncHandler(async (req, res) => {
    try {
        const updated = await marriageModel.update(req.userId, req.params.id, req.body);
        res.json({ message: 'Marriage record updated', marriage: updated });
    } catch (err) {
        handleModelError(err, res);
    }
}));

/**
 * DELETE /api/marriages/:id
 */
app.delete('/api/marriages/:id', verifyToken, verifyRole(['admin']), asyncHandler(async (req, res) => {
    try {
        const result = await marriageModel.remove(req.userId, req.params.id);
        res.json(result);
    } catch (err) {
        handleModelError(err, res);
    }
}));

/**
 * POST /api/admin/users
 */
app.post('/api/admin/users', verifyToken, verifyRole(['admin']), asyncHandler(async (req, res) => {
    const { full_name, email, password, phone, role } = req.body;
    const validRoles = ['admin', 'contributor', 'viewer', 'moderator'];

    if (!full_name || !email || !password) {
        return res.status(400).json({ error: 'Full name, email, and password are required' });
    }

    if (role && !validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be one of: ' + validRoles.join(', ') });
    }

    try {
        const hashedPassword = await bcryptjs.hash(password, 10);
        const assignedRole = role || 'viewer';

        const user = await prisma.user.create({
            data: {
                full_name,
                email,
                password_hash: hashedPassword,
                phone: phone || null,
                role: assignedRole
            }
        });

        await logAudit({
            userId: req.userId,
            action: 'create_user',
            entityType: 'user',
            entityId: user.id,
            changes: { email, role: assignedRole }
        });
        res.status(201).json({ message: 'User created', userId: user.id, role: assignedRole });
    } catch (err) {
        console.error('Admin Create User Error:', err);
        if (isUniqueViolation(err)) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        throw err;
    }
}));

/**
 * GET /api/admin/users
 */
app.get('/api/admin/users', verifyToken, verifyRole(['admin']), asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            role: true,
            created_at: true
        },
        orderBy: { created_at: 'desc' }
    });
    res.json(users);
}));

/**
 * DELETE /api/admin/users/:id
 */
app.delete('/api/admin/users/:id', verifyToken, verifyRole(['admin']), asyncHandler(async (req, res) => {
    const targetId = parseInt(req.params.id, 10);
    if (targetId === req.userId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    try {
        await prisma.user.delete({ where: { id: targetId } });
        await logAudit({
            userId: req.userId,
            action: 'delete_user',
            entityType: 'user',
            entityId: targetId
        });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        throw err;
    }
}));

/**
 * PUT /api/admin/users/:id/role
 */
app.put('/api/admin/users/:id/role', verifyToken, verifyRole(['admin']), asyncHandler(async (req, res) => {
    const { role } = req.body;
    const validRoles = ['admin', 'contributor', 'viewer', 'moderator'];

    if (!role || !validRoles.includes(role)) {
        return res.status(400).json({ error: 'Valid role is required' });
    }

    try {
        const targetId = parseInt(req.params.id, 10);
        await prisma.user.update({
            where: { id: targetId },
            data: { role }
        });
        await logAudit({
            userId: req.userId,
            action: 'update_user_role',
            entityType: 'user',
            entityId: targetId,
            changes: { role }
        });
        res.json({ message: 'Role updated successfully', role });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        throw err;
    }
}));

/**
 * GET /api/admin/roles
 */
app.get('/api/admin/roles', verifyToken, asyncHandler(async (req, res) => {
    const roles = await prisma.roleDefinition.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, description: true }
    });
    res.json(roles);
}));

/**
 * GET /api/admin/permissions/:role
 */
app.get('/api/admin/permissions/:role', verifyToken, asyncHandler(async (req, res) => {
    const role = await prisma.roleDefinition.findUnique({
        where: { name: req.params.role },
        include: {
            permissions: {
                include: { permission: true }
            }
        }
    });

    if (!role) {
        return res.status(404).json({ error: 'Role not found' });
    }

    res.json({
        role: role.name,
        description: role.description,
        permissions: role.permissions.map((rp) => ({
            id: rp.permission.id,
            name: rp.permission.name,
            description: rp.permission.description
        }))
    });
}));

/**
 * GET /api/admin/audit-log
 */
app.get('/api/admin/audit-log', verifyToken, verifyRole(['admin']), asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const logs = await prisma.auditLog.findMany({
        orderBy: { created_at: 'desc' },
        take: limit,
        include: {
            user: { select: { id: true, full_name: true, email: true } }
        }
    });
    res.json(logs);
}));

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);

    if (err.code === 'ECONNREFUSED' || err.code === 'P1001') {
        return res.status(503).json({
            error: 'Database connection failed. Make sure PostgreSQL is running and DATABASE_URL is correct.'
        });
    }

    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log('BUGANDA HERITAGE API IS LIVE');
        console.log(`Port: ${PORT}`);
        console.log('Database: PostgreSQL (Prisma)');
    });
}

module.exports = app;
