import { authedApi as api } from "../api/unifiedAuthApi";
import { Campaign, CampaignForAdmin, CreateCampaign, UpdateCampaign } from "../types/campaign";

export const campaignApi = {
    getCampaignsForShop: async (slug: string) => await api.get<Campaign[]>(`campaign/shop/${slug}`).then(r => r.data),
    getCampaignForAdmin: async () => await api.get<CampaignForAdmin[]>(`campaign/shop/admin`).then(r => r.data),
    getOneCampaignForAdmin: async (id: number) => await api.get<CampaignForAdmin>(`campaign/shop/admin/${id}`).then(r => r.data),
    createCampaign: async (data: CreateCampaign) => await api.post<Campaign>(`campaign`, data).then(r => r.data),
    updateCampaign: async (data: UpdateCampaign, id: number) => await api.put<Campaign>(`campaign/${id}`, data).then(r => r.data),
    deleteCampaign: async (id: number) => await api.delete(`/campaign/${id}`).then(r => r.data),
};