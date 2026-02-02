import { authedApi as api } from "../api/unifiedAuthApi";
import { Shop } from "../types/shop";

export const shopApi = {
    getShops: async () => await api.get<Shop[]>("/shop").then(r => r.data),
    uploadShopImage: async (formData: FormData) => await api.post("/shop/image", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }).then(r => r.data),
    deleteShopImage: async () => await api.put("/shop/image").then(r => r.data),
};