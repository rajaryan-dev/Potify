const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

const isString = (v) => typeof v === 'string' && v.trim().length > 0;
const isObjectId = (v) => typeof v === 'string' && OBJECT_ID_RE.test(v);
const isHttpUrl = (v) => {
    if (typeof v !== 'string') return false;
    try {
        const u = new URL(v);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
};
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function publicUser(user) {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || '',
        createdAt: user.createdAt,
    };
}

module.exports = { isString, isObjectId, isHttpUrl, escapeRegex, publicUser };
