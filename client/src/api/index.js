import axios from 'axios';

// All requests go to /api (proxied to Express in dev, same origin in production).
const http = axios.create({ baseURL: '/api', withCredentials: true });

// If the session expires while using the app, tell AuthContext so it can redirect to login.
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    if (err.response?.status === 401 && !url.startsWith('/auth/')) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(err);
  }
);

export const getErrorMessage = (err, fallback = 'Something went wrong. Please try again.') =>
  err?.response?.data?.message || (err?.request && !err?.response ? 'Cannot reach the server.' : fallback);

const data = (p) => p.then((r) => r.data);

export const authApi = {
  register: (body) => data(http.post('/auth/register', body)),
  login: (body) => data(http.post('/auth/login', body)),
  logout: () => data(http.post('/auth/logout')),
  me: () => data(http.get('/auth/me')),
};

export const musicApi = {
  list: (params) => data(http.get('/music', { params })),
  search: (q) => data(http.get('/music/search', { params: { q } })),
  artists: () => data(http.get('/music/artists')),
  recommended: () => data(http.get('/music/recommended')),
  genres: () => data(http.get('/music/genres')),
  recent: () => data(http.get('/music/recent')),
  mine: () => data(http.get('/music/mine')),
  add: (body) => data(http.post('/music', body)),
  remove: (id) => data(http.delete(`/music/${id}`)),
  recordPlay: (id, duration) => data(http.post(`/music/${id}/play`, { duration })),
};

export const playlistApi = {
  mine: () => data(http.get('/playlists')),
  featured: () => data(http.get('/playlists/featured')),
  get: (id) => data(http.get(`/playlists/${id}`)),
  create: (body) => data(http.post('/playlists', body)),
  update: (id, body) => data(http.patch(`/playlists/${id}`, body)),
  remove: (id) => data(http.delete(`/playlists/${id}`)),
  addSong: (id, songId) => data(http.post(`/playlists/${id}/songs`, { songId })),
  removeSong: (id, songId) => data(http.delete(`/playlists/${id}/songs/${songId}`)),
};

export const likeApi = {
  list: () => data(http.get('/likes')),
  like: (id) => data(http.post(`/likes/${id}`)),
  unlike: (id) => data(http.delete(`/likes/${id}`)),
};

export const userApi = {
  profile: () => data(http.get('/users/profile')),
  update: (body) => data(http.patch('/users/profile', body)),
};
