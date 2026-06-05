const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 1. Middleware 
app.use(cors());
app.use(express.json());

// 2. Database Connection Pool 
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'buganda_heritage',
    waitForConnections: true,
    connectionLimit: 10
});

// 2.5 Email Transporter Configuration
const emailTransporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
});

// Verify email configuration on startup
emailTransporter.verify((error, success) => {
    if (error) {
        console.warn('⚠️  Email configuration error:', error.message);
        console.warn('   Password reset emails will not be sent until configured.');
    } else {
        console.log('✓ Email service connected successfully');
    }
});

// 3. Authentication Middleware
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// 4. Role-Based Access Control Middleware
const verifyRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.userRole || !allowedRoles.includes(req.userRole)) {
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }
        next();
    };
};

// 5. Authentication Endpoints

/**
 * POST /api/auth/register
 * Purpose: Register a new user (default role: 'viewer')
 */
app.post('/api/auth/register', async (req, res) => {
    const { full_name, email, password, phone } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ error: 'Full name, email, and password are required' });
    }

    try {
        const hashedPassword = await bcryptjs.hash(password, 10);
        
        const [result] = await pool.execute(
            'INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
            [full_name, email, hashedPassword, phone || null, 'viewer']
        );

        res.status(201).json({
            message: 'User registered successfully',
            userId: result.insertId,
            role: 'viewer'
        });
    } catch (err) {
        console.error('Registration Error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
});

