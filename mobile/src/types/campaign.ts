import { CampaignService } from "./appointment";
import { Service } from "./service";

export interface Campaign {
    id: number;
    shopId: number;
    name: string;
    description?: string;
    discountType: number | string;
    discountValue: number | string;
    startAt: string;
    endAt?: string | null;
    wheelEnabled: boolean;
    wheelWeight: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CampaignForAdmin extends Campaign {
    campaignServices: (CampaignService & { service?: Service })[];
}

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface CreateCampaign {
    name: string;
    description?: string | null;
    discountType: DiscountType;
    discountValue: number;
    serviceIds: number[];
    startAt: string;
    endAt?: string | null;
    wheelEnabled?: boolean | null;
    wheelWeight?: number | null;
    active?: boolean | null;
}

export interface UpdateCampaign {
    name?: string;
    description?: string;
    discountType?: DiscountType;
    discountValue?: number;
    serviceIds?: number[];
    startAt?: string;
    endAt?: string | null;
    wheelEnabled?: boolean;
    wheelWeight?: number;
    active?: boolean;
}