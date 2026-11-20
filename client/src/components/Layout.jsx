import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';
import Player from './Player';
import { usePlayer } from '../context/PlayerContext';

export default function Layout() {
  const { current } = usePlayer();
  return (
    <div className={`flex h-full bg-black ${current ? 'md:pb-24' : ''}`}>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col md:py-2 md:pr-2">
        <main className={`min-h-0 flex-1 overflow-y-auto bg-surface md:rounded-lg ${current ? 'pb-48 md:pb-6' : 'pb-20 md:pb-6'}`}>
          <TopBar />
          <div className="px-4 pb-6 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
      <Player />
      <MobileNav />
    </div>
  );
}
