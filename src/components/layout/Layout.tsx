import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden text-white selection:bg-red-500 selection:text-white">
            {/* Background Elements */}
            <div className="fixed inset-0 z-[-1]">
                {/* Dark radial gradient background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1a1a2e_0%,_#0f0f1b_100%)]" />

                {/* Animated Orbs/Glows */}
                <motion.div
                    className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-600/20 blur-[100px]"
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-yellow-500/10 blur-[100px]"
                    animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />
            </div>

            {/* Main Content */}
            <main className="relative z-10 container mx-auto px-4 py-6 min-h-screen flex flex-col">
                {children}
            </main>

            {/* Watermark */}
            <div className="fixed bottom-4 right-4 z-50 text-[10px] text-white/20 pointer-events-none font-mono tracking-wider">
                Bảo Duy Media
            </div>
        </div>
    );
};

export default Layout;
