const HttpError = require('../utils/httpError');
const { isObjectId } = require('../utils/helpers');

// validateObjectId('id', 'songId') -> 400 if any of those route params is not a valid id
const validateObjectId = (...params) => (req, res, next) => {
    for (const p of params) {
        if (!isObjectId(req.params[p])) throw new HttpError(400, `Invalid ${p}`);
    }
    next();
};

module.exports = validateObjectId;
