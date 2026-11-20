import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LibraryProvider } from './context/LibraryContext';
import { PlayerProvider } from './context/PlayerContext';
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import LikedSongs from './pages/LikedSongs';
import PlaylistDetails from './pages/PlaylistDetails';
import Profile from './pages/Profile';
import AddSong from './pages/AddSong';
import NotFound from './pages/NotFound';

// Library + Player providers sit inside ProtectedRoute and above Layout, so the audio element
// survives page navigation but is torn down on logout.
function AppShell() {
  return (
    <ProtectedRoute>
      <LibraryProvider>
        <PlayerProvider>
          <Layout />
        </PlayerProvider>
      </LibraryProvider>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="library" element={<Library />} />
            <Route path="liked" element={<LikedSongs />} />
            <Route path="playlist/:id" element={<PlaylistDetails />} />
            <Route path="profile" element={<Profile />} />
            <Route path="artist" element={<AddSong />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
