import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Play, Plus, QrCode } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

// Floating Envelope Component
const FloatingEnvelope = ({ delay, x, y, size, rotation }: { delay: number, x: number, y: number, size: number, rotation: number }) => {
    return (
        <motion.div
            className="absolute z-0 pointer-events-none opacity-20"
            initial={{ x, y, rotate: rotation, scale: 0 }}
            animate={{
                y: [y, y - 20, y],
                rotate: [rotation, rotation + 5, rotation - 5, rotation],
                scale: 1
            }}
            transition={{
                duration: 5,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
            }}
        >
            <div
                className="bg-red-600 rounded-lg shadow-xl relative"
                style={{ width: size, height: size * 1.4 }}
            >
                <div className="absolute top-0 left-0 w-full h-1/3 bg-red-700/50 rounded-t-lg clip-triangle-down" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-yellow-400 rounded-full border-2 border-yellow-200 shadow-inner flex items-center justify-center">
                    <span className="text-red-800 font-bold text-xs">福</span>
                </div>
            </div>
        </motion.div>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState('');
    const [showJoinInput, setShowJoinInput] = useState(false);

    const handleCreateRoom = () => {
        navigate('/host');
    };

    const handleJoinRoom = () => {
        if (roomCode.trim()) {
            navigate(`/play/${roomCode}`);
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-[80vh] w-full max-w-md mx-auto">

            {/* Background Envelopes */}
            <FloatingEnvelope delay={0} x={-100} y={-50} size={60} rotation={-15} />
            <FloatingEnvelope delay={1.5} x={150} y={100} size={80} rotation={10} />
            <FloatingEnvelope delay={2.5} x={-120} y={250} size={50} rotation={-5} />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full z-10"
            >
                <motion.div variants={itemVariants} className="text-center mb-8">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] mb-2">
                        Lì Xì
                    </h1>
                    <h2 className="text-3xl font-light text-white tracking-widest uppercase">
                        Nhân Phẩm
                    </h2>
                    <p className="text-white/60 mt-4 text-sm">
                        Thử vận may - Nhận lời chúc - Vui Tết 2026
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
                    <Card className="flex flex-col gap-4 p-8 items-center bg-white/10 border-white/20">
                        <div className="w-full">
                            <Button
                                onClick={handleCreateRoom}
                                className="w-full flex items-center justify-center gap-2 text-lg py-4 group"
                                size="lg"
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                Tạo Phòng Lì Xì
                            </Button>
                        </div>

                        <div className="relative w-full flex items-center justify-center py-2">
                            <div className="absolute w-full h-px bg-white/10" />
                            <span className="bg-[#1a1a2e] px-2 text-xs text-white/40 relative z-10 font-mono">HOẶC</span>
                        </div>

                        <div className="w-full space-y-3">
                            {!showJoinInput ? (
                                <Button
                                    variant="outline"
                                    onClick={() => setShowJoinInput(true)}
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    <QrCode className="w-4 h-4" />
                                    Tham Gia Phòng
                                </Button>
                            ) : (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="space-y-2"
                                >
                                    <input
                                        type="text"
                                        placeholder="Nhập mã phòng..."
                                        value={roomCode}
                                        onChange={(e) => setRoomCode(e.target.value)}
                                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-center text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 transition-colors uppercase tracking-widest"
                                        autoFocus
                                    />
                                    <Button
                                        variant="secondary"
                                        onClick={handleJoinRoom}
                                        disabled={!roomCode}
                                        className="w-full flex items-center justify-center gap-2"
                                    >
                                        <Play className="w-4 h-4 fill-current" />
                                        Vào Chơi
                                    </Button>
                                    <button
                                        onClick={() => setShowJoinInput(false)}
                                        className="w-full text-xs text-white/40 hover:text-white/80 py-2"
                                    >
                                        Quay lại
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Home;