/**
 * POST /api/auth/login
 * Purpose: Login user and return JWT token with role
 */
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const [users] = await pool.execute(
            'SELECT id, full_name, email, password_hash, role FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];
        const passwordMatch = await bcryptjs.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * GET /api/auth/profile
 * Purpose: Get current user's profile including role
 */
app.get('/api/auth/profile', verifyToken, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, full_name, email, phone, bio, role, created_at FROM users WHERE id = ?',
            [req.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (err) {
        console.error('Profile Error:', err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

/**
 * PUT /api/auth/profile
 * Purpose: Update user's profile information
 */
app.put('/api/auth/profile', verifyToken, async (req, res) => {
    const { full_name, phone, bio } = req.body;

    try {
        await pool.execute(
            'UPDATE users SET full_name = ?, phone = ?, bio = ? WHERE id = ?',
            [full_name, phone || null, bio || null, req.userId]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Update Error:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * POST /api/auth/forgot-password-request
 * Purpose: Send password reset code to user's email
 */
app.post('/api/auth/forgot-password-request', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const [users] = await pool.execute('SELECT id, full_name FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            // Security: Don't reveal if email exists
            return res.json({ message: 'If email exists, verification code will be sent' });
        }

        const user = users[0];
        // Generate a 6-digit code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Store the reset code in database
        await pool.execute(
            'UPDATE users SET reset_code = ?, reset_code_expires = ? WHERE email = ?',
            [resetCode, expiresAt, email]
        );

        // Send email with reset code
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'Buganda Heritage <noreply@buganda-heritage.com>',
            to: email,
            subject: 'Password Reset - Buganda Heritage Archives',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                        <h2>🏛️ Buganda Heritage Archives</h2>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                        <p>Hello ${user.full_name},</p>
                        <p>We received a request to reset your password. Use the verification code below:</p>
                        <div style="background: white; border: 2px solid #D4AF37; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                            <h3 style="margin: 0; color: #8B4513; font-size: 24px; letter-spacing: 2px;">
                                ${resetCode}
                            </h3>
                        </div>
                        <p style="color: #666;">This code will expire in 15 minutes.</p>
                        <p style="color: #666;">If you didn't request this, please ignore this email or contact support.</p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px;">
                            © 2026 Buganda Heritage Archives | Preserving Our Past, Building Our Future
                        </p>
                    </div>
                </div>
            `,
            text: `Your password reset code is: ${resetCode}\n\nThis code will expire in 15 minutes.`
        };

        // Send email
        emailTransporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Email sending error:', err);
                // Don't send response here - response already sent
            } else {
                console.log(`✓ Password reset email sent to ${email}`);
            }
        });

        res.json({ message: 'If email exists, verification code will be sent' });
    } catch (err) {
        console.error('Forgot Password Error:', err);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

/**
 * POST /api/auth/reset-password
 * Purpose: Reset password using verification code
 */
app.post('/api/auth/reset-password', async (req, res) => {
    const { email, code, password } = req.body;

    if (!email || !code || !password) {
        return res.status(400).json({ error: 'Email, code, and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        const [users] = await pool.execute(
            'SELECT id, full_name, reset_code, reset_code_expires FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = users[0];

        // Check if code is valid
        if (!user.reset_code || user.reset_code !== code) {
            return res.status(401).json({ error: 'Invalid verification code' });
        }

        // Check if code is expired
        if (new Date() > new Date(user.reset_code_expires)) {
            return res.status(401).json({ error: 'Verification code has expired' });
        }

        // Hash new password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Update password and clear reset code
        await pool.execute(
            'UPDATE users SET password_hash = ?, reset_code = NULL, reset_code_expires = NULL WHERE email = ?',
            [hashedPassword, email]
        );

        // Send confirmation email
        const confirmMailOptions = {
            from: process.env.EMAIL_FROM || 'Buganda Heritage <noreply@buganda-heritage.com>',
            to: email,
            subject: 'Password Reset Successful - Buganda Heritage Archives',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #8B4513 0%, #D4AF37 100%); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                        <h2>🏛️ Buganda Heritage Archives</h2>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                        <p>Hello ${user.full_name},</p>
                        <p>Your password has been successfully reset! You can now log in with your new password.</p>
                        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 20px 0; border-radius: 8px; color: #155724;">
                            <strong>✓ Password Reset Complete</strong>
                        </div>
                        <p style="color: #666;">If you did not reset your password, please <a href="#" style="color: #D4AF37; text-decoration: none;">contact support</a> immediately.</p>
                        <p style="color: #666;"><a href="http://localhost:5173/login" style="color: #D4AF37; text-decoration: none;">Click here to login</a></p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px;">
                            © 2026 Buganda Heritage Archives | Preserving Our Past, Building Our Future
                        </p>
                    </div>
                </div>
            `,
            text: `Your password has been successfully reset. You can now log in with your new password.`
        };

        emailTransporter.sendMail(confirmMailOptions, (err, info) => {
            if (err) {
                console.error('Confirmation email error:', err);
            } else {
                console.log(`✓ Password reset confirmation sent to ${email}`);
            }
        });

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error('Reset Password Error:', err);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// 5. Family Members Endpoints (User-specific)


/**
 * GET /api/individuals
 * Purpose: Fetches all family members for the logged-in user
 */
app.get('/api/individuals', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT i.*, c.name as clan_name 
            FROM individuals i 
            LEFT JOIN clans c ON i.clan_id = c.id
            WHERE i.user_id = ?
            ORDER BY i.full_name ASC
        `, [req.userId]);
        res.json(rows);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to fetch heritage data" });
    }
});

/**
 * POST /api/individuals
 * Purpose: Receives new member data from the frontend form and saves it to MySQL (user-specific)
 */
app.post('/api/individuals', verifyToken, async (req, res) => {
    const { full_name, gender, clan_id, father_id, mother_id, bio } = req.body;
    
    if (!full_name || !gender) {
        return res.status(400).json({ error: "Full name and gender are required." });
    }

    try {
        const sql = 'INSERT INTO individuals (full_name, gender, clan_id, father_id, mother_id, bio, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [result] = await pool.execute(sql, [full_name, gender, clan_id || null, father_id || null, mother_id || null, bio || '', req.userId]);
        
        res.status(201).json({ 
            message: "Record preserved successfully", 
            id: result.insertId 
        });
    } catch (err) {
        console.error("Insert Error:", err);
        res.status(500).json({ error: "Failed to save record to archives" });
    }
});

/**
 * GET /api/clans
 * Purpose: Returns a list of all clans (for the dropdown menu in the form).
 */
app.get('/api/clans', async (req, res) => {
    try {
        const [clans] = await pool.query('SELECT * FROM clans');
        res.json(clans);
    } catch (err) {
        res.status(500).json({ error: "Could not load clans" });
    }
});

/**
 * GET /api/family-tree
 * Purpose: Returns a hierarchical family tree structure for the logged-in user
 */
app.get('/api/family-tree', verifyToken, async (req, res) => {
    try {
        const [individuals] = await pool.query(`
            SELECT i.*, c.name as clan_name 
            FROM individuals i 
            LEFT JOIN clans c ON i.clan_id = c.id
            WHERE i.user_id = ?
        `, [req.userId]);

        const individualsMap = new Map();
        individuals.forEach(ind => {
            individualsMap.set(ind.id, { ...ind, children: [] });
        });

        const roots = [];
        individualsMap.forEach((person) => {
            if (person.father_id) {
                const father = individualsMap.get(person.father_id);
                if (father) father.children.push(person);
            } else if (person.mother_id) {
                const mother = individualsMap.get(person.mother_id);
                if (mother) mother.children.push(person);
            } else {
                roots.push(person);
            }
        });

        res.json({
            roots: roots,
            allIndividuals: Array.from(individualsMap.values()),
            total: individuals.length
        });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to fetch family tree" });
    }
});

/**
 * GET /api/individuals/:id/lineage
 * Purpose: Returns full lineage for a specific individual (user-specific)
 */
app.get('/api/individuals/:id/lineage', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [individual] = await pool.query(`
            SELECT i.*, c.name as clan_name 
            FROM individuals i 
            LEFT JOIN clans c ON i.clan_id = c.id
            WHERE i.id = ? AND i.user_id = ?
        `, [id, req.userId]);

        if (individual.length === 0) {
            return res.status(404).json({ error: "Individual not found" });
        }

        const person = individual[0];

        let parents = { father: null, mother: null };
        if (person.father_id || person.mother_id) {
            const [parentData] = await pool.query(`
                SELECT i.*, c.name as clan_name 
                FROM individuals i 
                LEFT JOIN clans c ON i.clan_id = c.id
                WHERE i.user_id = ? AND i.id IN (?, ?)
            `, [req.userId, person.father_id, person.mother_id]);

            parentData.forEach(p => {
                if (p.id === person.father_id) parents.father = p;
                if (p.id === person.mother_id) parents.mother = p;
            });
        }

        const [descendants] = await pool.query(`
            SELECT i.*, c.name as clan_name 
            FROM individuals i 
            LEFT JOIN clans c ON i.clan_id = c.id
            WHERE i.user_id = ? AND (i.father_id = ? OR i.mother_id = ?)
        `, [req.userId, id, id]);

        res.json({
            person,
            parents,
            children: descendants
        });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to fetch lineage" });
    }
});

// 6. ROLE-BASED ADMIN ENDPOINTS

/**
 * GET /api/admin/users
 * Purpose: Get all users (admin only)
 */
app.get('/api/admin/users', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, full_name, email, role, phone, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (err) {
        console.error('Admin Error:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * PUT /api/admin/users/:id/role
 * Purpose: Update user's role (admin only)
 */
app.put('/api/admin/users/:id/role', verifyToken, verifyRole(['admin']), async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const validRoles = ['admin', 'contributor', 'viewer', 'moderator'];

    if (!role || !validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be one of: ' + validRoles.join(', ') });
    }

    try {
        const [result] = await pool.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User role updated successfully', userId: id, newRole: role });
    } catch (err) {
        console.error('Role Update Error:', err);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

/**
 * DELETE /api/admin/users/:id
 * Purpose: Delete a user (admin only)
 */
app.delete('/api/admin/users/:id', verifyToken, verifyRole(['admin']), async (req, res) => {
    const { id } = req.params;

    // Prevent deleting self
    if (parseInt(id) === req.userId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    try {
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete Error:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

/**
 * GET /api/admin/roles
 * Purpose: Get all available roles (authenticated users)
 */
app.get('/api/admin/roles', verifyToken, async (req, res) => {
    try {
        const [roles] = await pool.execute('SELECT name, description FROM roles');
        res.json(roles);
    } catch (err) {
        console.error('Roles Error:', err);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
});

/**
 * GET /api/admin/permissions
 * Purpose: Get all permissions for a role (authenticated users)
 */
app.get('/api/admin/permissions/:role', verifyToken, async (req, res) => {
    const { role } = req.params;

    try {
        const [permissions] = await pool.execute(`
            SELECT p.name, p.description 
            FROM role_permissions rp
            JOIN roles r ON rp.role_id = r.id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE r.name = ?
        `, [role]);

        res.json(permissions);
    } catch (err) {
        console.error('Permissions Error:', err);
        res.status(500).json({ error: 'Failed to fetch permissions' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`
    ===========================================
    BUGANDA HERITAGE API IS LIVE
    Port: ${PORT}
    Database: ${process.env.DB_NAME}
    ===========================================
    `);
});
