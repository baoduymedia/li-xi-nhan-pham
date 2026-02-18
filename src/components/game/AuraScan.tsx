import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Scan, Sparkles, X } from 'lucide-react';

interface AuraScanProps {
    onComplete: (score: number) => void;
    onClose: () => void;
}

const AURA_COLORS = [
    { color: '#FFD700', name: 'Hoàng Kim', desc: 'Vận may cực thịnh!' },
    { color: '#FF0000', name: 'Hồng Phúc', desc: 'Đỏ như son!' },
    { color: '#00FF00', name: 'Thanh Long', desc: 'Sự nghiệp thăng hoa.' },
    { color: '#00FFFF', name: 'Bạch Hổ', desc: 'Quyết đoán, mạnh mẽ.' },
    { color: '#FF00FF', name: 'Chu Tước', desc: 'Tình duyên rực rỡ.' },
    { color: '#808080', name: 'Hắc Quy', desc: 'Bình an, vững chãi.' }
];

const AuraScan = ({ onComplete, onClose }: AuraScanProps) => {
    const webcamRef = useRef<Webcam>(null);
    const [scanning, setScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<{ score: number, aura: typeof AURA_COLORS[0] } | null>(null);

    const finishScan = () => {
        let score = Math.floor(Math.random() * 100) + 1;
        const rand = Math.random();
        if (rand > 0.7) score = 90 + Math.floor(Math.random() * 10);
        else if (rand > 0.2) score = 50 + Math.floor(Math.random() * 40);
        else score = Math.floor(Math.random() * 50);

        const aura = AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)];
        setResult({ score, aura });
    };

    const handleScan = useCallback(() => {
        setScanning(true);
        let p = 0;
        const interval = setInterval(() => {
            p += 4; // Faster scan
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                setScanning(false);
                finishScan();
            }
        }, 50);
    }, []);

    const handleConfirm = () => {
        if (result) onComplete(result.score);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-gray-900 border border-yellow-500/30 rounded-3xl overflow-hidden relative shadow-2xl flex flex-col h-[80vh]"
            >
                <div className="absolute top-0 w-full z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex items-center gap-2 text-yellow-500">
                        <Scan className="w-5 h-5 animate-pulse" />
                        <span className="font-bold tracking-widest uppercase text-sm">AI Aura Scan</span>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-6 h-6" /></button>
                </div>

                <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "user" }}
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />

                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-10 left-10 right-10 bottom-10 border-2 border-white/20 rounded-2xl">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-500"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-yellow-500"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-yellow-500"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-500"></div>
                        </div>
                    </div>

                    {scanning && (
                        <motion.div
                            initial={{ top: "10%" }}
                            animate={{ top: "90%" }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear", repeatType: "reverse" }}
                            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] z-10"
                        />
                    )}

                    {!scanning && !result && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-auto">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleScan}
                                className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border-4 border-yellow-500 flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.4)] animate-pulse hover:bg-yellow-500/20 transition-colors"
                            >
                                <Scan className="w-8 h-8 text-white" />
                            </motion.button>
                            <p className="mt-4 text-white/80 font-medium text-sm bg-black/50 px-3 py-1 rounded-full">Chạm để Quét Nhân Phẩm</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gray-900 border-t border-white/10 min-h-[180px] flex flex-col items-center justify-center text-center z-30">
                    {scanning ? (
                        <div className="w-full space-y-2">
                            <p className="text-cyan-400 font-mono text-xs animate-pulse">ANALYZING FACIAL GEOMETRY...</p>
                            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-cyan-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                                <span>LUCK_MATRIX_LOAD</span>
                                <span>{progress}%</span>
                            </div>
                        </div>
                    ) : result ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-left">
                                    <p className="text-xs text-white/50 uppercase">Hào quang</p>
                                    <p className="font-bold text-lg" style={{ color: result.aura.color }}>{result.aura.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-white/50 uppercase">Điểm Nhân Phẩm</p>
                                    <p className="font-black text-4xl text-white">{result.score}</p>
                                </div>
                            </div>
                            <p className="text-sm text-white/70 italic mb-4">"{result.aura.desc}"</p>
                            <button
                                onClick={handleConfirm}
                                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl font-bold text-black hover:brightness-110 transition-all flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" /> Nhận Lộc Ngay
                            </button>
                        </motion.div>
                    ) : (
                        <p className="text-white/40 text-xs text-center max-w-[200px]">
                            Hãy để AI đánh giá vận may của bạn trước khi mở bao lì xì!
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AuraScan;
