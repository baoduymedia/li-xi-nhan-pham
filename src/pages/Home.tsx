import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, Users, Star } from 'lucide-react';

const Home = () => {
    const [roomCode, setRoomCode] = useState('');
    const [isJoinMode, setIsJoinMode] = useState(false);
    const navigate = useNavigate();

    const handleJoin = () => {
        if (roomCode.trim()) {
            navigate(`/play/${roomCode}`);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] text-center space-y-12 relative z-10 w-full max-w-4xl mx-auto px-4">

            {/* 3D Envelope Centerpiece */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, type: "spring" }}
                className="relative perspective-container group cursor-pointer"
                whileHover={{ scale: 1.05, rotate: 2 }}
            >
                <div className="w-64 h-80 relative preserve-3d animate-[float_6s_ease-in-out_infinite]">
                    {/* Front of Envelope */}
                    <div className="absolute inset-0 bg-red-700 rounded-lg shadow-2xl flex flex-col items-center justify-center border-2 border-yellow-500/50 overflow-hidden">
                        {/* Texture */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                        {/* Gold Circle */}
                        <div className="w-24 h-24 rounded-full border-4 border-yellow-400 flex items-center justify-center bg-red-800 shadow-inner mb-4 relative z-10">
                            <span className="text-5xl font-serif text-yellow-400">Tết</span>
                        </div>
                        <div className="text-yellow-200 font-sans tracking-[0.3em] text-xs uppercase relative z-10">2026 • YEAR OF THE HORSE</div>

                        {/* Shine Effect */}
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    </div>
                </div>
            </motion.div>

            {/* Typography */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
            >
                <h1 className="text-6xl md:text-8xl font-black text-gold-premium tracking-tight drop-shadow-2xl">
                    LÌ XÌ NHÂN PHẨM
                </h1>
                <p className="text-xl md:text-2xl text-yellow-100/80 font-light italic font-serif">
                    "Vận may không tự nhiên sinh ra, nó đến từ nhân phẩm của bạn."
                </p>
            </motion.div>

            {/* Actions */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col md:flex-row gap-6 w-full max-w-xl"
            >
                {!isJoinMode ? (
                    <>
                        <button
                            onClick={() => navigate('/host')}
                            className="flex-1 btn-neumorphic py-6 text-xl group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <Gift className="w-6 h-6 mr-3 text-yellow-300" />
                            Tạo Phòng
                        </button>
                        <button
                            onClick={() => setIsJoinMode(true)}
                            className="flex-1 glass-premium py-6 rounded-xl text-xl font-bold text-yellow-100 border border-white/20 hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                        >
                            <Users className="w-6 h-6" />
                            Tham Gia
                        </button>
                    </>
                ) : (
                    <div className="w-full glass-premium p-8 rounded-2xl animate-[fadeIn_0.3s_ease-out]">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-2xl text-gold-premium mb-2">Nhập Mã Phòng</h3>
                            <input
                                type="text"
                                placeholder="VD: ABCD12"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                className="w-full bg-black/30 border border-yellow-500/30 rounded-xl px-4 py-4 text-center text-2xl font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-400 transition-all uppercase tracking-widest"
                                autoFocus
                            />
                            <div className="flex gap-4 mt-2">
                                <button onClick={() => setIsJoinMode(false)} className="flex-1 py-4 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                                    Quay Lại
                                </button>
                                <button
                                    onClick={handleJoin}
                                    disabled={!roomCode}
                                    className="flex-[2] btn-neumorphic disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Vào Ngay <Star className="w-5 h-5 ml-2 fill-yellow-200" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Decorative Footer */}
            <div className="absolute bottom-4 text-white/20 text-xs font-sans tracking-widest uppercase">
                Designed for Tet 2026 • Premium Edition
            </div>
        </div>
    );
};

export default Home;
