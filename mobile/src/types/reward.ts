import { Campaign } from "./campaign";

export interface Reward {
    id: number;
    shopId: number;
    campaignId: number;
    customerId: number;
    appointmentId: number | null;
    status: RewardStatus;
    usedAt?: string | null;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
    // API denetiminden görüldüğü üzere alan adı `campaign` (küçük harf)
    campaign?: Campaign;
    // Eski kullanım için bırakıldı, backend ilişki adını değiştirse de kırılmasın diye
    Campaign?: Campaign;
}

export enum RewardStatus {
    AVAILABLE = 'AVAILABLE',
    USED = 'USED',
    EXPIRED = 'EXPIRED',
}