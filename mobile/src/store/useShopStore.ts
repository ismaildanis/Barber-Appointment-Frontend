import { create } from "zustand";

type ShopState = {
    activeShopSlug: string | null;
    setActiveShop: (slug: string) => void;
}

export const useShopStore = create<ShopState>((set) => ({
    activeShopSlug: null,
    setActiveShop: (slug: string) => set({ activeShopSlug: slug }),
}));