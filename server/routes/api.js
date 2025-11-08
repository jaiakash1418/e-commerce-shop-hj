const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const multer = require('multer');

const SECRET_KEY = process.env.JWT_SECRET || 'change-this-in-prod';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'change-refresh-secret';

// Simple in-memory stores for demo — replace with DB (Mongo/Postgres) in production
const users = new Map(); // key: email -> { id, email, passwordHash, addresses: [] }
const refreshTokens = new Map(); // key: refreshToken -> email
const products = new Map(); // key: id -> { id, name, description, price, image, category, stock, unit }

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../src/images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// helpers
function generateAccessToken(payload) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '15m' });
}
function generateRefreshToken(payload) {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

// Register
router.post('/auth/register',
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;
        if (users.has(email)) return res.status(409).json({ message: 'User already exists' });

        const passwordHash = await bcrypt.hash(password, 10);
        const isAdmin = users.size === 0;
        const user = { id: `u_${Date.now()}`, email, passwordHash, addresses: [], role: isAdmin ? 'admin' : 'user' };
        users.set(email, user);

        res.status(201).json({ message: 'Registered' });
    }
);

// Login
router.post('/auth/login',
    body('email').isEmail(),
    body('password').isString(),
    async (req, res) => {
        const { email, password } = req.body;
        const user = users.get(email);
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

        const accessToken = generateAccessToken({ email: user.email, userId: user.id, role: user.role });
        const refreshToken = generateRefreshToken({ email: user.email, userId: user.id });
        refreshTokens.set(refreshToken, user.email);

        res.json({ accessToken, refreshToken, expiresIn: 900 });
    }
);

// Refresh token
router.post('/auth/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken || !refreshTokens.has(refreshToken)) return res.status(401).json({ message: 'Invalid refresh token' });

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const accessToken = generateAccessToken({ email: payload.email, userId: payload.userId, role: payload.role });
        res.json({ accessToken, expiresIn: 900 });
    } catch (err) {
        refreshTokens.delete(refreshToken);
        return res.status(403).json({ message: 'Refresh token invalid' });
    }
});

// Logout (revoke refresh token)
router.post('/auth/logout', (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) refreshTokens.delete(refreshToken);
    res.json({ message: 'Logged out' });
});

// Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, payload) => {
        if (err) return res.sendStatus(403);
        req.user = payload;
        next();
    });
}

function isAdmin(req, res, next) {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    next();
}

// Product endpoints
router.get('/products', (req, res) => {
    res.json(Array.from(products.values()));
});

router.post('/products', authenticateToken, isAdmin, upload.single('image'), (
    req, res) => {
    const { name, description, price, category, stock, unit } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null;
    const product = { id: `p_${Date.now()}`, name, description, price, image, category, stock, unit };
    products.set(product.id, product);
    res.status(201).json(product);
});

router.put('/products/:id', authenticateToken, isAdmin, upload.single('image'), (
    req, res) => {
    const { id } = req.params;
    const { name, description, price, category, stock, unit } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : req.body.image;

    if (!products.has(id)) return res.status(404).json({ message: 'Product not found' });

    const product = { ...products.get(id), name, description, price, image, category, stock, unit };
    products.set(id, product);
    res.json(product);
});

router.delete('/products/:id', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    if (!products.has(id)) return res.status(404).json({ message: 'Product not found' });

    products.delete(id);
    res.sendStatus(204);
});


// Address endpoints (CRUD)
router.get('/users/me/addresses', authenticateToken, (req, res) => {
    const user = users.get(req.user.email);
    return res.json(user?.addresses || []);
});

router.post('/users/me/addresses',
    authenticateToken,
    body('fullName').notEmpty(),
    body('streetAddress').notEmpty(),
    body('city').notEmpty(),
    body('pincode').notEmpty(),
    body('phone').notEmpty(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const user = users.get(req.user.email);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const addr = { id: `addr_${Date.now()}`, ...req.body };
        user.addresses.push(addr);
        res.status(201).json(addr);
    }
);

module.exports = router;