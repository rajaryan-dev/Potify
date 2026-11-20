const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const HttpError = require('../utils/httpError');

async function authenticate(req, res, next) {
    const header = req.headers.authorization || '';
    const token = req.cookies?.token || (header.startsWith('Bearer ') ? header.slice(7) : null);
    if (!token) throw new HttpError(401, 'Authentication required');

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        throw new HttpError(401, 'Invalid or expired token');
    }

    const user = await userModel.findById(payload.id);
    if (!user) throw new HttpError(401, 'User no longer exists');

    req.user = user;
    next();
}

const authorizeRoles = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        throw new HttpError(403, 'You do not have permission to do this');
    }
    next();
};

module.exports = { authenticate, authorizeRoles };
