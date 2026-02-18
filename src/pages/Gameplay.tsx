import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Shuffle, Eye, EyeOff, AlertTriangle, ArrowLeft, Smartphone, Download, Volume2, VolumeX, ScanFace } from 'lucide-react';
import { api } from '../lib/api';
import confetti from 'canvas-confetti';
import PremiumEnvelope from '../components/game/PremiumEnvelope';
import AuraScan from '../components/game/AuraScan';
import VoucherTemplate from '../components/game/VoucherTemplate'; // Import VoucherTemplate
import { useShake } from '../hooks/useShake';
import { useSound } from '../hooks/useSound';
import html2canvas from 'html2canvas';



interface RedemptionState {
    status: 'none' | 'requested' | 'doing' | 'completed' | 'failed';
    timestamp: number;
}

const Gameplay = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [joined, setJoined] = useState(false);
    const voucherRef = useRef<HTMLDivElement>(null); // Ref for Voucher

    // Game State
    const [deck, setDeck] = useState<any[]>([]); // Use server envelope state
    const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'ended' | 'paused'>('waiting');
    const [currentResult, setCurrentResult] = useState<{
        id: number,
        amount: number;
        wish: string;
        isTrap: boolean;
        trap?: { type: 'text' | 'action' | 'bankrupt' };
        karmaScore?: number;
    } | null>(null);
    const [godMode, setGodMode] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);

    // Redemption State
    const [redemptionStatus, setRedemptionStatus] = useState<RedemptionState | null>(null);
    const [activeChallenge, setActiveChallenge] = useState<{ id: string, content: string, duration: number } | null>(null);
    const [showRedemptionUI, setShowRedemptionUI] = useState(false);

    // Aura Scan State
    const [showScan, setShowScan] = useState(false);
    const [hasScanned, setHasScanned] = useState(false);
    const [auraScore, setAuraScore] = useState<number | null>(null);

    // Ad State
    const [adConfig, setAdConfig] = useState<any>(null);
    const [showAd, setShowAd] = useState(false);
    const [adTimer, setAdTimer] = useState(0);
    const [playCount, setPlayCount] = useState(0);

    // Audio & Shake
    const { play, toggleMute, muted } = useSound();
    const isShaking = useShake();

    // Fingerprint Check and SYNC
    useEffect(() => {
        const hasPlayed = localStorage.getItem(`played_${roomId}`);
        if (hasPlayed) {
            const savedResult = localStorage.getItem(`result_${roomId}`);
            if (savedResult) {
                setJoined(true);
                setCurrentResult(JSON.parse(savedResult));
            }
        }

        // Polling Universe State + Subscribe
        if (roomId && joined) {
            const fetchState = async () => {
                const stats = await api.getRoomStats(roomId);
                if (stats) {
                    if (stats.envelopes) setDeck(stats.envelopes);
                    setGameStatus(stats.status);

                    // Check Redemption Status
                    const deviceId = localStorage.getItem('device_id');
                    const me = stats.participants.find((p: any) => p.deviceId === deviceId);

                    if (me && me.redemption) {
                        setRedemptionStatus(me.redemption);
                        if (me.redemption.status === 'doing' || me.redemption.status === 'requested') {
                            setShowRedemptionUI(true);
                        }
                        // If completed, reset local result to allow re-roll
                        if (me.redemption.status === 'completed' && currentResult?.isTrap) {
                            setCurrentResult(null);
                            setShowRedemptionUI(false);
                            localStorage.removeItem(`played_${roomId}`); // Allow re-play
                            alert("Thử thách thành công! Bạn được chọn lại!");
                        }
                    }

                    if ((stats as any).activeChallenge) {
                        setActiveChallenge((stats as any).activeChallenge);
                    }

                    // Sync Ad Config
                    if ((stats as any).adConfig) {
                        setAdConfig((stats as any).adConfig);
                    }
                }
            };

            fetchState();
            const unsubscribe = api.subscribe(fetchState);
            const interval = setInterval(fetchState, 1000);

            return () => {
                unsubscribe();
                clearInterval(interval);
            }
        }
    }, [roomId, joined]);

    // Initialize Deck - No longer purely local, wait for polling
    // But for initial render, we can keep empty or loading state

    // Handle Shake -> Interaction and Open
    useEffect(() => {
        if (isShaking && joined && !currentResult && gameStatus === 'playing') {
            play('shake');

            // 1. Ghosting Signal (Simulate interaction)
            const deviceId = localStorage.getItem('device_id') || 'unknown';

            // Find a random available envelope to target
            const available = deck.filter(e => e.status === 'available');
            if (available.length > 0) {
                const target = available[Math.floor(Math.random() * available.length)];

                // Lock it!
                api.interactEnvelope(roomId || '', target.id, deviceId, 'lock').then(res => {
                    if (res.success) {
                        // If lock successful, try to open it after a split second
                        setTimeout(() => handleOpen(target), 500);
                    }
                });
            }
        }
    }, [isShaking, joined, currentResult, deck, gameStatus]);

    // ...

    const handleJoin = async () => {
        if (name.trim()) {
            try {
                // Generate or retrieve Device ID
                let deviceId = localStorage.getItem('device_id');
                if (!deviceId) {
                    deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
                    localStorage.setItem('device_id', deviceId);
                }

                const res = await api.joinRoom(roomId || '', name, deviceId);
                if (res.success) {
                    setJoined(true);
                    play('bgm');
                } else {
                    alert(res.error || 'Không thể tham gia phòng.');
                }
            } catch (e) {
                alert('Lỗi kết nối.');
                console.error(e);
            }
        }
    };

    const handleShuffle = () => {
        setIsShuffling(true);
        play('shake');
        setTimeout(() => {
            const shuffled = [...deck].sort(() => Math.random() - 0.5);
            setDeck(shuffled);
            setIsShuffling(false);
        }, 800);
    };

    const handleOpen = async (envelope: any) => {
        if (envelope.status === 'opened' || currentResult || !roomId) return;

        if (localStorage.getItem(`played_${roomId}`)) {
            alert("Bạn đã mở lì xì rồi! Không được mở lần 2 nhé.");
            return;
        }

        if (!hasScanned) {
            // alert("Vui lòng Quét Nhân Phẩm trước khi mở!"); // removed redundant alert
            setShowScan(true);
            return;
        }

        const deviceId = localStorage.getItem('device_id') || 'unknown';

        try {
            play('open');
            // Pass Envelope ID to API
            const res = await api.openEnvelope(roomId, name, envelope.id, deviceId);

            if (!res.success) {
                alert(res.error || "Lỗi mở bao!");
                return;
            }

            // Update local deck optimistically
            setDeck(prev => prev.map(e => e.id === envelope.id ? { ...e, status: 'opened' } : e));
            // Add ID to result for layoutId matching
            setCurrentResult({ ...res as any, id: envelope.id });

            localStorage.setItem(`played_${roomId}`, 'true');
            localStorage.setItem(`result_${roomId}`, JSON.stringify(res));

            if (navigator.vibrate) navigator.vibrate(200);

            if (res.success && !(res as any).isTrap) {
                play('win');
                const duration = 3000;
                const end = Date.now() + duration;

                const frame = () => {
                    confetti({
                        particleCount: 2,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: ['#FFD700', '#D4AF37', '#FFFFFF']
                    });
                    confetti({
                        particleCount: 2,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: ['#FFD700', '#D4AF37', '#FFFFFF']
                    });
                    if (Date.now() < end) requestAnimationFrame(frame);
                };
                frame();
            } else {
                play('troll');
            }

            // Check for Ad Trigger
            const newPlayCount = playCount + 1;
            setPlayCount(newPlayCount);

            if (adConfig?.enabled && newPlayCount % adConfig.frequency === 0) {
                setTimeout(() => {
                    setShowAd(true);
                    setAdTimer(5); // 5s forced view
                }, 2000); // Show ad 2s after result
            }

        } catch (e) {
            console.error(e);
        }
    };

    const handleHesitation = async (envelopeId: number) => {
        if (!roomId || !name || !joined || currentResult || gameStatus !== 'playing') return;

        // Log to console for debug
        console.log(`User ${name} is hesitating on envelope ${envelopeId}`);

        const deviceId = localStorage.getItem('device_id') || 'unknown';
        await api.reportHesitation(roomId, name, envelopeId, deviceId);
    };

    const handleRequestRedemption = async () => {
        if (!roomId || !name) return;
        try {
            await api.requestRedemption(roomId, name);
            setShowRedemptionUI(true); // Open waiting UI
        } catch (e) {
            console.error(e);
        }
    };

    // ... handleDownloadCard ... (Keep same logic, just hiding to focus on render)
    const handleDownloadCard = async () => {
        if (voucherRef.current) {
            try {
                // Wait a bit for the hidden element to be fully rendered if needed
                await new Promise(resolve => setTimeout(resolve, 100));

                const canvas = await html2canvas(voucherRef.current, {
                    scale: 2,
                    backgroundColor: null,
                    useCORS: true,
                    logging: false
                });

                const dataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `chung-nhan-nhan-pham-${roomId}-${Date.now()}.png`;
                link.href = dataUrl;
                link.click();
            } catch (err) { console.error(err); alert("Lỗi khi tải ảnh chứng nhận"); }
        }
    };

    // Polling & Countdown (Keep logic same)
    // gameStatus is already declared at top
    const [countdown, setCountdown] = useState<number | null>(null);

    useEffect(() => {
        if (joined && roomId && gameStatus === 'waiting') {
            const interval = setInterval(async () => {
                const stats = await api.getRoomStats(roomId);
                if (stats?.status === 'playing') {
                    setCountdown(3);
                    clearInterval(interval);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [joined, roomId, gameStatus]);

    useEffect(() => {
        if (countdown !== null && countdown > 0) {
            const timer = setTimeout(() => {
                play('open'); // Tick sound
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setGameStatus('playing');
            setCountdown(null);
            play('win'); // Start sound
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }
    }, [countdown]);

    // Ad Timer Effect
    useEffect(() => {
        if (showAd && adTimer > 0) {
            const timer = setTimeout(() => setAdTimer(adTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [showAd, adTimer]);

    // ... Render Login ... (Keep similar, add Sound Toggle?)

    if (!joined) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-lg mx-auto px-4">
                {/* ... Keep login UI ... */}
                <div className="w-full glass-premium p-10 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500"></div>
                    <h2 className="text-4xl font-serif font-bold text-center text-gold-premium mb-2">Xin Chào</h2>
                    <p className="text-center text-white/60 mb-8 font-sans">Chiếc tên làm nên nhân phẩm</p>
                    <input
                        type="text"
                        placeholder="Nhập tên của bạn..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/30 border border-yellow-500/20 rounded-xl px-6 py-5 text-center text-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-400 mb-8 transition-all font-serif"
                    />
                    <button onClick={handleJoin} className="w-full py-5 text-xl btn-neumorphic">Bắt Đầu</button>
                    <button onClick={() => navigate('/')} className="w-full mt-4 text-sm text-white/40 hover:text-white transition-colors">Quay về trang chủ</button>
                </div>
            </div>
        );
    }

    // Waiting Room
    if (gameStatus === 'waiting' && countdown === null) {
        // ... Keep waiting room UI ...
        return (
            <div className="flex flex-col items-center justify-center min-h-screen w-full relative overflow-hidden">
                <div className="z-10 text-center space-y-8 p-6">
                    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-red-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,215,0,0.4)] border-4 border-yellow-300">
                        <span className="text-5xl font-bold text-white">{name.charAt(0).toUpperCase()}</span>
                    </motion.div>
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Xin chào, {name}!</h2>
                        <p className="text-yellow-200/80 text-lg animate-pulse">Đang chờ chủ phòng phát lộc...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (countdown !== null) {
        return (
            <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-red-950 to-black">
                <motion.div key={countdown} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.5, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} className="text-[150px] font-black text-yellow-400 drop-shadow-[0_0_50px_rgba(255,215,0,0.8)]">
                    {countdown}
                </motion.div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center min-h-screen px-4 py-8 relative">

            {/* Main Header */}
            <div className="w-full flex justify-between items-center mb-6 z-10">
                <button onClick={() => navigate('/')} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft className="text-white w-6 h-6" />
                </button>

                <div className="flex items-center gap-4">
                    <button onClick={toggleMute} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <div onClick={() => setGodMode(!godMode)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${godMode ? 'bg-red-500 text-white' : 'bg-white/5 text-white/10 hover:text-white/30'}`}>
                        {godMode ? <Eye size={20} /> : <EyeOff size={20} />}
                    </div>
                    <button onClick={handleShuffle} disabled={isShuffling} className="px-6 py-2 rounded-full border border-yellow-500/30 text-yellow-200 hover:bg-yellow-500/10 flex items-center gap-2 transition-all">
                        <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} /> Tráo Bài
                    </button>
                </div>
            </div>

            {/* Aura Scan Prompt */}
            {!hasScanned && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 z-20">
                    <button
                        onClick={() => setShowScan(true)}
                        className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-pulse flex items-center gap-3 hover:scale-105 transition-transform"
                    >
                        <ScanFace className="w-6 h-6" /> Quét Nhân Phẩm
                    </button>
                </motion.div>
            )}

            {/* Aura Result Badge */}
            {hasScanned && auraScore !== null && (
                <div className="mb-6 z-10 px-4 py-1 bg-black/40 border border-cyan-500/30 rounded-full flex items-center gap-2">
                    <span className="text-cyan-400 text-xs uppercase font-bold">Aura Score</span>
                    <span className="text-white font-mono font-bold">{auraScore}</span>
                </div>
            )}

            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-black/40 backdrop-blur-sm border border-white/10 px-6 py-3 rounded-full flex items-center gap-3 z-10">
                <Smartphone className={`w-5 h-5 text-yellow-400 ${isShaking ? 'animate-shake' : 'animate-pulse'}`} />
                <span className="text-white/90 font-medium">Lắc điện thoại để nhận lộc!</span>
            </motion.div>

            {/* SHARED ELEMENT TRANSITION GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 w-full max-w-4xl place-items-center pb-20 relative z-0">
                <AnimatePresence>
                    {deck.map((envelope) => (
                        <PremiumEnvelope
                            key={envelope.id}
                            layoutId={`envelope-${envelope.id}`} // Shared ID
                            amount={envelope.amount || 0} // Could be hidden
                            isTrap={envelope.isTrap || false}
                            opened={envelope.status === 'opened'}
                            status={envelope.status} // 'available' | 'locked' | 'opened'
                            godMode={godMode}
                            onClick={() => handleOpen(envelope)}
                            onHesitate={() => handleHesitation(envelope.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* RESULT OVERLAY - SHARED ELEMENT */}
            <AnimatePresence>
                {currentResult && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            layoutId={`envelope-${currentResult.id}`} // Matches the clicked envelope
                            className={`w-full max-w-md relative ${currentResult.isTrap ? 'bg-gray-900 border-gray-700' : 'bg-gradient-to-b from-red-900 to-red-950 border-yellow-500'} border-2 rounded-2xl shadow-2xl overflow-hidden`}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <motion.button
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setCurrentResult(null)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white z-50"
                            >
                                X
                            </motion.button>

                            <div className={`h-2 w-full ${currentResult.isTrap ? 'bg-gray-600' : 'bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300'}`}></div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="p-10 text-center relative z-10"
                            >
                                {/* ... Result Content ... */}
                                {currentResult.isTrap ? (
                                    <>
                                        {currentResult.trap?.type === 'bankrupt' ? (
                                            <div className="mb-6 relative">
                                                <AlertTriangle className="w-24 h-24 text-red-600 mx-auto animate-pulse" />
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="absolute top-0 right-10 text-4xl">💸</motion.div>
                                            </div>
                                        ) : currentResult.trap?.type === 'action' ? (
                                            <div className="mb-6 relative">
                                                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-8xl">🎭</motion.div>
                                            </div>
                                        ) : (
                                            <AlertTriangle className="w-24 h-24 text-gray-500 mx-auto mb-6 animate-pulse" />
                                        )}
                                        <h2 className="text-4xl font-black text-white uppercase tracking-widest glitch-text mb-4" data-text="BỊ TROLL">
                                            {currentResult.trap?.type === 'bankrupt' ? 'MẤT SẠCH!' : currentResult.trap?.type === 'action' ? 'THỬ THÁCH' : 'BỊ TROLL'}
                                        </h2>
                                    </>
                                ) : (
                                    <>
                                        <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
                                        <h2 className="text-4xl font-serif font-black text-gold-premium tracking-wider mb-2">CHÚC MỪNG</h2>
                                    </>
                                )}

                                <div className="py-8 border-y border-white/10 my-6 bg-black/20 rounded-lg">
                                    <p className={`text-5xl md:text-6xl font-serif font-bold ${currentResult.isTrap ? 'text-gray-400 decoration-red-500 decoration-4' : 'text-white drop-shadow-lg'}`}>
                                        {currentResult.isTrap && currentResult.trap?.type === 'bankrupt' ? (
                                            <span className="text-red-500 line-through decoration-white">-100%</span>
                                        ) : currentResult.isTrap ? (
                                            <span className="text-gray-500">:(</span>
                                        ) : (
                                            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentResult.amount)
                                        )}
                                    </p>
                                </div>

                                <p className={`text-xl font-serif italic leading-relaxed ${currentResult.trap?.type === 'action' ? 'text-yellow-300 font-bold text-2xl' : 'text-yellow-100/90'}`}>
                                    "{currentResult.wish}"
                                </p>

                                {/* Karma Score Display */}
                                {currentResult.karmaScore !== undefined && (
                                    <div className="mt-6">
                                        <div className="flex justify-between text-xs uppercase tracking-widest text-white/50 mb-1">
                                            <span>Nhân Phẩm</span>
                                            <span className={currentResult.karmaScore >= 80 ? "text-green-400" : currentResult.karmaScore < 20 ? "text-red-500" : "text-yellow-400"}>
                                                {currentResult.karmaScore}/100
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${currentResult.karmaScore}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={`h-full ${currentResult.karmaScore >= 80 ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : currentResult.karmaScore < 20 ? "bg-red-500" : "bg-yellow-500"}`}
                                            ></motion.div>
                                        </div>
                                        <p className="text-[10px] text-white/30 mt-1 italic">
                                            {currentResult.karmaScore >= 90 ? "Thánh sống!" : currentResult.karmaScore < 10 ? "Ăn ở sao vậy?" : "Cũng tạm được..."}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-10 flex gap-4">
                                    <button onClick={() => setCurrentResult(null)} className="flex-1 py-4 rounded-xl border border-white/20 hover:bg-white/10 text-white font-bold tracking-widest uppercase transition-all">Đóng</button>
                                    {!currentResult.isTrap && (
                                        <button onClick={handleDownloadCard} className="flex-1 py-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-red-900 font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2">
                                            <Download className="w-5 h-5" /> Lưu Ảnh
                                        </button>
                                    )}
                                </div>

                                {/* Redemption Button */}
                                {currentResult.isTrap && !localStorage.getItem(`redemption_${roomId}`) && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1 }}
                                        onClick={handleRequestRedemption}
                                        className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-800 border border-red-400 text-white font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(255,0,0,0.5)] hover:scale-105 transition-transform flex items-center justify-center gap-2"
                                    >
                                        <AlertTriangle className="w-5 h-5" /> Xin Hồi Sinh
                                    </motion.button>
                                )}
                            </motion.div>
                        </motion.div>

                        {/* Hidden Voucher Template */}
                        <div className="fixed top-0 left-[-9999px]">
                            <VoucherTemplate
                                ref={voucherRef}
                                name={name}
                                amount={currentResult?.amount || 0}
                                wish={currentResult?.wish || ''}
                                karmaScore={currentResult?.karmaScore || auraScore || 50}
                                roomId={roomId || ''}
                                date={new Date().toLocaleDateString('vi-VN')}
                            />
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* REDEMPTION CHALLENGE UI */}
            <AnimatePresence>
                {showRedemptionUI && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="w-full max-w-lg bg-gray-900 border-2 border-red-500 rounded-3xl p-8 text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>

                            <h2 className="text-3xl font-black text-red-500 uppercase tracking-widest mb-6">Thử Thách Hồi Sinh</h2>

                            {redemptionStatus?.status === 'requested' ? (
                                <div className="space-y-6">
                                    <div className="w-20 h-20 mx-auto border-4 border-t-red-500 border-r-transparent border-b-red-500 border-l-transparent rounded-full animate-spin"></div>
                                    <p className="text-xl text-white/80 animate-pulse">Đang chờ Chủ Phòng ra đề...</p>
                                </div>
                            ) : redemptionStatus?.status === 'doing' && activeChallenge ? (
                                <div className="space-y-8">
                                    <div className="p-6 bg-red-900/30 rounded-xl border border-red-500/30">
                                        <p className="text-sm text-red-300 uppercase tracking-widest mb-2">Nhiệm vụ của bạn</p>
                                        <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                                            "{activeChallenge.content}"
                                        </p>
                                    </div>

                                    {/* Timer Visualization could go here */}
                                    {/* For now just simple text */}
                                    <div className="text-yellow-400 text-6xl font-black font-mono animate-pulse">
                                        {/* We rely on Host Timer sync visually or just show 'DO IT NOW' */}
                                        DO IT!
                                    </div>
                                    <p className="text-white/60 text-sm">Hãy thực hiện trước mặt mọi người!</p>
                                </div>
                            ) : (
                                <p>Loading...</p>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* AURA SCAN MODAL */}
            <AnimatePresence>
                {showScan && (
                    <AuraScan
                        onClose={() => setShowScan(false)}
                        onComplete={(score) => {
                            setAuraScore(score);
                            setHasScanned(true);
                            setShowScan(false);
                            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
                            play('win');
                        }}
                    />
                )}
            </AnimatePresence>

            {/* PAUSE OVERLAY */}
            <AnimatePresence>
                {gameStatus === 'paused' && (
                    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-4xl text-yellow-500 font-black uppercase tracking-widest animate-pulse">Trò chơi tạm dừng</h2>
                            <p className="text-white/60 mt-4">Vui lòng chờ Chủ phòng...</p>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* AD OVERLAY */}
            <AnimatePresence>
                {showAd && adConfig && (
                    <div className="fixed inset-0 z-[70] bg-black flex flex-col items-center justify-center p-4">
                        <div className="absolute top-4 right-4 text-white/50 text-sm">
                            Quảng cáo {adTimer > 0 ? `(${adTimer}s)` : ''}
                        </div>

                        <div className="w-full max-w-lg aspect-video bg-gray-800 rounded-xl overflow-hidden mb-4 relative">
                            {adConfig.bannerUrl ? (
                                <img src={adConfig.bannerUrl} alt="Advertisement" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                    <span>Quảng cáo tại đây</span>
                                </div>
                            )}
                        </div>

                        <div className="text-center mb-8">
                            <h3 className="text-xl font-bold text-white mb-2">Nhà Tài Trợ</h3>
                            <p className="text-white/60">Cảm ơn bạn đã đồng hành cùng chương trình.</p>
                        </div>

                        <button
                            disabled={adTimer > 0}
                            onClick={() => setShowAd(false)}
                            className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest transition-all ${adTimer > 0 ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-white text-black hover:bg-white/90'}`}
                        >
                            {adTimer > 0 ? `Bỏ qua sau ${adTimer}s` : 'Bỏ qua quảng cáo'}
                        </button>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default Gameplay;
