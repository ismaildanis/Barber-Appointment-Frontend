import { authedApi as api } from "../api/unifiedAuthApi";
import { Shop, UpdateShop } from "../types/shop";

export const shopApi = {
    getShops: async () => await api.get<Shop[]>("/shop").then(r => r.data),
    getShopForAdmin: async () => await api.get<Shop>(`/shop/admin`).then(r => r.data),
    updateShop: async (data: UpdateShop, id: number) => await api.put<Shop>(`/shop/admin/${id}`, data).then(r => r.data),
    uploadShopImage: async (formData: FormData) => await api.post("/shop/image", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }).then(r => r.data),
    deleteShopImage: async () => await api.put("/shop/image").then(r => r.data),
};