import { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Trash2, AlertTriangle, Coins, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { api } from '../lib/api';

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

    const [traps, setTraps] = useState<string[]>(['Vé quét nhà 1 tuần', 'Một nụ cười']);
    const [newTrap, setNewTrap] = useState('');
    const [step, setStep] = useState<'settings' | 'lobby'>('settings');
    const [roomId, setRoomId] = useState('');
    const [roomCode, setRoomCode] = useState('');

    const handleCreateRoom = async () => {
        try {
            const settings = { counts, traps };
            const room = await api.createRoom(settings);
            setRoomId(room.id);
            setRoomCode(room.code);
            setStep('lobby');
        } catch (error) {
            console.error('Failed to create room:', error);
            alert('Lỗi tạo phòng. Vui lòng thử lại.');
        }
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
            setTraps([...traps, newTrap.trim()]);
            setNewTrap('');
        }
    };

    const removeTrap = (index: number) => {
        setTraps(traps.filter((_, i) => i !== index));
    };

    const copyRoomLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/play/${roomId}`);
        // Ideally show a toast here
    };

    if (step === 'lobby') {
        return (
            <div className="w-full max-w-4xl mx-auto space-y-6">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Phòng chờ: {roomCode}</h1>
                        <p className="text-white/60">Đang đợi người chơi tham gia...</p>
                    </div>
                    <Button variant="secondary" onClick={() => { }} className="gap-2">
                        <PlayIcon /> Bắt đầu Lì Xì
                    </Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* QR Code Panel */}
                    <Card className="flex flex-col items-center justify-center gap-4 bg-white/10">
                        <div className="bg-white p-4 rounded-xl">
                            <QRCodeSVG value={`${window.location.origin}/play/${roomCode}`} size={200} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-white/60 mb-2">Quét mã để tham gia</p>
                            <Button size="sm" variant="outline" onClick={copyRoomLink} className="gap-2">
                                <Copy className="w-4 h-4" /> Copy Link
                            </Button>
                        </div>
                    </Card>

                    {/* Player List */}
                    <Card className="md:col-span-2 h-[400px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Users className="w-5 h-5" /> Người chơi (0)
                            </h3>
                        </div>
                        <div className="flex-1 flex items-center justify-center text-white/40 border-2 border-dashed border-white/10 rounded-xl">
                            Chưa có ai tham gia...
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto pb-20">
            <h1 className="text-3xl font-bold text-white mb-6 text-center">Thiết lập Lì Xì</h1>

            <div className="space-y-6">
                {/* Budget Summary - Sticky Top */}
                <Card className="sticky top-4 z-20 bg-black/40 backdrop-blur-xl border-yellow-500/30 shadow-yellow-500/10">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-white/60">Tổng ngân sách</p>
                            <p className="text-2xl font-bold text-yellow-400">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalMoney)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-white/60">Số bao lì xì</p>
                            <p className="text-2xl font-bold text-white">{totalEnvelopes}</p>
                        </div>
                    </div>
                </Card>

                {/* Money Settings */}
                <Card>
                    <div className="flex items-center gap-2 mb-4 text-lg font-bold">
                        <Coins className="w-5 h-5 text-yellow-400" /> Phân bổ tiền
                    </div>
                    <div className="space-y-4">
                        {DENOMINATIONS.map((d) => (
                            <div key={d.value} className="flex items-center gap-4">
                                <div className={`w-16 py-1 px-2 rounded text-center text-xs font-bold text-white shadow-sm ${d.color}`}>
                                    {d.label}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="20"
                                        value={counts[d.value] || 0}
                                        onChange={(e) => setCounts({ ...counts, [d.value]: parseInt(e.target.value) })}
                                        className="w-full accent-red-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-24 justify-end">
                                    <button
                                        onClick={() => handleCountChange(d.value, -1)}
                                        className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center"
                                    >
                                        -
                                    </button>
                                    <span className="w-6 text-center font-mono">{counts[d.value] || 0}</span>
                                    <button
                                        onClick={() => handleCountChange(d.value, 1)}
                                        className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Traps Settings */}
                <Card>
                    <div className="flex items-center gap-2 mb-4 text-lg font-bold text-red-400">
                        <AlertTriangle className="w-5 h-5" /> Lì xì "Bẫy" (Vui vẻ)
                    </div>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newTrap}
                            onChange={(e) => setNewTrap(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addTrap()}
                            placeholder="VD: Chúc bạn may mắn lần sau..."
                            className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
                        />
                        <Button size="sm" onClick={addTrap}>Thêm</Button>
                    </div>

                    <div className="flex flex-col gap-2">
                        {traps.map((trap, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center justify-between bg-white/5 px-4 py-2 rounded-lg border border-white/5"
                            >
                                <span>{trap}</span>
                                <button onClick={() => removeTrap(idx)} className="text-white/40 hover:text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                        {traps.length === 0 && <p className="text-white/30 text-sm italic">Chưa có lì xì bẫy nào.</p>}
                    </div>
                </Card>

                <Button
                    className="w-full py-4 text-lg"
                    size="lg"
                    onClick={handleCreateRoom}
                    disabled={totalEnvelopes === 0}
                >
                    Tạo Phòng & Lấy QR
                </Button>
            </div>
        </div>
    );
};

// Helper component for Play icon
const PlayIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 3L19 12L5 21V3Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default HostDashboard;
