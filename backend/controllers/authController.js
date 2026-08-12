const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

exports.register = async (req, res) => {
    try {
        const { name, email, password, department, role } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please enter all required fields" });
        }

        // Check if user exists
        const [existing] = await db.query('SELECT * FROM users WHERE email = :1', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert new user
        const sql = `INSERT INTO users (name, email, password_hash, role, department) VALUES (:1, :2, :3, :4, :5)`;
        const binds = [name, email, password_hash, role || 'student', department || null];
        await db.query(sql, binds);

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("REGISTER ERROR:", error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // --- HARDCODED ADMIN LOGIC ---
        if (email === 'admin@college.edu' && password === 'admin123') {
            const token = jwt.sign({ id: 0, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
            return res.status(200).json({
                id: 0,
                name: 'System Admin',
                email: 'admin@college.edu',
                role: 'admin',
                department: 'Administration',
                token
            });
        }
        // ------------------------------

        const [users] = await db.query('SELECT * FROM users WHERE email = :1', [email]);
        if (users.length === 0) return res.status(404).json({ message: "User not found" });

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        // Generate token
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, department FROM users WHERE id = :1', [req.userId]);
        if (users.length === 0) return res.status(404).json({ message: "User not found" });
        
        res.status(200).json(users[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};
