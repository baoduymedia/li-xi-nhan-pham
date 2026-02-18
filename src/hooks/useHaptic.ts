import { useState, useCallback } from 'react';

export const useHaptic = () => {
    const [enabled, setEnabled] = useState(() => {
        const saved = localStorage.getItem('haptics_enabled');
        return saved !== null ? saved === 'true' : true;
    });

    const trigger = useCallback((pattern: number | number[] = 200) => {
        if (!enabled || !navigator.vibrate) return;
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            // Ignore if vibration fails (some browsers block it without interaction)
        }
    }, [enabled]);

    const toggle = useCallback(() => {
        setEnabled(prev => {
            const newState = !prev;
            localStorage.setItem('haptics_enabled', String(newState));
            if (newState) {
                if (navigator.vibrate) navigator.vibrate(50);
            }
            return newState;
        });
    }, []);

    return { trigger, toggle, enabled };
};
