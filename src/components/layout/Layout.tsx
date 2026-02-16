import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
            {/* Falling Blossoms Animation Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            opacity: 0,
                            y: -20,
                            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)
                        }}
                        animate={{
                            opacity: [0, 1, 0],
                            y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100,
                            x: (Math.random() - 0.5) * 200 + (Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)),
                            rotate: Math.random() * 360
                        }}
                        transition={{
                            duration: 5 + Math.random() * 10,
                            repeat: Infinity,
                            delay: Math.random() * 10,
                            ease: "linear"
                        }}
                        className="absolute top-0 rounded-full bg-pink-300/60 blur-[1px]"
                        style={{
                            width: Math.random() * 10 + 5 + 'px',
                            height: Math.random() * 10 + 5 + 'px',
                            backgroundColor: Math.random() > 0.5 ? '#ffb7b2' : '#ffd700', // Pink or Gold petals
                        }}
                    />
                ))}
            </div>

            {/* Decorative Corners (Golden Patterns) */}
            <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none z-0 opacity-40">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-yellow-500">
                    <path d="M0 0C50 0 50 50 0 50V0Z" fill="currentColor" />
                    <path d="M10 10C40 10 40 40 10 40V10Z" fill="var(--tet-red-dark)" opacity="0.5" />
                </svg>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none z-0 opacity-40 rotate-90">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-yellow-500">
                    <path d="M0 0C50 0 50 50 0 50V0Z" fill="currentColor" />
                </svg>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 p-4 md:p-8 flex flex-col items-center justify-center">
                <div className="w-full max-w-6xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Watermark / Footer */}
            <footer className="relative z-10 py-4 text-center text-yellow-200/40 text-sm font-light tracking-widest uppercase">
                Lì Xì Nhân Phẩm 2026 • Bảo Duy Media
            </footer>
        </div>
    );
};

export default Layout;
