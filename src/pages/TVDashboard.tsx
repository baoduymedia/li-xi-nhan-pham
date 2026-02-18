import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Trophy, Activity, Users, Star } from 'lucide-react';
import { api } from '../lib/api';

const TVDashboard = () => {
    const { roomId } = useParams();
    const [stats, setStats] = useState<any>(null);
    const [recentEvents, setRecentEvents] = useState<any[]>([]);

    useEffect(() => {
        if (!roomId) return;

        const fetchData = async () => {
            const data = await api.getRoomStats(roomId);
            if (data) {
                setStats(data);

                // Process recent events (mock logic for now based on participants)
                // In a real app, we'd have a separate event log
                const opened = data.participants.filter((p: any) => p.result).map((p: any) => ({
                    type: p.result.isTrap ? 'trap' : 'win',
                    player: p.playerName,
                    amount: p.result.amount,
                    trap: p.result.trap,
                    timestamp: p.result.timestamp || Date.now()
                })).sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, 5);
                setRecentEvents(opened);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, [roomId]);

    if (!stats) return <div className="text-white text-4xl flex items-center justify-center min-h-screen">Loading TV Interface...</div>;

    const winners = stats.participants
        .filter((p: any) => p.result && !p.result.isTrap)
        .sort((a: any, b: any) => b.result.amount - a.result.amount)
        .slice(0, 5);

    const victims = stats.participants
        .filter((p: any) => p.result && p.result.isTrap)
        .slice(0, 5);

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden font-sans flex flex-col">
            {/* Top Bar */}
            <div className="h-24 bg-gradient-to-r from-red-900 to-black border-b border-yellow-500/30 flex items-center justify-between px-10 relative z-10">
                <div className="flex items-center gap-6">
                    <img src="/logo.png" alt="" className="h-16 w-16 opacity-0" /> {/* Placeholder */}
                    <div>
                        <h1 className="text-4xl font-black text-yellow-500 uppercase tracking-widest">Lộc Xuân 2026</h1>
                        <p className="text-white/60 text-lg">Phòng: <span className="text-white font-mono font-bold">{roomId}</span></p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-sm text-white/50 uppercase">Người chơi</p>
                        <p className="text-3xl font-bold flex items-center justify-end gap-2">
                            <Users className="w-6 h-6 text-cyan-400" /> {stats.participants.length}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-white/50 uppercase">Đã mở</p>
                        <p className="text-3xl font-bold flex items-center justify-end gap-2">
                            <Activity className="w-6 h-6 text-green-400" /> {stats.metrics.openedCount}/{stats.metrics.totalEnvelopes}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 grid grid-cols-12 gap-8 p-8 relative">
                {/* Background Video/Effect */}
                <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse"></div>

                {/* Left: Leaderboard (4 cols) */}
                <div className="col-span-4 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col gap-6 z-10">
                    <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-3 uppercase tracking-wider border-b border-white/10 pb-4">
                        <Trophy className="w-8 h-8" /> Bảng Vàng
                    </h2>
                    <div className="space-y-4 flex-1 overflow-hidden relative">
                        <AnimatePresence>
                            {winners.map((p: any, i: number) => (
                                <motion.div
                                    key={p.socketId || i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-gradient-to-r from-yellow-900/40 to-black/40 p-4 rounded-xl border border-yellow-500/20 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-black ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-300' : i === 2 ? 'bg-orange-400' : 'bg-white/20 text-white'}`}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{p.playerName}</p>
                                            <p className="text-xs text-white/50">Karma Score: {p.result.karmaScore || '?'}</p>
                                        </div>
                                    </div>
                                    <p className="font-mono text-xl text-yellow-400 font-bold">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.result.amount)}
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Middle: Live Feed / Highlight (5 cols) */}
                <div className="col-span-4 flex flex-col gap-6 z-10">
                    {/* Recent Highlight */}
                    <div className="flex-1 bg-gradient-to-b from-purple-900/20 to-black rounded-3xl border border-purple-500/30 p-6 flex flex-col relative overflow-hidden">
                        <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2"><Star className="animate-spin-slow" /> Mới Nhất</h2>
                        <div className="space-y-3">
                            {recentEvents.map((e, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-xl border-l-4 ${e.type === 'win' ? 'border-green-500 bg-green-900/10' : 'border-red-500 bg-red-900/10'}`}
                                >
                                    <p className="text-sm text-white/60 mb-1 flex justify-between">
                                        <span>{e.player}</span>
                                        <span>{new Date(e.timestamp).toLocaleTimeString()}</span>
                                    </p>
                                    <p className={`text-xl font-bold ${e.type === 'win' ? 'text-white' : 'text-red-400'}`}>
                                        {e.type === 'win' ? `Đã nhận ${new Intl.NumberFormat('vi-VN').format(e.amount)} VNĐ` : `BỊ TROLL: ${e.trap?.content || 'Unknown'}`}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Hall of Shame */}
                    <div className="h-1/3 bg-red-900/10 border border-red-500/20 rounded-3xl p-6">
                        <h2 className="text-lg font-bold text-red-400 mb-2 uppercase">Hội Nạn Nhân</h2>
                        <div className="flex gap-2 flex-wrap">
                            {victims.map((v: any, i: number) => (
                                <span key={i} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm border border-red-500/30">
                                    {v.playerName} 💀
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: QR Code & CTA (4 cols) */}
                <div className="col-span-4 flex flex-col gap-6 z-10">
                    <div className="bg-white p-6 rounded-3xl flex flex-col items-center justify-center text-black flex-1 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                        <p className="text-2xl font-black uppercase mb-6 tracking-widest text-center">Quét để tham gia</p>
                        <QRCodeSVG value={`${window.location.origin}/play/${roomId}`} size={300} />
                        <p className="mt-8 text-xl font-mono font-bold bg-black text-white px-6 py-2 rounded-xl">Phòng: {roomId}</p>
                    </div>
                </div>
            </div>

            {/* Ticker at bottom */}
            <div className="h-12 bg-yellow-500/10 border-t border-yellow-500/20 flex items-center overflow-hidden">
                <motion.div
                    animate={{ x: ["100%", "-100%"] }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="whitespace-nowrap text-yellow-200 text-lg font-mono px-4"
                >
                    CHÚC MỪNG NĂM MỚI 2026 • LÌ XÌ NHÂN PHẨM • AI AURA SCAN NOW AVAILABLE • QUÉT MẶT NGAY NHẬN BUFF NHÂN PHẨM • CHÚC MỪNG NĂM MỚI 2026
                </motion.div>
            </div>
        </div>
    );
};

export default TVDashboard;
