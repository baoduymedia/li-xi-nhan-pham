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
                        <Card className={`flex items-center gap-4 p-4 border transition-all ${index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-400 shadow-lg shadow-yellow-500/10' :
                                'border-white/10 hover:border-yellow-500/30'
                            }`}>
                            <div className={`w-10 h-10 flex items-center justify-center font-bold text-xl ${index === 0 ? 'text-yellow-400 drop-shadow-md' : 'text-white/40'
                                }`}>
                                {index === 0 ? <Crown className="text-yellow-400 fill-yellow-400 w-8 h-8 filter drop-shadow-lg" /> :
                                    index === 1 ? <Medal className="text-gray-300 fill-gray-300 w-6 h-6" /> :
                                        index === 2 ? <Medal className="text-amber-700 fill-amber-700 w-6 h-6" /> :
                                            `#${index + 1}`}
                            </div>

                            <div className="w-12 h-12 rounded-full bg-red-950 flex items-center justify-center overflow-hidden border-2 border-yellow-500/50 shadow-inner">
                                <User className="w-6 h-6 text-yellow-200" />
                            </div>

                            <div className="flex-1">
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-lg text-white group-hover:text-yellow-300 transition-colors">{player.name}</h3>
                                    {player.badge && (
                                        <div className="flex">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1
                                             ${player.badge === 'Nhân Phẩm Âm' ? 'bg-gray-800 text-gray-400 border border-gray-600' : 'bg-red-600 text-yellow-100 border border-yellow-500'}
                                            `}>
                                                {player.badge}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="font-black text-yellow-400 text-lg drop-shadow-sm">
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
