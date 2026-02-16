import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface LayoutProps {
    children: ReactNode;
}

                />
            </div >
// Assuming the component structure starts here, and the previous lines were malformed.
// The original content had a stray `/>` and `</div>` before the main tag.
// The instruction implies fixing the overall structure.
// A common pattern for a Layout component is a root div.
const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
            {/* Background animation - assuming this was the intended content before main */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 z-0"
            >
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('/images/bg-pattern.svg')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            </motion.div>

            {/* Main Content */}
            <main className="relative z-10 container mx-auto px-4 py-6 min-h-screen flex flex-col">
                {children}
            </main>

            {/* Watermark / Footer */}
            <footer className="relative z-10 py-4 text-center text-yellow-200/40 text-sm font-light tracking-widest uppercase">
                Lì Xì Nhân Phẩm 2026 • Bảo Duy Media
            </footer>
        </div>
    );
};

export default Layout;
