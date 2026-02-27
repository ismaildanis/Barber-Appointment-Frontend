import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rewardApi } from "../api/rewardApi";
import { RewardStatus, Reward } from "../types/reward";

const key = ["reward"] as const;

export const useGetRewardsForCustomer = (slug: string, status: RewardStatus) =>
    useQuery({
        queryKey: [key, slug, status],
        queryFn: () => rewardApi.getRewardsForCustomer(slug, status),
        staleTime: 5 * 60 * 1000,
        enabled: !!slug,
    });