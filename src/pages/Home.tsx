import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Gift, Users, MailOpen } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Home = () => {
    const [roomCode, setRoomCode] = useState('');
    const navigate = useNavigate();

    const handleJoin = () => {
        if (roomCode.trim()) {
            navigate(`/play/${roomCode}`);
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 relative z-10">

            {/* Hero Section */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-4"
            >
                <motion.div variants={itemVariants}>
                    <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-red-500 to-yellow-300 drop-shadow-sm filter pb-2 text-glow" style={{ fontFamily: "'Dancing Script', cursive, sans-serif" }}>
                        Tết 2026
                    </h1>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg uppercase tracking-wider">
                        Lì Xì Nhân Phẩm
                    </h2>
                </motion.div>

                <motion.p variants={itemVariants} className="text-yellow-200 text-lg md:text-xl font-light italic max-w-lg mx-auto">
                    "Tiền nhiều hay ít không quan trọng, quan trọng là nhân phẩm!"
                </motion.p>
            </motion.div>

            {/* Main Actions */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md"
            >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card className="h-full flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/10 group bg-red-900/40" onClick={() => navigate('/host')}>
                        <div className="p-4 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-lg group-hover:shadow-red-500/50 transition-all">
                            <Gift className="w-8 h-8 text-yellow-300" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-yellow-300">Tạo Phòng Lì Xì</h3>
                            <p className="text-sm text-white/60">Dành cho "Nhà Cái"</p>
                        </div>
                    </Card>
                </motion.div>

                <Card className="h-full flex flex-col gap-4 bg-red-900/40">
                    <div className="flex items-center gap-2 text-yellow-300 font-bold justify-center">
                        <Users className="w-5 h-5" /> Tham Gia
                    </div>
                    <input
                        type="text"
                        placeholder="Nhập mã phòng..."
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        className="w-full bg-red-950/50 border border-yellow-500/30 rounded-lg px-4 py-3 text-center text-lg font-bold text-yellow-300 placeholder:text-white/20 focus:outline-none focus:border-yellow-400 transition-all uppercase"
                    />
                    <Button
                        className="w-full text-lg font-black tracking-widest neumorphic-button py-4 rounded-xl text-yellow-100"
                        onClick={handleJoin}
                        disabled={!roomCode}
                    >
                        Vào Ngay
                    </Button>
                </Card>
            </motion.div>

            {/* Decorative Floating Envelopes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ y: [-20, 20, -20], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-10 left-10 opacity-60"
                >
                    <MailOpen className="w-24 h-24 text-red-500/80 drop-shadow-lg" />
                </motion.div>
                <motion.div
                    animate={{ y: [20, -20, 20], rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-20 right-10 opacity-60"
                >
                    <MailOpen className="w-32 h-32 text-yellow-500/80 drop-shadow-lg" />
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
