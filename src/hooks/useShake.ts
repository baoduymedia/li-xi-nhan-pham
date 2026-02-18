import { useEffect, useState } from 'react';

export const useShake = (threshold = 15) => {
    const [shaking, setShaking] = useState(false);

    useEffect(() => {
        let lastX = 0;
        let lastY = 0;
        let lastZ = 0;
        let lastTime = 0;

        const handleMotion = (e: DeviceMotionEvent) => {
            const current = e.accelerationIncludingGravity;
            if (!current) return;

            const currentTime = Date.now();
            if ((currentTime - lastTime) > 100) {
                const diffTime = currentTime - lastTime;
                lastTime = currentTime;

                const x = current.x || 0;
                const y = current.y || 0;
                const z = current.z || 0;

                const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;

                if (speed > threshold * 100) { // Adjusted scaling
                    setShaking(true);
                    // Reset shaking after a short delay to allow re-trigger
                    setTimeout(() => setShaking(false), 1000);
                }

                lastX = x;
                lastY = y;
                lastZ = z;
            }
        };

        // Check if DeviceMotionEvent is defined (SSR/Desktop safety)
        if (typeof window !== 'undefined' && window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', handleMotion);
        }

        return () => {
            if (typeof window !== 'undefined' && window.DeviceMotionEvent) {
                window.removeEventListener('devicemotion', handleMotion);
            }
        };
    }, [threshold]);

    return shaking;
};
