import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Share2, Trophy } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { api } from '../lib/api';


// Envelope Component with 3D Flip
const Envelope = ({ onClick, opened, value, wish }: { onClick: () => void, opened: boolean, value?: string, wish?: string }) => {
    return (
        <div className="relative w-64 h-80 perspective-1000 cursor-pointer group" onClick={onClick}>
            <motion.div
                className={`w-full h-full relative preserve-3d transition-transform duration-700 ${opened ? 'rotate-y-180' : ''}`}
                whileHover={{ scale: 1.05, rotateZ: 2 }}
            >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-2xl border-2 border-yellow-500 flex flex-col items-center justify-center p-4">
                    <div className="w-full h-full border-2 border-dashed border-yellow-500/50 rounded-lg flex flex-col items-center justify-center">
                        <img
                            src="https://img.icons8.com/color/96/year-of-snake.png"
                            alt="Snake Year"
                            className="w-20 h-20 mb-4 drop-shadow-lg filter brightness-110"
                        />
                        <h2 className="text-4xl font-black text-yellow-400 uppercase tracking-widest drop-shadow-md text-glow">Lì Xì</h2>
                        <p className="text-yellow-200 mt-2 font-dancing text-xl">Năm Mới Bình An</p>
                    </div>
                </div>

                {/* Back (Result) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl shadow-2xl border-4 border-red-600 flex flex-col items-center justify-center p-6 text-center">
                    <div className="absolute top-2 right-2 text-red-500/20">
                        <Trophy size={40} />
                    </div>
                    <p className="text-red-800 font-bold uppercase tracking-wider mb-2 text-sm">Chúc Mừng</p>
                    <h3 className="text-4xl font-black text-red-600 mb-4">{value}</h3>
                    <p className="text-red-900/80 italic text-sm leading-relaxed border-t border-red-200 pt-4">"{wish}"</p>
                </div>
            </motion.div>
        </div>
    );
};

const Gameplay = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [joined, setJoined] = useState(false);
    const [opened, setOpened] = useState(false);
    const [result, setResult] = useState<{ value: string; wish: string } | null>(null);


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

    const handleOpen = async () => {
        if (opened || !roomId) return;

        try {
            // In real app, we need playerId. For demo, we might need to store it in simpler way or passed from join
            // For now, let's assume api handles it or we mock it
            const res = await api.openEnvelope(roomId, 'current-player-id');
            setResult(res as { value: string; wish: string }); // Cast to expected type
            setOpened(true);

            // Trigger Confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#ff0000', '#ffd700', '#ffffff']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#ff0000', '#ffd700', '#ffffff']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        } catch (e) {
            console.error(e);
        }
    };

    const handleShare = () => {
        // Mock share
        alert('Đã lưu ảnh về máy! (Giả lập)');
    };

    if (!joined) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-md mx-auto">
                <Card className="w-full p-8 space-y-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-2">Tham gia phòng {roomId}</h1>
                        <p className="text-white/60 text-sm">Nhập tên của bạn để bắt đầu nhận lì xì nhé!</p>
                    </div>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                        placeholder="Tên của bạn (VD: Duy Nến)"
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 text-center"
                    />
                    <Button onClick={handleJoin} disabled={!name} className="w-full">
                        Sẵn sàng nhận lộc
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-md mx-auto relative perspective-1000">
            <AnimatePresence>
                {!result ? (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="relative z-10"
                    >
                        <Envelope onClick={handleOpen} opened={false} />
                        <motion.p
                            className="mt-8 text-white/80 text-center animate-pulse"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            Chạm để mở lì xì...
                        </motion.p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex flex-col items-center"
                    >
                        <div className="scale-110 mb-8">
                            <Envelope onClick={() => { }} opened={true} value={result.value} wish={result.wish} />
                        </div>

                        <div className="flex gap-4 w-full">
                            <Button onClick={handleShare} variant="secondary" className="flex-1 gap-2">
                                <Share2 className="w-4 h-4" /> Khoe ngay
                            </Button>
                            <Button onClick={() => navigate(`/leaderboard/${roomId}`)} variant="outline" className="flex-1 gap-2">
                                <Trophy className="w-4 h-4" /> Xem BXH
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gameplay;
