import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);

            // Only show if user has interacted (simple logic: show after 5s for now)
            // Or we check localStorage if they dismissed it before
            const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
            if (!hasDismissed) {
                setTimeout(() => setIsVisible(true), 3000);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 z-[100] bg-zinc-900 border border-yellow-500/30 rounded-2xl p-4 shadow-2xl flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-yellow-500/20 p-3 rounded-xl text-yellow-500">
                            <Download size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Cài đặt ứng dụng</h3>
                            <p className="text-sm text-white/60">Trải nghiệm mượt hơn, không cần tải lại.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDismiss}
                            className="p-2 text-white/40 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                        <button
                            onClick={handleInstall}
                            className="bg-yellow-500 text-black font-bold px-4 py-2 rounded-xl text-sm"
                        >
                            Cài Đặt
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InstallPrompt;
