function notFound(req, res) {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);

    let status = err.status || 500;
    let message = err.message;

    if (err.name === 'ValidationError') {
        status = 400;
        message = Object.values(err.errors).map((e) => e.message).join(', ');
    } else if (err.name === 'CastError') {
        status = 400;
        message = `Invalid ${err.path}`;
    } else if (err.code === 11000) {
        status = 409;
        message = `${Object.keys(err.keyValue || {})[0] || 'value'} already exists`;
    } else if (err.type === 'entity.parse.failed') {
        status = 400;
        message = 'Malformed JSON body';
    }

    if (status >= 500) {
        console.error(err);
        message = 'Internal server error';
    }
    res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
