// AI Wish Generator Service
// Currently uses advanced templates, but structured to easily swap with OpenAI/Gemini API

const THEMES = { // Used for tagging templates
    WEALTH: ['WEALTH'],
    LOVE: ['LOVE'],
    HEALTH: ['HEALTH'],
    FUN: ['FUN']
};

const TEMPLATES = [
    {
        min: 500000,
        tags: [THEMES.WEALTH[0]],
        text: [
            "Đại gia {name} chân đất mắt to,\nTiền vào như nước, chẳng lo điều gì.",
            "Nửa triệu vào tay {name} rồi,\nCả năm sung túc, ngồi chơi xơi quà.",
            "Vía {name} tốt quá đi thôi,\nNăm nay đất đai, nhà lầu xe hơi.",
            "Chúc mừng {name} đại gia,\nTiền này để dành mua nhà năm sau!"
        ]
    },
    {
        min: 200000,
        tags: [THEMES.WEALTH[0], THEMES.FUN[0]],
        text: [
            "{name} ơi, nhân phẩm tuyệt vời,\nNăm nay gặt hái bầu trời thành công!",
            "Hai trăm nghìn, lộc đầy tay,\n{name} cười tít mắt, vận may ùa về.",
            "Lộc này không phải dạng vừa,\n{name} nhớ khao bạn, đừng lừa người ta."
        ]
    },
    {
        min: 100000,
        tags: [THEMES.WEALTH[0], THEMES.FUN[0]],
        text: [
            "{name} cười tít mắt rồi,\nTrăm nghìn may mắn, lộc rơi đầy nhà.",
            "Đầu năm bốc được trăm ca,\n{name} vui vẻ, mặn mà cả năm.",
            "Lộc to, lộc nhỏ, lộc vàng,\nKhông bằng lộc này {name} mang về."
        ]
    },
    {
        min: 50000,
        tags: [THEMES.FUN[0], THEMES.LOVE[0]],
        text: [
            "{name} ơi, năm mới phát tài,\nTiền vào cửa trước, chẳng sai cửa nào.",
            "Năm chục cũng là lộc to,\n{name} đừng lo lắng, trời cho lộc này.",
            "Có tiền là có người yêu,\n{name} nhớ chải chuốt, sớm chiều có đôi."
        ]
    },
    {
        min: 20000,
        tags: [THEMES.FUN[0]],
        text: [
            "Lộc này muỗi đốt inox,\nNhưng mà {name} vẫn cứ sock (shock) vì vui.",
            "Hai mươi nghìn, phở một tô,\n{name} ăn cho ấm, đừng lo ế chồng (vợ).",
            "Của ít lòng nhiều {name} ơi,\nVui là chính, tiền là... phụ thôi."
        ]
    },
    {
        min: 10000,
        tags: [THEMES.FUN[0]],
        text: [
            "Lộc này tuy nhỏ nhưng vui,\n{name} nhận lấy, nụ cười trên môi.",
            "Mười nghìn, hai chục cũng tiền,\n{name} đừng chê ít, lộc hiền đầu năm.",
            "Tuy là lộc bé tí teo,\nNhưng mà tình nghĩa to lèo đầu năm."
        ]
    },
    {
        min: 0,
        tags: [THEMES.FUN[0], 'TROLL'],
        text: [
            "Của ít lòng nhiều {name} ơi,\nQuan trọng là lộc, là lời chúc vui.",
            "Đầu năm nhận chút lộc rơi,\n{name} sẽ gặp may mắn trọn đời ấm êm.",
            "Tiền không quan trọng, tình là chính,\n{name} nhỉ? (Nhưng tiền vẫn thích hơn!)"
        ]
    }
];

export const ai = {
    generateWish: (name: string, amount: number, _context?: string): string => {
        // 1. Filter templates by amount
        const eligibleGroups = TEMPLATES.filter(t => amount >= t.min);
        const group = eligibleGroups[0] || TEMPLATES[TEMPLATES.length - 1]; // First match (highest min) or fallback

        // 2. Pick random template from group
        const rawTemplate = group.text[Math.floor(Math.random() * group.text.length)];

        // 3. Replace placeholders
        return rawTemplate.replace(/{name}/g, name);
    },

    // In the future, this can be swapped with a real API call
    // generateWishAsync: async (name: string, amount: number) => { ... }
};
