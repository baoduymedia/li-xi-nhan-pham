import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface EventEffectsProps {
    roomId: string;
}

const EventEffects = ({ roomId }: EventEffectsProps) => {
    const [showJackpot, setShowJackpot] = React.useState(false);
    const [showTrapMeme, setShowTrapMeme] = React.useState(false);
    const [currentMeme, setCurrentMeme] = React.useState('');

    const memeLibrary = [
        '😭', '💀', '🤡', '😱', '🙈', // Emoji fallbacks
        '/memes/troll1.gif',
        '/memes/unlucky.png',
        '/memes/bruh.jpg'
    ];

    React.useEffect(() => {
        // Listen to BroadcastChannel for game events
        const channel = new BroadcastChannel(`game_${roomId}`);

        channel.onmessage = (event) => {
            if (event.data.type === 'jackpot_won') {
                triggerJackpot();
            } else if (event.data.type === 'trap_triggered') {
                triggerTrapMeme();
            }
        };

        return () => channel.close();
    }, [roomId]);

    const triggerJackpot = () => {
        setShowJackpot(true);

        // Confetti burst
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#FF6347', '#FFFFFF']
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#FF6347', '#FFFFFF']
            });
            if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();

        setTimeout(() => setShowJackpot(false), 5000);
    };

    const triggerTrapMeme = () => {
        const randomMeme = memeLibrary[Math.floor(Math.random() * memeLibrary.length)];
        setCurrentMeme(randomMeme);
        setShowTrapMeme(true);
        setTimeout(() => setShowTrapMeme(false), 4000);
    };

    return (
        <>
            {/* Jackpot Animation */}
            <AnimatePresence>
                {showJackpot && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="text-9xl font-bold text-yellow-400 drop-shadow-[0_0_50px_rgba(255,215,0,0.8)]"
                        >
                            🎉 JACKPOT! 🎉
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trap Meme Overlay */}
            <AnimatePresence>
                {showTrapMeme && (
                    <motion.div
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 12 }}
                        exit={{ scale: 0, rotate: 30 }}
                        className="fixed bottom-20 right-20 z-40"
                    >
                        {currentMeme.startsWith('/') ? (
                            <img
                                src={currentMeme}
                                alt="Trap Meme"
                                className="w-64 h-64 object-contain drop-shadow-2xl"
                                onError={(e) => {
                                    // Fallback to emoji if image fails
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="text-9xl">{currentMeme}</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default EventEffects;
