import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Shuffle, Eye, EyeOff, AlertTriangle, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import confetti from 'canvas-confetti';

interface EnvelopeData {
    id: number;
    amount: number;
    wish: string;
    isTrap: boolean;
    opened: boolean;
}

const Gameplay = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [joined, setJoined] = useState(false);

    // Game State
    const [deck, setDeck] = useState<EnvelopeData[]>([]);
    const [currentResult, setCurrentResult] = useState<{ amount: number; wish: string; isTrap: boolean } | null>(null);
    const [godMode, setGodMode] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);

    // Initialize Deck
    useEffect(() => {
        // Create a fun initial deck with mixed rewards
        const initialDeck: EnvelopeData[] = [
            { id: 1, amount: 500000, wish: "Đại gia chân đất!", isTrap: false, opened: false },
            { id: 2, amount: 20000, wish: "Của ít lòng nhiều.", isTrap: false, opened: false },
            { id: 3, amount: 0, wish: "Chúc bạn may mắn lần sau!", isTrap: true, opened: false },
            { id: 4, amount: 100000, wish: "Tiền vào như nước!", isTrap: false, opened: false },
            { id: 5, amount: 50000, wish: "Lộc lá đầy nhà.", isTrap: false, opened: false },
            { id: 6, amount: 0, wish: "Voucher Rửa Bát 1 Tháng", isTrap: true, opened: false },
        ];
        setDeck(initialDeck);
    }, []);

    const handleJoin = async () => {
        if (name.trim()) {
            try {
                await api.joinRoom(roomId || '', name);
                setJoined(true);
            } catch (e) {
                alert('Không thể tham gia phòng.');
                console.error(e);
            }
        }
    };

    const handleShuffle = () => {
        setIsShuffling(true);
        setTimeout(() => {
            const shuffled = [...deck].sort(() => Math.random() - 0.5);
            setDeck(shuffled);
            setIsShuffling(false);
        }, 800);
    };

    const handleOpen = async (envelope: EnvelopeData) => {
        if (envelope.opened || currentResult || !roomId) return;

        try {
            const res = await api.openEnvelope(roomId, 'current-player-id', {
                amount: envelope.amount,
                wish: envelope.wish,
                isTrap: envelope.isTrap
            });

            setDeck(deck.map(e => e.id === envelope.id ? { ...e, opened: true } : e));
            setCurrentResult(res as any);

            if (!res.isTrap) {
                const duration = 3000;
                const end = Date.now() + duration;

                const frame = () => {
                    confetti({
                        particleCount: 2,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: ['#FFD700', '#D4AF37', '#FFFFFF']
                    });
                    confetti({
                        particleCount: 2,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: ['#FFD700', '#D4AF37', '#FFFFFF']
                    });
                    if (Date.now() < end) requestAnimationFrame(frame);
                };
                frame();
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (!joined) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-lg mx-auto px-4">
                <div className="w-full glass-premium p-10 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden">
                    {/* Decorative Background for Modal */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500"></div>

                    <h2 className="text-4xl font-serif font-bold text-center text-gold-premium mb-2">Xin Chào</h2>
                    <p className="text-center text-white/60 mb-8 font-sans">Chiếc tên làm nên nhân phẩm</p>

                    <input
                        type="text"
                        placeholder="Nhập tên của bạn..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/30 border border-yellow-500/20 rounded-xl px-6 py-5 text-center text-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-400 mb-8 transition-all font-serif"
                    />
                    <button
                        onClick={handleJoin}
                        className="w-full py-5 text-xl btn-neumorphic"
                    >
                        Bắt Đầu
                    </button>

                    <button onClick={() => navigate('/')} className="w-full mt-4 text-sm text-white/40 hover:text-white transition-colors">
                        Quay về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    // Result Overlay (The Reveal)
    if (currentResult) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, rotateX: 90 }}
                    animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                    className={`w-full max-w-md relative ${currentResult.isTrap ? 'bg-gray-900 border-gray-700' : 'bg-gradient-to-b from-red-900 to-red-950 border-yellow-500'} border-2 rounded-2xl shadow-2xl overflow-hidden`}
                >
                    {/* Header Strip */}
                    <div className={`h-2 w-full ${currentResult.isTrap ? 'bg-gray-600' : 'bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300'}`}></div>

                    <div className="p-10 text-center relative z-10">
                        {currentResult.isTrap ? (
                            <>
                                <AlertTriangle className="w-24 h-24 text-gray-500 mx-auto mb-6 animate-pulse" />
                                <h2 className="text-4xl font-black text-white uppercase tracking-widest glitch-text mb-4" data-text="BỊ TROLL">BỊ TROLL</h2>
                            </>
                        ) : (
                            <>
                                <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
                                <h2 className="text-4xl font-serif font-black text-gold-premium tracking-wider mb-2">CHÚC MỪNG</h2>
                            </>
                        )}

                        <div className="py-8 border-y border-white/10 my-6 bg-black/20 rounded-lg">
                            <p className={`text-5xl md:text-6xl font-serif font-bold ${currentResult.isTrap ? 'text-gray-400 line-through decoration-red-500 decoration-4' : 'text-white drop-shadow-lg'}`}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentResult.amount)}
                            </p>
                        </div>

                        <p className="text-xl text-yellow-100/90 font-serif italic leading-relaxed">
                            "{currentResult.wish}"
                        </p>

                        <div className="mt-10">
                            <button onClick={() => setCurrentResult(null)} className="w-full py-4 rounded-xl border border-white/20 hover:bg-white/10 text-white font-bold tracking-widest uppercase transition-all">
                                Đóng
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center min-h-screen px-4 py-8">
            {/* Header / Controls */}
            <div className="w-full flex justify-between items-center mb-10">
                <button onClick={() => navigate('/')} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft className="text-white w-6 h-6" />
                </button>

                <h2 className="text-2xl font-serif text-gold-premium tracking-widest uppercase hidden md:block">Phòng: {roomId}</h2>

                <div className="flex items-center gap-4">
                    <div
                        onClick={() => setGodMode(!godMode)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${godMode ? 'bg-red-500 text-white' : 'bg-transparent text-white/10 hover:text-white/30'}`}
                    >
                        {godMode ? <Eye size={20} /> : <EyeOff size={20} />}
                    </div>

                    <button
                        onClick={handleShuffle}
                        disabled={isShuffling}
                        className="px-6 py-2 rounded-full border border-yellow-500/30 text-yellow-200 hover:bg-yellow-500/10 flex items-center gap-2 transition-all"
                    >
                        <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
                        Tráo Bài
                    </button>
                </div>
            </div>

            {/* The Board - Premium Grid */}
            <motion.div
                layout
                className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 w-full max-w-4xl place-items-center"
            >
                <AnimatePresence>
                    {deck.map((envelope) => (
                        <motion.div
                            layout
                            key={envelope.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05, y: -10 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="relative perspective-container cursor-pointer group"
                            onClick={() => handleOpen(envelope)}
                        >
                            <div className={`relative w-40 h-56 md:w-56 md:h-72 transition-all duration-500 ${envelope.opened ? 'opacity-50 grayscale' : ''}`}>

                                {/* Envelope Visual - Matte Gold Style */}
                                <div className="absolute inset-0 bg-gradient-to-b from-[#e6c200] to-[#b39500] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center overflow-hidden border border-[#ffe033]/50">
                                    {/* Paper Texture Overlay */}
                                    {/* Top Flap */}
                                    <div className="absolute top-0 w-full h-24 bg-[#cfae00] clip-triangle shadow-sm z-10"></div>

                                    {/* Center Seal */}
                                    <div className="absolute top-16 z-20 w-16 h-16 bg-red-700 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-300">
                                        <span className="text-3xl font-serif text-yellow-100 font-bold">Lộc</span>
                                    </div>

                                    {/* Body Content */}
                                    <div className="mt-36 text-center z-10">
                                        <div className="text-[#594a00] font-serif font-black text-2xl tracking-widest uppercase opacity-80">2026</div>
                                    </div>

                                    {/* Patterns */}
                                    <div className="absolute bottom-0 w-full h-12 bg-red-800/10 clip-wave"></div>

                                    {/* GOD MODE REVEAL */}
                                    {godMode && !envelope.opened && (
                                        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-2 text-center backdrop-blur-sm">
                                            <Eye className="w-8 h-8 text-red-500 mb-2" />
                                            <p className="text-yellow-400 font-bold text-lg font-mono">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(envelope.amount)}
                                            </p>
                                            {envelope.isTrap && <span className="text-red-500 font-black text-xs uppercase border border-red-500 px-2 py-1 mt-1">TRAP</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Gameplay;
