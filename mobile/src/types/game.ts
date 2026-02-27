enum GameType {
    SPIN_WHEEL
}

export interface GameSession {
    id: number;
    shopId: number;
    customerId: number;
    gameType: GameType;
    playedAt: string;
    nextPlayAt: string;
}