export interface Shop {
    id: number;
    name: string;
    slug: string;
    phone?: string | null;
    email: string;
    city: string;
    district: string;
    neighborhood: string;
    address: string;
    image?: string;
    active: boolean;
}

export interface UpdateShop {
    name?: string;
    phone?: string | null;
    city?: string;
    district?: string;
    neighborhood?: string;
    address?: string;
}