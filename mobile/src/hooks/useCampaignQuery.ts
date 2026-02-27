import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { campaignApi } from "../api/campaignApi";
import { CreateCampaign, UpdateCampaign } from "../types/campaign";

export const campaignKeys = {
  all: ["campaign"] as const,
  listByShop: (slug: string) => [...campaignKeys.all, "shop", slug] as const,
  detail: (id: number) => [...campaignKeys.all, "detail", id] as const,
};

export const useGetCampaignsForShop = (slug: string) =>
  useQuery({
    queryKey: campaignKeys.listByShop(slug),
    queryFn: () => campaignApi.getCampaignsForShop(slug),
    enabled: !!slug,
  });

export const useGetCampaignForAdmin = () =>
  useQuery({
    queryKey: ["campaign", "admin"],
    queryFn: () => campaignApi.getCampaignForAdmin(),
  });

export const useGetOneCampaignForAdmin = (id: number) =>
  useQuery({
    queryKey: ["campaign", "admin", id],
    queryFn: () => campaignApi.getOneCampaignForAdmin(id),
    enabled: !!id,
  });

export const useCreateCampaignMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCampaign) => campaignApi.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
};

export const useUpdateCampaignMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCampaign }) =>
      campaignApi.updateCampaign(data, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(variables.id) });
    },
  });
};

export const useDeleteCampaignMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => campaignApi.deleteCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
      queryClient.removeQueries({ queryKey: campaignKeys.detail(id) });
    },
  });
};
