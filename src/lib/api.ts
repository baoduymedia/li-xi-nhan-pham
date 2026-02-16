import { supabase } from './supabase';

export interface RoomSettings {
    counts: Record<number, number>;
    traps: string[];
}

export interface Player {
    id: string;
    name: string;
    amount: number;
    badge?: string | null;
    avatar?: string | null;
}

// Mock Data Store (for when backend is offline)
let mockRooms: Record<string, any> = {};
let mockPlayers: Record<string, Player[]> = {};

export const api = {
    // Create Room
    async createRoom(settings: RoomSettings) {
        if (!(supabase as any).supabaseUrl.includes('placeholder')) {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            const { data, error } = await supabase
                .from('rooms')
                .insert([{ code, settings, status: 'active' }])
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            // Mock
            const code = 'TEST-ROOM';
            const id = 'mock-room-id';
            mockRooms[id] = { id, code, settings };
            return { id, code, settings };
        }
    },

    // Join Room
    async joinRoom(code: string, name: string) {
        if (!(supabase as any).supabaseUrl.includes('placeholder')) {
            // 1. Get Room ID
            const { data: room, error: roomError } = await supabase
                .from('rooms')
                .select('id')
                .eq('code', code)
                .single();

            if (roomError || !room) throw new Error('Room not found');

            // 2. Add Player
            const { data: player, error: playerError } = await supabase
                .from('players')
                .insert([{ room_id: room.id, name }])
                .select()
                .single();

            if (playerError) throw playerError;
            return { ...player, roomId: room.id };
        } else {
            // Mock
            const roomId = 'mock-room-id'; // Assume always joining this for test
            const player = { id: Math.random().toString(), name, amount: 0, room_id: roomId };
            if (!mockPlayers[roomId]) mockPlayers[roomId] = [];
            mockPlayers[roomId].push(player);
            return { ...player, roomId };
        }
    },

    // Open Envelope (Game Logic)
    async openEnvelope(roomId: string, playerId: string) {
        // Ideally this logic should be Server-Side (Edge Function) to prevent cheating
        // For now, we simulate client-side for the demo

        // 1. Fetch Room Settings to see what's left
        // (Simplified)

        const amounts = [10000, 20000, 50000, 100000, 200000, 500000];
        const wishes = [
            "Tiền vào như nước sông Đà, tiền ra nhỏ giọt như cà phê phin.",
            "Năm mới bớt sống ảo, tập trung làm giàu đi bạn ơi.",
            "Đại gia chân đất, năm nay phất lên như diều gặp gió!",
            "Sớm sinh quý tử (nếu muốn), muộn sinh quý tử (nếu chưa muốn).",
        ];

        const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
        const randomWish = wishes[Math.floor(Math.random() * wishes.length)];

        if (!(supabase as any).supabaseUrl.includes('placeholder')) {
            const { data, error } = await supabase
                .from('results')
                .insert([{
                    room_id: roomId,
                    player_id: playerId,
                    amount: randomAmount,
                    wish: randomWish
                }])
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            return { amount: randomAmount, wish: randomWish, is_trap: false };
        }
    },

    // Get Leaderboard
    async getLeaderboard(roomId: string) {
        if (!(supabase as any).supabaseUrl.includes('placeholder')) {
            const { data, error } = await supabase
                .from('results')
                .select(`
                amount,
                players (name, avatar_url)
            `)
                .eq('room_id', roomId)
                .order('amount', { ascending: false });

            if (error) throw error;

            // Transform data
            return data.map((item: any, index: number) => ({
                id: index.toString(),
                name: item.players.name,
                amount: item.amount,
                avatar: item.players.avatar_url,
                badge: index === 0 ? 'Top 1' : null
            }));
        } else {
            return [
                { id: '1', name: 'Duy Nến', amount: 500000, badge: 'Đại Gia 2026', avatar: null },
                { id: '2', name: 'Lan Ngọc', amount: 200000, badge: 'May Mắn', avatar: null },
            ];
        }
    }
};
