import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { AlertTriangle, Coins, Activity, BarChart3, Bot, Sliders, Gavel, EyeOff, Play, Pause } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { api } from '../lib/api';
import { TRAP_LIBRARY } from '../lib/trap-studio';

const DENOMINATIONS = [
    { value: 2000, label: '2K', color: 'bg-slate-400' },
    { value: 5000, label: '5K', color: 'bg-blue-400' },
    { value: 10000, label: '10K', color: 'bg-yellow-600' },
    { value: 20000, label: '20K', color: 'bg-blue-600' },
    { value: 50000, label: '50K', color: 'bg-pink-400' },
    { value: 100000, label: '100K', color: 'bg-green-600' },
    { value: 200000, label: '200K', color: 'bg-orange-500' },
    { value: 500000, label: '500K', color: 'bg-cyan-500' },
];

const HostDashboard = () => {
    const [counts, setCounts] = useState<Record<number, number>>(
        DENOMINATIONS.reduce((acc, d) => ({ ...acc, [d.value]: 0 }), {})
    );

    const [traps, setTraps] = useState<any[]>([]); // Initial traps, synced with API later
    const [newTrap, setNewTrap] = useState('');
    const [newTrapType, setNewTrapType] = useState<'text' | 'action' | 'bankrupt'>('text');
    const [step, setStep] = useState<'settings' | 'lobby' | 'monitor'>('settings');
    const [roomId, setRoomId] = useState('');
    const [roomCode, setRoomCode] = useState('');

    // Monitor State
    const [stats, setStats] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'setup' | 'monitor' | 'universe' | 'redemption' | 'godmode'>('monitor');

    // GOD MODE STATE
    const [weights, setWeights] = useState<Record<string, number>>({});
    const [showGodMode, setShowGodMode] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if ((step === 'monitor' || step === 'lobby') && roomId) {
                const data = await api.getRoomStats(roomId);
                setStats(data);
                if (data?.weights) setWeights(data.weights);
                if (step === 'lobby' && data?.status === 'playing') setStep('monitor');
            }
        };

        if (roomId) {
            fetchData();
            const unsubscribe = api.subscribe(fetchData);
            const interval = setInterval(fetchData, 2000);
            return () => { unsubscribe(); clearInterval(interval); };
        }
    }, [step, roomId]);

    const handleCreateRoom = async () => {
        try {
            const settings = { counts, traps, moneyItems: [], trapItems: [] };
            const room = await api.createRoom(settings);
            setRoomId(room.id);
            setRoomCode(room.code);
            setStep('lobby');
        } catch (error) {
            console.error('Failed to create room:', error);
            alert('Lỗi tạo phòng. Vui lòng thử lại.');
        }
    };

    const handleStartGame = async () => {
        if (!roomId) return;
        await api.startGame(roomId);
        setStep('monitor');
    };

    // GOD MODE HANDLERS
    const updateWeight = async (key: string, val: number) => {
        const newWeights = { ...weights, [key]: val };
        setWeights(newWeights);
        await api.setProbabilities(roomId, newWeights);
    };

    const applyPreset = async (preset: 'generous' | 'challenge' | 'bankrupt') => {
        if (!roomId) return;
        if (preset === 'generous') {
            await updateWeight('500000', 100);
            await updateWeight('200000', 80);
            await updateWeight('TRAP', 5);
        } else if (preset === 'challenge') {
            await updateWeight('TRAP', 100);
            await updateWeight('500000', 1);
        } else {
            // Bankrupt: low chance for everything except traps/losses
            await updateWeight('TRAP', 150); // Nightmare
            await updateWeight('10000', 50);
            await updateWeight('500000', 0);
        }
        alert(`Đã áp dụng chế độ: ${preset.toUpperCase()}`);
    };

    const handleLiveSwap = async (content: string) => {
        if (!roomId) return;
        await api.liveSwapTrap(roomId, 0, content); // 0 envelopeId placeholder logic in api.ts
        alert(`Next Trap Set: ${content}`);
    };

    const totalMoney = Object.entries(counts).reduce((sum, [val, count]) => sum + Number(val) * count, 0);
    const totalEnvelopes = Object.values(counts).reduce((sum, count) => sum + count, 0) + traps.length;

    const handleCountChange = (value: number, delta: number) => {
        setCounts(prev => ({
            ...prev,
            [value]: Math.max(0, (prev[value] || 0) + delta)
        }));
    };

    const addTrap = () => {
        if (newTrap.trim()) {
            setTraps([...traps, {
                id: Math.random().toString(36).substr(2, 9),
                type: newTrapType,
                content: newTrap.trim()
            }]);
            setNewTrap('');
        }
    };

    // Trap Studio Helper
    const addLibraryTrap = (content: string) => {
        setNewTrap(content);
        setNewTrapType('action'); // Default to action for library items
        addTrap();
    };



    const handleAIAction = async (insight: any) => {
        if (!roomId || !insight.action) return;
        await api.manipulateInventory(roomId, insight.action);
        alert(`Đã thực thi: ${insight.action}`);
    };




    if (step === 'monitor') {
        const remainingMoney = stats ? Object.entries(stats.remaining).reduce((sum: number, [key, count]: [string, any]) => {
            return key !== 'TRAP' ? sum + Number(key) * (count as number) : sum;
        }, 0) : totalMoney;

        // Calculate total inventory value for budget (use initial or fallback to totalMoney)
        const totalInventoryValue = stats?.initial ? Object.entries(stats.initial).reduce((sum, [key, count]) => {
            if (key === 'TRAP') return sum;
            return sum + (parseInt(key) * (count as number));
        }, 0) : totalMoney;

        return (
            <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
                {/* Budget Calculator Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-premium p-6 rounded-2xl border-2 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                >
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-green-400 mb-1">💰 Tổng ngân sách cần chuẩn bị</h3>
                            <p className="text-white/60 text-sm">Số tiền mặt host cần mang theo</p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalInventoryValue)}
                            </div>
                            <div className="flex gap-4 text-sm text-white/70">
                                <span>Số bao: {stats?.totalInitial || totalEnvelopes}</span>
                                <span>Dự phòng 20%: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalInventoryValue * 0.2)}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <header className="flex items-center justify-between glass-premium p-6 rounded-2xl sticky top-4 z-40">
                    <div onClick={() => setShowGodMode(!showGodMode)} className="cursor-pointer">
                        <h1 className="text-3xl font-serif text-gold-premium flex items-center gap-2">
                            {showGodMode ? <EyeOff className="text-red-500" /> : <Activity className="text-green-500" />}
                            Live Monitor: {roomCode}
                        </h1>
                        <div className="flex gap-4 mt-2">
                            <span className="text-white/60">Đã mở: {stats ? (stats.totalInitial - stats.totalRemaining) : 0}/{stats?.totalInitial || totalEnvelopes}</span>
                            <span className="text-yellow-400 font-bold">Còn lại: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(remainingMoney)}</span>

                            {/* Game Control */}
                            {stats && (
                                <div className="flex gap-2 ml-4 border-l border-white/10 pl-4">
                                    {stats.status === 'waiting' && <button onClick={handleStartGame} className="bg-green-600 p-2 rounded hover:bg-green-500"><Play size={16} /></button>}
                                    {stats.status !== 'waiting' && stats.status !== 'ended' && (
                                        <button
                                            onClick={() => api.pauseGame(roomId, stats.status !== 'paused')}
                                            className={`${stats.status === 'paused' ? 'bg-yellow-500 text-black' : 'bg-orange-500'} p-2 rounded hover:brightness-110`}
                                        >
                                            {stats.status === 'paused' ? <Play size={16} /> : <Pause size={16} />}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex bg-black/40 rounded-full p-1 border border-white/10 overflow-x-auto">
                        <button onClick={() => setActiveTab('monitor')} className={`px-4 py-2 rounded-full font-bold transition-all ${activeTab === 'monitor' ? 'bg-yellow-500 text-red-900 shadow-lg' : 'text-white/40 hover:text-white'}`}>Tổng quan</button>
                        <button onClick={() => setActiveTab('godmode')} className={`px-4 py-2 rounded-full font-bold transition-all ${activeTab === 'godmode' ? 'bg-purple-600 text-white shadow-lg animate-pulse' : 'text-purple-400/60 hover:text-purple-400'}`}>⚡️ GOD MODE</button>
                        <button onClick={() => setActiveTab('universe')} className={`px-4 py-2 rounded-full font-bold transition-all ${activeTab === 'universe' ? 'bg-yellow-500 text-red-900 shadow-lg' : 'text-white/40 hover:text-white'}`}>Matrix</button>
                        <button onClick={() => setActiveTab('redemption')} className={`px-4 py-2 rounded-full font-bold transition-all ${activeTab === 'redemption' ? 'bg-red-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>Hồi sinh</button>
                    </div>
                </header>

                {/* GOD MODE DASHBOARD */}
                {activeTab === 'godmode' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                            <div className="flex items-center gap-2 mb-6 text-xl font-bold text-purple-300 border-b border-purple-500/20 pb-2">
                                <Sliders className="w-6 h-6" /> Probability Sliders (Trọng số thực)
                            </div>

                            <div className="space-y-6">
                                {/* Presets */}
                                <div className="flex gap-2 mb-6">
                                    <button onClick={() => applyPreset('generous')} className="flex-1 py-2 bg-green-900/40 border border-green-500/50 rounded hover:bg-green-800 text-green-300 text-sm font-bold uppercase">Hào Phóng</button>
                                    <button onClick={() => applyPreset('challenge')} className="flex-1 py-2 bg-yellow-900/40 border border-yellow-500/50 rounded hover:bg-yellow-800 text-yellow-300 text-sm font-bold uppercase">Thử Thách</button>
                                    <button onClick={() => applyPreset('bankrupt')} className="flex-1 py-2 bg-red-900/40 border border-red-500/50 rounded hover:bg-red-800 text-red-300 text-sm font-bold uppercase">Cháy Túi 💀</button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-red-400 font-bold flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div> TRAP (Bẫy)</span>
                                        <span className="font-mono text-xl">{weights['TRAP'] || 20}</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="200" step="10"
                                        value={weights['TRAP'] || 20}
                                        onChange={(e) => updateWeight('TRAP', Number(e.target.value))}
                                        className="w-full accent-red-500 h-2 bg-white/10 rounded cursor-pointer"
                                    />

                                    <div className="h-px bg-white/10 my-4"></div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-cyan-400 font-bold">500K Log (Jackpot)</span>
                                        <span className="font-mono text-xl">{weights['500000'] || 20}</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="200" step="10"
                                        value={weights['500000'] || 20}
                                        onChange={(e) => updateWeight('500000', Number(e.target.value))}
                                        className="w-full accent-cyan-400 h-2 bg-white/10 rounded cursor-pointer"
                                    />

                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-pink-400 font-bold">50K (Vui vẻ)</span>
                                        <span className="font-mono text-xl">{weights['50000'] || 20}</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="200" step="10"
                                        value={weights['50000'] || 20}
                                        onChange={(e) => updateWeight('50000', Number(e.target.value))}
                                        className="w-full accent-pink-400 h-2 bg-white/10 rounded cursor-pointer"
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                            <div className="flex items-center gap-2 mb-6 text-xl font-bold text-red-300 border-b border-red-500/20 pb-2">
                                <Gavel className="w-6 h-6" /> Trap Studio (Live Swap)
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm text-white/50">Chọn bẫy để tráo ngay lập tức cho người tiếp theo mở.</p>
                                <div className="h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                    {TRAP_LIBRARY.map((trap, i) => (
                                        <div
                                            key={i}
                                            onClick={() => handleLiveSwap(trap.content)}
                                            className="p-3 rounded border border-white/10 bg-white/5 hover:bg-red-900/40 hover:border-red-500 cursor-pointer transition-all group"
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className="font-bold text-white/90 group-hover:text-red-300">{trap.content}</span>
                                                <span className="text-[10px] uppercase bg-white/10 px-1.5 py-0.5 rounded">{trap.intensity === 3 ? '💀 Hard' : 'Easy'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {activeTab === 'monitor' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Monitor Content (Existing) */}
                        <Card className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-4 text-xl font-bold text-yellow-300">
                                <BarChart3 className="w-6 h-6" /> Kho Lì Xì (Realtime)
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {DENOMINATIONS.map(d => {
                                    const remaining = stats?.remaining[d.value] || 0;
                                    return (
                                        <div key={d.value} className={`p-4 rounded-xl border ${remaining === 0 ? 'border-white/5 bg-white/5 opacity-40' : 'border-yellow-500/30 bg-red-900/40'} flex flex-col items-center`}>
                                            <span className={`text-lg font-bold ${d.color.replace('bg-', 'text-')}`}>{d.label}</span>
                                            <span className="text-2xl font-black text-white">{remaining}</span>
                                        </div>
                                    )
                                })}
                                <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/40 flex flex-col items-center">
                                    <span className="text-lg font-bold text-red-500">TRAPS</span>
                                    <span className="text-2xl font-black text-white">{stats?.remaining['TRAP'] || 0}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Live Feed + AI Advisor */}
                        <Card className="h-[500px] flex flex-col relative">
                            <div className="flex items-center gap-2 mb-4 text-xl font-bold text-white">
                                <Activity className="w-6 h-6 text-green-400" /> Nhật ký mở
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-20">
                                {stats?.history?.slice().reverse().map((event: any, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`p-3 rounded-lg border ${event.isTrap ? 'border-red-500/30 bg-red-950/50' : 'border-yellow-500/20 bg-yellow-900/20'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-white">{event.playerName}</span>
                                            <span className="text-xs text-white/40">{new Date(event.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <div className={`text-lg font-black mt-1 ${event.isTrap ? 'text-red-400' : 'text-yellow-400'}`}>
                                            {event.isTrap ? 'BỊ TROLL!' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(event.amount)}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* AI Floating Panel inside Monitor */}
                            <AnimatePresence>
                                {stats?.aiInsights && stats.aiInsights.length > 0 && (
                                    <motion.div
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="absolute bottom-4 left-4 right-4 bg-purple-900/90 backdrop-blur-xl border border-purple-500/50 rounded-xl p-3 shadow-2xl z-20"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Bot className="w-4 h-4 text-purple-300 animate-pulse" />
                                            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">AI Strategist</span>
                                        </div>
                                        <div className="space-y-2 max-h-[150px] overflow-y-auto">
                                            {stats.aiInsights.map((insight: any) => (
                                                <div key={insight.id} className="text-sm text-white/90 bg-black/20 p-2 rounded flex justify-between items-center gap-2">
                                                    <span>{insight.message}</span>
                                                    {insight.action && (
                                                        <button onClick={() => handleAIAction(insight)} className="px-2 py-1 bg-purple-600 rounded text-[10px] font-bold uppercase hover:bg-purple-500 whitespace-nowrap">
                                                            {insight.action}
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </div>
                )}

                {/* Other Tabs (Universe/Redemption) - Simplified for brevity in this view, keeping original logic if not GodMode */}
                {activeTab === 'universe' && (
                    <Card>
                        <div className="flex items-center gap-2 mb-6 text-xl font-bold text-purple-300">
                            <span className="text-2xl">🌌</span> Đa Vũ Trụ Lì Xì (Matrix)
                        </div>
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                            {stats?.envelopes?.map((env: any) => (
                                <div key={env.id} className={`aspect-[3/4] rounded border p-2 flex items-center justify-center text-center ${env.status === 'opened' ? (env.isTrap ? 'bg-red-900/40 border-red-500' : 'bg-green-900/40 border-green-500') : 'bg-white/5 border-white/10'}`}>
                                    {env.status === 'opened' ? (
                                        <div>
                                            <p className="text-[10px] text-white/60 mb-1">{env.openedBy}</p>
                                            <p className="font-bold text-white">{env.isTrap ? 'TROLL' : env.value}</p>
                                        </div>
                                    ) : (
                                        <span className="text-white/20">#{env.id}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {activeTab === 'redemption' && (
                    <Card>
                        <div className="flex items-center gap-2 mb-6 text-xl font-bold text-red-500">
                            <span className="text-2xl">🔥</span> Hồi sinh & Thử thách
                        </div>

                        {/* Redemption Queue */}
                        <div className="space-y-4">
                            {stats?.participants
                                ?.filter((p: any) => p.redemption && p.redemption.status === 'pending')
                                .map((p: any) => (
                                    <div key={p.playerName} className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-white font-bold text-lg">{p.playerName}</h3>
                                                <p className="text-white/60 text-sm">Dính bẫy: {p.redemption.trapContent || 'Unknown'}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-300 text-xs font-bold uppercase">
                                                Đang chờ
                                            </span>
                                        </div>

                                        {p.redemption.challenge && (
                                            <div className="mb-3 p-3 bg-black/30 rounded">
                                                <p className="text-sm text-white/80">
                                                    <span className="font-bold text-cyan-400">Thử thách: </span>
                                                    {p.redemption.challenge}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <button
                                                onClick={async () => {
                                                    const confirmed = confirm(`Duyệt hồi sinh cho ${p.playerName}?`);
                                                    if (confirmed) {
                                                        await api.approveRedemption(roomId!, p.playerName);
                                                        alert(`Đã duyệt hồi sinh cho ${p.playerName}!`);
                                                    }
                                                }}
                                                className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded font-bold text-white transition-colors"
                                            >
                                                ✓ Duyệt
                                            </button>
                                            <button
                                                onClick={() => {
                                                    alert('Chức năng từ chối sẽ được thêm sau');
                                                }}
                                                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded font-bold text-white/70 transition-colors"
                                            >
                                                ✗ Từ chối
                                            </button>
                                        </div>
                                    </div>
                                ))}

                            {(!stats?.participants ||
                                !stats.participants.some((p: any) => p.redemption && p.redemption.status === 'pending')) && (
                                    <div className="text-center text-white/40 italic py-8">
                                        Chưa có ai cần hồi sinh...
                                    </div>
                                )}
                        </div>
                    </Card>
                )}
            </div>
        );
    }

    // SETUP & LOBBY VIEW (Standard)
    if (step === 'lobby') {
        const participantCount = stats?.participantCount || 0;
        return (
            <div className="w-full max-w-4xl mx-auto space-y-6 text-center pt-20">
                <h1 className="text-4xl font-bold text-white mb-4">Mã Phòng: {roomCode}</h1>
                <div className="bg-white p-4 rounded-xl inline-block mx-auto">
                    <QRCodeSVG value={`${window.location.origin}/play/${roomCode}`} size={250} />
                </div>
                <div className="text-white/60">Người chơi: {participantCount}</div>
                <Button onClick={handleStartGame} size="lg" className="w-64 mx-auto mt-8">BẮT ĐẦU</Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto pb-20">
            <h1 className="text-3xl font-bold text-white mb-6 text-center">Thiết lập Lì Xì (God Mode Integrated)</h1>
            <div className="space-y-6">
                <Card>
                    <div className="flex items-center gap-2 mb-4 text-xl font-bold text-yellow-300 border-b border-white/10 pb-2">
                        <Coins className="w-6 h-6 text-yellow-400" /> Phân bổ tiền
                    </div>
                    <div className="space-y-4">
                        {DENOMINATIONS.map((d) => (
                            <div key={d.value} className="flex items-center gap-4">
                                <div className={`w-16 py-1 px-2 rounded text-center text-xs font-bold text-white ${d.color}`}>{d.label}</div>
                                <input type="range" min="0" max="20" value={counts[d.value] || 0} onChange={(e) => handleCountChange(d.value, parseInt(e.target.value))} className="flex-1 accent-yellow-400 h-2 bg-white/10 rounded-lg cursor-pointer" />
                                <span className="w-8 text-center font-bold text-white">{counts[d.value] || 0}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-2 mb-4 text-xl font-bold text-red-300 border-b border-white/10 pb-2">
                        <AlertTriangle className="w-6 h-6" /> Lì xì "Bẫy"
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTrap}
                                onChange={(e) => setNewTrap(e.target.value)}
                                placeholder="Nhập nội dung bẫy... (Nhập ID để target, vd: '5:Hát')"
                                className="flex-1 bg-black/30 border border-white/20 rounded px-3 py-2 text-white"
                            />
                            <Button onClick={() => {
                                // Check for Target Syntax "ID:Content"
                                if (newTrap.includes(':')) {
                                    const [idStr, content] = newTrap.split(':');
                                    const id = parseInt(idStr.trim());
                                    if (!isNaN(id) && content.trim()) {
                                        api.liveSwapTrap(roomId || '', id, content.trim()).then(() => {
                                            alert(`Đã gài bẫy "${content.trim()}" vào phong bao #${id}`);
                                            setNewTrap('');
                                        });
                                        return;
                                    }
                                }
                                addTrap();
                            }}>Thêm</Button>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {TRAP_LIBRARY.slice(0, 5).map(t => (
                                <button key={t.id} onClick={() => addLibraryTrap(t.content)} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-white/70 whitespace-nowrap transition-colors">
                                    {t.content}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                <Button className="w-full py-4 text-xl" size="lg" onClick={handleCreateRoom} disabled={totalEnvelopes === 0}>Tạo Phòng & Lấy QR</Button>
            </div>
        </div>
    );
};

export default HostDashboard;
