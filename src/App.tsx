import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import HostDashboard from './pages/HostDashboard';
import Gameplay from './pages/Gameplay';
import Leaderboard from './pages/Leaderboard';
import TVDashboard from './pages/TVDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InstallPrompt from './components/pwa/InstallPrompt';

function App() {
  return (
    <Router>
      <Layout>
        <InstallPrompt />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/host" element={<HostDashboard />} />
          <Route path="/play/:roomId" element={<Gameplay />} />
          <Route path="/tv/:roomId" element={<TVDashboard />} />
          <Route path="/leaderboard/:roomId" element={<Leaderboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
