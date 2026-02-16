import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
// Placeholder pages - will be created in next steps
import Home from './pages/Home';
import HostDashboard from './pages/HostDashboard';
import Gameplay from './pages/Gameplay';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/host" element={<HostDashboard />} />
          <Route path="/play/:roomId" element={<Gameplay />} />
          <Route path="/leaderboard/:roomId" element={<Leaderboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
