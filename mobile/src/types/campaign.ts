export interface Campaign {
    id: number;
    shopId: number;
    name: string;
    description?: string;
    discountType: number;
    discountValue: number;
    startAt: string;
    endAt?: string | null;
    wheelEnabled: boolean;
    wheelWeight: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCampaign {
    name: string;
    description?: string | null;
    discountType: number;
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
    discountType?: number;
    discountValue?: number;
    startAt?: string;
    endAt?: string | null;
    wheelEnabled?: boolean;
    wheelWeight?: number;
    active?: boolean;
}