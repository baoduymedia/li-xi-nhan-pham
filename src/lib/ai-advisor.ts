
export interface AIInsight {
    id: string;
    type: 'warning' | 'opportunity' | 'troll';
    message: string;
    action?: 'tighten' | 'release' | 'shuffle' | 'swap_trap';
    targetPlayer?: string;
    targetEnvelope?: number;
    timestamp: number;
}

export class AIAdvisor {
    static analyze(roomData: any): AIInsight[] {
        const insights: AIInsight[] = [];
        const now = Date.now();

        // 1. Analyze Economy (Too Lucky?)
        const totalInitial = roomData.initialCount || 0;
        const totalRemaining = roomData.inventory?.length || 0;
        const openedCount = totalInitial - totalRemaining;

        if (openedCount > 5) {
            const history = roomData.history || [];
            const moneyWins = history.filter((h: any) => !h.isTrap && h.amount >= 50000).length;

            if (moneyWins / openedCount > 0.6) {
                insights.push({
                    id: 'economy_warning_' + now,
                    type: 'warning',
                    message: "Cảnh báo: Tỉ lệ thắng đang quá cao (Luck > 60%). Kho tiền đang vơi nhanh!",
                    action: 'tighten',
                    timestamp: now
                });
            }
        }

        // 2. Analyze Mood (Too Sad?)
        if (openedCount > 5) {
            const history = roomData.history || [];
            const trapCount = history.filter((h: any) => h.isTrap).length;

            if (trapCount / openedCount > 0.7) {
                insights.push({
                    id: 'mood_sad_' + now,
                    type: 'opportunity',
                    message: "Không khí đang trầm lắng (70% dính bẫy). Hãy xả kho để lấy lại tinh thần!",
                    action: 'release',
                    timestamp: now
                });
            }
        }

        // 3. Analyze Hesitation (Greed Detector)
        // This relies on `activeEvents` populated by api.reportHesitation
        if (roomData.activeEvents) {
            const hesitationEvents = roomData.activeEvents.filter((e: any) => e.type === 'hesitation' && (now - e.timestamp < 5000));

            hesitationEvents.forEach((e: any) => {
                insights.push({
                    id: 'greed_' + e.deviceId,
                    type: 'troll',
                    message: `${e.playerName} đang do dự ở bao #${e.envelopeId} quá 3 giây. Có mùi tham lam!`,
                    action: 'shuffle',
                    targetPlayer: e.playerName,
                    targetEnvelope: e.envelopeId,
                    timestamp: now
                });
            });
        }

        return insights;
    }

    static getPersonaTrap(persona: 'bestie' | 'ex' | 'cousin' | 'boss'): string {
        const traps = {
            bestie: [
                "Khai thật tật xấu nhất của bạn thân?",
                "Gọi điện cho người yêu cũ bật loa ngoài",
                "Cho bạn thân xem lịch sử duyệt web"
            ],
            ex: [
                "Tại sao ngày xưa lại chia tay?",
                "Hát bài 'Người lạ ơi'",
                "Gửi tin nhắn 'Nhớ em/anh' rồi thu hồi"
            ],
            cousin: [
                "Rửa bát cho cả nhà tối nay",
                "Múa bài 'Con cò bé bé'",
                "Không được lì xì đi về chỗ"
            ],
            boss: [
                "Khen nhân viên xuất sắc nhất 3 câu",
                "Hứa tăng lương (dù chỉ là lời nói)",
                "Mời cả phòng đi trà sữa"
            ]
        };
        const list = traps[persona] || traps['bestie'];
        return list[Math.floor(Math.random() * list.length)];
    }
}
