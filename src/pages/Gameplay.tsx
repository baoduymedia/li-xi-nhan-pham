import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Trophy, Shuffle, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';
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
            { id: 3, amount: 0, wish: "Chúc bạn may mắn lần sau!", isTrap: true, opened: false }, // Trap
            { id: 4, amount: 100000, wish: "Tiền vào như nước!", isTrap: false, opened: false },
            { id: 5, amount: 50000, wish: "Lộc lá đầy nhà.", isTrap: false, opened: false },
            { id: 6, amount: 0, wish: "Voucher Rửa Bát 1 Tháng", isTrap: true, opened: false }, // Trap
        ];
        // Duplicate to make 12 for better grid if needed, but 6 is fine for mobile
        setDeck(initialDeck);
    }, []);

    const handleJoin = async () => {
        if (name.trim()) {
            try {
                await api.joinRoom(roomId || '', name);
                setJoined(true);
            } catch (e) {
                alert('Không thể tham gia phòng. Vui lòng kiểm tra mã phòng.');
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
            // Apply logic
            const res = await api.openEnvelope(roomId, 'current-player-id', {
                amount: envelope.amount,
                wish: envelope.wish,
                isTrap: envelope.isTrap
            });

            // Mark as opened
            setDeck(deck.map(e => e.id === envelope.id ? { ...e, opened: true } : e));
            setCurrentResult(res as any);

            if (!res.isTrap) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#FFD700', '#D40000']
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (!joined) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="w-full max-w-sm glass-premium p-8 rounded-2xl border border-white/20 shadow-2xl">
                    <h2 className="text-3xl font-black text-center text-yellow-400 mb-6 uppercase drop-shadow-md">Nhập Tên</h2>
                    <input
                        type="text"
                        placeholder="Tên của bạn..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/20 border border-yellow-500/30 rounded-xl px-4 py-4 text-center text-xl text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 mb-6 transition-all"
                    />
                    <Button onClick={handleJoin} className="w-full py-4 text-lg font-bold neumorphic-button text-yellow-50">
                        Tham Gia Ngay
                    </Button>
                </div>
            </div>
        );
    }

    // Result Overlay
    if (currentResult) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-md mx-auto p-4 perspective-1000">
                <motion.div
                    initial={{ rotateX: 90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    className={`w-full relative ${currentResult.isTrap ? 'bg-gray-900 border-gray-600' : 'bg-gradient-to-br from-red-600 to-red-800 border-yellow-500'} border-4 rounded-xl shadow-2xl p-8 text-center`}
                >
                    {/* Troll Glitch Effect */}
                    {currentResult.isTrap && (
                        <div className="absolute inset-0 bg-white/5 animate-pulse rounded-xl z-0 pointer-events-none" />
                    )}

                    <div className="relative z-10">
                        {currentResult.isTrap ? (
                            <div className="mb-6">
                                <AlertTriangle className="w-20 h-20 text-gray-400 mx-auto mb-4 animate-bounce" />
                                <h2 className="text-4xl font-black text-white uppercase tracking-widest glitch-text">BỊ TROLL RỒI!</h2>
                            </div>
                        ) : (
                            <div className="mb-6">
                                <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 drop-shadow-lg" />
                                <h2 className="text-4xl font-black text-yellow-400 uppercase tracking-widest text-glow">CHÚC MỪNG</h2>
                            </div>
                        )}

                        <div className="py-6 border-y border-white/10 my-6">
                            <p className={`text-6xl font-black ${currentResult.isTrap ? 'text-gray-200' : 'text-yellow-300'}`}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentResult.amount)}
                            </p>
                        </div>

                        <p className="text-xl text-white/80 italic font-medium leading-relaxed">
                            "{currentResult.wish}"
                        </p>

                        <div className="mt-8">
                            <Button onClick={() => setCurrentResult(null)} variant="outline" className="w-full">
                                Chơi Tiếp
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center min-h-screen">
            {/* Header / Controls */}
            <div className="w-full flex justify-between items-center mb-8 px-4">
                <Button
                    variant="ghost"
                    onClick={handleShuffle}
                    disabled={isShuffling}
                    className="flex items-center gap-2 text-yellow-300 hover:bg-white/5 rounded-full px-6"
                >
                    <Shuffle className={`w-5 h-5 ${isShuffling ? 'animate-spin' : ''}`} />
                    Tráo Bài
                </Button>

                {/* GOD MODE TRIGGER (Hidden/Long Press - simulated by click for demo) */}
                <button
                    onClick={() => setGodMode(!godMode)}
                    className="w-10 h-10 rounded-full flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity"
                    title="Mắt Thần (God Mode)"
                >
                    {godMode ? <Eye className="text-red-500 w-6 h-6" /> : <EyeOff className="text-white w-6 h-6" />}
                </button>
            </div>

            {/* The Board */}
            <motion.div
                layout
                className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 p-4 w-full place-items-center"
            >
                <AnimatePresence>
                    {deck.map((envelope) => (
                        <motion.div
                            layout
                            key={envelope.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                            className="relative flex justify-center perspective-1000"
                            onClick={() => handleOpen(envelope)}
                        >
                            <div className={`relative w-40 h-52 md:w-56 md:h-72 transition-transform duration-500 cursor-pointer group transform hover:-translate-y-2 hover:rotate-1`}>
                                {/* Envelope Body */}
                                <div className="absolute inset-0 bg-gradient-to-b from-red-600 to-red-800 rounded-xl shadow-2xl border border-yellow-500/50 flex flex-col items-center justify-center overflow-hidden">
                                    {/* Pattern */}
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />

                                    {/* Center Piece */}
                                    {envelope.opened ? (
                                        <div className="text-yellow-400 font-bold text-center p-2">
                                            Đã mở
                                        </div>
                                    ) : (
                                        <>
                                            <div className="relative z-10 w-20 h-20 md:w-28 md:h-28 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-4 border-yellow-200 ring-4 ring-red-900/20">
                                                <span className="text-4xl md:text-5xl font-black text-red-700">福</span>
                                            </div>

                                            <div className="mt-4 md:mt-6 text-yellow-200 font-bold uppercase tracking-widest text-xs md:text-sm">
                                                Lì Xì 2026
                                            </div>
                                        </>
                                    )}

                                    {/* GOD MODE REVEAL */}
                                    {godMode && !envelope.opened && (
                                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 rounded-xl backdrop-blur-sm p-2 text-center">
                                            <Eye className="w-8 h-8 text-red-500 mb-2 animate-pulse" />
                                            <p className="text-yellow-400 font-bold text-lg">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(envelope.amount)}
                                            </p>
                                            {envelope.isTrap && <span className="text-red-500 font-black uppercase text-xl animate-bounce">TRAP!</span>}
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
