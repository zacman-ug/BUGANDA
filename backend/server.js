require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pool = require('./config/db');
const individualModel = require('./models/individualModel');

const app = express();
const PORT = process.env.PORT || 5000;
const DEFAULT_JWT_SECRET = 'your-secret-key-change-in-production';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || JWT_SECRET === DEFAULT_JWT_SECRET)) {
    console.error('FATAL: JWT_SECRET must be set to a strong value in production.');
    process.exit(1);
}

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

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

function asyncHandler(fn) {
    return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function handleModelError(err, res) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Internal server error' });
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
        const [countRows] = await pool.execute('SELECT COUNT(*) AS cnt FROM users');
        const assignedRole = countRows[0].cnt === 0 ? 'admin' : 'viewer';

        const [result] = await pool.execute(
            'INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
            [full_name, email, hashedPassword, phone || null, assignedRole]
        );

        res.status(201).json({
            message: 'Registration successful',
            userId: result.insertId,
            role: assignedRole
        });
    } catch (err) {
        console.error('Registration Error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
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

    const [users] = await pool.execute(
        'SELECT id, full_name, email, password_hash, role FROM users WHERE email = ?',
        [email]
    );

    if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
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
    const [users] = await pool.execute(
        'SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?',
        [req.userId]
    );

    if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
}));

/**
 * PUT /api/auth/profile
 */
app.put('/api/auth/profile', verifyToken, asyncHandler(async (req, res) => {
    const { full_name, phone } = req.body;

    if (!full_name) {
        return res.status(400).json({ error: 'Full name is required' });
    }

    await pool.execute(
        'UPDATE users SET full_name = ?, phone = ? WHERE id = ?',
        [full_name, phone || null, req.userId]
    );

    res.json({ message: 'Profile updated successfully' });
}));

async function sendPasswordResetCode(email) {
    const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) return;

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await pool.execute(
        'UPDATE users SET reset_code = ?, reset_expires = ? WHERE email = ?',
        [resetCode, expires, email]
    );

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

    const [users] = await pool.execute(
        'SELECT id, reset_code, reset_expires FROM users WHERE email = ?',
        [email]
    );

    if (users.length === 0 || users[0].reset_code !== token) {
        return res.status(400).json({ error: 'Invalid verification code' });
    }

    if (new Date() > new Date(users[0].reset_expires)) {
        return res.status(400).json({ error: 'Verification code has expired' });
    }

    const hashedPassword = await bcryptjs.hash(nextPassword, 10);
    await pool.execute(
        'UPDATE users SET password_hash = ?, reset_code = NULL, reset_expires = NULL WHERE email = ?',
        [hashedPassword, email]
    );

    res.json({ message: 'Password reset successfully' });
});

app.post('/api/auth/forgot-password', handleForgotPassword);
app.post('/api/auth/forgot-password-request', handleForgotPassword);
app.post('/api/auth/reset-password', handleResetPassword);

/**
 * GET /api/clans
 */
app.get('/api/clans', verifyToken, asyncHandler(async (req, res) => {
    const [clans] = await pool.execute('SELECT id, name, description FROM clans ORDER BY name ASC');
    res.json(clans);
}));

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
        res.status(201).json({ message: 'Record preserved successfully', id: created.id, individual: created });
    } catch (err) {
        handleModelError(err, res);
    }
}));

/**
 * PUT /api/individuals/:id
 */
app.put('/api/individuals/:id', verifyToken, verifyRole(['admin', 'contributor']), asyncHandler(async (req, res) => {
    try {
        const updated = await individualModel.update(req.userId, req.params.id, req.body);
        res.json({ message: 'Record updated successfully', individual: updated });
    } catch (err) {
        handleModelError(err, res);
    }
}));

/**
 * DELETE /api/individuals/:id
 */
app.delete('/api/individuals/:id', verifyToken, verifyRole(['admin', 'contributor']), asyncHandler(async (req, res) => {
    try {
        const result = await individualModel.remove(req.userId, req.params.id);
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

    res.json({ roots, total: individuals.length });
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

        const [result] = await pool.execute(
            'INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
            [full_name, email, hashedPassword, phone || null, assignedRole]
        );

        res.status(201).json({ message: 'User created', userId: result.insertId, role: assignedRole });
    } catch (err) {
        console.error('Admin Create User Error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        throw err;
    }
}));

/**
 * GET /api/admin/users
 */
app.get('/api/admin/users', verifyToken, verifyRole(['admin']), asyncHandler(async (req, res) => {
    const [users] = await pool.execute(
        'SELECT id, full_name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
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

    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [targetId]);
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
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

    const [result] = await pool.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, req.params.id]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Role updated successfully', role });
}));

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);

    if (err.code === 'ECONNREFUSED') {
        return res.status(503).json({
            error: 'Database connection failed. Make sure MySQL is running on port 3306.'
        });
    }

    if (err.code === 'ER_BAD_FIELD_ERROR' && err.message?.includes('reset_expires')) {
        return res.status(500).json({
            error: 'Database schema mismatch. Run ADD_PASSWORD_RESET.sql or backend/migrations/001_full_schema.sql.'
        });
    }

    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log('BUGANDA HERITAGE API IS LIVE');
        console.log(`Port: ${PORT}`);
        console.log(`Database: ${process.env.DB_NAME || 'buganda_heritage'}`);
    });
}

module.exports = app;
