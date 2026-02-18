import { ai } from './ai';
import { AIAdvisor } from './ai-advisor';
// Removed unused TrapStudio import

export interface RoomSettings {
    counts: Record<number, number>;
    traps: TrapItem[];
    moneyItems: Array<{ value: number; quantity: number }>;
    trapItems: Array<{ label: string; quantity: number }>;
}

export interface TrapItem {
    id: string;
    type: 'text' | 'action' | 'bankrupt';
    content: string;
    category?: string;
    intensity?: number;
}

export interface ChallengeItem {
    id: string;
    content: string;
    duration: number; // seconds
}

export interface AdConfig {
    enabled: boolean;
    frequency: number;
    bannerUrl: string;
    videoUrl: string;
    waitingScreenEnabled: boolean;
    redemptionQueueEnabled: boolean;
}

export interface Player {
    id: string;
    name: string;
    amount: number;
    badge?: string | null;
    avatar?: string | null;
    deviceId?: string; // For anti-cheat
}

export interface ParticipantResult {
    playerName: string;
    amount: number;
    isTrap: boolean;
    trap?: TrapItem; // structured trap info
    timestamp: number;
    deviceId?: string;
    redemption?: {
        status: 'none' | 'requested' | 'doing' | 'completed' | 'failed';
        timestamp: number;
    };
    karmaScore?: number; // 0-100
}

export interface EnvelopeState {
    id: number;
    status: 'available' | 'locked' | 'opened';
    lockedBy?: string; // deviceId
    lockedAt?: number;
    openedBy?: string; // playerName
    value?: number; // Reveal only when opened
    isTrap?: boolean;
    trap?: TrapItem;
}

interface RoomData {
    id: string;
    code: string;
    settings: RoomSettings;
    inventory: Array<{ type: 'money' | 'trap', value: number | TrapItem }>;
    initialCount: number;
    // status: 'waiting' | 'playing' | 'ended'; // Moved below
    participants: ParticipantResult[];
    // Real-time Universe State
    envelopes: EnvelopeState[];
    history?: ParticipantResult[];
    activeChallenge?: ChallengeItem;
    activeEvents?: Array<{ type: string; playerName: string; deviceId: string; envelopeId?: number; timestamp: number }>;
    adConfig?: AdConfig;

    // GOD MODE SETTINGS
    weights?: Record<string, number>; // Key: "500000", "50000", "TRAP". Value: 0-100 (Relative weight)
    accumulatedLuck: Record<string, number>; // playerName -> multiplier (default 1)
    targetedTraps?: Record<number, TrapItem>; // envelopeId -> TrapItem (Specific override)
    status: 'waiting' | 'playing' | 'paused' | 'ended';
}

// DATABASE SIMULATION (LocalStorage + BroadcastChannel)
const DB_KEY = 'li_xi_universe_db';
const CHANNEL_NAME = 'li_xi_sync_channel';

const channel = new BroadcastChannel(CHANNEL_NAME);

