import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Image, Zap, Settings, Lock, X, BarChart3, Eye } from 'lucide-react';
import Card from '../components/ui/Card';
import { api } from '../lib/api';

const AdminDashboard = () => {
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [globalStats, setGlobalStats] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [adConfig, setAdConfig] = useState({
        enabled: true,
        frequency: 5, // Show ad every N plays
        bannerUrl: '',
        videoUrl: '',
        waitingScreenEnabled: true,
        redemptionQueueEnabled: true
    });

    useEffect(() => {
        if (authenticated) {
            fetchGlobalData();
            const interval = setInterval(fetchGlobalData, 3000);
            return () => clearInterval(interval);
        }
    }, [authenticated]);

    const fetchGlobalData = async () => {
        // Mock global stats - in real app, this would aggregate from all rooms
        const allRoomsObj = await api.getAllRooms?.() || {};
        const allRooms = Object.values(allRoomsObj);
        setRooms(allRooms);

        const totalPlays = allRooms.reduce((sum: number, r: any) => sum + (r.history?.length || 0), 0);
        const totalTraps = allRooms.reduce((sum: number, r: any) => {
            return sum + (r.history?.filter((h: any) => h.isTrap).length || 0);
        }, 0);

        setGlobalStats({
            totalRooms: allRooms.length,
            activeRooms: allRooms.filter((r: any) => r.status === 'playing').length,
            totalPlays,
            totalTraps,
            trapRate: totalPlays > 0 ? ((totalTraps / totalPlays) * 100).toFixed(1) : 0,
            aiPortraitsGenerated: 0 // Placeholder
        });
    };

    const handleLogin = () => {
        if (password === 'baoduymedia') {
            setAuthenticated(true);
            localStorage.setItem('admin_token', 'true');
        } else {
            alert('Sai mật khẩu!');
        }
    };

    const handleCloseRoom = async (roomId: string) => {
        if (confirm('Đóng phòng này?')) {
            await api.closeRoom?.(roomId);
            fetchGlobalData();
        }
    };

    if (!authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md p-8 bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Lock className="w-8 h-8 text-purple-400" />
                        <h1 className="text-2xl font-bold text-white">Admin Access</h1>
                    </div>
                    <p className="text-white/60 mb-6">Chỉ dành cho Bảo Duy Media</p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        placeholder="Nhập mật khẩu..."
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 mb-4"
                    />
                    <button
                        onClick={handleLogin}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-white transition-colors"
                    >
                        Đăng nhập
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-white/60">The Architect - Bảo Duy Media Command Center</p>
                </div>
                <button
                    onClick={() => {
                        setAuthenticated(false);
                        localStorage.removeItem('admin_token');
                    }}
                    className="px-4 py-2 bg-red-600/20 border border-red-500/50 rounded-lg text-red-300 hover:bg-red-600/30"
                >
                    Đăng xuất
                </button>
            </header>

            {/* Big Data Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-blue-500/30">
                    <div className="flex items-center gap-3">
                        <Users className="w-10 h-10 text-blue-400" />
                        <div>
                            <p className="text-white/60 text-sm">Total Rooms</p>
                            <p className="text-3xl font-bold text-white">{globalStats?.totalRooms || 0}</p>
                            <p className="text-green-400 text-xs">{globalStats?.activeRooms || 0} đang hoạt động</p>
                        </div>
                    </div>
                </Card>

                <Card className="border-yellow-500/30">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-10 h-10 text-yellow-400" />
                        <div>
                            <p className="text-white/60 text-sm">Total Plays</p>
                            <p className="text-3xl font-bold text-white">{globalStats?.totalPlays || 0}</p>
                            <p className="text-red-400 text-xs">Trap Rate: {globalStats?.trapRate || 0}%</p>
                        </div>
                    </div>
                </Card>

                <Card className="border-pink-500/30">
                    <div className="flex items-center gap-3">
                        <Image className="w-10 h-10 text-pink-400" />
                        <div>
                            <p className="text-white/60 text-sm">AI Portraits</p>
                            <p className="text-3xl font-bold text-white">{globalStats?.aiPortraitsGenerated || 0}</p>
                            <p className="text-cyan-400 text-xs">AuraArt Studio</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Room Management */}
            <Card>
                <div className="flex items-center gap-2 mb-4 text-xl font-bold text-white">
                    <BarChart3 className="w-6 h-6" /> Global Room Manager
                </div>
                <div className="space-y-3">
                    {rooms.length === 0 ? (
                        <p className="text-white/40 text-center py-8">Chưa có phòng nào...</p>
                    ) : (
                        rooms.map((room) => (
                            <div key={room.id} className="p-4 bg-white/5 border border-white/10 rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="text-white font-bold">Room: {room.code}</h3>
                                    <p className="text-white/60 text-sm">
                                        {room.participants?.length || 0} người chơi • {room.status}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 bg-blue-600/20 border border-blue-500/50 rounded text-blue-300 hover:bg-blue-600/30">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleCloseRoom(room.id)}
                                        className="px-3 py-1 bg-red-600/20 border border-red-500/50 rounded text-red-300 hover:bg-red-600/30"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Ad Center */}
            <Card className="border-purple-500/30">
                <div className="flex items-center gap-2 mb-4 text-xl font-bold text-purple-300">
                    <Zap className="w-6 h-6" /> Ad Center
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-white/80 text-sm block mb-2">Ad Frequency (Mỗi bao nhiêu lượt chơi?)</label>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={adConfig.frequency}
                            onChange={(e) => setAdConfig({ ...adConfig, frequency: parseInt(e.target.value) })}
                            className="w-full accent-purple-500"
                        />
                        <p className="text-white/60 text-sm mt-1">Hiện quảng cáo mỗi {adConfig.frequency} lượt</p>
                    </div>

                    <div>
                        <label className="text-white/80 text-sm block mb-2">Banner URL</label>
                        <input
                            type="text"
                            value={adConfig.bannerUrl}
                            onChange={(e) => setAdConfig({ ...adConfig, bannerUrl: e.target.value })}
                            placeholder="https://example.com/banner.jpg"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        />
                    </div>

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-white/80">
                            <input
                                type="checkbox"
                                checked={adConfig.waitingScreenEnabled}
                                onChange={(e) => setAdConfig({ ...adConfig, waitingScreenEnabled: e.target.checked })}
                                className="w-4 h-4"
                            />
                            Waiting Screen Ads
                        </label>
                        <label className="flex items-center gap-2 text-white/80">
                            <input
                                type="checkbox"
                                checked={adConfig.redemptionQueueEnabled}
                                onChange={(e) => setAdConfig({ ...adConfig, redemptionQueueEnabled: e.target.checked })}
                                className="w-4 h-4"
                            />
                            Redemption Queue Ads
                        </label>
                    </div>

                    <button
                        onClick={() => {
                            localStorage.setItem('admin_ad_config', JSON.stringify(adConfig));
                            alert('Cấu hình quảng cáo đã lưu!');
                        }}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded font-bold text-white"
                    >
                        Lưu cấu hình
                    </button>
                </div>
            </Card>

            {/* Ecosystem Config */}
            <Card className="border-cyan-500/30">
                <div className="flex items-center gap-2 mb-4 text-xl font-bold text-cyan-300">
                    <Settings className="w-6 h-6" /> Ecosystem Config
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-white/80 text-sm block mb-2">AuraArt Studio API Endpoint</label>
                        <input
                            type="text"
                            placeholder="https://auraart.example.com/api/generate"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        />
                    </div>
                    <p className="text-white/40 text-sm italic">Voucher management coming soon...</p>
                </div>
            </Card>
        </div>
    );
};

export default AdminDashboard;
