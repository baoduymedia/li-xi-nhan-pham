import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Medal, Award, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import { api, type Player } from '../lib/api';

const Leaderboard = () => {
    const { roomId } = useParams();
    const [rankings, setRankings] = useState<Player[]>([]);

    useEffect(() => {
        if (roomId) {
            api.getLeaderboard(roomId).then(setRankings).catch(console.error);

            // Poll for updates (Realtime subscription would be better but requires more setup)
            const interval = setInterval(() => {
                api.getLeaderboard(roomId).then(setRankings).catch(console.error);
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [roomId]);

    return (
        <div className="w-full max-w-2xl mx-auto pb-10">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Bảng Xếp Hạng</h1>
                <p className="text-white/60">Phòng: {roomId}</p>
            </div>

            <div className="space-y-4">
                {rankings.map((player, index) => (
                    <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className={`flex items-center gap-4 p-4 ${index === 0 ? 'bg-yellow-500/20 border-yellow-400/50' : ''}`}>
                            <div className="w-10 h-10 flex items-center justify-center font-bold text-xl text-white/50">
                                {index === 0 ? <Crown className="text-yellow-400 fill-yellow-400" /> :
                                    index === 1 ? <Medal className="text-gray-300 fill-gray-300" /> :
                                        index === 2 ? <Medal className="text-amber-700 fill-amber-700" /> :
                                            `#${index + 1}`}
                            </div>

                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                                <User className="w-6 h-6 text-white/50" />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg text-white">{player.name}</h3>
                                    {player.badge && (
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider
                      ${player.badge === 'Nhân Phẩm Âm' ? 'bg-gray-700 text-gray-300' : 'bg-red-500 text-white'}
                    `}>
                                            {player.badge}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="font-bold text-yellow-400 text-lg">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(player.amount)}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full text-white/40 text-sm">
                    <Award className="w-4 h-4" />
                    Cập nhật theo thời gian thực
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