const loadDB = (): Record<string, RoomData> => {
    try {
        const stored = localStorage.getItem(DB_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        return {};
    }
};

const saveDB = (data: Record<string, RoomData>) => {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
    channel.postMessage({ type: 'UPDATE' });
};

const findRoom = (rooms: Record<string, RoomData>, idOrCode: string): RoomData | undefined => {
    let room = rooms[idOrCode];
    if (!room) {
        const found = Object.values(rooms).find(r => r.code.toUpperCase() === idOrCode.toUpperCase());
        if (found) room = found;
    }
    return room;
};

// Helper for Weighted Random Selection
const selectItemWithWeights = (inventory: Array<{ type: 'money' | 'trap', value: number | TrapItem }>, weights?: Record<string, number>) => {
    if (!weights || Object.keys(weights).length === 0) {
        // Default behavior: Random pop from available
        const index = Math.floor(Math.random() * inventory.length);
        return { item: inventory[index], index };
    }

    // Filter available types
    const availableTypes = new Set(inventory.map(i => i.type === 'money' ? String(i.value) : 'TRAP'));

    // Calculate total weight for AVAILABLE items only
    let totalWeight = 0;
    const activeWeights: Record<string, number> = {};

    availableTypes.forEach(type => {
        const weight = weights[type] !== undefined ? weights[type] : 20; // Default weight 20
        activeWeights[type] = weight;
        // Multiply by count to be fair? NO. "God Mode" overrides count probability.
        // If 500k has weight 100 and 10k has weight 1, 500k should be 100x more likely even if there is only 1 500k and 100 10k.
        // THIS IS THE KEY "GOD MODE" LOGIC.
        // However, we must ensure the item exists.
        totalWeight += weight;
    });

    if (totalWeight === 0) {
        const index = Math.floor(Math.random() * inventory.length);
        return { item: inventory[index], index };
    }

    let random = Math.random() * totalWeight;
    let selectedType = '';

    for (const [type, weight] of Object.entries(activeWeights)) {
        random -= weight;
        if (random <= 0) {
            selectedType = type;
            break;
        }
    }

    // Find an item of this type
    const itemIndex = inventory.findIndex(i =>
        selectedType === 'TRAP' ? i.type === 'trap' : (i.type === 'money' && String(i.value) === selectedType)
    );

    if (itemIndex !== -1) {
        return { item: inventory[itemIndex], index: itemIndex };
    }

    // Fallback if something went wrong
    const fallbackIndex = Math.floor(Math.random() * inventory.length);
    return { item: inventory[fallbackIndex], index: fallbackIndex };
};


export const api = {
    async createRoom(settings: RoomSettings) {
        const rooms = loadDB();
        let inventory: Array<{ type: 'money' | 'trap', value: number | TrapItem }> = [];

        Object.entries(settings.counts).forEach(([amountStr, count]) => {
            const amount = parseInt(amountStr);
            for (let i = 0; i < count; i++) {
                inventory.push({ type: 'money', value: amount });
            }
        });

        settings.traps.forEach(trap => {
            inventory.push({ type: 'trap', value: trap });
        });

        // Initial Shuffle
        for (let i = inventory.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [inventory[i], inventory[j]] = [inventory[j], inventory[i]];
        }

        const envelopes: EnvelopeState[] = inventory.map((_item, idx) => ({
            id: idx + 1,
            status: 'available',
        }));

        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const id = 'room-' + code;

        rooms[id] = {
            id,
            code,
            settings,
            inventory,
            initialCount: inventory.length,
            status: 'waiting',
            participants: [],
            envelopes,
            accumulatedLuck: {}
        };

        saveDB(rooms);
        return { id, code, settings };
    },

    async joinRoom(code: string, playerName: string, deviceId: string) {
        const rooms = loadDB();
        const room = findRoom(rooms, code);

        if (!room) return { success: false, error: 'Phòng không tồn tại' };

        const existingParticipant = room.participants.find(p => p.deviceId === deviceId);
        if (existingParticipant) {
            return { success: true, roomId: room.id, status: room.status, recovered: true };
        }

        if (room.participants.find(p => p.playerName === playerName)) {
            return { success: false, error: 'Tên này đã có người dùng!' };
        }

        room.participants.push({
            playerName,
            amount: 0,
            isTrap: false,
            timestamp: Date.now(),
            deviceId
        });

        // Init luck
        if (!room.accumulatedLuck) room.accumulatedLuck = {};
        if (!room.accumulatedLuck[playerName]) room.accumulatedLuck[playerName] = 1.0;

        saveDB(rooms);
        return { success: true, roomId: room.id, status: room.status };
    },

    async startGame(roomId: string) {
        const rooms = loadDB();
        const room = findRoom(rooms, roomId);
        if (room) {
            room.status = 'playing';
            saveDB(rooms);
            return { success: true };
        }
        return { success: false };
    },

    async pauseGame(roomId: string, paused: boolean) {
        const rooms = loadDB();
        const room = findRoom(rooms, roomId);
        if (room) {
            room.status = paused ? 'paused' : 'playing';
            saveDB(rooms);
            return { success: true, status: room.status };
        }
        return { success: false };
    },

    async interactEnvelope(roomId: string, envelopeId: number, deviceId: string, action: 'lock' | 'unlock' | 'hover') {
        const rooms = loadDB();
        const room = findRoom(rooms, roomId);
        if (!room) return { success: false };

        let envelope = room.envelopes.find(e => e.id === envelopeId);
        if (!envelope) return { success: false };

        const now = Date.now();
        if (envelope.status === 'locked' && envelope.lockedAt && (now - envelope.lockedAt > 5000)) {
            envelope.status = 'available';
            envelope.lockedBy = undefined;
        }

        if (action === 'lock') {
            if (envelope.status !== 'available') return { success: false, error: 'Bao đã bị người khác chọn!' };
            envelope.status = 'locked';
            envelope.lockedBy = deviceId;
            envelope.lockedAt = now;
            saveDB(rooms);
            return { success: true };
        }
        return { success: true };
    },

    async openEnvelope(roomId: string, playerName: string, envelopeId: number, deviceId: string) {
        const rooms = loadDB();
        const room = findRoom(rooms, roomId);
        if (!room) return { success: false, error: 'Room error' };

        let envelopeState = room.envelopes.find(e => e.id === envelopeId);
        if (!envelopeState) return { success: false, error: 'Không tìm thấy bao!' };

        if (envelopeState.status === 'opened') return { success: false, error: 'Chậm tay rồi! Bao này đã mở.' };
        if (envelopeState.status === 'locked' && envelopeState.lockedBy !== deviceId) {
            return { success: false, error: 'Bao đang bị người khác giữ!' };
        }

        if (room.inventory.length === 0) {
            return { success: false, error: 'Hết bao lì xì rồi!', isOutOfStock: true };
        }

        const participant = room.participants.find(p => p.playerName === playerName);
        const isRedemption = participant?.redemption?.status === 'completed';

        // --- GOD MODE CORE LOGIC ---
        // Instead of popping the last item, we select heavily based on WEIGHTS.

        let selected;

        // 0. Check for Targeted Trap (Highest Priority)
        if (room.targetedTraps && room.targetedTraps[envelopeId]) {
            const trap = room.targetedTraps[envelopeId];
            delete room.targetedTraps[envelopeId]; // Consume it

            // We need to return a result that looks like an item but isn't in inventory
            // So we mock the 'item' structure
            selected = {
                item: { type: 'trap', value: trap } as any,
                index: -1 // Special flag
            };
        }
        // If Redemption, we force standard safe logic
        else if (isRedemption) {
            const safeIndex = room.inventory.findIndex(i => i.type === 'money' && (i.value as number) < 50000);
            if (safeIndex !== -1) {
                selected = { item: room.inventory[safeIndex], index: safeIndex };
            } else {
                const hasMoney = room.inventory.some(i => i.type === 'money');
                if (!hasMoney) {
                    // Inject Consolation
                    room.inventory.push({ type: 'money', value: 10000 });
                    selected = { item: room.inventory[room.inventory.length - 1], index: room.inventory.length - 1 };
                } else {
                    selected = selectItemWithWeights(room.inventory, room.weights);
                }
            }
        } else {
            // Normal Selection with Smart Odds
            selected = selectItemWithWeights(room.inventory, room.weights);
        }

        // Handle item removal only if it came from inventory
        let item;
        if (selected.index !== -1) {
            item = room.inventory.splice(selected.index, 1)[0];
        } else {
            item = selected.item;
        }
        // ---------------------------

        let wish = "";
        let trapData: TrapItem | undefined = undefined;

        if (item?.type === 'money') {
            const amount = item.value as number;
            wish = ai.generateWish(playerName, amount);
            envelopeState.value = amount;
            envelopeState.isTrap = false;

            // Refund luck if they win big
            if (room.accumulatedLuck && amount >= 500000) {
                room.accumulatedLuck[playerName] = 1.0;
            }
        } else {
            trapData = item?.value as TrapItem;
            wish = trapData?.content || "Trap";
            envelopeState.isTrap = true;
            envelopeState.trap = trapData;

            // Boost luck for next time
            if (room.accumulatedLuck) {
                room.accumulatedLuck[playerName] = (room.accumulatedLuck[playerName] || 1.0) + 0.5;
            }
        }

        envelopeState.status = 'opened';
        envelopeState.openedBy = playerName;

        if (!room['history']) room['history'] = [];

        const isMoney = item?.type === 'money';
        const val = isMoney ? (item.value as number) : 0;

        let karmaScore = 50;
        if (!isMoney) {
            karmaScore = Math.floor(Math.random() * 10) + 1;
        } else {
            if (val >= 500000) karmaScore = 100;
            else if (val >= 50000) karmaScore = Math.floor(Math.random() * 20) + 80;
            else karmaScore = Math.floor(Math.random() * 40) + 40;
        }

        const result: ParticipantResult = {
            playerName,
            amount: isMoney ? val : 0,
            isTrap: item?.type === 'trap',
            trap: trapData,
            timestamp: Date.now(),
            deviceId,
            karmaScore
        };

        room['history'].push(result);
        saveDB(rooms);
        return { success: true, ...result, wish };
    },

    async getRoomStats(roomId: string) {
        const rooms = loadDB();
        const room = findRoom(rooms, roomId);

        if (!room) return null;

        const history: ParticipantResult[] = room['history'] || [];

        const remainingCounts: Record<string, number> = {};
        room.inventory.forEach(item => {
            const key = item.type === 'money' ? item.value.toString() : 'TRAP';
            remainingCounts[key] = (remainingCounts[key] || 0) + 1;
        });

        const leaderboard = [...history].sort((a, b) => b.amount - a.amount).map((item, idx) => ({
            id: idx.toString(),
            name: item.playerName,
            amount: item.amount,
            badge: idx === 0 && item.amount > 0 ? 'Top 1' : null,
            avatar: null
        }));

        return {
            status: room.status,
            participantCount: room.participants.length,
            participants: room.participants,
            remaining: remainingCounts,
            totalInitial: room.initialCount,
            totalRemaining: room.inventory.length,
            leaderboard,
            history,
            envelopes: room.envelopes,
            aiInsights: AIAdvisor.analyze(room),
            weights: room.weights, // Send weights to Host UI
            adConfig: room.adConfig // Send ad config to Client/TV
        };
    },

    async getLeaderboard(roomId: string) {
        const stats = await this.getRoomStats(roomId);
        return stats ? stats.leaderboard : [];
    },

    subscribe(callback: () => void) {
        const handler = () => callback();
        channel.addEventListener('message', handler);
        return () => channel.removeEventListener('message', handler);
    },

    async requestRedemption(roomId: string, playerName: string) {
        const rooms = loadDB();
        const room = findRoom(rooms, roomId);
        if (!room) return { success: false };

        const participant = room.participants.find(p => p.playerName === playerName);
        if (participant) {
            participant.redemption = {
                status: 'requested',
                timestamp: Date.now()
            };
            saveDB(rooms);
            return { success: true };
        }
        return { success: false };
    },

    async setChallenge(roomId: string, challenge: ChallengeItem) {
        const rooms = loadDB();
        const room = findRoom(rooms, roomId);
        if (!room) return { success: false };
        room.activeChallenge = challenge;
        saveDB(rooms);
        return { success: true };
    },

    async approveRedemption(roomId: string, playerName: string) {
        const rooms = loadDB();
        const room = findRoom(rooms, roomId);
        if (!room) return { success: false };

        // Auto-assign random trap from studio logic if not set manually?
        // Ideally Host sets it manually via Dashboard.

        const participant = room.participants.find(p => p.playerName === playerName);
        if (participant && participant.redemption) {
            participant.redemption.status = 'completed';
            saveDB(rooms);
            return { success: true };
        }
        return { success: false };
    },

    async manipulateInventory(roomId: string, action: 'tighten' | 'release' | 'shuffle') {
        const rooms = loadDB();
        const room = findRoom(rooms, roomId);
        if (!room) return { success: false };

        // Legacy Support + New Weight System
        if (!room.weights) room.weights = {};

        if (action === 'shuffle') {
            // Just shuffle physical inventory, weights reset to neutral?
            // Or maybe "Shuffle" implies "Randomize Weights" too? 
            // Let's keep shuffle as physical shuffle for now.
            for (let i = room.inventory.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [room.inventory[i], room.inventory[j]] = [room.inventory[j], room.inventory[i]];
            }
        } else if (action === 'tighten') {
            // Reduce big money weights
            room.weights['500000'] = 1;
            room.weights['200000'] = 5;
            room.weights['50000'] = 10;
            room.weights['TRAP'] = 80; // High trap chance
        } else if (action === 'release') {
            // Increase big money weights
            room.weights['500000'] = 50;
            room.weights['200000'] = 40;
            room.weights['50000'] = 30;
            room.weights['TRAP'] = 10;
        }

        saveDB(rooms);
        return { success: true };
    },

    // NEW: Fine-grained Probability Control
    async setProbabilities(roomId: string, newWeights: Record<string, number>) {
        const rooms = loadDB();
        const room = findRoom(rooms, roomId);
        if (!room) return { success: false };

        room.weights = { ...room.weights, ...newWeights };
        saveDB(rooms);
        return { success: true };
    },

    // NEW: Live Swap Trap
    async liveSwapTrap(roomId: string, envelopeId: number | null, newTrapContent: string) {
        const rooms = loadDB();
        const room = findRoom(rooms, roomId);
        if (!room) return { success: false };

        if (envelopeId) {
            // Target specific envelope
            if (!room.targetedTraps) room.targetedTraps = {};
            room.targetedTraps[envelopeId] = {
                id: 'swap-' + Date.now(),
                type: 'action',
                content: newTrapContent,
                intensity: 3
            };
        } else {
            // General "Next Trap" boost (Old Logic)
            room.inventory.push({
                type: 'trap',
                value: { id: 'live-swap-' + Date.now(), type: 'action', content: newTrapContent, intensity: 3 }
            });
            if (!room.weights) room.weights = {};
            room.weights['TRAP'] = 1000;
        }

        saveDB(rooms);
        return { success: true };
    },

    async reportHesitation(roomId: string, playerName: string, envelopeId: number, deviceId: string) {
        const rooms = loadDB();
        const room = findRoom(rooms, roomId);
        if (!room) return { success: false };

        if (!room.activeEvents) room.activeEvents = [];
        room.activeEvents.push({
            type: 'hesitation',
            playerName,
            deviceId,
            envelopeId,
            timestamp: Date.now()
        });

        if (room.activeEvents.length > 20) {
            room.activeEvents = room.activeEvents.slice(-20);
        }

        saveDB(rooms);
        return { success: true };
    },

    // ADMIN FUNCTIONS
    async getAllRooms() {
        const rooms = loadDB();
        return rooms;
    },

    async closeRoom(roomId: string) {
        const rooms = loadDB();
        const room = findRoom(rooms, roomId);
        if (room) {
            room.status = 'ended';
            saveDB(rooms);
            return { success: true };
        }
        return { success: false };
    },

    async setAdConfig(roomId: string, config: AdConfig) {
        const rooms = loadDB();
        const room = findRoom(rooms, roomId);
        if (room) {
            room.adConfig = config;
            saveDB(rooms);
            return { success: true };
        }
        return { success: false };
    }
};
