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
    campaign?: Campaign;
}

export enum RewardStatus {
    AVAILABLE = 'AVAILABLE',
    USED = 'USED',
    EXPIRED = 'EXPIRED',
}