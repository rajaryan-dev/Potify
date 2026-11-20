const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');
const HttpError = require('../utils/httpError');
const { isString, publicUser } = require('../utils/helpers');

const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
};
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function registerUser(req, res) {
    const { username, email, password, role } = req.body || {};

    if (![username, email, password].every(isString)) {
        throw new HttpError(400, 'username, email and password are required');
    }
    if (!USERNAME_RE.test(username.trim())) {
        throw new HttpError(400, 'Username must be 3-30 characters: letters, numbers, . _ -');
    }
    if (!EMAIL_RE.test(email.trim())) throw new HttpError(400, 'Please enter a valid email address');
    if (password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters');
    if (role !== undefined && !['user', 'artist'].includes(role)) {
        throw new HttpError(400, 'Invalid role');
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    const existing = await userModel.findOne({
        $or: [{ username: cleanUsername }, { email: cleanEmail }],
    });
    if (existing) throw new HttpError(409, 'User already exists');

    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
        username: cleanUsername,
        email: cleanEmail,
        password: hash,
        role,
    });

    res.cookie('token', signToken(user), { ...COOKIE_OPTIONS, maxAge: WEEK_MS });
    res.status(201).json({ message: 'User registered successfully', user: publicUser(user) });
}

async function loginUser(req, res) {
    const { username, email, password } = req.body || {};

    if (!isString(password) || !(isString(username) || isString(email))) {
        throw new HttpError(400, 'Provide password and username or email');
    }

    const conditions = [];
    if (isString(username)) conditions.push({ username: username.trim() });
    if (isString(email)) conditions.push({ email: email.trim().toLowerCase() });

    const user = await userModel.findOne({ $or: conditions }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new HttpError(401, 'Invalid credentials');
    }

    res.cookie('token', signToken(user), { ...COOKIE_OPTIONS, maxAge: WEEK_MS });
    res.status(200).json({ message: 'User logged in successfully', user: publicUser(user) });
}

function logoutUser(req, res) {
    res.clearCookie('token', COOKIE_OPTIONS);
    res.status(200).json({ message: 'Logged out successfully' });
}

function getMe(req, res) {
    res.json({ user: publicUser(req.user) });
}

module.exports = { registerUser, loginUser, logoutUser, getMe };
