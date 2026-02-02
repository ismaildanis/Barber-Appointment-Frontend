export interface Shop {
    id: string;
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