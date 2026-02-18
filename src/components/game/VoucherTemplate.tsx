import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Trophy, Star } from 'lucide-react';

interface VoucherProps {
    name: string;
    amount: number;
    wish: string;
    karmaScore: number;
    roomId: string;
    date: string;
}

const VoucherTemplate = forwardRef<HTMLDivElement, VoucherProps>(({ name, amount, wish, karmaScore, roomId, date }, ref) => {
    return (
        <div ref={ref} className="fixed top-0 left-[-9999px] w-[1080px] h-[1920px] bg-gradient-to-br from-[#1a0505] to-[#3a0000] text-white font-serif relative overflow-hidden flex flex-col p-20 z-[9999]">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="absolute inset-0 border-[40px] border-yellow-500/80 rounded-[60px] pointer-events-none"></div>

            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-yellow-500/20 to-transparent"></div>

            {/* Header */}
            <div className="relative z-10 text-center mt-20">
                <div className="inline-block p-4 border-2 border-yellow-500 rounded-full mb-8 bg-black/40 backdrop-blur-md shadow-xl">
                    <Trophy className="w-32 h-32 text-yellow-400" />
                </div>
                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 uppercase tracking-widest drop-shadow-sm">
                    Chứng Nhận
                </h1>
                <h2 className="text-5xl text-yellow-500 font-bold mt-4 uppercase tracking-[0.5em]">Nhân Phẩm Cao Quý</h2>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10 my-10">
                <p className="text-4xl text-white/60 mb-8 font-sans uppercase tracking-widest">Trao tặng cho</p>
                <div className="relative mb-16">
                    <h3 className="text-[120px] font-black text-white leading-tight drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]">
                        {name || 'Người Bí Ẩn'}
                    </h3>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
                </div>

                <div className="bg-white/10 border border-white/20 backdrop-blur-md p-12 rounded-[50px] w-full max-w-3xl transform rotate-1 shadow-2xl">
                    <p className="text-3xl text-yellow-200 mb-4 font-sans uppercase font-bold">Lộc Xuân Nhận Được</p>
                    <p className="text-[100px] font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600">
                        {new Intl.NumberFormat('vi-VN').format(amount)} <span className="text-4xl text-yellow-400">VNĐ</span>
                    </p>
                </div>

                <p className="mt-16 text-5xl italic text-white/90 max-w-4xl leading-relaxed">
                    "{wish}"
                </p>
            </div>

            {/* Footer */}
            <div className="relative z-10 flex items-center justify-between mt-auto w-full px-10">
                <div className="text-left">
                    <p className="text-4xl font-bold text-cyan-400 flex items-center gap-4">
                        <Star className="w-10 h-10 fill-cyan-400" /> {karmaScore} / 100
                    </p>
                    <p className="text-2xl text-white/40 mt-2 font-mono">{date}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl text-black flex items-center gap-6 shadow-2xl">
                    <QRCodeSVG value={`${window.location.origin}/play/${roomId}`} size={150} />
                    <div className="text-left">
                        <p className="text-2xl font-bold uppercase">Xác thực</p>
                        <p className="text-xl opacity-60">Quét mã</p>
                    </div>
                </div>
            </div>

            {/* Signature Watermark */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/5 text-[200px] font-black uppercase tracking-widest pointer-events-none whitespace-nowrap z-0">
                Lộc Xuân
            </div>
        </div>
    );
});

export default VoucherTemplate;
