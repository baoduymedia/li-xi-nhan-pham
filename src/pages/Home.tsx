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
                                    Tham Gia Phòng
                                </Button >
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
                        </div >
                    </Card >
                </motion.div >
            </motion.div >
        </div >
    );
};

export default Home;
