export interface Trap {
    id: string;
    content: string;
    category: 'physical' | 'embarrassing' | 'service' | 'promotion' | 'custom';
    intensity: 1 | 2 | 3; // 1: Cute, 2: Funny/Mild, 3: Nightmare
    tags?: string[];
}

export const TRAP_LIBRARY: Trap[] = [
    // PHYSICAL (Hành xác)
    { id: 'p1', content: 'Plank trong 30 giây (có người đếm)', category: 'physical', intensity: 2 },
    { id: 'p2', content: 'Squat 20 cái ngay tại chỗ', category: 'physical', intensity: 2 },
    { id: 'p3', content: 'Nhảy lò cò 1 vòng quanh phòng', category: 'physical', intensity: 1 },
    { id: 'p4', content: 'Hít đất 10 cái', category: 'physical', intensity: 2 },
    { id: 'p5', content: 'Vừa plank vừa hát Quốc ca', category: 'physical', intensity: 3 },

    // EMBARRASSING (Mất hình tượng)
    { id: 'e1', content: 'Hát một bài nhạc thiếu nhi bằng giọng Opera', category: 'embarrassing', intensity: 2 },
    { id: 'e2', content: 'Làm mặt xấu nhất có thể để mọi người chụp meme', category: 'embarrassing', intensity: 2 },
    { id: 'e3', content: 'Dùng mông viết tên mình lên không trung', category: 'embarrassing', intensity: 3 },
    { id: 'e4', content: 'Gọi điện cho người yêu/crush nói "Gấu gấu meo meo"', category: 'embarrassing', intensity: 3 },
    { id: 'e5', content: 'Kể một chuyện cười, nếu không ai cười phải kể lại', category: 'embarrassing', intensity: 2 },

    // SERVICE (Gia đình/Phục vụ)
    { id: 's1', content: 'Rửa bát toàn bộ bữa tiệc hôm nay', category: 'service', intensity: 3 },
    { id: 's2', content: 'Rót nước mời từng người trong phòng', category: 'service', intensity: 1 },
    { id: 's3', content: 'Đấm lưng cho chủ phòng 5 phút', category: 'service', intensity: 1 },
    { id: 's4', content: 'Dọn sạch bàn tiệc sau khi ăn xong', category: 'service', intensity: 2 },

    // PROMOTION (PR cho Duy)
    { id: 'm1', content: 'Đăng story khen Duy đẹp trai nhất vùng', category: 'promotion', intensity: 1 },
    { id: 'm2', content: 'Quay clip 15s giới thiệu "Bảo Duy Media" đỉnh cao', category: 'promotion', intensity: 2 },
    { id: 'm3', content: 'Hô to "Bảo Duy Media muôn năm" 3 lần', category: 'promotion', intensity: 1 },
];

export const TrapStudio = {
    getTrapsByCategory(category: Trap['category']) {
        return TRAP_LIBRARY.filter(t => t.category === category);
    },

    getTrapsByIntensity(level: number) {
        return TRAP_LIBRARY.filter(t => t.intensity === level);
    },

    suggestTrapForPersona(persona: string): Trap {
        // Simple keyword matching or random fallback
        const lower = persona.toLowerCase();

        if (lower.includes('khoẻ') || lower.includes('gym')) {
            const pool = this.getTrapsByCategory('physical');
            return pool[Math.floor(Math.random() * pool.length)];
        }

        if (lower.includes('hài') || lower.includes('lầy')) {
            const pool = this.getTrapsByCategory('embarrassing');
            return pool[Math.floor(Math.random() * pool.length)];
        }

        if (lower.includes('ngoan') || lower.includes('em')) {
            return { id: 'temp', content: 'Chúc bé ngoan hay ăn chóng lớn', category: 'custom', intensity: 1 };
        }

        // Default: Random Mix
        return TRAP_LIBRARY[Math.floor(Math.random() * TRAP_LIBRARY.length)];
    },

    getRandomTrap(intensityLevel?: number): Trap {
        let pool = TRAP_LIBRARY;
        if (intensityLevel) {
            pool = pool.filter(t => t.intensity === intensityLevel);
        }
        if (pool.length === 0) pool = TRAP_LIBRARY;
        return pool[Math.floor(Math.random() * pool.length)];
    }
};
