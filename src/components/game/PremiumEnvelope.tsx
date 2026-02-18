import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Eye } from 'lucide-react';

interface PremiumEnvelopeProps {
    amount: number;
    isTrap: boolean;
    opened: boolean;
    status: 'available' | 'locked' | 'opened';
    godMode: boolean;
    onClick: () => void;
    layoutId?: string;
    onHesitate?: () => void;
}

const PremiumEnvelope = ({ amount, isTrap, opened, status, godMode, onClick, layoutId, onHesitate }: PremiumEnvelopeProps) => {

    // 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [20, -20]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-20, 20]);

    // ...

    // Derived states
    const isLocked = status === 'locked';
    const isOpened = status === 'opened' || opened;

    return (
        <motion.div
            layoutId={layoutId}
            style={{
                rotateX: isOpened ? 0 : rotateX,
                rotateY: isOpened ? 0 : rotateY,
                transformStyle: "preserve-3d",
                perspective: 1000
            }}
            // ... events ...
            onClick={onClick} // Allow click even if locked to show specific message? Or disable
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
                scale: isLocked ? 1.05 : 1,
                opacity: 1,
                rotateZ: isLocked ? [0, -2, 2, 0] : 0 // Shake effect if ghosting
            }}
            transition={{ rotateZ: { repeat: Infinity, duration: 0.2 } }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => {
                if (onHesitate && status === 'available') {
                    // Start timer
                    (window as any)[`timer_${layoutId}`] = setTimeout(() => onHesitate(), 3000);
                }
            }}
            onMouseLeave={() => {
                // Clear timer
                if ((window as any)[`timer_${layoutId}`]) clearTimeout((window as any)[`timer_${layoutId}`]);
            }}
            className="relative w-40 h-56 md:w-56 md:h-72 cursor-pointer group touch-none select-none"
        >
            <div className={`relative w-full h-full transition-all duration-700 ${isOpened ? 'opacity-50 grayscale' : ''}`}>

                {/* Envelope Body */}
                <div className={`absolute inset-0 bg-gradient-to-b ${isLocked ? 'from-yellow-400 to-red-500 shadow-[0_0_30px_rgba(255,215,0,0.6)]' : 'from-[#e6c200] to-[#b39500]'} rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center overflow-hidden border border-[#ffe033]/50 backface-hidden`}>

                    {/* ... existing content ... */}
                    {/* Top Flap */}
                    <div className="absolute top-0 w-full h-24 bg-[#cfae00] clip-triangle shadow-sm z-20 origin-top transition-transform duration-500"
                        style={{ transform: isOpened ? 'rotateX(180deg)' : 'rotateX(0deg)' }}>
                    </div>

                    {/* Content */}
                    <div className="absolute top-8 inset-x-4 bottom-4 bg-white/90 rounded-lg z-10 flex flex-col items-center justify-center p-2 shadow-inner transform translate-y-full transition-transform duration-500"
                        style={{ transform: isOpened ? 'translateY(0)' : 'translateY(40%)' }}>
                        <p className={`font-bold ${isTrap ? 'text-red-600' : 'text-green-600'}`}>
                            {isTrap ? 'TROLL' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
                        </p>
                    </div>

                    {/* External Decoration */}
                    <div className="absolute top-16 z-30 w-16 h-16 bg-red-700 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-300 transition-transform duration-300 group-hover:scale-110">
                        <span className="text-3xl font-serif text-yellow-100 font-bold drop-shadow-md">Lộc</span>
                    </div>

                    <div className="mt-36 text-center z-20 pointer-events-none">
                        <div className="text-[#594a00] font-serif font-black text-2xl tracking-widest uppercase opacity-80 group-hover:text-white transition-colors">2026</div>
                    </div>

                    {/* ... */}
                    {godMode && !isOpened && (
                        // ... existing god mode code
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-2 text-center backdrop-blur-sm border-2 border-red-500">
                            <Eye className="w-8 h-8 text-red-500 mb-2 animate-pulse" />
                            <p className="text-yellow-400 font-bold text-lg font-mono">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
                            </p>
                            {isTrap && <span className="text-red-500 font-active text-xs uppercase border border-red-500 px-2 py-1 mt-1 bg-red-900/50">TRAP</span>}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default PremiumEnvelope;
