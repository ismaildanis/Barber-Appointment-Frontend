import { authedApi as api } from "../api/unifiedAuthApi";
import { Campaign } from "../types/campaign";
import { GameSession } from "../types/game";

export const gameApi = {
    spinWheel: async (slug: string) => await api.post<Campaign>(`game/${slug}/wheel`).then(r => r.data),
    lastSpin: async (slug: string) => await api.get<GameSession>(`game/${slug}/last-spin`).then(r => r.data)
};