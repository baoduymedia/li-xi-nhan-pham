import { useState, useEffect, useRef } from 'react';

type SoundType = 'shake' | 'open' | 'win' | 'troll' | 'bgm' | 'click' | 'revel' | 'waiting' | 'heartbeat' | 'trap' | 'jackpot';

export const useSound = () => {
    const [muted, setMuted] = useState(false);
    const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
        shake: null,
        open: null,
        win: null,
        troll: null,
        bgm: null,
        click: null,
        revel: null,
        waiting: null,
        heartbeat: null,
        trap: null,
        jackpot: null
    });

    useEffect(() => {
        // Initialize Audio objects
        // In a real scenario, these paths would need to exist in /public/sounds/
        const sounds: Record<SoundType, string> = {
            shake: '/sounds/shake.mp3',
            open: '/sounds/open.mp3',
            win: '/sounds/win.mp3',
            troll: '/sounds/troll.mp3',
            bgm: '/sounds/bgm.mp3',
            click: '/sounds/click.mp3',
            revel: '/sounds/revel.mp3',
            waiting: '/sounds/waiting.mp3',
            heartbeat: '/sounds/heartbeat.mp3',
            trap: '/sounds/trap.mp3',
            jackpot: '/sounds/jackpot.mp3'
        };

        Object.entries(sounds).forEach(([key, path]) => {
            const audio = new Audio(path);
            audio.volume = key === 'bgm' ? 0.3 : 0.6; // BGM lower volume
            if (key === 'bgm') audio.loop = true;

            // Error handling for missing files to prevent console spam
            audio.onerror = () => {
                // console.warn(`Sound file missing: ${path}`);
                audioRefs.current[key as SoundType] = null;
            };

            audioRefs.current[key as SoundType] = audio;
        });

        return () => {
            Object.values(audioRefs.current).forEach(audio => {
                if (audio) {
                    audio.pause();
                    audio.src = '';
                }
            });
        };
    }, []);

    const play = (type: SoundType) => {
        if (muted) return;
        const audio = audioRefs.current[type];
        if (audio) {
            if (type !== 'bgm') {
                audio.currentTime = 0; // Restart non-looping sounds
            }
            audio.play().catch(() => {
                // Auto-play policy might block this if no user interaction yet
            });
        }
    };

    const stop = (type: SoundType) => {
        const audio = audioRefs.current[type];
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    };

    const toggleMute = () => {
        setMuted(prev => !prev);
        // If muting, stop all. If unmuting, maybe restart bgm?
        if (!muted) {
            Object.values(audioRefs.current).forEach(a => a?.pause());
        } else {
            // Optional: Resume BGM
            audioRefs.current.bgm?.play().catch(() => { });
        }
    };

    return { play, stop, toggleMute, muted };
};
