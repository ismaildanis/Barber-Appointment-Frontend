import { authedApi as api } from "../api/unifiedAuthApi";
import { Reward, RewardStatus } from "../types/reward";


export const rewardApi = {
    getRewardsForCustomer: async (slug: string, status: RewardStatus) => await api.get<Reward[]>(`reward/${slug}`, { params: { status } }).then(r => r.data),
    getAvailableRewardForCustomer: async (slug: string) =>
        await api.get<Reward>(`reward/available/${slug}`).then(r => r.data),
};